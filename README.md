# Recipe Finder — a little pantry magic

An expanded edition of **Alisia’s [Recipe Finder](https://alisiamouka.github.io/recipe-finder/)**. Turn ingredients you already have into a meal, keep a personal cookbook, plan your week, and bring the missing ingredients together in a shopping list.

## Start here

1. Unzip the folder.
2. Double-click **index.html**. Use a current Chrome, Edge, Firefox, or Safari browser.
3. Add what you have, such as `2 eggs, 200g tomatoes, spinach`.

**No install, API key, account, or internet connection is needed.** Fonts, illustrations and recipes are included.

For a consistent local address and browser storage, with Node.js 18+ installed:

```sh
npm start
```

Open **http://127.0.0.1:4173**. Press Ctrl+C in the terminal to stop the preview. There are no dependencies to install.

## What’s new

- 190 recipes: the original 150 plus 40 new recipes. **130 have measured ingredients**, including 90 original recipes checked against their source pages.
- A compact desktop workspace with pagination, a responsive phone layout, 190 recipe-specific artwork mappings, and smaller bundled fonts.
- Natural pantry lists with quantities and ingredient aliases. Unknown names require correction or an explicit custom choice; cooked, dry and frozen forms retain their meaning.
- Search dishes, ingredients and cuisines. Filter by time, dietary style, allergens, cuisine, extra purchases, or measured recipes.
- Clear ingredient-name matching and missing lists; salt, pepper and water are assumed.
- A locally saved cookbook independent of pantry matching, an editable seven-day meal planner, and export/restore backups from Kitchen settings.
- Shopping lists that omit pantry ingredients, combine compatible units, preserve fresh/canned and cooked/dry distinctions, and download as text.
- Serving controls for measured recipes; measured amounts within the method scale too. Cooking times, temperatures, per-piece sizes and equipment capacities remain unchanged.
- Step-by-step cooking, checklists, printable recipes, and a timer. Active servings, cooking step, checks and timer survive a reload; replacing a running timer requires an explicit choice.

## A few useful details

**Pantry matching checks names, not stock levels.** Having “egg” does not mean you have all six eggs a recipe needs. Check your quantities before cooking. Food families match in the useful direction: parmesan can cover “cheese”; generic cheese cannot promise parmesan.

**Quantities have a clear origin.** The 40 new recipes have measured amounts but have not been kitchen-tested. Another 90 originals use source-checked quantities, with their exact serving basis and adaptations in [SOURCE-CHECKS.md](docs/SOURCE-CHECKS.md). The remaining 60 original recipes retain unknown amounts (the reason for each is in SOURCE-CHECKS.md) and link to their sources; their serving controls stay disabled. Source checks are not kitchen testing.

**Diet and allergy filters are guides.** Optional ingredients are included conservatively. Product formulations, substitutions and cross-contact vary: check labels and recipes. Costs are rough euro estimates per serving, not live supermarket prices. 159 illustrations represent identified dishes; 31 clearly described ingredient studies show recipe ingredients instead of claiming a finished appearance. They are original artwork, not food photographs.

**Your kitchen stays in your browser.** Pantry, exclusions, preferences, cookbook and plan are stored in localStorage. Nothing is sent to a service. Clearing browser data removes your saved kitchen; moving the folder, changing browser, or using private mode can give you separate storage. The app still works if storage is unavailable, and shows a notice. Cooking progress and the timer deadline are saved too. A timer cannot notify you while the page or browser is closed; reopening it shows whether it has finished. Export a JSON backup from Kitchen settings to move your kitchen safely.

**Scaling needs cooking judgment.** The ingredient list and explicit method weights/volumes scale. Keep per-piece sizes and equipment capacity as written; cook extra servings in batches and allow extra time. Cooking times are estimates, so use the recipe’s doneness cues. Optional additions are not included in the shopping list.

## Edit or publish it

This is a static site. Upload the contents of this folder to GitHub Pages, Netlify, or any static web host; keep the folder structure intact. No build command is needed. Hosting is not required to use the ZIP.

| File | Purpose |
| --- | --- |
| `index.html` / `style.css` | Layout, typography, responsive design |
| `app.js` | Pantry, cookbook, planner, shopping list, cooking UI |
| `engine.js` / `kitchen-state.js` | Search, safe matching, quantity calculations, validated persistence and backups |
| `recipes.js` | Original 150-recipe collection and source attribution |
| `recipes-extra.js` | 40 new measured recipes, written in an editable compact format |
| `recipe-enhancements.js` | 90 source-checked upgrades (22 with clearer methods, 68 with amounts only); original records remain untouched |
| `recipe-art.js` / `recipe-art-manifest.json` | Explicit artwork mapping and honest descriptions |
| `images/recipes/` / `images/plates/` / `fonts/` | Local recipe artwork, decorative bowl and typography |
| `tests/` | Search, scaling, data and source-integrity checks |
| `serve.js` | Optional local preview, using Node’s built-in modules only |

To add a measured recipe, follow an entry in `recipes-extra.js`. Use a unique `id`, canonical lowercase ingredient names, and one measured amount for every required ingredient. Keep source and license information with reused material. Add tests for new search behavior in `tests/engine.test.js`.

```sh
npm run check
npm test
```

For the optional reproducible browser suite, follow `tests/browser-runner.mjs`; it uses an isolated Chromium context and a disposable localhost server. The regular app and unit tests require no installed packages.

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for measured results, checks performed and their limits.

## Credits and licenses

Original project and code: **Alisia**. Original recipe content is adapted from the **Wikibooks Cookbook**, with each recipe’s source URL retained, and is shared under **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**. The 40 new recipes are shared under the same license. Preserve attribution and share-alike requirements when redistributing recipe content. This edition changes design, search, and presentation; it does not claim ownership of the original project.

The original code retains its original licensing status. Newly authored UI and engine code and original SVG plate artwork in this edition may be reused, modified and redistributed under the MIT license in `LICENSE-ADDITIONS.txt`; this grant does not relicense original code or recipe text. DM Sans and DM Serif Display use the SIL Open Font License. Their notices are included locally. See [ASSET-CREDITS.md](ASSET-CREDITS.md) and [DATA-NOTES.md](DATA-NOTES.md).
