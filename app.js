// THE WAITER
// Reads what the user picked, asks the cook (matcher.js), and shows the results.

const KNOWN_INGREDIENTS = allIngredients(RECIPES);
const MAX_SUGGESTIONS = 6;

const form = document.getElementById("search");
const filtersButton = document.getElementById("filters-button");
const filtersPanel = document.getElementById("filters-panel");
const haveEverythingSwitch = document.getElementById("have-everything");
const notesArea = document.getElementById("notes");
const countArea = document.getElementById("count");
const resultsArea = document.getElementById("results");

// ---- Ingredient boxes ("I have" and "Leave out") ----

const haveBox = createTagBox(document.getElementById("have-box"), "I have");
const outBox = createTagBox(document.getElementById("out-box"), "Leave out");
haveBox.other = outBox;
outBox.other = haveBox;

// Sets up one box: tags, suggestions while typing, and the rule that an
// ingredient can't be in both boxes at once.
function createTagBox(element, name) {
  const box = {
    name,
    items: [],
    other: null,
    element,
    input: element.querySelector("input"),
    tagsArea: element.querySelector(".tags"),
    list: element.querySelector(".suggestions"),
    message: document.createElement("p"),
    highlighted: -1,
  };
  box.message.className = "box-message";
  element.after(box.message);

  box.input.addEventListener("input", () => {
    // Typing or pasting a comma adds everything before it as tags.
    if (box.input.value.includes(",")) {
      const parts = box.input.value.split(",");
      box.input.value = parts.pop();
      parts.forEach((part) => addItem(box, part));
    }
    showSuggestions(box);
  });

  box.input.addEventListener("keydown", (event) => {
    const options = [...box.list.querySelectorAll("li:not(.blocked)")];
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (options.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      box.highlighted = (box.highlighted + step + options.length) % options.length;
      options.forEach((option, index) => option.classList.toggle("active", index === box.highlighted));
    } else if (event.key === "Enter" && box.input.value.trim() !== "") {
      event.preventDefault(); // add the tag instead of searching
      // The highlighted suggestion; otherwise the top one if it starts with
      // what was typed (a blocked one shows the "already in" message);
      // otherwise exactly what was typed.
      const typed = box.input.value.trim().toLowerCase();
      const top = box.list.hidden ? null : box.list.querySelector("li");
      if (options[box.highlighted]) addItem(box, options[box.highlighted].dataset.value);
      else if (top && top.dataset.value.startsWith(typed)) addItem(box, top.dataset.value);
      else addItem(box, box.input.value);
    } else if (event.key === "Backspace" && box.input.value === "" && box.items.length) {
      removeItem(box, box.items[box.items.length - 1]);
    } else if (event.key === "Escape") {
      hideSuggestions(box);
    }
  });

  box.input.addEventListener("blur", () => hideSuggestions(box));
  // mousedown (not click) so the choice lands before the box loses focus
  box.list.addEventListener("mousedown", (event) => {
    event.preventDefault();
    const option = event.target.closest("li:not(.blocked)");
    if (option) addItem(box, option.dataset.value);
  });
  box.tagsArea.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) removeItem(box, button.dataset.value);
  });
  element.addEventListener("click", (event) => {
    if (event.target === element || event.target === box.tagsArea) box.input.focus();
  });

  return box;
}

function addItem(box, text) {
  const item = cleanIngredient(text);
  box.input.value = "";
  hideSuggestions(box);
  if (item === "" || box.items.includes(item)) return;
  if (box.other.items.includes(item)) {
    box.message.textContent = `${capitalize(item)} is already in "${box.other.name}".`;
    return;
  }
  box.message.textContent = "";
  box.items.push(item);
  drawTags(box);
  search();
}

function removeItem(box, item) {
  box.items = box.items.filter((existing) => existing !== item);
  box.message.textContent = "";
  drawTags(box);
  search();
}

function drawTags(box) {
  box.tagsArea.innerHTML = box.items
    .map((item) => `<span class="tag">${escapeText(item)}<button type="button" data-value="${escapeText(item)}" aria-label="Remove ${escapeText(item)}">×</button></span>`)
    .join("");
}

// Suggestions: names starting with what's typed come first, then names
// containing it. Ingredients in the other box are shown greyed out.
function showSuggestions(box) {
  const typed = box.input.value.trim().toLowerCase();
  box.highlighted = -1;
  if (typed === "") return hideSuggestions(box);

  const notYetPicked = KNOWN_INGREDIENTS.filter((item) => !box.items.includes(item));
  const startsWith = notYetPicked.filter((item) => item.startsWith(typed));
  const contains = notYetPicked.filter((item) => !item.startsWith(typed) && item.includes(typed));
  const matches = [...startsWith, ...contains].slice(0, MAX_SUGGESTIONS);
  if (matches.length === 0) return hideSuggestions(box);

  box.list.innerHTML = matches
    .map((item) => {
      const blocked = box.other.items.includes(item);
      const note = blocked ? `<small>already in "${box.other.name}"</small>` : "";
      return `<li class="${blocked ? "blocked" : ""}" data-value="${escapeText(item)}">${escapeText(item)}${note}</li>`;
    })
    .join("");
  box.list.hidden = false;
}

function hideSuggestions(box) {
  box.list.hidden = true;
  box.highlighted = -1;
}

// ---- Filters dropdown ----

filtersButton.addEventListener("click", () => setFiltersOpen(filtersPanel.hidden));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".filters")) setFiltersOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setFiltersOpen(false);
});
filtersPanel.addEventListener("change", () => {
  const count = filtersPanel.querySelectorAll("input:checked").length;
  filtersButton.textContent = count ? `Filters (${count}) ▾` : "Filters ▾";
  search();
});

function setFiltersOpen(open) {
  filtersPanel.hidden = !open;
  filtersButton.setAttribute("aria-expanded", String(open));
}

// ---- Searching and showing results ----

form.addEventListener("submit", (event) => {
  event.preventDefault();
  // Anything still being typed counts too.
  if (haveBox.input.value.trim()) addItem(haveBox, haveBox.input.value);
  if (outBox.input.value.trim()) addItem(outBox, outBox.input.value);
  search();
});

function search() {
  if (haveBox.items.length === 0) {
    notesArea.innerHTML = "";
    countArea.textContent = "";
    resultsArea.innerHTML = "";
    return;
  }

  const diets = [...filtersPanel.querySelectorAll('input[name="diet"]:checked')].map((box) => box.value);
  const { results, notes } = findRecipes(RECIPES, haveBox.items, {
    diets,
    leaveOut: outBox.items,
    haveEverything: haveEverythingSwitch.checked,
  });

  notesArea.innerHTML = notes.map((note) => `<p class="note">${escapeText(note)}</p>`).join("");
  countArea.textContent = results.length === 1 ? "1 recipe found" : `${results.length} recipes found`;
  resultsArea.innerHTML = results.length
    ? results.map(recipeCard).join("")
    : `<p class="empty">No recipes match. Try more ingredients or fewer filters.</p>`;
}

function recipeCard({ recipe, labels, have, missing }) {
  const picture = recipe.image
    ? `<img class="thumb" src="${escapeText(recipe.image)}" alt="">`
    : `<div class="thumb" style="--shift: ${placeholderShift(recipe.name)}deg"></div>`;
  const facts = [
    recipe.cuisine,
    `${recipe.minutes} min`,
    `${recipe.servings} serving${recipe.servings > 1 ? "s" : ""}`,
    `~€${recipe.price.toFixed(2)}`,
    ...labels,
  ];
  const missingLine = missing.length
    ? `<p><span class="missing">Missing:</span> ${missing.map(escapeText).join(", ")}</p>`
    : `<p class="ready">You have everything!</p>`;

  return `
    <article class="card">
      ${picture}
      <div class="card-body">
        <h2>${escapeText(recipe.name)}</h2>
        <p class="facts">${facts.map(escapeText).join(" · ")}</p>
        <p>You have: ${have.map(escapeText).join(", ")}</p>
        ${missingLine}
      </div>
    </article>`;
}

// Gives each placeholder picture a slightly different shade, based on the name.
function placeholderShift(name) {
  const total = [...name].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return (total % 7) * 8 - 24;
}

// Stops typed text from being treated as page code.
function escapeText(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
