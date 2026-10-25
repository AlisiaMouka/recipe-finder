// PANTRY CHECKS
// Is the recipe information complete and consistent?
// These catch typos when someone adds or edits a recipe.

const { check, loadCook, runChecks, assert } = require("./checker");
const { RECIPES, FAMILIES, OTHER_NAMES, cleanIngredient } = loadCook();

const DIET_LABELS = ["vegetarian", "vegan", "gluten-free"];
const ALLERGENS = ["gluten", "dairy", "egg", "soy", "peanut", "fish"];

check("every recipe has a name, cuisine, cooking time, servings and a price", () => {
  for (const recipe of RECIPES) {
    assert.ok(recipe.name, "a recipe has no name");
    assert.ok(recipe.cuisine, `${recipe.name} has no cuisine`);
    assert.ok(recipe.minutes > 0, `${recipe.name} has no cooking time`);
    assert.ok(recipe.servings > 0, `${recipe.name} has no servings`);
    assert.ok(recipe.price > 0, `${recipe.name} has no price`);
  }
});

check("no two recipes have the same name", () => {
  const names = RECIPES.map((recipe) => recipe.name);
  assert.strictEqual(new Set(names).size, names.length);
});

check("ingredient names are written the way the app expects (lowercase, singular)", () => {
  for (const recipe of RECIPES) {
    for (const item of recipe.ingredients) {
      assert.strictEqual(cleanIngredient(item), item, `${recipe.name}: "${item}" should be written as "${cleanIngredient(item)}"`);
    }
  }
});

check("diet labels are only vegetarian, vegan or gluten-free", () => {
  for (const recipe of RECIPES) {
    for (const label of recipe.diet) {
      assert.ok(DIET_LABELS.includes(label), `${recipe.name}: unknown diet label "${label}"`);
    }
  }
});

check('allergens use the agreed names (e.g. "dairy", not "milk")', () => {
  for (const recipe of RECIPES) {
    for (const allergen of recipe.allergens) {
      assert.ok(ALLERGENS.includes(allergen), `${recipe.name}: unknown allergen "${allergen}"`);
    }
  }
});

check("every vegan recipe is also labelled vegetarian", () => {
  for (const recipe of RECIPES.filter((recipe) => recipe.diet.includes("vegan"))) {
    assert.ok(recipe.diet.includes("vegetarian"), `${recipe.name} is vegan but not vegetarian`);
  }
});

check("no vegetarian recipe contains meat or fish", () => {
  const meatOrFish = [...FAMILIES.meat, ...FAMILIES.fish, "meat", "fish"];
  for (const recipe of RECIPES.filter((recipe) => recipe.diet.includes("vegetarian"))) {
    const found = recipe.ingredients.filter((item) => meatOrFish.includes(item));
    assert.deepStrictEqual(found, [], `${recipe.name} is vegetarian but contains ${found.join(", ")}`);
  }
});

check("recipes with cheese, butter, cream or milk are marked with the dairy allergen", () => {
  const dairy = ["cheese", ...FAMILIES.cheese, "butter", "cream", "milk", "yogurt"];
  for (const recipe of RECIPES) {
    if (recipe.ingredients.some((item) => dairy.includes(item))) {
      assert.ok(recipe.allergens.includes("dairy"), `${recipe.name} contains dairy but isn't marked "dairy"`);
    }
  }
});

check("other names point to a name the app knows", () => {
  const known = new Set([...RECIPES.flatMap((r) => r.ingredients), ...Object.values(FAMILIES).flat()]);
  for (const [other, name] of Object.entries(OTHER_NAMES)) {
    assert.ok(known.has(name), `"${other}" points to "${name}", which isn't a known ingredient`);
  }
});

module.exports = () => runChecks("Pantry checks (the recipe information)");
