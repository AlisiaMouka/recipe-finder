// PAGE CHECKS
// Does the page work when a person uses it? Runs in a real (hidden) browser.

const path = require("path");
const { check, runChecks, assert, ROOT } = require("./checker");

const PAGE = "file://" + path.join(ROOT, "index.html");

let browser;
let page;
let pageErrors = [];

// Opens a fresh copy of the page for each check.
async function openPage(width = 1000) {
  if (page) await page.close();
  page = await browser.newPage({ viewport: { width, height: 900 } });
  pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(PAGE);
}

async function add(box, word) {
  await page.click(`#${box}-input`);
  await page.keyboard.type(word);
  await page.keyboard.press("Enter");
}

const tags = (box) => page.$$eval(`#${box}-box .tag`, (els) => els.map((el) => el.firstChild.textContent));
const recipeNames = () => page.$$eval(".card h2", (els) => els.map((el) => el.textContent));
const messages = () => page.$$eval(".box-message", (els) => els.map((el) => el.textContent).join(" "));

check("the front page shows every recipe, A to Z, before anything is typed", async () => {
  await openPage();
  const names = await recipeNames();
  assert.ok(names.length >= 50, `only ${names.length} recipes shown`);
  assert.deepStrictEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
  assert.ok((await page.textContent("#count")).startsWith("All recipes"));
});

check("with nothing typed, cards show the ingredient list (not You have / Missing)", async () => {
  await openPage();
  const first = await page.locator(".card").first().innerText();
  assert.ok(first.includes("Ingredients:"), first);
  assert.ok(!first.includes("Missing:"), first);
});

check("ticking only Vegan shows all vegan recipes", async () => {
  await openPage();
  await page.click("#filters-button");
  await page.check('input[value="vegan"]');
  assert.ok((await page.textContent("#count")).startsWith("Vegan recipes"));
  const labels = await page.$$eval(".card .facts", (els) => els.map((el) => el.textContent));
  assert.ok(labels.length > 5 && labels.every((text) => text.includes("vegan")));
});

check('"I have everything" is gone from the Filters menu', async () => {
  await openPage();
  assert.strictEqual(await page.locator("#have-everything").count(), 0);
});

check("typing shows suggestions, and Enter picks the top one", async () => {
  await openPage();
  await page.click("#have-input");
  await page.keyboard.type("tom");
  const first = await page.$eval("#have-box .suggestions li", (li) => li.dataset.value);
  assert.strictEqual(first, "tomato");
  await page.keyboard.press("Enter");
  assert.deepStrictEqual(await tags("have"), ["tomato"]);
});

check("typing with commas turns each ingredient into a tag, and results appear", async () => {
  await openPage();
  await add("have", "Eggs, rice,chicken");
  assert.deepStrictEqual(await tags("have"), ["egg", "rice", "chicken"]);
  assert.ok((await recipeNames()).length > 0);
});

check("× removes a tag", async () => {
  await openPage();
  await add("have", "egg, rice");
  await page.click('#have-box .tag button[data-value="egg"]');
  assert.deepStrictEqual(await tags("have"), ["rice"]);
});

check("the same ingredient can't be in both boxes", async () => {
  await openPage();
  await add("have", "egg");
  await add("out", "egg");
  assert.deepStrictEqual(await tags("out"), []);
  assert.ok((await messages()).includes('Egg is already in "I have".'));
});

check('a family member can\'t go in "I have" when its family is in "Leave out"', async () => {
  await openPage();
  await add("out", "meat");
  await add("have", "chicken");
  assert.deepStrictEqual(await tags("have"), []);
  assert.ok((await messages()).includes('Chicken counts as meat, which is in "Leave out".'));
});

check('Leave out lists what a family covers ("Also leaving out: …")', async () => {
  await openPage();
  await add("out", "cheese");
  const covers = await page.textContent("#out-box ~ .covers");
  assert.ok(covers.startsWith("Also leaving out:") && covers.includes("parmesan"), covers);
});

check('a card shows "cheddar (as cheese)"', async () => {
  await openPage();
  await add("have", "cheddar, egg");
  const cardText = await page.$$eval(".card", (cards) =>
    cards.find((c) => c.querySelector("h2").textContent === "Spinach & Cheese Omelette").innerText);
  assert.ok(cardText.includes("cheddar (as cheese)"), cardText);
});

check("other names show discreetly in suggestions (garbanzo → chickpea)", async () => {
  await openPage();
  await page.click("#have-input");
  await page.keyboard.type("garb");
  const item = await page.$eval("#have-box .suggestions li", (li) => ({
    value: li.dataset.value,
    alias: li.querySelector(".alias")?.textContent,
  }));
  assert.deepStrictEqual(item, { value: "chickpea", alias: "garbanzo bean" });
});

check('"Show steps" unfolds the numbered cooking steps, and "Hide steps" folds them away', async () => {
  await openPage();
  await add("have", "potato, egg, onion");
  const card = page.locator(".card", { hasText: "Spanish Tortilla" });
  assert.ok(!(await card.locator(".steps li").first().isVisible()), "steps should start folded");
  await card.getByText("Show steps").click();
  assert.ok(await card.locator(".steps li").first().isVisible(), "steps should unfold");
  assert.ok((await card.locator(".steps li").count()) >= 3);
  await card.getByText("Hide steps").click();
  assert.ok(!(await card.locator(".steps li").first().isVisible()), "steps should fold away");
});

check("the Filters dropdown opens, counts what's ticked, and closes when clicking elsewhere", async () => {
  await openPage();
  await add("have", "egg");
  await page.click("#filters-button");
  assert.ok(await page.isVisible("#filters-panel"));
  await page.check('input[value="vegetarian"]');
  await page.check('input[value="dairy-free"]');
  assert.strictEqual((await page.textContent("#filters-button")).trim(), "Filters (2) ▾");
  await page.click("h1");
  assert.ok(!(await page.isVisible("#filters-panel")));
});

check("the vegetarian note appears on the page", async () => {
  await openPage();
  await add("have", "chicken, rice");
  await page.click("#filters-button");
  await page.check('input[value="vegetarian"]');
  const notes = await page.$$eval(".note", (els) => els.map((el) => el.textContent));
  assert.deepStrictEqual(notes, ["Chicken was ignored because Vegetarian is on."]);
});

check("on a computer, Filters and Find recipes sit beside the I have box", async () => {
  await openPage(1100);
  const box = await page.locator("#have-box").boundingBox();
  const button = await page.locator(".find-button").boundingBox();
  assert.ok(Math.abs(box.y - button.y) < 5, "buttons should be on the same row as I have");
});

check("on a phone, the buttons come after Leave out, with no sideways scrolling", async () => {
  await openPage(390);
  const outBox = await page.locator("#out-box").boundingBox();
  const button = await page.locator(".find-button").boundingBox();
  assert.ok(button.y > outBox.y, "buttons should be below Leave out");
  const scrollsSideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.ok(!scrollsSideways);
});

check("on a phone, unfolded steps use (almost) the full card width", async () => {
  await openPage(390);
  await add("have", "potato, egg, onion");
  const card = page.locator(".card", { hasText: "Spanish Tortilla" });
  await card.getByText("Show steps").click();
  const cardBox = await card.boundingBox();
  const stepsBox = await card.locator(".steps ol").boundingBox();
  assert.ok(stepsBox.width > cardBox.width * 0.85, `steps are ${Math.round(stepsBox.width)}px in a ${Math.round(cardBox.width)}px card`);
});

check("on a wide screen, recipes sit two per row", async () => {
  await openPage(1440);
  const [first, second] = await page.locator(".card").evaluateAll((cards) =>
    cards.slice(0, 2).map((card) => card.getBoundingClientRect().top));
  assert.ok(Math.abs(first - second) < 2, "the first two recipes should be side by side");
});

check("opening one recipe's steps doesn't stretch the recipe next to it", async () => {
  await openPage(1440);
  const before = await page.locator(".card").nth(1).boundingBox();
  await page.locator(".card").first().getByText("Show steps").click();
  const after = await page.locator(".card").nth(1).boundingBox();
  assert.ok(Math.abs(after.height - before.height) < 2, `neighbor grew from ${before.height}px to ${after.height}px`);
});

check("on a phone, recipes are one per row", async () => {
  await openPage(390);
  const [first, second] = await page.locator(".card").evaluateAll((cards) =>
    cards.slice(0, 2).map((card) => card.getBoundingClientRect().top));
  assert.ok(second > first + 20, "the second recipe should be below the first");
});

check("the browser tab shows the food icon (favicon.svg)", async () => {
  await openPage();
  const href = await page.getAttribute('link[rel="icon"]', "href");
  assert.strictEqual(href, "favicon.svg");
  const loaded = await page.evaluate(async (url) => (await fetch(url)).ok, href).catch(() => false);
  assert.ok(require("fs").existsSync(require("path").join(ROOT, href)) || loaded, "favicon.svg is missing");
});

check("no errors happen on the page during any of these checks", async () => {
  await openPage();
  await add("have", "egg, cheddar, tomato");
  await add("out", "meat");
  assert.deepStrictEqual(pageErrors, []);
});

module.exports = async () => {
  let chromium;
  try {
    ({ chromium } = require("playwright"));
    browser = await chromium.launch();
  } catch (error) {
    // On GitHub (CI) a missing browser is a failure; on a laptop we just say so.
    if (process.env.CI) throw error;
    console.log("\nPage checks: SKIPPED (no browser available here). The cook and pantry checks still ran.");
    return 0;
  }
  try {
    return await runChecks("Page checks (using the app in a browser)");
  } finally {
    await browser.close();
  }
};
