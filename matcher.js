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

// Every ingredient the pantry knows, A to Z. Used for suggestions while typing.
function allIngredients(recipes) {
  const names = new Set(recipes.flatMap((recipe) => recipe.ingredients));
  return [...names].sort();
}

// A recipe's labels: the ones written in the pantry, plus "dairy-free"
// when its allergens don't include dairy.
function labelsOf(recipe) {
  const labels = [...recipe.diet];
  if (!recipe.allergens.includes("dairy")) labels.push("dairy-free");
  return labels;
}

// typed: ingredients the user has, e.g. ["egg", "rice"]
// options.leaveOut: ingredients the user doesn't want, e.g. ["mushroom"]
// options.diets: labels a recipe must have, e.g. ["vegetarian", "dairy-free"]
// options.haveEverything: true = only recipes with nothing missing
function findRecipes(recipes, typed, options) {
  const passesDiets = (recipe) => options.diets.every((diet) => labelsOf(recipe).includes(diet));
  const avoidsLeftOut = (recipe) => !recipe.ingredients.some((item) => options.leaveOut.includes(item));
  const allowed = recipes.filter((recipe) => passesDiets(recipe) && avoidsLeftOut(recipe));

  const results = [];
  for (const recipe of allowed) {
    const have = recipe.ingredients.filter((item) => typed.includes(item));
    const missing = recipe.ingredients.filter((item) => !typed.includes(item));

    if (have.length === 0) continue; // Rule 3: uses none of your ingredients
    if (options.haveEverything && missing.length > 0) continue;

    results.push({ recipe, labels: labelsOf(recipe), have, missing });
  }

  // Rule 1: fewest missing first. Rule 2: if tied, uses more of yours first.
  results.sort((a, b) => a.missing.length - b.missing.length || b.have.length - a.have.length);

  return { results, notes: explainUnusedIngredients(recipes, typed, options.diets) };
}

// Explains typed ingredients that the switched-on filters rule out,
// e.g. "Chicken was ignored because Vegetarian is on."
function explainUnusedIngredients(recipes, typed, diets) {
  const notes = [];
  for (const item of typed) {
    const usedAnywhere = recipes.filter((recipe) => recipe.ingredients.includes(item));
    const usedInAllowed = usedAnywhere.some((recipe) => diets.every((diet) => labelsOf(recipe).includes(diet)));

    if (usedAnywhere.length === 0) {
      notes.push(`We don't have any recipes with ${item} yet.`);
    } else if (!usedInAllowed) {
      // Which switched-on filters rule this ingredient out?
      let blocking = diets.filter((diet) => usedAnywhere.every((recipe) => !labelsOf(recipe).includes(diet)));
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
