// THE COOK
// Takes the user's ingredients and choices, and picks + ranks recipes.
// It doesn't know where recipes come from or what the page looks like.
// It uses the reference book (ingredients.js) to understand families and other names.

// Turns "  Zucchinis " into "courgette" so typing style doesn't matter.
function cleanIngredient(text) {
  let word = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (word.endsWith("ies")) word = word.slice(0, -3) + "y"; // strawberries -> strawberry
  else if (word.endsWith("oes")) word = word.slice(0, -2); // tomatoes -> tomato
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

// ---- Typos ----

// How many single-letter changes (add, remove or swap one letter) turn a into b.
// e.g. "brocoli" -> "broccoli" is 1 (add a c).
function letterChanges(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const swap = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, swap);
    }
    previous = current;
  }
  return previous[b.length];
}

// The known ingredient a typo most likely meant, or null.
// "Close" means: words of up to 5 letters may be 1 change away, longer words 2.
// Known words (and words close to nothing) get null.
function closestIngredient(word, recipes) {
  const known = allIngredients(recipes);
  if (known.includes(word)) return null;
  const allowed = word.length <= 5 ? 1 : 2;
  let best = null;
  let bestChanges = allowed + 1;
  for (const name of known) {
    const changes = letterChanges(word, name);
    if (changes < bestChanges) {
      best = name;
      bestChanges = changes;
    }
  }
  return best;
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

// The recipes that pass the filters and contain nothing from "Leave out".
// options.diets: labels a recipe must have, e.g. ["vegetarian", "dairy-free"]
// options.leaveOut: ingredients or families the user doesn't want, e.g. ["meat"]
function allowedRecipes(recipes, options) {
  const passesDiets = (recipe) => options.diets.every((diet) => labelsOf(recipe).includes(diet));
  const avoidsLeftOut = (recipe) =>
    !recipe.ingredients.some((item) => options.leaveOut.some((out) => isLeftOutBy(item, out)));
  return recipes.filter((recipe) => passesDiets(recipe) && avoidsLeftOut(recipe));
}

// ---- Sorting ----
// Each sort compares two recipes; ties fall back to the default order
// (A to Z when browsing, Buy Less when ingredients are typed).

function pricePerServing(recipe) {
  return recipe.price / recipe.servings;
}

const byName = (a, b) => a.name.localeCompare(b.name);
const byTime = (a, b) => a.minutes - b.minutes;
const byPricePerServing = (a, b) => pricePerServing(a) - pricePerServing(b);

// Browsing: compares recipes.
const BROWSE_SORTS = {
  "a-z": byName,
  quickest: (a, b) => byTime(a, b) || byName(a, b),
  cheapest: (a, b) => byPricePerServing(a, b) || byName(a, b),
};

// Ingredients typed: compares results ({ recipe, have, missing }).
const buyLess = (a, b) => a.missing.length - b.missing.length || b.have.length - a.have.length;
const FIND_SORTS = {
  "buy-less": buyLess,
  "use-most": (a, b) => b.have.length - a.have.length || buyLess(a, b),
  quickest: (a, b) => byTime(a.recipe, b.recipe) || buyLess(a, b),
  cheapest: (a, b) => byPricePerServing(a.recipe, b.recipe) || buyLess(a, b),
};

// Browsing, when no ingredients are typed: every allowed recipe, A to Z
// unless options.sortBy says "quickest" or "cheapest".
function browseRecipes(recipes, options) {
  const compare = BROWSE_SORTS[options.sortBy] || BROWSE_SORTS["a-z"];
  return allowedRecipes(recipes, options).sort(compare);
}

// typed: ingredients the user has, e.g. ["egg", "cheddar"]
// options: the same filters and "Leave out" as allowedRecipes, plus
// options.sortBy: "buy-less" (default), "use-most", "quickest" or "cheapest"
function findRecipes(recipes, typed, options) {
  const results = [];
  for (const recipe of allowedRecipes(recipes, options)) {
    // have: [{ needed: "cheese", using: "cheddar" }, ...]
    const have = [];
    const missing = [];
    for (const needed of recipe.ingredients) {
      const using = typed.find((item) => item === needed) || typed.find((item) => covers(item, needed));
      if (using) have.push({ needed, using });
      else missing.push(needed);
    }

    if (have.length === 0) continue; // Rule 3: uses none of your ingredients

    results.push({ recipe, labels: labelsOf(recipe), have, missing });
  }

  // Default (Buy Less) is the cook's rule 1 and 2: fewest missing first, then uses more of yours.
  results.sort(FIND_SORTS[options.sortBy] || FIND_SORTS["buy-less"]);

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
