const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const E = require("../engine");
const root = path.join(__dirname, "..");
const ctx = { window: {} };
vm.createContext(ctx);
for (const name of [
  "recipes.js",
  "recipes-extra.js",
  "recipe-enhancements.js",
  "recipe-art.js",
])
  vm.runInContext(fs.readFileSync(path.join(root, name), "utf8"), ctx);
const catalog = E.buildCatalog(
  vm.runInContext("RECIPES", ctx),
  ctx.window.EXTRA_RECIPES,
  ctx.window.RECIPE_ENHANCEMENTS,
);
test("every recipe has explicit existing artwork and an honest description", () => {
  const art = ctx.window.RECIPE_ART;
  assert.equal(Object.keys(art).length, catalog.length);
  for (const r of catalog) {
    const item = art[r.id];
    assert.ok(item, r.id);
    assert.match(item.src, /^images\/recipes\/[a-z0-9-]+\.svg$/);
    assert.ok(fs.existsSync(path.join(root, item.src)), item.src);
    assert.ok(item.alt.length > 20);
    assert.ok(["dish-illustration", "ingredient-study"].includes(item.kind));
  }
});
test("mug cake and yogurt cups have distinct dish-specific artwork", () => {
  const art = ctx.window.RECIPE_ART;
  const cake = catalog.find((r) => r.name === "Chocolate banana mug cake");
  const yogurt = catalog.find((r) => /yogurt.*cups/i.test(r.name));
  assert.ok(cake);
  assert.ok(yogurt);
  assert.notEqual(art[cake.id].src, art[yogurt.id].src);
  assert.match(art[cake.id].alt, /mug/i);
  assert.match(art[yogurt.id].alt, /cup|glass/i);
});
