// COOK CHECKS
// Do the matching and ranking rules work? No browser needed.
// Some checks use small made-up recipes, so each rule can be tested on its own.

const { check, loadCook, runChecks, assert } = require("./checker");
const { RECIPES, findRecipes, browseRecipes, cleanIngredient } = loadCook();

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
  const { results } = find(["egg", "cheese", "spinach"]);
  const omelette = results.find((r) => r.recipe.name === "Spinach & Cheese Omelette");
  assert.deepStrictEqual(omelette.missing, ["butter"]);
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

// ---- Typing style ----

check('capitals, spaces and plurals don\'t matter ("  Tomatoes " = "tomato")', () => {
  assert.strictEqual(cleanIngredient("  Tomatoes "), "tomato");
  assert.strictEqual(cleanIngredient("Eggs"), "egg");
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
  const { results } = find(["chicken", "rice"], { diets: ["vegetarian"] });
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
  const { results } = find(["rice"], { leaveOut: ["mushroom"] });
  assert.ok(!namesOf(results).includes("Mushroom Risotto"));
  assert.ok(namesOf(results).includes("Vegetable Fried Rice"));
});

check('a family in Leave out hides every member ("cheese" hides parmesan, feta, mozzarella)', () => {
  const { results } = find(["tomato"], { leaveOut: ["cheese"] });
  for (const name of ["Tomato Basil Pasta", "Greek Salad", "Caprese Toast", "Beef Tacos"]) {
    assert.ok(!namesOf(results).includes(name), `${name} should be hidden`);
  }
});

check('leaving out "meat" also hides chicken stock (it is in two families)', () => {
  const soup = fake("Chicken Stock Soup", ["chicken stock", "carrot"]);
  const { results } = find(["carrot"], { leaveOut: ["meat"] }, [soup]);
  assert.deepStrictEqual(namesOf(results), []);
});

// ---- Families ----

check('a specific ingredient counts for its family: cheddar works for "cheese"', () => {
  const { results } = find(["cheddar", "egg"]);
  const omelette = results.find((r) => r.recipe.name === "Spinach & Cheese Omelette");
  assert.ok(omelette.have.some((h) => h.needed === "cheese" && h.using === "cheddar"));
});

check('a family does NOT count for a specific ingredient: "cheese" doesn\'t match parmesan', () => {
  const { results } = find(["cheese", "rice"]);
  const risotto = results.find((r) => r.recipe.name === "Mushroom Risotto");
  assert.ok(risotto.missing.includes("parmesan"));
});

check('typing a family name explains it only matches recipes asking for "any" of it', () => {
  const { notes } = find(["vegetable"]);
  assert.ok(notes[0].startsWith('"Vegetable" only finds recipes that ask for any vegetable.'), notes[0]);
});

module.exports = () => runChecks("Cook checks (matching and ranking rules)");
