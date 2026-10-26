// A tiny homemade test checker. No extra tools to install.
// Each check has a plain-language sentence saying which rule it protects.

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const checks = [];

// Registers a check: check("cheddar counts as cheese", () => { ... })
function check(sentence, run) {
  checks.push({ sentence, run });
}

// Loads the pantry, the reference book and the cook (no browser needed),
// and returns what they define.
function loadCook() {
  const code = ["recipes.js", "ingredients.js", "matcher.js"]
    .map((file) => fs.readFileSync(path.join(ROOT, file), "utf8"))
    .join("\n");
  const exported = "RECIPES, FAMILIES, OTHER_NAMES, findRecipes, browseRecipes, cleanIngredient, closestIngredient, letterChanges, allIngredients, labelsOf";
  return new Function(`${code}\nreturn { ${exported} };`)();
}

// Runs every registered check and prints PASS/FAIL. Returns the number of failures.
async function runChecks(title) {
  console.log(`\n${title}`);
  let failures = 0;
  for (const { sentence, run } of checks.splice(0)) {
    try {
      await run();
      console.log(`  PASS  ${sentence}`);
    } catch (error) {
      failures++;
      console.log(`  FAIL  ${sentence}\n        ${error.message.split("\n").join("\n        ")}`);
    }
  }
  return failures;
}

module.exports = { check, loadCook, runChecks, assert, ROOT };
