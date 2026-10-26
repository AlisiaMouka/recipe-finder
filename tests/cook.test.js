// COOK CHECKS
// Do the matching and ranking rules work? No browser needed.
// Some checks use small made-up recipes, so each rule can be tested on its own.

const { check, loadCook, runChecks, assert } = require("./checker");
const { RECIPES, findRecipes, browseRecipes, cleanIngredient, closestIngredient, letterChanges } = loadCook();

const noFilters = { diets: [], leaveOut: [] };

// A made-up recipe with only the fields the cook needs.
function fake(name, ingredients, extra = {}) {
  return { name, ingredients, diet: [], allergens: [], ...extra };
}

function namesOf(results) {
  return results.map((result) => result.recipe.name);
}

function find(typed, options = {}, recipes = RECIPES) {
  return findRecipes(recipes, typed, { ...noFilters, ...options });
}

// ---- Optional ingredients ----

check("optional ingredients never count as missing, and never count as yours", () => {
  const flatbread = fake("Flatbread", ["flour"], { optional: ["ghee"] });
  const { results } = find(["flour", "ghee"], {}, [flatbread]);
  assert.deepStrictEqual(results[0].missing, []);
  assert.deepStrictEqual(results[0].have.map((h) => h.needed), ["flour"]);
});

// ---- Ranking (the cook's rule) ----

check("rule 1: a recipe you can cook right now beats one that uses more of your ingredients", () => {
  const x = fake("X", ["egg", "cheese", "spinach", "a", "b", "c", "d", "e"]); // 3 of yours, 5 missing
  const y = fake("Y", ["egg", "tomato"]); // 2 of yours, nothing missing
  const { results } = find(["egg", "cheese", "spinach", "tomato"], {}, [x, y]);
  assert.deepStrictEqual(namesOf(results), ["Y", "X"]);
});

check("rule 2: when equally many are missing, the recipe using more of yours comes first", () => {
  const fewer = fake("Fewer", ["egg", "flour"]); // 1 of yours, 1 missing
  const more = fake("More", ["egg", "milk", "flour"]); // 2 of yours, 1 missing
  const { results } = find(["egg", "milk"], {}, [fewer, more]);
  assert.deepStrictEqual(namesOf(results), ["More", "Fewer"]);
});

check("rule 3: a recipe that uses none of your ingredients doesn't appear", () => {
  const { results } = find(["egg"], {}, [fake("Toast", ["bread"])]);
  assert.deepStrictEqual(namesOf(results), []);
});

check("each result lists what you're missing", () => {
  const omelette = fake("Spinach & Cheese Omelette", ["egg", "cheese", "spinach", "butter"]);
  const { results } = find(["egg", "cheese", "spinach"], {}, [omelette]);
  assert.deepStrictEqual(results[0].missing, ["butter"]);
});

// ---- Browsing (no ingredients typed) ----

check("with nothing selected, all recipes are shown, A to Z", () => {
  const names = browseRecipes(RECIPES, noFilters).map((recipe) => recipe.name);
  assert.strictEqual(names.length, RECIPES.length);
  assert.deepStrictEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
});

check("with only a filter, every recipe in that category is shown (Vegan)", () => {
  const shown = browseRecipes(RECIPES, { ...noFilters, diets: ["vegan"] });
  const allVegan = RECIPES.filter((recipe) => recipe.diet.includes("vegan"));
  assert.strictEqual(shown.length, allVegan.length);
  assert.ok(shown.every((recipe) => recipe.diet.includes("vegan")));
});

check('with only Leave out, every other recipe is shown (leave out "meat")', () => {
  const shown = browseRecipes(RECIPES, { ...noFilters, leaveOut: ["meat"] });
  assert.ok(shown.length > 0);
  for (const recipe of shown) {
    assert.ok(!recipe.ingredients.some((item) => ["meat", "chicken", "beef", "pork", "lamb", "bacon", "ham", "chicken stock"].includes(item)), recipe.name);
  }
});

// ---- Sorting ----

check("Use Most puts the recipe using the most of your ingredients first", () => {
  const two = fake("Two", ["egg", "milk", "flour", "sugar"]); // 2 of yours, 2 missing
  const one = fake("One", ["egg"]); // 1 of yours, nothing missing
  const { results } = find(["egg", "milk"], { sortBy: "use-most" }, [one, two]);
  assert.deepStrictEqual(namesOf(results), ["Two", "One"]);
});

check("Quickest puts the shortest cooking time first", () => {
  const slow = fake("Slow", ["egg"], { minutes: 40 });
  const fast = fake("Fast", ["egg", "flour"], { minutes: 10 });
  const { results } = find(["egg"], { sortBy: "quickest" }, [slow, fast]);
  assert.deepStrictEqual(namesOf(results), ["Fast", "Slow"]);
});

check("Cheapest compares price per serving, not total (€12 for 4 beats €4 for 1)", () => {
  const paella = fake("Paella", ["rice"], { price: 12, servings: 4 }); // €3 per serving
  const toast = fake("Toast", ["rice"], { price: 4, servings: 1 }); // €4 per serving
  const { results } = find(["rice"], { sortBy: "cheapest" }, [toast, paella]);
  assert.deepStrictEqual(namesOf(results), ["Paella", "Toast"]);
});

check("ties fall back to the default order (Buy Less when ingredients are typed)", () => {
  const missingTwo = fake("Missing two", ["egg", "a", "b"], { minutes: 20 });
  const missingNone = fake("Missing none", ["egg"], { minutes: 20 });
  const { results } = find(["egg"], { sortBy: "quickest" }, [missingTwo, missingNone]);
  assert.deepStrictEqual(namesOf(results), ["Missing none", "Missing two"]);
});

check("when browsing, Quickest and Cheapest work too, with ties falling back to A to Z", () => {
  const recipes = [
    fake("Beta", ["x"], { minutes: 10, price: 2, servings: 1 }),
    fake("Alpha", ["x"], { minutes: 10, price: 6, servings: 2 }),
    fake("Gamma", ["x"], { minutes: 5, price: 9, servings: 1 }),
  ];
  const names = (sortBy) => browseRecipes(recipes, { ...noFilters, sortBy }).map((r) => r.name);
  assert.deepStrictEqual(names("quickest"), ["Gamma", "Alpha", "Beta"]);
  assert.deepStrictEqual(names("cheapest"), ["Beta", "Alpha", "Gamma"]); // €2 / €3 / €9 per serving
});

// ---- Typos ----

check("letter changes are counted one add, remove or swap at a time", () => {
  assert.strictEqual(letterChanges("brocoli", "broccoli"), 1); // add a c
  assert.strictEqual(letterChanges("tomatoe", "tomato"), 1); // remove the e
  assert.strictEqual(letterChanges("rise", "rice"), 1); // swap s for c
  assert.strictEqual(letterChanges("egg", "egg"), 0);
});

check('a close typo gets a guess: brocoli → broccoli, tomatoe → tomato, parmesean → parmesan', () => {
  assert.strictEqual(closestIngredient("brocoli", RECIPES), "broccoli");
  assert.strictEqual(closestIngredient("tomatoe", RECIPES), "tomato");
  assert.strictEqual(closestIngredient("parmesean", RECIPES), "parmesan");
});

check("words up to 5 letters allow 1 change (rise → rice), longer words allow 2 (brokoli → broccoli)", () => {
  assert.strictEqual(closestIngredient("rise", RECIPES), "rice");
  assert.strictEqual(closestIngredient("brokoli", RECIPES), "broccoli"); // 2 changes, 7 letters
  assert.strictEqual(closestIngredient("rcie", RECIPES), null); // 2 changes, only 4 letters
});

check("known ingredients are never questioned (egg, cheddar, courgette)", () => {
  for (const word of ["egg", "cheddar", "courgette", "cheese"]) {
    assert.strictEqual(closestIngredient(word, RECIPES), null, word);
  }
});

check("words that aren't close to anything get no guess (pizza, chocolate bar)", () => {
  assert.strictEqual(closestIngredient("pizza", RECIPES), null);
  assert.strictEqual(closestIngredient("chocolate bar", RECIPES), null);
});

check('real foods are never questioned, even when they\'re close to another one ("pear" isn\'t questioned as "pea")', () => {
  assert.strictEqual(closestIngredient("pear", RECIPES), null);
  assert.strictEqual(closestIngredient("kale", RECIPES), null);
});

// ---- Typing style ----

check('capitals, spaces and plurals don\'t matter ("  Tomatoes " = "tomato")', () => {
  assert.strictEqual(cleanIngredient("  Tomatoes "), "tomato");
  assert.strictEqual(cleanIngredient("Eggs"), "egg");
});

check('words ending in "-us" aren\'t plurals (couscous, asparagus, hummus stay whole)', () => {
  for (const word of ["couscous", "asparagus", "hummus"]) assert.strictEqual(cleanIngredient(word), word);
});

check('"-ies" plurals work too ("strawberries" = "strawberry")', () => {
  assert.strictEqual(cleanIngredient("Strawberries"), "strawberry");
});

check('other names work ("zucchinis" = courgette, "garbanzo beans" = chickpea)', () => {
  assert.strictEqual(cleanIngredient("zucchinis"), "courgette");
  assert.strictEqual(cleanIngredient("garbanzo beans"), "chickpea");
});

// ---- Filters ----

check("Vegetarian hides recipes with meat", () => {
  const recipes = [
    fake("Chicken Fried Rice", ["chicken", "rice"]),
    fake("Vegetable Fried Rice", ["rice", "pea"], { diet: ["vegetarian"] }),
  ];
  const { results } = find(["chicken", "rice"], { diets: ["vegetarian"] }, recipes);
  assert.ok(!namesOf(results).includes("Chicken Fried Rice"));
  assert.ok(namesOf(results).includes("Vegetable Fried Rice"), "rice recipes should still show");
});

check('a note explains ignored ingredients ("Chicken was ignored because Vegetarian is on.")', () => {
  const { notes } = find(["chicken", "rice"], { diets: ["vegetarian"] });
  assert.deepStrictEqual(notes, ["Chicken was ignored because Vegetarian is on."]);
});

check("Dairy-free hides every recipe marked with the dairy allergen", () => {
  const { results } = find(["egg", "tomato", "rice", "potato"], { diets: ["dairy-free"] });
  for (const { recipe } of results) {
    assert.ok(!recipe.allergens.includes("dairy"), `${recipe.name} has dairy`);
  }
});

check("filters combine: Vegan + Gluten-free only shows recipes with both labels", () => {
  const { results } = find(["onion", "tomato"], { diets: ["vegan", "gluten-free"] });
  assert.ok(results.length > 0);
  for (const { labels, recipe } of results) {
    assert.ok(labels.includes("vegan") && labels.includes("gluten-free"), recipe.name);
  }
});

check('an unknown ingredient gets a note ("We don\'t have any recipes with pizza yet.")', () => {
  const { notes } = find(["pizza"]);
  assert.deepStrictEqual(notes, ["We don't have any recipes with pizza yet."]);
});

// ---- Leave out ----

check("Leave out hides recipes containing that ingredient", () => {
  const recipes = [fake("Mushroom Risotto", ["rice", "mushroom"]), fake("Vegetable Fried Rice", ["rice", "pea"])];
  const { results } = find(["rice"], { leaveOut: ["mushroom"] }, recipes);
  assert.ok(!namesOf(results).includes("Mushroom Risotto"));
  assert.ok(namesOf(results).includes("Vegetable Fried Rice"));
});

check('a family in Leave out hides every member ("cheese" hides parmesan, feta, mozzarella)', () => {
  const recipes = [
    fake("Tomato Basil Pasta", ["tomato", "parmesan"]),
    fake("Greek Salad", ["tomato", "feta"]),
    fake("Caprese Toast", ["tomato", "mozzarella"]),
    fake("Beef Tacos", ["tomato", "cheese"]),
    fake("Tomato Soup", ["tomato", "onion"]),
  ];
  const { results } = find(["tomato"], { leaveOut: ["cheese"] }, recipes);
  assert.deepStrictEqual(namesOf(results), ["Tomato Soup"]);
});

check('leaving out "meat" also hides chicken stock (it is in two families)', () => {
  const soup = fake("Chicken Stock Soup", ["chicken stock", "carrot"]);
  const { results } = find(["carrot"], { leaveOut: ["meat"] }, [soup]);
  assert.deepStrictEqual(namesOf(results), []);
});

check('leaving out "fish" also hides oysters and smoked salmon', () => {
  const oysters = fake("Oyster Toast", ["oyster", "bread"]);
  const bagel = fake("Salmon Bagel", ["smoked salmon", "bread"]);
  const { results } = find(["bread"], { leaveOut: ["fish"] }, [oysters, bagel]);
  assert.deepStrictEqual(namesOf(results), []);
});

// ---- Families ----

check('a specific ingredient counts for its family: cheddar works for "cheese"', () => {
  const omelette = fake("Spinach & Cheese Omelette", ["egg", "cheese", "spinach", "butter"]);
  const { results } = find(["cheddar", "egg"], {}, [omelette]);
  assert.ok(results[0].have.some((h) => h.needed === "cheese" && h.using === "cheddar"));
});

check('a family does NOT count for a specific ingredient: "cheese" doesn\'t match parmesan', () => {
  const risotto = fake("Mushroom Risotto", ["rice", "mushroom", "parmesan"]);
  const { results } = find(["cheese", "rice"], {}, [risotto]);
  assert.ok(results[0].missing.includes("parmesan"));
});

check('typing a family name explains it only matches recipes asking for "any" of it', () => {
  const { notes } = find(["vegetable"]);
  assert.ok(notes[0].startsWith('"Vegetable" only finds recipes that ask for any vegetable.'), notes[0]);
});

module.exports = () => runChecks("Cook checks (matching and ranking rules)");
