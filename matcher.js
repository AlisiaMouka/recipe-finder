// THE COOK
// Takes the user's ingredients and choices, and picks + ranks recipes.
// It doesn't know where recipes come from or what the page looks like.
// It uses the reference book (ingredients.js) to understand families and other names.

// Turns "  Zucchinis " into "courgette" so typing style doesn't matter.
function cleanIngredient(text) {
  let word = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (word.endsWith("oes")) word = word.slice(0, -2); // tomatoes -> tomato
  else if (word.endsWith("s") && !word.endsWith("ss")) word = word.slice(0, -1); // eggs -> egg
  return OTHER_NAMES[word] || word;
}

// Every ingredient name the app knows, A to Z: pantry ingredients,
// family names and family members. Used for suggestions while typing.
function allIngredients(recipes) {
  const names = new Set(recipes.flatMap((recipe) => recipe.ingredients));
  for (const [family, members] of Object.entries(FAMILIES)) {
    names.add(family);
    members.forEach((member) => names.add(member));
  }
  return [...names].sort();
}

// True when `item` belongs to `family`, e.g. ("cheddar", "cheese").
function isMemberOf(item, family) {
  return (FAMILIES[family] || []).includes(item);
}

// Does having `have` cover a recipe that needs `needed`?
// Cheddar covers "cheese", but "cheese" does not cover "parmesan".
function covers(have, needed) {
  return have === needed || isMemberOf(have, needed);
}

// Is a recipe ingredient ruled out by a "Leave out" item?
// Leaving out "cheese" rules out parmesan too.
function isLeftOutBy(ingredient, leftOut) {
  return ingredient === leftOut || isMemberOf(ingredient, leftOut);
}

// Two items clash when they're the same, or one is a family the other belongs to.
// Used to stop the same food being in "I have" and "Leave out" at once.
function clashes(a, b) {
  return a === b || isMemberOf(a, b) || isMemberOf(b, a);
}

// A recipe's labels: the ones written in the pantry, plus "dairy-free"
// when its allergens don't include dairy.
function labelsOf(recipe) {
  const labels = [...recipe.diet];
  if (!recipe.allergens.includes("dairy")) labels.push("dairy-free");
  return labels;
}

// typed: ingredients the user has, e.g. ["egg", "cheddar"]
// options.leaveOut: ingredients or families the user doesn't want, e.g. ["meat"]
// options.diets: labels a recipe must have, e.g. ["vegetarian", "dairy-free"]
// options.haveEverything: true = only recipes with nothing missing
function findRecipes(recipes, typed, options) {
  const passesDiets = (recipe) => options.diets.every((diet) => labelsOf(recipe).includes(diet));
  const avoidsLeftOut = (recipe) =>
    !recipe.ingredients.some((item) => options.leaveOut.some((out) => isLeftOutBy(item, out)));
  const allowed = recipes.filter((recipe) => passesDiets(recipe) && avoidsLeftOut(recipe));

  const results = [];
  for (const recipe of allowed) {
    // have: [{ needed: "cheese", using: "cheddar" }, ...]
    const have = [];
    const missing = [];
    for (const needed of recipe.ingredients) {
      const using = typed.find((item) => item === needed) || typed.find((item) => covers(item, needed));
      if (using) have.push({ needed, using });
      else missing.push(needed);
    }

    if (have.length === 0) continue; // Rule 3: uses none of your ingredients
    if (options.haveEverything && missing.length > 0) continue;

    results.push({ recipe, labels: labelsOf(recipe), have, missing });
  }

  // Rule 1: fewest missing first. Rule 2: if tied, uses more of yours first.
  results.sort((a, b) => a.missing.length - b.missing.length || b.have.length - a.have.length);

  return { results, notes: explainUnusedIngredients(recipes, typed, options.diets) };
}

// Explains typed ingredients that no recipe can use,
// e.g. "Chicken was ignored because Vegetarian is on."
function explainUnusedIngredients(recipes, typed, diets) {
  const notes = [];
  for (const item of typed) {
    const usedAnywhere = recipes.filter((recipe) => recipe.ingredients.some((needed) => covers(item, needed)));
    const usedInAllowed = usedAnywhere.some((recipe) => diets.every((diet) => labelsOf(recipe).includes(diet)));

    if (usedAnywhere.length === 0 && FAMILIES[item]) {
      const examples = FAMILIES[item].filter((member) => recipes.some((recipe) => recipe.ingredients.includes(member)));
      const hint = examples.length ? ` Add specific ones, like ${examples.slice(0, 2).join(" or ")}.` : "";
      notes.push(`"${capitalize(item)}" only finds recipes that ask for any ${item}.${hint}`);
    } else if (usedAnywhere.length === 0) {
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
