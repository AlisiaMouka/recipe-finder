// THE COOK
// Takes the user's ingredients and choices, and picks + ranks recipes.
// It doesn't know where recipes come from or what the page looks like.

// Turns "  Tomatoes " into "tomato" so typing style doesn't matter.
function cleanIngredient(text) {
  let word = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (word.endsWith("oes")) return word.slice(0, -2); // tomatoes -> tomato
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1); // eggs -> egg
  return word;
}

// Turns "eggs, Cheese ,, spinach" into ["egg", "cheese", "spinach"] (no repeats).
function readIngredientList(text) {
  const words = text.split(",").map(cleanIngredient).filter((word) => word !== "");
  return [...new Set(words)];
}

// options.diets: labels a recipe must have, e.g. ["vegetarian"]
// options.haveEverything: true = only recipes with nothing missing
function findRecipes(recipes, typed, options) {
  const passesDiets = (recipe) => options.diets.every((diet) => recipe.diet.includes(diet));
  const allowed = recipes.filter(passesDiets);

  const results = [];
  for (const recipe of allowed) {
    const have = recipe.ingredients.filter((item) => typed.includes(item));
    const missing = recipe.ingredients.filter((item) => !typed.includes(item));

    if (have.length === 0) continue; // Rule 3: uses none of your ingredients
    if (options.haveEverything && missing.length > 0) continue;

    results.push({ recipe, have, missing });
  }

  // Rule 1: fewest missing first. Rule 2: if tied, uses more of yours first.
  results.sort((a, b) => a.missing.length - b.missing.length || b.have.length - a.have.length);

  return { results, notes: explainUnusedIngredients(recipes, allowed, typed, options.diets) };
}

// Explains typed ingredients that no shown recipe can use,
// e.g. "Chicken was ignored because Vegetarian is on."
function explainUnusedIngredients(recipes, allowed, typed, diets) {
  const notes = [];
  for (const item of typed) {
    const usedAnywhere = recipes.filter((recipe) => recipe.ingredients.includes(item));
    const usedInAllowed = allowed.some((recipe) => recipe.ingredients.includes(item));

    if (usedAnywhere.length === 0) {
      notes.push(`We don't have any recipes with ${item} yet.`);
    } else if (!usedInAllowed) {
      // Which switched-on filters rule this ingredient out?
      let blocking = diets.filter((diet) => usedAnywhere.every((recipe) => !recipe.diet.includes(diet)));
      if (blocking.length === 0) blocking = diets; // only the combination rules it out
      const verb = blocking.length === 1 ? "is" : "are";
      notes.push(`${capitalize(item)} was ignored because ${blocking.map(capitalize).join(" + ")} ${verb} on.`);
    }
  }
  return notes;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
