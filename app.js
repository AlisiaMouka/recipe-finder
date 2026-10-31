/* Recipe Finder: local-first UI. No API calls, analytics or accounts. */
(function () {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const E = window.KitchenEngine;
  const catalog = E.buildCatalog(
    typeof RECIPES === "undefined" ? [] : RECIPES,
    window.EXTRA_RECIPES || [],
    window.RECIPE_ENHANCEMENTS || [],
  );
  const byId = new Map(catalog.map((r) => [r.id, r]));
  const ICONS = {
    arrow: "M4 12h16m-6-6 6 6-6 6",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    close: "m6 6 12 12M6 18 18 6",
    search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    clock: "M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    leaf: "M4 20C3 8 10 4 21 3c1 11-4 18-15 16m-3 3L15 10",
    bag: "M5 7h14l2 14H3L5 7ZM8 8V6a4 4 0 0 1 8 0v2",
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8",
    bookmark: "M6 3h12v19l-6-4-6 4V3Z",
    grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
    sliders: "M4 7h9m4 0h3M4 17h3m4 0h9M13 4v6M7 14v6",
    sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
    jar: "M7 2h10v4H7V2ZM6 6h12l1 4v11H5V10l1-4Zm-1 6h14",
    chevron: "m6 9 6 6 6-6",
    check: "m5 12 4 4L19 6",
    lock: "M5 10h14v11H5V10Zm3 0V6a4 4 0 0 1 8 0v4",
    spark: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z",
    users:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 8a4 4 0 0 1 5 4v2m-5-18a4 4 0 0 1 0 8",
    coin: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M16 7c-5-4-9 6-3 10l3-1M7 10h8M7 14h7",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    print: "M6 9V2h12v7M6 18H3V9h18v9h-3M6 14h12v8H6v-8",
    play: "m8 4 12 8-12 8V4Z",
    calendar: "M3 5h18v17H3V5ZM7 2v6m10-6v6M3 11h18",
    back: "M20 12H4m6-6-6 6 6 6",
  };
  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name] || ICONS.leaf}"/></svg>`;
  }
  function icons(root = document) {
    $$("[data-icon]", root).forEach((el) => {
      el.outerHTML = icon(el.dataset.icon);
    });
  }
  function esc(v) {
    return String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function cap(v) {
    return String(v).charAt(0).toUpperCase() + String(v).slice(1);
  }
  function safeUrl(v) {
    try {
      const u = new URL(v);
      return u.protocol === "https:" ? u.href : "";
    } catch {
      return "";
    }
  }
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const Store = window.KitchenState;
  const loaded = (() => {
    try {
      return Store.read(localStorage, catalog);
    } catch {
      return { state: Store.defaults(), available: false };
    }
  })();
  let storageAvailable = loaded.available;
  let state = loaded.state;
  let pendingIngredients = [],
    pendingKind = "pantry",
    page = 0,
    savedMatchesOnly = false;
  let planContext = null,
    pendingDay = null,
    pendingImport = null;
  const motion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  function pageCapacity() {
    // The visitor's "Show" choice wins; 0 means "Fit screen".
    if (state.pageSize) return state.pageSize;
    if (innerWidth <= 960) return 4;
    return (innerWidth >= 1200 ? 3 : 2) * (innerHeight < 820 ? 1 : 2);
  }
  let view = "discover",
    collection = "all",
    query = "",
    sort = "recommended",
    pageSize = pageCapacity(),
    results = [],
    currentRecipe = null,
    currentServings = 2,
    cookStep = -1,
    ingredientChecks = new Set(),
    stepChecks = new Set(),
    suggestionIndex = -1,
    suggestions = [],
    toastTimeout,
    recipeReturnFocus = null;
  function persist() {
    try {
      localStorage.setItem(Store.KEY, JSON.stringify(state));
    } catch {
      if (storageAvailable)
        toast(
          "Browser storage is unavailable. Your changes will last for this visit.",
        );
      storageAvailable = false;
    }
  }
  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(
      () => $("#toast").classList.remove("visible"),
      3800,
    );
  }
  // Shown rounded as little as possible (the cook's roundAmount); exact inside.
  function amount(value, unit) {
    return value == null
      ? ""
      : E.roundAmount(value, unit).toLocaleString("en", {
          maximumFractionDigits: 3,
        });
  }

  function quantity(row) {
    if (row.amount == null) return "";
    return `${amount(row.amount, row.unit)} ${unitText(row)}`.trim();
  }
  function unitText(row) {
    const shown = row.amount == null ? row.amount : E.roundAmount(row.amount, row.unit);
    const unit =
      row.unit === "whole"
        ? ""
        : row.unit === "dessert spoon"
          ? "dsp"
          : row.unit || "";
    if (shown > 1 && unit === "leaf") return "leaves";
    if (shown > 1 && unit === "pinch") return "pinches";
    return (
      unit +
      (["clove", "slice", "cup", "stalk", "tablespoon", "teaspoon"].includes(
        unit,
      ) && shown > 1
        ? "s"
        : "")
    );
  }

  function timeLabel(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60),
      m = minutes % 60;
    return `${h}h${m ? " " + m + "m" : ""}`;
  }
  function art(r) {
    const entry = (window.RECIPE_ART || {})[r.id];
    return typeof entry === "string"
      ? entry
      : entry?.path || entry?.src || "images/plates/bowl.svg";
  }

  function options() {
    return {
      pantry: view === "saved" && !savedMatchesOnly ? [] : state.pantry,
      exclude: state.exclude,
      diets: [
        ...new Set([
          ...state.diets,
          ...(collection === "plant" ? ["vegan"] : []),
        ]),
      ],
      allergens: state.allergens,
      query,
      category: ["breakfast", "dessert"].includes(collection)
        ? collection
        : "all",
      cuisine: state.cuisine,
      maxTime:
        collection === "quick"
          ? Math.min(state.maxTime || 30, 30)
          : state.maxTime,
      maxMissing: view === "saved" && !savedMatchesOnly ? "" : state.maxMissing,
      sort,
      saved: state.saved,
      savedOnly: view === "saved",
    };
  }
  function resultFor(r) {
    const have = r.ingredients.flatMap((needed) => {
      const using = state.pantry.find((item) =>
        E.coversRequirement(
          item,
          needed,
          r.amounts.find((row) => row.ingredient === needed),
        ),
      );
      return using ? [{ needed, using }] : [];
    });
    return {
      recipe: r,
      have,
      missing: r.ingredients.filter((i) => !have.some((h) => h.needed === i)),
      match: Math.round((have.length / r.ingredients.length) * 100),
    };
  }
  function refresh(save = true) {
    const focus = focusKey(document.activeElement);
    renderPantry();
    updateResults();
    renderFilters();
    renderPlan();
    renderShopping();
    $("#saved-count").textContent = state.saved.length;
    if (save) persist();
    restoreFocus(focus);
  }
  function updateResults(resetPage = false) {
    if (resetPage) page = 0;
    results = E.search(catalog, options()).filter(
      (x) => !state.quantified || x.recipe.hasQuantities,
    );
    if (view === "saved" && !savedMatchesOnly)
      results = results.map((x) => resultFor(x.recipe));
    pageSize = pageCapacity();
    page = Math.min(
      page,
      Math.max(0, Math.ceil(results.length / pageSize) - 1),
    );
    renderCards();
  }
  function focusKey(el) {
    if (!el || el === document.body) return null;
    if (el.id) return { id: el.id };
    const attrs = [
      "data-save",
      "data-remove",
      "data-clear-filter",
      "data-servings",
      "data-step-check",
      "data-cook-next",
      "data-cook-prev",
      "data-exit-cook",
      "data-start-cook",
      "data-remove-plan",
    ];
    for (const key of attrs)
      if (el.hasAttribute(key))
        return {
          key,
          value: el.getAttribute(key),
          ingredient: el.dataset.ingredient,
        };
    return null;
  }
  function restoreFocus(key) {
    if (!key) return;
    let el = key.id
      ? document.getElementById(key.id)
      : $$("[" + key.key + "]").find(
          (x) =>
            x.getAttribute(key.key) === key.value &&
            (!key.ingredient || x.dataset.ingredient === key.ingredient),
        );
    if (!el && key.key === "data-remove") el = $("#pantry-input");
    if (!el && key.key === "data-save")
      el = $(".recipe-open") || $("#recipe-query");
    if (el?.disabled && key.key === "data-servings")
      el = $('[data-servings="' + (key.value === "1" ? "-1" : "1") + '"]');
    if (!el && key.key === "data-remove-plan")
      el = $("[data-plan-day]") || $("#plan-shopping");
    if (!el && key.key === "data-clear-filter") el = $("#filters-button");
    if (el && !el.disabled) el.focus({ preventScroll: true });
  }
  function redrawDetail(focus = true) {
    const key = focusKey(document.activeElement);
    const pickerOpen = $("#plan-picker") && !$("#plan-picker").hidden,
      pickedDay = $("#plan-day")?.value;
    renderDetail();
    if (pickerOpen) {
      $("#plan-picker").hidden = false;
      $("#plan-day").value = pickedDay;
    }
    saveSession();
    if (focus) restoreFocus(key);
  }
  function saveSession() {
    state.session = currentRecipe
      ? {
          recipeId: currentRecipe.id,
          servings: currentServings,
          cookStep,
          planKey: planContext?.key || null,
          ingredientChecks: [...ingredientChecks],
          stepChecks: [...stepChecks],
        }
      : null;
    persist();
  }
  function announceStep() {
    const el = $(".cook-step");
    if (el) {
      el.tabIndex = -1;
      el.focus({ preventScroll: true });
    }
  }

  function setView(next) {
    view = next;
    page = 0;
    $$("[data-view]").forEach((b) => {
      if (b.classList.contains("nav-link")) {
        b.classList.toggle("active", b.dataset.view === view);
        b.setAttribute(
          "aria-current",
          b.dataset.view === view ? "page" : "false",
        );
      }
    });
    $("#saved-match-label").hidden = view !== "saved";
    $("#discovery-layout").hidden = view === "plan";
    $("#planner").hidden = view !== "plan";
    $("#section-eyebrow").textContent =
      view === "saved"
        ? "THE ONES YOU WANT TO MAKE AGAIN"
        : view === "plan"
          ? "A WEEK OF GOOD FOOD"
          : "FROM YOUR PANTRY TO YOUR PLATE";
    $("#section-title").innerHTML =
      view === "saved"
        ? "Your personal <em>cookbook.</em>"
        : view === "plan"
          ? "A little planning. <em>A lovely week.</em>"
          : "Find your next <em>favorite.</em>";
    $("#section-description").textContent =
      view === "saved"
        ? "Good ideas, kept close."
        : view === "plan"
          ? "One less thing to think about."
          : "Simple ingredients. Very good things.";
    refresh(false);
    if (next !== "discover" && innerWidth <= 960)
      $("#kitchen").scrollIntoView({ behavior: motion(), block: "start" });
  }
  function renderPantry() {
    const tags = (arr, kind) =>
      arr
        .map(
          (name) =>
            `<span class="ingredient-tag">${esc(name)}<button data-remove="${kind}" data-ingredient="${esc(name)}" aria-label="Remove ${esc(name)}">${icon("close")}</button></span>`,
        )
        .join("");
    $("#pantry-tags").innerHTML = tags(state.pantry, "pantry");
    $("#exclude-tags").innerHTML = tags(state.exclude, "exclude");
    $("#pantry-count").textContent = state.pantry.length;
    $("#pantry-empty").hidden = state.pantry.length > 0;
    $("#clear-pantry").hidden = state.pantry.length === 0;
    $("#quick-ingredients").innerHTML = [
      "egg",
      "tomato",
      "pasta",
      "spinach",
      "chickpea",
      "potato",
    ]
      .filter((i) => !state.pantry.includes(i))
      .map((i) => `<button data-add="${i}">+ ${cap(i)}</button>`)
      .join("");
  }
  function addIngredients(text, kind = "pantry", allowCustom = false) {
    const parsed = E.parseIngredients(text)
      .map((i) => i.slice(0, 80))
      .filter(Boolean);
    const items =
      kind === "pantry"
        ? parsed.filter((i) => !["salt", "black pepper", "water"].includes(i))
        : parsed;
    if (!items.length) {
      toast(
        parsed.length
          ? "Salt, pepper and water are already assumed."
          : "Enter an ingredient name, such as egg or tomato.",
      );
      return;
    }
    const accepted = items.filter(
      (i) =>
        E.isKnownIngredient(i, catalog) ||
        state.custom.includes(i) ||
        allowCustom,
    );
    const unknown = items.filter((i) => !accepted.includes(i));
    if (allowCustom)
      state.custom = [
        ...new Set([
          ...state.custom,
          ...accepted.filter((i) => !E.isKnownIngredient(i, catalog)),
        ]),
      ];
    state[kind] = [...new Set([...state[kind], ...accepted])];
    pendingIngredients = unknown;
    pendingKind = kind;
    renderIngredientConfirmation();
    page = 0;
    if (accepted.length) {
      refresh();
      toast(
        kind === "pantry"
          ? `Added ${accepted.join(", ")}.`
          : "Exclusions updated.",
      );
    }
    $("#" + kind + "-input").value = "";
    hideSuggestions();
    if (pendingIngredients.length) $("#ingredient-confirmation button").focus();
    else $("#" + kind + "-input").focus();
    hideSuggestions();
  }
  function renderIngredientConfirmation() {
    const box = $("#ingredient-confirmation");
    box.hidden = !pendingIngredients.length;
    if (!pendingIngredients.length) {
      box.innerHTML = "";
      return;
    }
    const word = pendingIngredients[0];
    const matches = E.suggestions(word, catalog, [])
      .filter((x) => x !== word)
      .slice(0, 3);
    box.innerHTML = `<strong>Check “${esc(word)}”</strong><p>This name is not in our ingredient index. ${pendingKind === "exclude" ? "An unrecognized exclusion may not hide the recipes you expect." : "Choose a suggestion or explicitly keep it as a custom ingredient."}</p><div class="custom-confirmation-actions">${matches.map((x) => `<button data-resolve-ingredient="${esc(x)}">Use ${esc(x)}</button>`).join("")}<button data-custom-ingredient>Add as custom ${pendingKind === "exclude" ? "exclusion" : "ingredient"}</button><button data-skip-ingredient>Dismiss</button></div>${pendingIngredients.length > 1 ? `<small>${pendingIngredients.length - 1} more names to check</small>` : ""}`;
  }
  function resolveIngredient(value, custom = false) {
    pendingIngredients.shift();
    if (value) {
      state[pendingKind] = [...new Set([...state[pendingKind], value])];
      if (custom) state.custom = [...new Set([...state.custom, value])];
      page = 0;
      refresh();
    }
    renderIngredientConfirmation();
    const next = $("#ingredient-confirmation button");
    (next || $("#" + pendingKind + "-input")).focus();
  }

  function renderCards() {
    const count = results.length,
      pages = Math.max(1, Math.ceil(count / pageSize));
    $("#result-count").innerHTML =
      `<strong>${count}</strong> ${view === "saved" ? "saved " : ""}recipe${count === 1 ? "" : "s"}${state.pantry.length && (view !== "saved" || savedMatchesOnly) ? " · pantry matches" : ""}`;
    $("#recipe-grid").innerHTML = results
      .slice(page * pageSize, (page + 1) * pageSize)
      .map(card)
      .join("");
    $("#page-size").value = state.pageSize ? String(state.pageSize) : "fit";
    $("#recipe-grid").classList.toggle("chosen-size", state.pageSize > 0);
    $("#previous-page").disabled = page === 0;
    $("#next-page").disabled = page + 1 >= pages;
    $("#page-status").textContent = count
      ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, count)} of ${count} · Page ${page + 1} of ${pages}`
      : "No recipes";
    $("#empty-state").hidden = count > 0;
    $(".pagination").hidden = count === 0;
    $("#empty-message").textContent =
      view === "saved" && !state.saved.length
        ? "Save a recipe with its bookmark to keep it here."
        : "Try a different search, add another pantry ingredient, or relax a filter.";
    $("#reset-filters").textContent =
      view === "saved" && !state.saved.length
        ? "Explore recipes"
        : "Reset search & filters";
  }

  function card(result) {
    const { recipe: r, have, missing, match } = result;
    const saved = state.saved.includes(r.id);
    const diet = r.diet.includes("vegan")
      ? "Plant based"
      : r.diet.includes("vegetarian")
        ? "Vegetarian"
        : r.cuisine;
    return `<article class="recipe-card"><button class="save-button ${saved ? "saved" : ""}" data-save="${r.id}" aria-label="${saved ? "Unsave" : "Save"} ${esc(r.name)}" aria-pressed="${saved}">${icon("bookmark")}</button><button class="recipe-open" data-recipe="${r.id}" aria-label="View ${esc(r.name)}"><div class="card-art"><img src="${art(r)}" alt="" width="480" height="360" loading="lazy"><span class="card-badge">${r.hasQuantities ? "With amounts" : ""}</span></div><div class="card-body"><p class="card-kicker">${esc(diet)}<span class="dot"></span>${esc(r.category)}</p><h3 class="card-title">${esc(r.name)}</h3>${state.pantry.length ? `<div class="card-match"><div class="match-summary"><strong>You have ${have.length} of ${r.ingredients.length}</strong><span>${missing.length ? missing.length + " to buy" : "Nothing to buy"}</span></div><div class="match-track"><i style="width:${match}%"></i></div><p class="match-details">${missing.length ? "To add: " + esc(missing.join(", ")) : "Check you have enough of each."}</p></div>` : `<p class="card-desc">${esc(r.description)}</p>`}<div class="card-meta"><span>${icon("clock")}${timeLabel(r.minutes)}</span><span>${icon("coin")}~€${(r.price / r.servings).toFixed(2)} / serving</span></div></div></button></article>`;
  }
  function toggleSaved(id) {
    if (!byId.has(id)) return;
    const saved = state.saved.includes(id);
    state.saved = saved
      ? state.saved.filter((x) => x !== id)
      : [...state.saved, id];
    refresh();
    if (currentRecipe?.id === id && $("#recipe-dialog").open) {
      const b = $("[data-detail-save]");
      if (b) {
        b.innerHTML = icon("bookmark") + (saved ? "Save recipe" : "Saved");
        b.setAttribute("aria-pressed", String(!saved));
      }
    }
    toast(
      saved ? "Recipe removed from your cookbook." : "Saved to your cookbook.",
    );
  }
  function hideSuggestions() {
    suggestions = [];
    suggestionIndex = -1;
    $("#ingredient-suggestions").hidden = true;
    $("#pantry-input").setAttribute("aria-expanded", "false");
    $("#pantry-input").removeAttribute("aria-activedescendant");
  }
  function showSuggestions() {
    const input = $("#pantry-input");
    if (pendingIngredients.length || !input.value.trim()) {
      hideSuggestions();
      return;
    }
    suggestions = E.suggestions(input.value, catalog, state.pantry);
    suggestionIndex = -1;
    $("#ingredient-suggestions").innerHTML = suggestions
      .map(
        (s, i) =>
          `<li id="ingredient-option-${i}" role="option" aria-selected="false" data-suggestion="${esc(s)}">${esc(s)}</li>`,
      )
      .join("");
    $("#ingredient-suggestions").hidden = !suggestions.length;
    input.setAttribute("aria-expanded", String(!!suggestions.length));
    input.removeAttribute("aria-activedescendant");
  }
  function moveSuggestion(dir) {
    if (!suggestions.length) showSuggestions();
    if (!suggestions.length) return;
    suggestionIndex =
      (suggestionIndex + dir + suggestions.length) % suggestions.length;
    $$("#ingredient-suggestions li").forEach((li, i) =>
      li.setAttribute("aria-selected", String(i === suggestionIndex)),
    );
    $("#pantry-input").setAttribute(
      "aria-activedescendant",
      `ingredient-option-${suggestionIndex}`,
    );
  }
  function filterCount() {
    return (
      state.diets.length +
      state.allergens.length +
      (state.maxTime ? 1 : 0) +
      (state.maxMissing !== "" ? 1 : 0) +
      (state.cuisine ? 1 : 0) +
      (state.quantified ? 1 : 0)
    );
  }
  function renderFilters() {
    const count = filterCount();
    $("#filter-count").textContent = count;
    $("#filter-count").hidden = count === 0;
    $$("#diet-options input").forEach(
      (el) => (el.checked = state.diets.includes(el.value)),
    );
    $$("#allergen-options input").forEach(
      (el) => (el.checked = state.allergens.includes(el.value)),
    );
    $("#time-filter").value = state.maxTime;
    $("#missing-filter").value = state.maxMissing;
    $("#cuisine-filter").value = state.cuisine;
    $("#quantified-filter").checked = state.quantified;
    const labels = [
      ...state.diets.map((x) => [cap(x), "diet", x]),
      ...state.allergens.map((x) => ["No " + x, "allergen", x]),
      ...(state.maxTime
        ? [[state.maxTime + " min or less", "maxTime", ""]]
        : []),
      ...(state.cuisine ? [[state.cuisine, "cuisine", ""]] : []),
      ...(state.maxMissing !== ""
        ? [[state.maxMissing + " extras max", "maxMissing", ""]]
        : []),
      ...(state.quantified ? [["Measured ingredients", "quantified", ""]] : []),
    ];
    $("#active-filters").innerHTML = labels
      .map(
        ([label, key, val]) =>
          `<button class="active-filter" data-clear-filter="${key}" data-value="${esc(val)}" aria-label="Remove filter ${esc(label)}">${esc(label)}${icon("close")}</button>`,
      )
      .join("");
  }
  function clearFilters(all = false) {
    state.diets = [];
    state.allergens = [];
    state.maxTime = 0;
    state.maxMissing = "";
    state.cuisine = "";
    state.quantified = false;
    collection = "all";
    query = "";
    $("#recipe-query").value = "";
    $$("[data-collection]").forEach((b) => {
      b.classList.toggle("active", b.dataset.collection === "all");
      b.setAttribute("aria-pressed", String(b.dataset.collection === "all"));
    });
    page = 0;
    if (all) state.exclude = [];
    refresh();
  }
  function openRecipe(id, push = true, restore = false) {
    const r = byId.get(id);
    if (!r) return;
    if (!$("#recipe-dialog").open) recipeReturnFocus = document.activeElement;
    currentRecipe = r;
    const session =
      restore && state.session?.recipeId === id ? state.session : null;
    planContext =
      typeof push === "object"
        ? push
        : session?.planKey
          ? state.plan.find((p) => p.key === session.planKey)
          : null;
    currentServings = session?.servings || planContext?.servings || r.servings;
    cookStep = session?.cookStep ?? -1;
    ingredientChecks = new Set(session?.ingredientChecks || []);
    stepChecks = new Set(session?.stepChecks || []);
    renderDetail();
    $("#recipe-dialog").appendChild($("#timer-dock"));
    $("#recipe-dialog").appendChild($("#toast"));
    if (!$("#recipe-dialog").open) $("#recipe-dialog").showModal();
    $("#recipe-dialog").scrollTop = 0;
    saveSession();
    if (cookStep >= 0) announceStep();
    if (push) {
      try {
        history.replaceState(null, "", "#recipe=" + encodeURIComponent(id));
      } catch {}
    }
  }
  function sourceHtml(r) {
    const source = r.source || {},
      url = safeUrl(source.url),
      license = safeUrl(source.licenseUrl);
    const credit =
      r.quantitySource === "source-checked"
        ? "Amounts checked against "
        : !(
              typeof RECIPES !== "undefined" &&
              RECIPES.some((original) => original.name === r.name)
            )
          ? "New recipe written for this edition. Not kitchen-tested. Source: "
          : "Adapted from ";
    return `${credit}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(source.name || "the original source")}</a>` : esc(source.name || "the original collection")}. ${r.quantityNote ? esc(r.quantityNote) + " " : ""}${r.sourceAttribution ? esc(r.sourceAttribution) + " " : ""}${r.safetyNote ? `<strong>${esc(r.safetyNote)}</strong> ` : ""}${license ? `Recipe content: <a href="${esc(license)}" target="_blank" rel="noopener">${esc(source.license || "CC BY-SA 4.0")}</a>. ` : ""}${(window.RECIPE_ART || {})[r.id]?.kind === "ingredient-study" ? "Artwork shows selected ingredients, not the finished dish." : "Illustrated artwork; not food photography."} Times and costs are estimates.`;
  }

  function renderDetail() {
    const r = currentRecipe;
    if (!r) return;
    const match = resultFor(r),
      saved = state.saved.includes(r.id);
    $("#recipe-detail").innerHTML =
      `<button class="close-button" data-close-recipe aria-label="Close recipe">${icon("close")}</button><div class="detail-hero"><img class="detail-image" src="${art(r)}" alt="${esc((window.RECIPE_ART || {})[r.id]?.alt || `Illustration representing ${r.name}`)}"><div class="detail-heading"><p class="eyebrow">${esc(r.cuisine)} · ${r.quantitySource === "source-checked" ? "SOURCE-CHECKED AMOUNTS" : "RECIPE COLLECTION"}</p><h2 id="recipe-title">${esc(r.name)}</h2><p>${esc(r.description)}</p><div class="detail-meta"><span>${icon("clock")}${timeLabel(r.minutes)}</span><span>${icon("users")}${currentServings} serving${currentServings === 1 ? "" : "s"}</span><span>${icon("coin")}~€${(r.price / r.servings).toFixed(2)} / serving</span></div></div></div><div class="detail-actions"><button data-detail-save aria-pressed="${saved}">${icon("bookmark")}${saved ? "Saved" : "Save recipe"}</button><button data-plan-picker>${icon("calendar")}${planContext ? "Edit planned meal" : "Add to meal plan"}</button><button data-print>${icon("print")}Print</button><button class="primary" data-start-cook>${icon("play")}Start cooking</button></div><div class="plan-picker" id="plan-picker" hidden><label for="plan-day">Which day?</label><select id="plan-day">${days.map((d) => `<option ${d === (planContext?.day || pendingDay) ? "selected" : ""}>${d}</option>`).join("")}</select><button class="button primary" data-confirm-plan>${planContext ? "Update" : "Add"} ${r.hasQuantities ? currentServings : r.servings} servings</button></div>${cookStep < 0 ? detailBody(r, match) : cookBody(r)}<div class="source-note">${sourceHtml(r)}</div>`;
  }
  function detailBody(r, match) {
    return `<div class="detail-body"><section class="detail-ingredients"><h3>Ingredients</h3><div class="serving-control"><button data-servings="-1" aria-label="Fewer servings" ${!r.hasQuantities || currentServings <= 1 ? "disabled" : ""}>${icon("minus")}</button><span><strong>${currentServings}</strong> serving${currentServings === 1 ? "" : "s"}</span><button data-servings="1" aria-label="More servings" ${!r.hasQuantities || currentServings >= 100 ? "disabled" : ""}>${icon("plus")}</button></div>${!r.hasQuantities ? `<p class="legacy-note">This original recipe lists ingredients without amounts. ${safeUrl(r.source?.url) ? `<a href="${esc(safeUrl(r.source.url))}" target="_blank" rel="noopener">Open the source for quantities</a>.` : ""} Serving scaling is unavailable.</p>` : '<p class="input-hint">Ingredients and measured method amounts scale with your servings. Times, temperatures and per-piece sizes stay the same; cook in batches when needed.</p>'}<ul class="ingredient-list">${E.servingAmounts(
      r,
      currentServings,
    )
      .map(
        (row, i) =>
          `<li><label><input type="checkbox" data-ingredient-check="${i}" ${ingredientChecks.has(i) ? "checked" : ""}><span class="ingredient-copy"><span class="ingredient-amount">${row.amount == null ? "—" : esc(amount(row.amount, row.unit))}</span><span class="ingredient-unit">${esc(unitText(row))}</span><span class="ingredient-name">${esc(row.ingredient)}</span>${row.note ? `<small class="note">${esc(row.note)}</small>` : ""}</span>${match.have.some((h) => h.needed === row.ingredient) ? '<span class="have-mark">In pantry</span>' : ""}</label></li>`,
      )
      .join(
        "",
      )}</ul>${r.optional.length ? `<p class="optional-note"><strong>Optional:</strong> ${esc(r.optional.join(", "))}. Included when filtering diets and allergens.</p>` : ""}<p class="input-hint">Salt, pepper and water are assumed. Pantry matches do not check how much you have.</p><p class="allergen-note"><strong>Listed allergens:</strong> ${r.allergens.length ? esc(r.allergens.join(", ")) : "none identified"}. Always check product labels and cross-contact.</p></section><section class="detail-method"><h3>Let’s make something good.</h3><ol class="method-list">${E.scaledSteps(
      r,
      currentServings,
    )
      .map(
        (s, i) =>
          `<li class="${stepChecks.has(i) ? "done" : ""}"><button class="step-check" data-step-check="${i}" aria-label="${stepChecks.has(i) ? "Unmark" : "Mark"} step ${i + 1} complete" aria-pressed="${stepChecks.has(i)}">${stepChecks.has(i) ? "✓" : i + 1}</button><p>${esc(s)}</p></li>`,
      )
      .join(
        "",
      )}</ol>${r.tip ? `<aside class="cook-tip"><strong>A little kitchen wisdom</strong>${esc(r.tip)}</aside>` : ""}</section></div>`;
  }
  function cookBody(r) {
    const done = cookStep >= r.steps.length;
    return `<div class="cook-mode"><div class="cook-top"><button class="text-button" data-exit-cook>${icon("back")}Back to recipe</button><p>${done ? "You made it." : `STEP ${cookStep + 1} OF ${r.steps.length}`}</p></div><p class="input-hint">${currentServings} serving${currentServings === 1 ? "" : "s"}${r.hasQuantities ? " · Ingredient and method amounts scaled. Times and temperatures are unchanged; allow extra time for batches." : " · Original method; quantities were not supplied. Consult the source before cooking."}</p><h3>${done ? "Something delicious, made by you." : esc(r.name)}</h3><div class="cook-progress">${r.steps.map((_, i) => `<i class="${i <= cookStep ? "done" : ""}"></i>`).join("")}</div><p class="cook-step" aria-live="polite" aria-atomic="true">${done ? "Time to set the table. Taste, adjust the seasoning, and enjoy every bite." : esc(E.scaledSteps(r, currentServings)[cookStep])}</p><div class="cook-controls"><button class="button outline" data-cook-prev ${cookStep === 0 ? "disabled" : ""}>${icon("back")}Previous</button><button class="button primary" ${done ? "data-exit-cook" : "data-cook-next"}>${done ? "Back to recipe" : cookStep === r.steps.length - 1 ? "Finish cooking" : "Next step"}${icon("arrow")}</button></div><div class="timer-controls"><label for="timer-minutes">Set a kitchen timer</label><input id="timer-minutes" type="number" min="1" max="240" value="5" aria-label="Timer minutes"><span>minutes</span><button data-start-timer>${icon("clock")} Start timer</button><span id="cook-timer-status">${timer ? timerText() : ""}</span><span id="timer-replace" hidden>Replace the current timer?<button data-confirm-timer>Replace timer</button><button data-cancel-timer>Keep current timer</button></span></div></div>`;
  }
  function printRecipe() {
    const r = currentRecipe;
    $("#print-area").innerHTML =
      `<h1>${esc(r.name)}</h1><p>${timeLabel(r.minutes)} · ${currentServings} serving${currentServings === 1 ? "" : "s"} · ${esc(r.cuisine)}</p>${!r.hasQuantities ? "<p>Ingredient amounts were not supplied. Consult the linked source before cooking.</p>" : "<p>Ingredients and measured method amounts are scaled. Times, temperatures and per-piece sizes are unchanged; allow extra time for batches.</p>"}<h2>Ingredients</h2><ul>${E.servingAmounts(
        r,
        currentServings,
      )
        .map(
          (row) =>
            `<li>${esc(quantity(row))} ${esc(row.ingredient)} ${row.note ? "(" + esc(row.note) + ")" : ""}</li>`,
        )
        .join(
          "",
        )}</ul>${r.optional.length ? "<p>Optional: " + esc(r.optional.join(", ")) + "</p>" : ""}<h2>Method</h2><ol>${E.scaledSteps(
        r,
        currentServings,
      )
        .map((s) => `<li>${esc(s)}</li>`)
        .join(
          "",
        )}</ol><p>${sourceHtml(r)}</p>${safeUrl(r.source?.url) ? "<p>" + esc(r.source.url) + "</p>" : ""}`;
    window.print();
  }
  function addToPlan() {
    const day = $("#plan-day").value;
    const entry = {
      key:
        planContext?.key ||
        Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      id: currentRecipe.id,
      day,
      servings: currentRecipe.hasQuantities
        ? currentServings
        : currentRecipe.servings,
    };
    const index = state.plan.findIndex((p) => p.key === entry.key);
    if (index >= 0) state.plan[index] = entry;
    else state.plan.push(entry);
    planContext = entry;
    saveSession();
    pendingDay = null;
    refresh();
    $("#plan-picker").hidden = true;
    toast(`Meal ${index >= 0 ? "updated" : "added"} for ${day}.`);
  }

  function renderPlan() {
    const total = state.plan.length;
    $("#week-grid").innerHTML = days
      .map((day) => {
        const meals = state.plan.filter((p) => p.day === day);
        return `<article class="day-card"><div class="day-title"><h3>${day}</h3><span>${meals.length ? meals.length + " meal" + (meals.length === 1 ? "" : "s") : ""}</span></div>${
          meals.length
            ? meals
                .map((p) => {
                  const r = byId.get(p.id);
                  return `<div class="planned-meal"><button data-recipe="${r.id}" data-plan-key="${esc(p.key)}"><img ${view === "plan" ? "src" : "data-src"}="${art(r)}" alt="" width="100" height="100" loading="lazy"><h4>${esc(r.name)}</h4></button><div class="planned-meta"><span>${p.servings} servings · ${timeLabel(r.minutes)}</span><button data-remove-plan="${esc(p.key)}" aria-label="Remove ${esc(r.name)} from ${day}">Remove</button></div></div>`;
                })
                .join("")
            : `<button class="day-empty" data-plan-day="${day}">${icon("plus")}Something good goes here</button>`
        }</article>`;
      })
      .join("");
    $("#plan-summary").textContent = total
      ? `${total} meal${total === 1 ? "" : "s"} planned · ${state.plan.reduce((sum, p) => sum + p.servings, 0)} servings in all`
      : "Your week is a blank canvas.";
  }
  function shoppingRows() {
    return E.shoppingList(
      state.plan.map((p) => ({ recipe: byId.get(p.id), servings: p.servings })),
      state.pantry,
    );
  }
  function shoppingKey(row) {
    return `${row.key || row.ingredient}|${row.unit}|${row.amount == null ? "unknown" : row.amount}`;
  }
  function renderShopping() {
    const rows = shoppingRows(),
      unchecked = rows.filter(
        (row) => !state.checked.includes(shoppingKey(row)),
      );
    $("#shopping-count").textContent = unchecked.length;
    $("#shopping-content").innerHTML = rows.length
      ? `<p class="input-hint" style="margin-bottom:15px">${unchecked.length} item${unchecked.length === 1 ? "" : "s"} left · ${rows.length} in total</p><ul class="shopping-list">${rows.map((row) => `<li><label><input type="checkbox" data-shopping-key="${esc(shoppingKey(row))}" ${state.checked.includes(shoppingKey(row)) ? "checked" : ""}><span><span class="shopping-name"><strong>${esc(quantity(row))}</strong> ${esc(row.ingredient)}</span><small>${row.amount == null ? "Amount not supplied — check the original recipe. " : ""}${row.note ? esc(row.note) + " · " : ""}${esc(row.recipes.join(" · "))}</small></span></label></li>`).join("")}</ul>`
      : `<div class="shopping-empty">${icon("bag")}<h3>${state.plan.length ? "Your pantry has every ingredient name." : "A little planning goes a long way."}</h3><p>${state.plan.length ? "Check the recipe amounts against what you have before cooking." : "Add a recipe to your meal planner and its missing ingredients will appear here."}</p><button class="button primary" data-shopping-discover>Explore recipes ${icon("arrow")}</button></div>`;
    $("#download-shopping").disabled = rows.length === 0;
    $("#uncheck-shopping").disabled = rows.length === 0;
  }
  function showDialog(selector) {
    const d = $(selector);
    d.appendChild($("#timer-dock"));
    d.appendChild($("#toast"));
    d.showModal();
  }
  for (const selector of [
    "#filters-dialog",
    "#shopping-dialog",
    "#about-dialog",
    "#settings-dialog",
  ])
    $(selector).addEventListener("close", () => {
      document.body.appendChild($("#timer-dock"));
      document.body.appendChild($("#toast"));
    });
  function downloadList() {
    const rows = shoppingRows();
    const text = [
      "RECIPE FINDER — SHOPPING LIST",
      "",
      ...rows.map(
        (row) =>
          `${state.checked.includes(shoppingKey(row)) ? "[x]" : "[ ]"} ${quantity(row)} ${row.ingredient}${row.note ? " (" + row.note + ")" : ""}${row.amount == null ? " (amount not supplied — check source)" : ""}`,
      ),
      "",
      "Pantry ingredients have been omitted. Check you have enough.",
      "Amounts in different units stay separate.",
      "",
      "PLANNED MEALS",
      ...state.plan.map(
        (p) => `${p.day}: ${byId.get(p.id).name} — ${p.servings} servings`,
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipe-finder-shopping-list.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Shopping list downloaded.");
  }
  let timer = state.timer,
    timerTick;
  function timerText() {
    if (!timer) return "";
    const seconds = Math.max(
      0,
      Math.ceil(
        (timer.paused ? timer.remaining : timer.end - Date.now()) / 1000,
      ),
    );
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }
  function updateTimer() {
    $("#timer-dock").hidden = !timer;
    if (!timer) return;
    const text = timerText();
    if (text === "0:00" && !timer.finished) {
      timer.finished = true;
      state.timer = timer;
      persist();
      toast("Your kitchen timer is finished.");
      clearInterval(timerTick);
    }
    $("#timer-display").textContent = timer.finished ? "Timer finished" : text;
    $("#timer-context").textContent = timer.recipeId
      ? byId.get(timer.recipeId)?.name || "Kitchen timer"
      : "Kitchen timer";
    $("#timer-dock").classList.toggle("finished", timer.finished);
    $("#timer-toggle").hidden = timer.finished;
    $("#timer-toggle").textContent = timer.paused ? "Resume" : "Pause";
    const el = $("#cook-timer-status");
    if (el)
      el.textContent = timer.finished
        ? "Timer finished"
        : text + (timer.paused ? " · paused" : "");
  }

  function startTimer(replace = false) {
    const minutes = Number($("#timer-minutes").value);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 240) {
      toast("Choose a timer from 1 to 240 minutes.");
      return;
    }
    if (timer && !timer.finished && !replace) {
      $("#timer-replace").hidden = false;
      $("[data-confirm-timer]").focus();
      return;
    }
    if ($("#timer-replace")) $("#timer-replace").hidden = true;
    clearInterval(timerTick);
    timer = {
      end: Date.now() + minutes * 60000,
      paused: false,
      remaining: minutes * 60000,
      finished: false,
      recipeId: currentRecipe?.id || null,
    };
    state.timer = timer;
    persist();
    $("#timer-dock").hidden = false;
    $("#timer-dock").classList.remove("finished");
    $("#timer-toggle").hidden = false;
    updateTimer();
    timerTick = setInterval(updateTimer, 500);
    toast(`Timer set for ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  function downloadFile(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function openSettings() {
    $("#storage-status").textContent = storageAvailable
      ? "Your kitchen is saved on this browser. Export a backup before clearing browser data or moving devices."
      : "Browser storage is unavailable. Export a backup to keep your kitchen.";
    showDialog("#settings-dialog");
  }
  for (const id of ["settings-button", "backup-shortcut"])
    $("#" + id).addEventListener("click", openSettings);
  $("#export-kitchen").addEventListener("click", () => {
    downloadFile(
      "recipe-finder-kitchen.json",
      Store.backup(state),
      "application/json",
    );
    toast("Kitchen backup downloaded.");
  });
  $("#import-kitchen").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = $("#import-preview");
    preview.hidden = false;
    pendingImport = null;
    try {
      if (file.size > 2 * 1024 * 1024)
        throw new Error("Please choose a backup smaller than 2 MB.");
      pendingImport = Store.importBackup(await file.text(), catalog);
      preview.innerHTML = `<p>Restore ${pendingImport.pantry.length} pantry ingredient${pendingImport.pantry.length === 1 ? "" : "s"}, ${pendingImport.saved.length} saved recipe${pendingImport.saved.length === 1 ? "" : "s"} and ${pendingImport.plan.length} planned meal${pendingImport.plan.length === 1 ? "" : "s"}? This replaces this browser’s current kitchen.</p><button id="confirm-import" class="button primary">Restore this backup</button><button id="cancel-import" class="button outline">Cancel</button>`;
    } catch (error) {
      preview.textContent = error.message;
    }
    event.target.value = "";
  });
  $("#import-preview").addEventListener("click", (event) => {
    if (event.target.id === "cancel-import") {
      pendingImport = null;
      $("#import-preview").hidden = true;
      $("#import-kitchen").focus();
    }
    if (event.target.id === "confirm-import" && pendingImport) {
      state = pendingImport;
      pendingImport = null;
      pendingIngredients = [];
      renderIngredientConfirmation();
      pendingDay = null;
      planContext = null;
      timer = state.timer;
      clearInterval(timerTick);
      updateTimer();
      if (timer && !timer.finished) timerTick = setInterval(updateTimer, 500);
      page = 0;
      refresh();
      $("#import-preview").hidden = true;
      toast("Your kitchen has been restored.");
      $("#export-kitchen").focus();
    }
  });
  $("#reset-kitchen").addEventListener("click", () => {
    $("#reset-confirmation").hidden = false;
    $("#cancel-reset").focus();
  });
  $("#cancel-reset").addEventListener("click", () => {
    $("#reset-confirmation").hidden = true;
    $("#reset-kitchen").focus();
  });
  $("#confirm-reset").addEventListener("click", () => {
    state = Store.defaults();
    timer = null;
    clearInterval(timerTick);
    updateTimer();
    pendingIngredients = [];
    renderIngredientConfirmation();
    pendingDay = null;
    planContext = null;
    collection = "all";
    query = "";
    $("#recipe-query").value = "";
    $("#reset-confirmation").hidden = true;
    setView("discover");
    persist();
    $("#settings-dialog").close();
    toast("Kitchen cleared.");
  });
  $("#previous-page").addEventListener("click", () => {
    page = Math.max(0, page - 1);
    renderCards();
    $("#next-page").focus({ preventScroll: true });
  });
  $("#next-page").addEventListener("click", () => {
    page++;
    renderCards();
    $("#previous-page").focus({ preventScroll: true });
  });
  $("#saved-match-only").addEventListener("change", (event) => {
    savedMatchesOnly = event.target.checked;
    updateResults(true);
  });
  $("#pantry-toggle").addEventListener("click", () => {
    const collapsed =
      $("#pantry-toggle").getAttribute("aria-expanded") === "true";
    $("#pantry-toggle").setAttribute("aria-expanded", String(!collapsed));
    $("#pantry-toggle").setAttribute(
      "aria-label",
      collapsed ? "Expand pantry" : "Collapse pantry",
    );
    $("#pantry-content").hidden = collapsed;
  });
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (pageCapacity() !== pageSize) updateResults(true);
      if (innerWidth > 960) {
        $("#pantry-content").hidden = false;
        $("#pantry-toggle").setAttribute("aria-expanded", "true");
      }
    }, 120);
  });
  // Events use delegation so newly rendered recipe and planner controls behave identically.
  document.addEventListener("click", (event) => {
    const b = event.target.closest("button,a");
    if (!b) return;
    if (b.hasAttribute("data-resolve-ingredient")) {
      resolveIngredient(b.dataset.resolveIngredient);
      return;
    }
    if (b.hasAttribute("data-custom-ingredient")) {
      resolveIngredient(pendingIngredients[0], true);
      return;
    }
    if (b.hasAttribute("data-skip-ingredient")) {
      resolveIngredient(null);
      return;
    }
    if (b.dataset.planDay) {
      pendingDay = b.dataset.planDay;
      setView("discover");
      toast(`Choose a recipe for ${pendingDay}.`);
      return;
    }
    if (b.hasAttribute("data-confirm-timer")) {
      startTimer(true);
      return;
    }
    if (b.hasAttribute("data-cancel-timer")) {
      $("#timer-replace").hidden = true;
      $("[data-start-timer]").focus();
      return;
    }
    if (b.dataset.view) {
      setView(b.dataset.view);
      return;
    }
    if (b.dataset.recipe) {
      openRecipe(
        b.dataset.recipe,
        b.dataset.planKey
          ? state.plan.find((p) => p.key === b.dataset.planKey)
          : true,
      );
      return;
    }
    if (b.dataset.save) {
      toggleSaved(b.dataset.save);
      return;
    }
    if (b.dataset.add) {
      addIngredients(b.dataset.add);
      return;
    }
    if (b.dataset.remove) {
      state[b.dataset.remove] = state[b.dataset.remove].filter(
        (i) => i !== b.dataset.ingredient,
      );
      refresh();
      return;
    }
    if (b.dataset.collection) {
      collection = b.dataset.collection;
      $$("[data-collection]").forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      page = 0;
      refresh();
      return;
    }
    if (b.dataset.clearFilter) {
      const key = b.dataset.clearFilter;
      if (key === "diet")
        state.diets = state.diets.filter((x) => x !== b.dataset.value);
      else if (key === "allergen")
        state.allergens = state.allergens.filter((x) => x !== b.dataset.value);
      else
        state[key] = key === "maxTime" ? 0 : key === "quantified" ? false : "";
      refresh();
      return;
    }
    if (b.hasAttribute("data-close-recipe")) {
      $("#recipe-dialog").close();
      return;
    }
    if (b.hasAttribute("data-detail-save")) {
      toggleSaved(currentRecipe.id);
      return;
    }
    if (b.hasAttribute("data-plan-picker")) {
      $("#plan-picker").hidden = !$("#plan-picker").hidden;
      if (!$("#plan-picker").hidden) $("#plan-day").focus();
      return;
    }
    if (b.hasAttribute("data-confirm-plan")) {
      addToPlan();
      return;
    }
    if (b.hasAttribute("data-print")) {
      printRecipe();
      return;
    }
    if (b.dataset.servings) {
      currentServings = Math.max(
        1,
        Math.min(100, currentServings + Number(b.dataset.servings)),
      );
      redrawDetail();
      return;
    }
    if (b.hasAttribute("data-step-check")) {
      const i = Number(b.dataset.stepCheck);
      stepChecks.has(i) ? stepChecks.delete(i) : stepChecks.add(i);
      redrawDetail();
      return;
    }
    if (b.hasAttribute("data-start-cook")) {
      cookStep = 0;
      redrawDetail(false);
      announceStep();
      $(".cook-mode").scrollIntoView({ block: "start", behavior: motion() });
      return;
    }
    if (b.hasAttribute("data-exit-cook")) {
      cookStep = -1;
      redrawDetail(false);
      $("[data-start-cook]").focus();
      return;
    }
    if (b.hasAttribute("data-cook-next")) {
      cookStep = Math.min(currentRecipe.steps.length, cookStep + 1);
      redrawDetail(false);
      announceStep();
      return;
    }
    if (b.hasAttribute("data-cook-prev")) {
      cookStep = Math.max(0, cookStep - 1);
      redrawDetail(false);
      announceStep();
      return;
    }
    if (b.hasAttribute("data-start-timer")) {
      startTimer();
      return;
    }
    if (b.dataset.removePlan) {
      state.plan = state.plan.filter((p) => p.key !== b.dataset.removePlan);
      refresh();
      toast("Meal removed from your plan.");
      return;
    }
    if (b.hasAttribute("data-shopping-discover")) {
      $("#shopping-dialog").close();
      setView("discover");
      $("#kitchen").scrollIntoView({ behavior: motion() });
    }
  });
  $("#pantry-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const text =
      suggestionIndex >= 0
        ? suggestions[suggestionIndex]
        : $("#pantry-input").value;
    addIngredients(text);
  });
  $("#exclude-form").addEventListener("submit", (e) => {
    e.preventDefault();
    addIngredients($("#exclude-input").value, "exclude");
  });
  $("#pantry-input").addEventListener("input", showSuggestions);
  $("#pantry-input").addEventListener("focus", showSuggestions);
  $("#pantry-input").addEventListener("keydown", (e) => {
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      moveSuggestion(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Escape") {
      hideSuggestions();
      e.stopPropagation();
    } else if (
      e.key === "Backspace" &&
      !e.target.value &&
      state.pantry.length
    ) {
      state.pantry.pop();
      refresh();
    } else if (e.key === "Tab") {
      hideSuggestions();
    }
  });
  $("#ingredient-suggestions").addEventListener("pointerdown", (e) => {
    const li = e.target.closest("[data-suggestion]");
    if (li) {
      e.preventDefault();
      addIngredients(li.dataset.suggestion);
      $("#pantry-input").focus();
      hideSuggestions();
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#pantry-form")) hideSuggestions();
  });
  $("#clear-pantry").addEventListener("click", () => {
    state.pantry = [];
    refresh();
    toast("Pantry cleared.");
  });
  $("#add-staples").addEventListener("click", () =>
    addIngredients("olive oil, onion, garlic"),
  );
  $("#recipe-query").addEventListener("input", (e) => {
    query = e.target.value.slice(0, 200);
    updateResults(true);
  });
  $("#page-size").addEventListener("change", (e) => {
    state.pageSize = e.target.value === "fit" ? 0 : Number(e.target.value);
    persist();
    updateResults(true);
  });
  $("#sort-select").addEventListener("change", (e) => {
    sort = e.target.value;
    updateResults(true);
  });
  $("#load-more").addEventListener("click", () => {
    const oldCount = Math.min(pageSize, results.length);
    pageSize += 18;
    renderCards();
    const next = $$(".recipe-open")[oldCount];
    if (next) next.focus({ preventScroll: true });
  });
  $("#filters-button").addEventListener("click", () =>
    showDialog("#filters-dialog"),
  );
  $("#apply-filters").addEventListener("click", () =>
    $("#filters-dialog").close(),
  );
  $("#clear-filters").addEventListener("click", () => clearFilters());
  $("#reset-filters").addEventListener("click", () => {
    if (view === "saved" && !state.saved.length) setView("discover");
    else clearFilters(true);
  });
  $("#filters-dialog").addEventListener("change", () => {
    state.diets = $$("#diet-options input:checked").map((i) => i.value);
    state.allergens = $$("#allergen-options input:checked").map((i) => i.value);
    state.maxTime = Number($("#time-filter").value);
    state.cuisine = $("#cuisine-filter").value;
    state.maxMissing =
      $("#missing-filter").value === ""
        ? ""
        : Number($("#missing-filter").value);
    state.quantified = $("#quantified-filter").checked;
    page = 0;
    refresh();
  });
  $("#recipe-dialog").addEventListener("change", (e) => {
    if (e.target.hasAttribute("data-ingredient-check")) {
      const i = Number(e.target.dataset.ingredientCheck);
      e.target.checked ? ingredientChecks.add(i) : ingredientChecks.delete(i);
      saveSession();
    }
  });
  $("#recipe-dialog").addEventListener("close", () => {
    document.body.appendChild($("#timer-dock"));
    document.body.appendChild($("#toast"));
    const fallback = currentRecipe
      ? $('[data-recipe="' + currentRecipe.id + '"]')
      : null;
    const focus = document.contains(recipeReturnFocus)
      ? recipeReturnFocus
      : fallback || $("#recipe-query");
    if (focus) focus.focus({ preventScroll: true });
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch {}
    currentRecipe = null;
    saveSession();
  });
  for (const id of ["shopping-button", "plan-shopping"])
    $("#" + id).addEventListener("click", () => {
      renderShopping();
      showDialog("#shopping-dialog");
    });
  $("#shopping-dialog").addEventListener("change", (e) => {
    if (e.target.dataset.shoppingKey) {
      const key = e.target.dataset.shoppingKey;
      state.checked = e.target.checked
        ? [...new Set([...state.checked, key])]
        : state.checked.filter((k) => k !== key);
      persist();
      const rows = shoppingRows();
      $("#shopping-count").textContent = rows.filter(
        (row) => !state.checked.includes(shoppingKey(row)),
      ).length;
      const summary = $("#shopping-content>.input-hint");
      if (summary)
        summary.textContent = `${rows.filter((row) => !state.checked.includes(shoppingKey(row))).length} items left · ${rows.length} in total`;
    }
  });
  $("#uncheck-shopping").addEventListener("click", () => {
    state.checked = [];
    persist();
    renderShopping();
  });
  $("#download-shopping").addEventListener("click", downloadList);
  $("#about-button").addEventListener("click", () =>
    showDialog("#about-dialog"),
  );
  $("#hero-surprise").addEventListener("click", () => {
    if (!results.length) {
      toast("No recipes fit these filters. Try relaxing one first.");
      $("#kitchen").scrollIntoView({ behavior: motion() });
      return;
    }
    const pool = results.slice(
      0,
      state.pantry.length ? Math.min(12, results.length) : results.length,
    );
    openRecipe(pool[Math.floor(Math.random() * pool.length)].recipe.id);
  });
  $("#timer-stop").addEventListener("click", () => {
    clearInterval(timerTick);
    timer = null;
    state.timer = null;
    persist();
    $("#timer-dock").hidden = true;
    const el = $("#cook-timer-status");
    if (el) el.textContent = "";
  });
  $("#timer-toggle").addEventListener("click", () => {
    if (!timer) return;
    if (timer.paused) {
      timer.end = Date.now() + timer.remaining;
      timer.paused = false;
    } else {
      timer.remaining = Math.max(0, timer.end - Date.now());
      timer.paused = true;
    }
    state.timer = timer;
    persist();
    updateTimer();
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "/" &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !document.querySelector("dialog[open]") &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    ) {
      e.preventDefault();
      if (view === "plan") setView("discover");
      $("#recipe-query").focus();
      $("#kitchen").scrollIntoView({ behavior: motion() });
    }
  });
  $(".site-header .brand").addEventListener("click", (e) => {
    e.preventDefault();
    setView("discover");
    window.scrollTo({ top: 0, behavior: motion() });
  });
  $("#diet-options").innerHTML = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
  ]
    .map(
      (d) =>
        `<label class="choice"><input type="checkbox" value="${d}">${cap(d)}</label>`,
    )
    .join("");
  $("#allergen-options").innerHTML = [
    "dairy",
    "egg",
    "gluten",
    "nuts",
    "peanut",
    "soy",
    "sesame",
    "fish",
    "shellfish",
    "mustard",
    "celery",
  ]
    .map(
      (d) =>
        `<label class="choice"><input type="checkbox" value="${d}">${cap(d)}</label>`,
    )
    .join("");
  $("#cuisine-filter").innerHTML =
    '<option value="">Every cuisine</option>' +
    [...new Set(catalog.map((r) => r.cuisine))]
      .sort()
      .map((c) => `<option value="${esc(c)}">${esc(c)}</option>`)
      .join("");
  $("#collection-size").textContent = `${catalog.length} recipes to explore`;
  icons();
  refresh(false);
  if (timer) {
    updateTimer();
    if (!timer.finished) timerTick = setInterval(updateTimer, 500);
  }
  if (!storageAvailable)
    setTimeout(
      () =>
        toast(
          "Browser storage is unavailable. Your kitchen will not persist after this visit.",
        ),
      500,
    );
  try {
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.has("recipe")) openRecipe(hash.get("recipe"), false, true);
    else if (state.session) openRecipe(state.session.recipeId, false, true);
  } catch {}
  window.addEventListener("hashchange", () => {
    try {
      const id = new URLSearchParams(location.hash.slice(1)).get("recipe");
      if (id) openRecipe(id, false);
    } catch {}
  });
})();
