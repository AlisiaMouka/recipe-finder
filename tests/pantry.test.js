// PANTRY CHECKS
// Is the recipe information complete and consistent?
// These catch typos when someone adds or edits a recipe.

const { check, loadCook, runChecks, assert } = require("./checker");
const fs = require("fs");
const path = require("path");
const { RECIPES, PHOTO_CREDITS, FAMILIES, OTHER_NAMES, cleanIngredient } = loadCook();
const ROOT = path.join(__dirname, "..");

const DIET_LABELS = ["vegetarian", "vegan", "gluten-free"];
const ALLERGENS = ["gluten", "dairy", "egg", "soy", "peanut", "fish", "shellfish", "sesame"];

check("every recipe has a name, cuisine, cooking time, servings and a price", () => {
  for (const recipe of RECIPES) {
    assert.ok(recipe.name, "a recipe has no name");
    assert.ok(recipe.cuisine, `${recipe.name} has no cuisine`);
    assert.ok(recipe.minutes > 0, `${recipe.name} has no cooking time`);
    assert.ok(recipe.servings > 0, `${recipe.name} has no servings`);
    assert.ok(recipe.price > 0, `${recipe.name} has no price`);
  }
});

check("every recipe has 3 to 8 cooking steps", () => {
  for (const recipe of RECIPES) {
    const count = (recipe.steps || []).length;
    assert.ok(count >= 3 && count <= 8, `${recipe.name} has ${count} steps`);
  }
});

check("every ingredient is mentioned in the cooking steps", () => {
  for (const recipe of RECIPES) {
    const allSteps = (recipe.steps || []).join(" ").toLowerCase();
    for (const item of recipe.ingredients) {
      // Ignore longer ingredient names that contain this one ("olive oil" when checking "olive").
      let text = allSteps;
      for (const longer of recipe.ingredients.filter((other) => other !== item && other.includes(item))) {
        text = text.split(longer).join(" ");
      }
      const plural = item.endsWith("y") ? item.slice(0, -1) + "ies" : item + "s";
      const mentioned = new RegExp(`\\b(${item}|${item}es|${plural})\\b`).test(text);
      assert.ok(mentioned, `${recipe.name}: the steps never mention "${item}"`);
    }
  }
});

check("every recipe has a drawing, and that drawing exists in images/illustrations", () => {
  for (const recipe of RECIPES) {
    assert.ok(recipe.illustration, `${recipe.name} has no illustration`);
    const file = path.join(ROOT, "images", "illustrations", `${recipe.illustration}.svg`);
    assert.ok(fs.existsSync(file), `${recipe.name}: there is no drawing called "${recipe.illustration}"`);
  }
});

check("every photo a recipe points to exists", () => {
  for (const recipe of RECIPES.filter((recipe) => recipe.image)) {
    assert.ok(fs.existsSync(path.join(ROOT, recipe.image)), `${recipe.name}: ${recipe.image} is missing`);
  }
});

check('every photo has a credit line (write "Own photo" for your own)', () => {
  for (const recipe of RECIPES.filter((recipe) => recipe.image)) {
    assert.ok(PHOTO_CREDITS[recipe.name], `${recipe.name} has a photo but no credit in photo-credits.js`);
  }
});

check("every credit belongs to a recipe that has a photo", () => {
  for (const name of Object.keys(PHOTO_CREDITS)) {
    const recipe = RECIPES.find((recipe) => recipe.name === name);
    assert.ok(recipe, `photo-credits.js mentions "${name}", but there's no recipe with that name`);
    assert.ok(recipe.image, `photo-credits.js has a credit for "${name}", but that recipe has no photo`);
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

check("no vegan recipe contains egg, dairy or honey", () => {
  for (const recipe of RECIPES.filter((recipe) => recipe.diet.includes("vegan"))) {
    const problems = recipe.allergens.filter((a) => a === "egg" || a === "dairy");
    if (recipe.ingredients.includes("honey")) problems.push("honey");
    assert.deepStrictEqual(problems, [], `${recipe.name} is vegan but contains ${problems.join(", ")}`);
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
