'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('../engine.js');

const project = path.join(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(project, 'recipes.js'), 'utf8') + '\nwindow.LEGACY_RECIPES = RECIPES;', context);
vm.runInContext(fs.readFileSync(path.join(project, 'recipes-extra.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(project, 'recipe-enhancements.js'), 'utf8'), context);
const legacy = context.window.LEGACY_RECIPES;
const extra = context.window.EXTRA_RECIPES;
const enhancements = context.window.RECIPE_ENHANCEMENTS;
const enhancedNames = new Set(enhancements.map(r => r.originalName));
const catalog = E.buildCatalog(legacy, extra, enhancements);
const byId = id => catalog.find(r => r.id === id);

function nonempty(value, label) {
  assert.equal(typeof value, 'string', label);
  assert.ok(value.trim().length, label);
}
function strings(value, label) {
  assert.ok(Array.isArray(value), label);
  for (const entry of value) nonempty(entry, label);
}

test('the collection retains 150 originals, adds 40 recipes and source-checks 90 original quantities', () => {
  assert.equal(legacy.length, 150);
  assert.equal(extra.length, 40);
  assert.equal(catalog.length, 190);
  assert.equal(new Set(catalog.map(r => r.id)).size, 190);
  assert.equal(new Set(extra.map(r => r.id)).size, 40);
  assert.equal(enhancements.length, 90);
  assert.equal(enhancedNames.size, 90);
  assert.equal(catalog.filter(r => r.hasQuantities).length, 130);
  for (const original of legacy) {
    assert.ok(catalog.some(r => r.name === original.name && r.source.url === original.source.url), original.name);
  }
});

test('source-checked upgrades preserve stable identities and declare their exact serving basis', () => {
  const originalCatalog = E.buildCatalog(legacy, []);
  const units = new Set(['g', 'ml', 'tbsp', 'tsp', 'whole', 'clove', 'slice', 'cup', 'stalk', 'leaf', 'pinch', 'dessert spoon']);
  for (const upgrade of enhancements) {
    const raw = legacy.find(r => r.name === upgrade.originalName);
    assert.ok(raw, upgrade.originalName);
    const recipe = catalog.find(r => r.name === upgrade.originalName);
    const previous = originalCatalog.find(r => r.name === upgrade.originalName);
    assert.equal(recipe.id, previous.id, `${recipe.name}: stable ID`);
    assert.equal(recipe.source.url, raw.source.url, `${recipe.name}: source retained`);
    assert.equal(recipe.quantitySource, 'source-checked', recipe.name);
    assert.equal(recipe.sourceCheckedAt, '2026-10-26', recipe.name);
    assert.match(recipe.quantityNote, /^Amounts adapted from the linked source;/, recipe.name);
    assert.match(recipe.quantityNote, /source (?:basis|variation|gives)/i, recipe.name);
    assert.equal(recipe.hasQuantities, true, recipe.name);
    assert.deepEqual([...recipe.amounts.map(a => a.ingredient)].sort(), [...recipe.ingredients].sort(), recipe.name);
    for (const amount of recipe.amounts) {
      assert.ok(Number.isFinite(amount.amount) && amount.amount > 0, `${recipe.name}: positive quantity`);
      assert.ok(units.has(amount.unit), `${recipe.name}: supported unit ${amount.unit}`);
    }
    const doubled = E.servingAmounts(recipe, recipe.servings * 2);
    for (const amount of doubled) {
      const base = recipe.amounts.find(a => a.ingredient === amount.ingredient);
      assert.equal(amount.amount, base.amount * 2, `${recipe.name}: ${amount.ingredient}`);
    }
  }
});

test('all recipe records have usable names, times, servings, costs, ingredients and steps', () => {
  for (const r of catalog) {
    for (const key of ['id', 'name', 'cuisine', 'illustration', 'description', 'category', 'difficulty']) nonempty(r[key], `${r.name}: ${key}`);
    assert.ok(Number.isFinite(r.minutes) && r.minutes > 0, `${r.name}: minutes`);
    assert.ok(Number.isInteger(r.servings) && r.servings > 0, `${r.name}: servings`);
    assert.ok(Number.isFinite(r.price) && r.price >= 0, `${r.name}: estimated price`);
    assert.ok(Number.isFinite(r.price / r.servings), `${r.name}: estimated per-serving price`);
    strings(r.ingredients, `${r.name}: ingredients`);
    assert.ok(r.ingredients.length > 0, `${r.name}: has ingredients`);
    assert.equal(new Set(r.ingredients).size, r.ingredients.length, `${r.name}: unique ingredients`);
    strings(r.optional, `${r.name}: optional ingredients`);
    strings(r.steps, `${r.name}: steps`);
    assert.ok(r.steps.length >= 3, `${r.name}: complete method`);
    strings(r.diet, `${r.name}: dietary labels`);
    strings(r.allergens, `${r.name}: allergens`);
    assert.ok(['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].includes(r.category), `${r.name}: category`);
  }
});

test('original attribution is retained and every recipe declares its content licence', () => {
  for (const r of catalog) {
    nonempty(r.source.name, `${r.name}: source name`);
    assert.equal(r.source.license, 'CC BY-SA 4.0', r.name);
    assert.equal(r.source.licenseUrl, 'https://creativecommons.org/licenses/by-sa/4.0/', r.name);
  }
  for (const r of legacy) {
    const url = new URL(r.source.url);
    assert.equal(url.protocol, 'https:', r.name);
    assert.equal(url.hostname, 'en.wikibooks.org', r.name);
    assert.ok(url.pathname.startsWith('/wiki/Cookbook:'), r.name);
  }
  for (const r of extra) {
    assert.equal(r.source.name, 'Recipe Finder kitchen collection', r.name);
    assert.equal(r.source.url, undefined, `${r.name}: no fabricated source URL`);
  }
});

test('every referenced recipe illustration is included in the downloadable project', () => {
  for (const r of catalog) {
    assert.match(r.illustration, /^[a-z0-9-]+$/, `${r.name}: safe artwork key`);
    const artwork = path.join(project, 'images', 'illustrations', `${r.illustration}.svg`);
    assert.ok(fs.existsSync(artwork), `${r.name}: ${artwork}`);
    assert.ok(fs.statSync(artwork).size > 0, `${r.name}: nonempty artwork`);
  }
});

test('every new recipe has exactly one positive amount for each required ingredient', () => {
  for (const original of extra) {
    const r = byId(original.id);
    assert.equal(r.hasQuantities, true, r.name);
    assert.equal(r.amounts.length, r.ingredients.length, r.name);
    assert.equal(new Set(r.amounts.map(a => a.ingredient)).size, r.ingredients.length, r.name);
    assert.deepEqual([...r.amounts.map(a => a.ingredient)].sort(), [...r.ingredients].sort(), r.name);
    for (const a of r.amounts) {
      assert.ok(Number.isFinite(a.amount) && a.amount > 0, `${r.name}: ${a.ingredient}`);
      assert.ok(['g', 'ml', 'tbsp', 'tsp', 'whole', 'clove', 'slice'].includes(a.unit), `${r.name}: ${a.unit}`);
      if (a.note !== undefined) nonempty(a.note, `${r.name}: preparation note`);
    }
    nonempty(r.tip, `${r.name}: useful cooking tip`);
  }
});

test('amount-only upgrades add amounts without changing the recipe\'s ingredients, steps, servings or labels', () => {
  const amountOnly = enhancements.filter(upgrade => !upgrade.steps);
  assert.equal(amountOnly.length, 68);
  const originalCatalog = E.buildCatalog(legacy, []);
  for (const upgrade of amountOnly) {
    const before = originalCatalog.find(r => r.name === upgrade.originalName);
    const after = catalog.find(r => r.name === upgrade.originalName);
    for (const key of ['ingredients', 'optional', 'steps', 'servings', 'minutes', 'diet', 'allergens']) {
      assert.deepEqual(after[key], before[key], `${after.name}: ${key}`);
    }
    assert.match(upgrade.quantityNote, /^Amounts adapted from the linked source;/, after.name);
  }
});

test('the 60 originals without checked quantities never acquire fabricated amounts when servings change', () => {
  const unchecked = legacy.filter(r => !enhancedNames.has(r.name));
  assert.equal(unchecked.length, 60);
  for (const original of unchecked) {
    const r = catalog.find(candidate => candidate.name === original.name);
    assert.equal(r.hasQuantities, false, r.name);
    assert.equal(r.amounts.length, 0, r.name);
    const scaled = E.servingAmounts(r, r.servings * 2);
    assert.equal(scaled.length, r.ingredients.length, r.name);
    assert.ok(scaled.every(a => a.amount === null && a.unit === ''), r.name);
  }
});

test('new recipe quantities scale without changing ingredient identities or preparation notes', () => {
  for (const original of extra) {
    const r = byId(original.id);
    const scaled = E.servingAmounts(r, r.servings * 2);
    assert.equal(scaled.length, r.ingredients.length, r.name);
    for (const amount of scaled) {
      const base = r.amounts.find(a => a.ingredient === amount.ingredient);
      assert.equal(amount.amount, base.amount * 2, `${r.name}: ${amount.ingredient}`);
      assert.equal(amount.unit, base.unit, r.name);
      assert.equal(amount.note, base.note || '', r.name);
    }
  }
});

test('catalog normalization preserves the original supplied data rather than rewriting provenance', () => {
  const beforeLegacy = JSON.stringify(legacy);
  const beforeExtra = JSON.stringify(extra);
  const beforeEnhancements = JSON.stringify(enhancements);
  E.buildCatalog(legacy, extra, enhancements);
  assert.equal(JSON.stringify(legacy), beforeLegacy);
  assert.equal(JSON.stringify(extra), beforeExtra);
  assert.equal(JSON.stringify(enhancements), beforeEnhancements);
});

test('counted courgettes retain a per-item preparation weight at half and double servings', () => {
  for (const recipe of catalog.filter(r => r.amounts.some(a => a.ingredient === 'courgette' && a.unit === 'whole'))) {
    const base = recipe.amounts.find(a => a.ingredient === 'courgette');
    assert.match(base.note, /250 g each/, recipe.name);
    assert.doesNotMatch(base.note, /total/, recipe.name);
    for (const factor of [0.5, 2]) {
      const amount = E.servingAmounts(recipe, recipe.servings * factor).find(a => a.ingredient === 'courgette');
      assert.equal(amount.amount, base.amount * factor, recipe.name);
      assert.equal(amount.note, base.note, recipe.name);
    }
  }
});

test('checked cooking methods avoid stale ingredient counts and unsafe shelf-storage advice', () => {
  const eggs = catalog.find(r => r.name === 'Deviled Eggs');
  const doubledEggs = E.scaledSteps(eggs, eggs.servings * 2).join(' ');
  assert.doesNotMatch(doubledEggs, /\b(?:6|six) eggs\b|1 teaspoon each/i);
  const spread = catalog.find(r => r.name === 'Zacusca');
  assert.match(spread.steps.join(' '), /refrigerate promptly/);
  assert.match(spread.steps.join(' '), /do not seal jars for storage at room temperature/);
  assert.match(spread.safetySource, /^https:\/\/nchfp\.uga\.edu\//);
  assert.equal(legacy.find(r => r.name === 'Zacusca').amounts, undefined, 'supplied raw record stays untouched');
});

test('the actual Rhubarb Fool optional dairy cannot appear in vegan or dairy-free results', () => {
  const raw = legacy.find(r => r.name === 'Rhubarb Fool');
  assert.ok(raw.diet.includes('vegan'), 'test addresses the original contradictory label');
  const r = catalog.find(r => r.name === 'Rhubarb Fool');
  assert.ok(r.optional.includes('milk') && r.optional.includes('cream'));
  assert.ok(r.allergens.includes('dairy'));
  assert.ok(!r.diet.includes('vegan') && !r.diet.includes('dairy-free'));
  for (const options of [{diets:['vegan']}, {diets:['dairy-free']}, {allergens:['dairy']}, {exclude:['dairy']}]) {
    assert.ok(!E.search(catalog, options).some(result => result.recipe.id === r.id), JSON.stringify(options));
  }
});

test('all catalog dietary labels stay consistent with the final ingredient and allergen evidence', () => {
  for (const r of catalog) {
    if (r.diet.includes('vegan')) {
      assert.ok(r.diet.includes('vegetarian'), r.name);
      assert.ok(!r.allergens.some(a => ['dairy','egg','fish','shellfish'].includes(a)), r.name);
      assert.ok(![...r.ingredients, ...r.optional].includes('honey'), r.name);
    }
    if (r.diet.includes('dairy-free')) assert.ok(!r.allergens.includes('dairy'), r.name);
    if (r.diet.includes('gluten-free')) assert.ok(!r.allergens.includes('gluten'), r.name);
  }
  assert.equal(extra.filter(r => r.diet.includes('vegan')).length, 25);
  assert.ok(!byId('banana-oat-pancakes').diet.includes('gluten-free'), 'ordinary oats are not asserted gluten-free');
  assert.ok(!byId('peanut-lime-noodles').diet.includes('gluten-free'), 'ordinary soy sauce is not asserted gluten-free');
  assert.ok(byId('hummus-roasted-pepper-pittas').allergens.includes('sesame'), 'hummus with tahini declares sesame');
  assert.ok(byId('peanut-lime-noodles').allergens.includes('peanut'), 'peanut uses the filter canonical allergen');
});

test('the cinnamon cookie time includes its explicitly stated chilling and baking time', () => {
  const original = legacy.find(r => r.name === 'Christmas Cinnamon Cookies');
  const corrected = catalog.find(r => r.name === original.name);
  assert.equal(original.minutes, 64, 'the supplied original is preserved');
  assert.ok(corrected.minutes >= 70, 'at least 60 minutes chilling plus 10 minutes baking');
});

test('mug cake and egg methods preserve per-serving directions', () => {
  const cake = byId('chocolate-banana-mug-cake');
  const method = cake.steps.join(' ');
  assert.match(method, /one microwave-safe mug per serving/i);
  assert.match(method, /divide the batter evenly/i);
  assert.match(method, /microwave each mug separately/i);
  assert.match(method, /centre is set with no wet batter/i);
  const doubledCakeMethod = E.scaledSteps(cake, cake.servings * 2).join(' ');
  assert.match(doubledCakeMethod, /4 tablespoons water/);
  assert.match(doubledCakeMethod, /350 ml capacity/);
  assert.match(doubledCakeMethod, /800 W for 75 seconds/);
  const pancakes = byId('banana-oat-pancakes');
  const doubledPancakes = E.scaledSteps(pancakes, pancakes.servings * 2).join(' ');
  assert.match(doubledPancakes, /4 tablespoons water/);
  assert.match(doubledPancakes, /2 tablespoons each/);
  const curry = byId('red-lentil-coconut-curry');
  assert.match(E.scaledSteps(curry, curry.servings * 2).join(' '), /700 ml water/);
  const eggs = byId('spinach-feta-eggs');
  assert.match(eggs.steps.join(' '), /one little well for each egg/i);
  for (const r of extra) {
    assert.doesNotMatch(r.steps.join(' '), /(?:between|on|in) two (?:bowls|glasses|plates)|over two slices|four little wells/i, r.name);
  }
});
