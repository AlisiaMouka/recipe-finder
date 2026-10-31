# Recipe Finder: Plan

## Version 3 (current)
The app was replaced by an expanded edition (from a ZIP the owner provided), with the
owner's approval. The README describes the features in detail. In short:

- **Discover:** a pantry box (with quantities, other names and typo questions), a
  "leave out" list, search by dish, ingredient or cuisine, quick filters and a Filters
  panel (time, diet, allergens, cuisine, extra purchases, measured recipes), sorting,
  and pages of results. A discreet "Show" menu next to the page count picks how many
  recipes a page shows: Fit screen (default), 6, 12, 24 or 48. The choice is
  remembered in the browser.
- **Cookbook:** saved favourite recipes. **Meal plan:** a seven-day planner.
  **Shopping list:** what's missing for planned recipes, combined and downloadable.
- **Cooking:** serving controls (measured recipes only), step-by-step mode, a timer.
- **Kitchen settings:** export and restore a backup. Everything is saved in the
  browser only; nothing is sent anywhere.
- An optional 3D bowl (Three.js, bundled locally).

## Recipes
- 190 recipes:
  - 150 adapted from the Wikibooks Cookbook (CC BY-SA 4.0), each linking to its page.
  - 40 new recipes written for this edition ("Recipe Finder kitchen collection",
    CC BY-SA 4.0), all with measured amounts. These are not from an online source.
  - 90 of the Wikibooks recipes have source-checked measured amounts: 22 with
    clearer methods, and 68 with amounts only, taken from the source page.
    Owner's rule: amounts come only from the source. If the source leaves any
    ingredient unmeasured, the recipe stays unmeasured (60 recipes; reasons in
    `docs/SOURCE-CHECKS.md`).
- **Labels rule (changed in version 3):** optional ingredients now count for diet
  labels and allergens. Example: Chapati with optional ghee is no longer vegan. This
  is more cautious than before, and matches "hide too much rather than too little".
- Food families: a specific ingredient counts for its family (parmesan covers
  "cheese"); a family never promises a specific ingredient.

## Earlier decisions (version 1 and 2), kept for history
- Our own first 50 recipes were removed once the 150 Wikibooks recipes were in.
- Live recipe services were ruled out: paid, no storing allowed, or they need a secret
  key a static site can't hide. Copying other websites' recipes isn't allowed;
  linking to them is fine.
- Version 2 look: sage green with berry accents ("Mix 2"), Cormorant Garamond and
  Jost, no footer. Version 3 replaced this design.

## Later
- Run the 12 browser checks on GitHub too (today they only run on a computer).
- A "search more online" button that links to a Wikibooks search (option D).
- Swaps (e.g. lime for lemon).
- Real recipe photos (work parked in PR 10, built for the version 2 design).
- Sort by real popularity. Never invent popularity numbers.

## How we work
- Sketch first: show a picture of a new feature or design before building it.
- Every change goes into a draft (a branch) first, never straight into main.
- Before a change goes into main, show a working preview in the chat.
- Main only changes after a pull request has been reviewed and approved.
- Names should say exactly what they mean (e.g. the "dairy" label, not "milk").
- When in doubt about food, go with what a cook would recommend.
- When a mistake could hurt someone (allergies, diets), prefer hiding too much
  over hiding too little.
- Code from outside (another tool or person) is checked before it goes in: safety,
  our house rules, and a preview.
