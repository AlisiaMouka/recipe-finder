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
