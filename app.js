// THE WAITER
// Reads what the user picked, asks the cook (matcher.js), and shows the results.

// Everything you can type: known names, plus other names that point to them.
const SEARCHABLE = [
  ...allIngredients(RECIPES).map((name) => ({ value: name, text: name })),
  ...Object.entries(OTHER_NAMES).map(([other, name]) => ({ value: name, text: other, alias: other })),
];
const MAX_SUGGESTIONS = 6;

const form = document.getElementById("search");
const filtersButton = document.getElementById("filters-button");
const filtersPanel = document.getElementById("filters-panel");
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
  box.covers = document.createElement("p"); // "Also leaving out: ..." (Leave out box only)
  box.covers.className = "covers";
  box.message.after(box.covers);

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
      else if (top && top.dataset.match.startsWith(typed)) addItem(box, top.dataset.value);
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
  const clash = box.other.items.find((other) => clashes(item, other));
  if (clash) {
    box.message.textContent = clashMessage(item, clash, box.other.name);
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

// e.g. 'Cheddar counts as cheese, which is in "Leave out".'
function clashMessage(item, other, otherBoxName) {
  if (item === other) return `${capitalize(item)} is already in "${otherBoxName}".`;
  if (isMemberOf(item, other)) return `${capitalize(item)} counts as ${other}, which is in "${otherBoxName}".`;
  return `${capitalize(item)} includes ${other}, which is in "${otherBoxName}".`;
}

function drawTags(box) {
  box.tagsArea.innerHTML = box.items
    .map((item) => `<span class="tag">${escapeText(item)}<button type="button" data-value="${escapeText(item)}" aria-label="Remove ${escapeText(item)}">×</button></span>`)
    .join("");

  // In "Leave out", list what the families cover, so there are no surprises.
  if (box === outBox) {
    const members = [...new Set(box.items.flatMap((item) => FAMILIES[item] || []))];
    box.covers.innerHTML = members.length ? `Also leaving out: <b>${members.map(escapeText).join(", ")}</b>` : "";
  }
}

// Suggestions: names starting with what's typed come first, then names
// containing it. Another name shows faintly next to the one we use.
// Ingredients that clash with the other box are shown greyed out.
function showSuggestions(box) {
  const typed = box.input.value.trim().toLowerCase();
  box.highlighted = -1;
  if (typed === "") return hideSuggestions(box);

  const notYetPicked = SEARCHABLE.filter((entry) => !box.items.includes(entry.value));
  const startsWith = notYetPicked.filter((entry) => entry.text.startsWith(typed));
  const contains = notYetPicked.filter((entry) => !entry.text.startsWith(typed) && entry.text.includes(typed));
  const seen = new Set();
  const matches = [...startsWith, ...contains]
    .filter((entry) => !seen.has(entry.value) && seen.add(entry.value))
    .slice(0, MAX_SUGGESTIONS);
  if (matches.length === 0) return hideSuggestions(box);

  box.list.innerHTML = matches
    .map(({ value, text, alias }) => {
      const clash = box.other.items.find((other) => clashes(value, other));
      const aliasNote = alias ? `<small class="alias">${escapeText(alias)}</small>` : "";
      const clashNote = clash
        ? `<small>${clash === value ? "already" : escapeText(clash) + " is"} in "${box.other.name}"</small>`
        : "";
      return `<li class="${clash ? "blocked" : ""}" data-value="${escapeText(value)}" data-match="${escapeText(text)}">${escapeText(value)}${aliasNote}${clashNote}</li>`;
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
  const diets = [...filtersPanel.querySelectorAll('input[name="diet"]:checked')].map((box) => box.value);
  const options = { diets, leaveOut: outBox.items };

  // Nothing typed in "I have": browse every recipe that passes the filters, A to Z.
  if (haveBox.items.length === 0) {
    const recipes = browseRecipes(RECIPES, options);
    notesArea.innerHTML = "";
    countArea.innerHTML = `<b>${escapeText(browseTitle(diets, outBox.items))}</b> · ${recipes.length}, A to Z`;
    resultsArea.innerHTML = recipes.length
      ? recipes.map((recipe) => recipeCard({ recipe, labels: labelsOf(recipe) })).join("")
      : `<p class="empty">No recipes match. Try fewer filters.</p>`;
    return;
  }

  const { results, notes } = findRecipes(RECIPES, haveBox.items, options);

  notesArea.innerHTML = notes.map((note) => `<p class="note">${escapeText(note)}</p>`).join("");
  countArea.textContent = results.length === 1 ? "1 recipe found" : `${results.length} recipes found`;
  resultsArea.innerHTML = results.length
    ? results.map(recipeCard).join("")
    : `<p class="empty">No recipes match. Try more ingredients or fewer filters.</p>`;
}

// e.g. "All recipes", "Vegan recipes", "Vegan + gluten-free recipes without meat"
function browseTitle(diets, leaveOut) {
  const title = diets.length ? `${capitalize(diets.join(" + "))} recipes` : "All recipes";
  return leaveOut.length ? `${title} without ${leaveOut.join(", ")}` : title;
}

// When browsing, `have` is not given and the card lists the ingredients instead.
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
  const ingredientLines = !have
    ? `<p>Ingredients: ${recipe.ingredients.map(escapeText).join(", ")}</p>`
    : `<p>You have: ${have.map(describeHave).join(", ")}</p>` +
      (missing.length
        ? `<p><span class="missing">Missing:</span> ${missing.map(escapeText).join(", ")}</p>`
        : `<p class="ready">You have everything!</p>`);

  return `
    <article class="card">
      ${picture}
      <div class="card-body">
        <h2>${escapeText(recipe.name)}</h2>
        <p class="facts">${facts.map(escapeText).join(" · ")}</p>
        ${ingredientLines}
        <details class="steps">
          <summary><span class="when-closed">Show steps ▾</span><span class="when-open">Hide steps ▴</span></summary>
          <ol>${recipe.steps.map((step) => `<li>${escapeText(step)}</li>`).join("")}</ol>
        </details>
      </div>
    </article>`;
}

// "cheddar (as cheese)" when a family member stands in for the family.
function describeHave({ needed, using }) {
  if (using === needed) return escapeText(using);
  return `${escapeText(using)} <span class="as">(as ${escapeText(needed)})</span>`;
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

// Show every recipe as soon as the page opens.
search();
