/* Device-local kitchen data. Shared with the regression suite. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KitchenState = api;
})(typeof window === "object" ? window : globalThis, function () {
  "use strict";
  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const KEY = "recipe-finder-kitchen-v3";
  function defaults() {
    return {
      version: 3,
      pantry: [],
      custom: [],
      exclude: [],
      diets: [],
      allergens: [],
      saved: [],
      plan: [],
      checked: [],
      maxTime: 0,
      maxMissing: "",
      cuisine: "",
      quantified: false,
      timer: null,
      session: null,
    };
  }
  function strings(value, maxLength = 300) {
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (x) =>
                typeof x === "string" && x.length > 0 && x.length <= maxLength,
            ),
          ),
        ]
      : [];
  }
  function validate(raw, catalog, strict = false) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new Error("This file does not contain a kitchen backup.");
    if (raw.version && ![2, 3].includes(raw.version))
      throw new Error("This backup uses an unsupported version.");
    if (
      strict &&
      (!Array.isArray(raw.pantry) ||
        !Array.isArray(raw.saved) ||
        !Array.isArray(raw.plan))
    )
      throw new Error(
        "The backup is missing pantry, cookbook or meal plan data.",
      );
    const ids = new Map(catalog.map((r) => [r.id, r]));
    const state = defaults();
    for (const key of [
      "pantry",
      "custom",
      "exclude",
      "diets",
      "allergens",
      "checked",
    ])
      state[key] = strings(raw[key]);
    state.saved = strings(raw.saved).filter((id) => ids.has(id));
    const keys = new Set();
    state.plan = (Array.isArray(raw.plan) ? raw.plan : []).flatMap((p, i) => {
      if (!p || !ids.has(p.id) || !DAYS.includes(p.day)) return [];
      const servings = Number(p.servings);
      if (!Number.isFinite(servings) || servings < 1 || servings > 100)
        return [];
      let key =
        typeof p.key === "string" && p.key.length < 100
          ? p.key
          : "restored-" + i;
      while (keys.has(key)) key += "-" + i;
      keys.add(key);
      return [{ key, id: p.id, day: p.day, servings: Math.round(servings) }];
    });
    state.maxTime = [0, 15, 30, 45, 60].includes(raw.maxTime) ? raw.maxTime : 0;
    state.maxMissing = ["", 0, 1, 3, 5].includes(raw.maxMissing)
      ? raw.maxMissing
      : "";
    state.cuisine =
      typeof raw.cuisine === "string" ? raw.cuisine.slice(0, 100) : "";
    state.quantified = raw.quantified === true;
    const t = raw.timer;
    if (
      t &&
      Number.isFinite(t.end) &&
      Number.isFinite(t.remaining) &&
      t.remaining >= 0 &&
      t.remaining <= 14400000
    ) {
      state.timer = {
        end: t.end,
        remaining: t.remaining,
        paused: t.paused === true,
        finished: t.finished === true,
        recipeId: ids.has(t.recipeId) ? t.recipeId : null,
      };
    }
    const session = raw.session,
      recipe = session && ids.get(session.recipeId);
    if (
      recipe &&
      Number.isInteger(session.servings) &&
      session.servings >= 1 &&
      session.servings <= 100 &&
      Number.isInteger(session.cookStep) &&
      session.cookStep >= -1 &&
      session.cookStep <= recipe.steps.length
    ) {
      const checks = (value, max) =>
        Array.isArray(value)
          ? [
              ...new Set(
                value.filter((x) => Number.isInteger(x) && x >= 0 && x < max),
              ),
            ]
          : [];
      state.session = {
        recipeId: recipe.id,
        servings: session.servings,
        cookStep: session.cookStep,
        planKey: state.plan.some(
          (p) => p.key === session.planKey && p.id === recipe.id,
        )
          ? session.planKey
          : null,
        ingredientChecks: checks(
          session.ingredientChecks,
          recipe.ingredients.length,
        ),
        stepChecks: checks(session.stepChecks, recipe.steps.length),
      };
    }
    if (
      strict &&
      (state.saved.length !== new Set(raw.saved).size ||
        state.plan.length !== raw.plan.length)
    )
      throw new Error(
        "Some recipes or meal entries are not valid for this edition. Nothing was imported.",
      );
    return state;
  }
  function read(storage, catalog) {
    try {
      const text =
        storage.getItem(KEY) || storage.getItem("recipe-finder-kitchen-v2");
      return {
        state: text ? validate(JSON.parse(text), catalog) : defaults(),
        available: true,
      };
    } catch {
      return { state: defaults(), available: false };
    }
  }
  function backup(state) {
    return JSON.stringify(
      { app: "Recipe Finder", exportedAt: new Date().toISOString(), ...state },
      null,
      2,
    );
  }
  function importBackup(text, catalog) {
    if (text.length > 2 * 1024 * 1024)
      throw new Error("Please choose a kitchen backup smaller than 2 MB.");
    let raw;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new Error("This is not a valid JSON backup.");
    }
    if (raw.app !== "Recipe Finder")
      throw new Error("Please choose a Recipe Finder kitchen backup.");
    return validate(raw, catalog, true);
  }
  return { KEY, DAYS, defaults, validate, read, backup, importBackup };
});
