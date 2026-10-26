# Handover: importing 150 recipes (branch `import-recipes`)

Read `CLAUDE.md` and `PLAN.md` first. Then this. Delete this file when the import is finished.

## Goal (decided with the owner)
Add **150 recipes** from two free sources, so the app has 200 in total:
- **Wikibooks Cookbook** (CC BY-SA 4.0). Use the ready-made collection on Hugging Face
  (`gossminn/wikibooks-cookbook`): **one download, not thousands of page requests**.
  Use `en.wikibooks.org` only to confirm the license and to link each recipe's page.
- **USDA MyPlate Kitchen** (myplate.gov). **Only recipes written by USDA itself** (public domain).
  Skip any recipe credited to an outside contributor or organization.

## Decisions already made
- **Selection:** any recipe with servings, time, an ingredient list and steps is welcome,
  including sauces, dressings, drinks and basics, long ingredient lists, and dishes we
  already have. Best Wikibooks ratings first.
- **Same name as one of our recipes: the imported one replaces ours.**
- **Long-term plan: remove all 50 of our own recipes once the 150 imports are in.**
  That is a separate, later step with its own draft and the owner's OK. Then rewrite
  checks that mention our recipes by name to use made-up test recipes (explain this in
  the draft; it's a deliberate change, not weakening checks), and retake the README
  screenshot. Every import must therefore carry complete information (labels,
  allergens, price, time, servings, steps), or filters and sorting stop working.
- **Credit line approved** (sketch shown): "From Wikibooks Cookbook · CC BY-SA 4.0",
  both linked, in small grey text under the facts line. Our own recipes get none.
- **Credit on each imported card**, linked to the original page, e.g.
  "From Wikibooks Cookbook · CC BY-SA 4.0" or "From USDA MyPlate Kitchen". Sketch it first.
- **Share-alike:** adapted Wikibooks recipes stay CC BY-SA 4.0. Add a short note to the README.
- **Our standards for every import:** our ingredient names (lowercase, singular), diet labels,
  allergens, cooking time, servings, estimated price in euros, 3–8 steps in our friendly style
  that mention every ingredient, cuisine, and an `illustration`.
  Where the source lacks something (often price or time), estimate it.
- **Cautious labels:** if unsure a recipe is vegetarian, vegan, gluten-free or dairy-free,
  leave the label off. Mark allergens generously ("hide too much rather than too little").
- **Batches of about 25.** Show the owner each batch as a list (name, source, cuisine,
  labels) and add it only after their OK.
- New ingredients that come with imported recipes must be **removed from `OTHER_FOODS`**
  in `ingredients.js` (a pantry check will flag doubles), and may belong in a family.

## Status
- License confirmed on Wikibooks pages and the Hugging Face card: CC BY-SA 4.0.
- Hugging Face files are served from `us.aws.cdn.hf.co` (not allowed), so recipes are
  fetched from the Wikibooks API instead (`en.wikibooks.org/w/api.php`, category
  "Recipes", namespace 102, 50 per request). Wikibooks answers "429" often: wait as asked.
- MyPlate (`www.myplate.gov`) is still blocked. Do Wikibooks first.

## Network (set by the owner in the environment settings)
Allowed: `huggingface.co`, `cdn-lfs.huggingface.co`, `cas-bridge.xethub.hf.co`,
`en.wikibooks.org`, `www.myplate.gov`, `myplate.gov`.
Be polite: identify the project in the User-Agent (use the repo URL, never the owner's email),
pause between requests, and stop on "429 Too Many Requests" (wait as long as asked).

## Code changes needed
- Recipe fields for the source, e.g. `source: { name, url, license }`.
- Cards show the credit line (sketch first).
- New pantry checks: every imported recipe has a source name, link and license;
  Wikibooks recipes say CC BY-SA 4.0; MyPlate recipes are USDA-written.
- README: a "Recipe sources and licenses" section.
- Later idea (not now): with 200 recipes the front page gets long, so consider
  "Show more" or a cuisine filter.
