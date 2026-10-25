// THE WAITER
// Reads what the user typed, asks the cook (matcher.js), and shows the results.

const form = document.getElementById("search");
const ingredientsBox = document.getElementById("ingredients");
const haveEverythingSwitch = document.getElementById("have-everything");
const notesArea = document.getElementById("notes");
const countArea = document.getElementById("count");
const resultsArea = document.getElementById("results");

function search() {
  const typed = readIngredientList(ingredientsBox.value);
  if (typed.length === 0) {
    notesArea.innerHTML = "";
    countArea.textContent = "";
    resultsArea.innerHTML = "";
    return;
  }

  const diets = [...form.querySelectorAll('input[name="diet"]:checked')].map((box) => box.value);
  const { results, notes } = findRecipes(RECIPES, typed, {
    diets,
    haveEverything: haveEverythingSwitch.checked,
  });

  notesArea.innerHTML = notes.map((note) => `<p class="note">${escapeText(note)}</p>`).join("");
  countArea.textContent = results.length === 1 ? "1 recipe found" : `${results.length} recipes found`;
  resultsArea.innerHTML = results.length
    ? results.map(recipeCard).join("")
    : `<p class="empty">No recipes match. Try more ingredients or fewer filters.</p>`;
}

function recipeCard({ recipe, have, missing }) {
  const missingLine = missing.length
    ? `<p><strong>Missing:</strong> ${missing.map(escapeText).join(", ")}</p>`
    : `<p class="ready">You have everything!</p>`;
  const allergenLine = recipe.allergens.length
    ? `<p class="allergens">May contain: ${recipe.allergens.map(escapeText).join(", ")}</p>`
    : "";

  return `
    <article class="card">
      <h2>${escapeText(recipe.name)}</h2>
      <p class="facts">${escapeText(recipe.cuisine)} · ${recipe.minutes} min · ${recipe.servings} serving${recipe.servings > 1 ? "s" : ""} · ~€${recipe.price.toFixed(2)}</p>
      <div class="badges">${recipe.diet.map((diet) => `<span class="badge">${escapeText(diet)}</span>`).join("")}</div>
      <p><strong>You have:</strong> ${have.map(escapeText).join(", ")}</p>
      ${missingLine}
      ${allergenLine}
    </article>`;
}

// Stops typed text from being treated as page code.
function escapeText(text) {
  const box = document.createElement("span");
  box.textContent = text;
  return box.innerHTML;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  search();
});
form.addEventListener("change", search);
