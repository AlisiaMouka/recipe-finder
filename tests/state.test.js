const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../kitchen-state");
const catalog = Array.from({ length: 190 }, (_, i) => ({
  id: "recipe-" + i,
  servings: 2,
}));
test("all 190 saves and more than 50 plan entries survive export and reload", () => {
  const state = S.defaults();
  state.saved = catalog.map((r) => r.id);
  state.plan = Array.from({ length: 75 }, (_, i) => ({
    key: "meal-" + i,
    id: catalog[i].id,
    day: "Wednesday",
    servings: 5,
  }));
  const restored = S.importBackup(S.backup(state), catalog);
  assert.equal(restored.saved.length, 190);
  assert.equal(restored.plan.length, 75);
  assert.deepEqual(restored.plan, state.plan);
});
test("invalid imports fail without silently discarding meals", () => {
  const state = S.defaults();
  state.plan = [{ id: "missing", key: "x", day: "Monday", servings: 2 }];
  assert.throws(() => S.importBackup(S.backup(state), catalog), /not valid/);
  assert.throws(() => S.importBackup("{}", catalog), /Recipe Finder/);
});
test("paused and finished timer context survives roundtrip", () => {
  for (const paused of [false, true]) {
    const state = S.defaults();
    state.timer = {
      end: 1234,
      remaining: 60000,
      paused,
      finished: false,
      recipeId: "recipe-2",
    };
    assert.deepEqual(
      S.importBackup(S.backup(state), catalog).timer,
      state.timer,
    );
  }
});
test("old kitchens migrate without cutting saved or checked items", () => {
  const old = {
    ...S.defaults(),
    version: 2,
    saved: catalog.map((r) => r.id),
    checked: Array.from({ length: 150 }, (_, i) => "item-" + i),
  };
  const result = S.read(
    { getItem: (k) => (k.endsWith("v2") ? JSON.stringify(old) : null) },
    catalog,
  );
  assert.equal(result.state.version, 3);
  assert.equal(result.state.saved.length, 190);
  assert.equal(result.state.checked.length, 150);
});
test("unavailable storage returns independent safe defaults", () => {
  const a = S.read(
    {
      getItem() {
        throw Error("blocked");
      },
    },
    catalog,
  );
  a.state.pantry.push("egg");
  const b = S.defaults();
  assert.equal(a.available, false);
  assert.deepEqual(b.pantry, []);
});
test("backup strings remain data, duplicate plan keys repaired on hydration", () => {
  const state = S.defaults();
  state.pantry = ["<img src=x onerror=alert(1)>"];
  state.plan = [
    { id: "recipe-1", key: "same", day: "Friday", servings: 2 },
    { id: "recipe-2", key: "same", day: "Friday", servings: 3 },
  ];
  const result = S.validate(state, catalog);
  assert.equal(result.pantry[0], state.pantry[0]);
  assert.notEqual(result.plan[0].key, result.plan[1].key);
});

test("cooking progress restores scaled portions, plan context and checked items", () => {
  const recipes = [
    {
      id: "meal",
      servings: 2,
      steps: ["one", "two"],
      ingredients: ["egg", "rice"],
    },
  ];
  const state = S.defaults();
  state.plan = [{ key: "wed", id: "meal", day: "Wednesday", servings: 5 }];
  state.session = {
    recipeId: "meal",
    servings: 5,
    cookStep: 1,
    planKey: "wed",
    ingredientChecks: [0],
    stepChecks: [0],
  };
  assert.deepEqual(
    S.importBackup(S.backup(state), recipes).session,
    state.session,
  );
  state.session.cookStep = 500;
  assert.equal(S.validate(state, recipes).session, null);
});
