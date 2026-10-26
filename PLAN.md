# Recipe Finder: Plan

## Version 1
- A single web page you open in a browser.
- 50 recipes we write ourselves, kept separate from the matching part
  (the "pantry" is separate from the "cook").
- Each recipe carries this information:
  - Ingredients
  - Diet labels: vegetarian, vegan, gluten-free
  - Allergens, kept in the pantry but not shown on the page.
    "dairy" covers milk, cheese, butter, cream, yogurt, etc.
  - Cooking time
  - Estimated price in euros (approximate)
  - Cuisine (e.g. Italian, Mexican)
  - Servings
  - Optional photo (a placeholder is shown until we have real photos)
- "I have" box: ingredients become tags, with suggestions while typing.
- "Leave out" box: recipes containing these ingredients are hidden.
- An ingredient can't be in both boxes at once.
- Filters dropdown (filters hide recipes): vegetarian, vegan, gluten-free,
  dairy-free (no "dairy" allergen).
- With nothing typed in "I have", show every recipe that passes the filters and
  "Leave out", A to Z, with each card listing its ingredients.
- Each result shows which ingredients you're missing.
- Each recipe has 3–8 cooking steps, folded away behind "Show steps ▾".
- "Sort by" menu (sorting reorders, it doesn't hide). Ties fall back to the default.
  - Browsing (nothing typed): A to Z (default), Quickest, Cheapest.
  - Ingredients typed: Buy Less (default), Use Most, Quickest, Cheapest.
  - Cheapest means lowest price **per serving**.
  - The value being sorted by is highlighted on each card.
- Smarter matching, using a reference book of ingredients (`ingredients.js`):
  - Families: cheese, meat, fish, vegetable, fruit, spice, herb, rice, pasta,
    noodle, stock, bread. An ingredient can be in more than one family.
  - A specific ingredient counts for its family: cheddar counts for a recipe
    that says "cheese" (shown as "cheddar (as cheese)").
  - A family does NOT count for a specific one: "cheese" doesn't match parmesan.
  - A family in "Leave out" hides every member, and the page lists what it covers.
  - Other names for the same thing work (zucchini = courgette), shown discreetly.
- If a filter makes one of your ingredients unusable, say so
  (e.g. "Chicken was ignored because Vegetarian is on").

## Look and feel
- Sage green background, rose/berry accents ("Mix 2").
- Elegant serif headings (Cormorant Garamond), clean body text (Jost).
- Recipe cards with a small food drawing on the left (18 drawings in the app's
  colors, in `images/illustrations`), on one of four soft background shades.
  To change a recipe's drawing, change its `illustration` word in `recipes.js`.
- Wide screens: page up to 1200px wide, two recipes per row. Phones: one per row.
- Browser tab icon: a steaming berry bowl (`favicon.svg`).

## The cook's rule (how recipes are ranked)
1. Fewest missing ingredients first. (A recipe you can cook right now wins.)
2. If tied, the recipe that uses more of your ingredients comes first.
3. A recipe that uses none of your ingredients doesn't appear.

## Later (Version 2+)
- Add an online recipe source alongside our own list.
- Smarter recommendations (e.g. typos, swaps like lemon for lime).
- More filters: by cuisine, by allergen.
- Real recipe photos from Unsplash (work parked on the `photos` branch, PR 10,
  see its HANDOVER-PHOTOS.md). The owner must be able to swap photos without coding.
- Sort the front page by real popularity (which recipes people open). Needs the
  app online and somewhere to store the counts. Never invent popularity numbers.

## How we work
- Sketch first: show a picture of a new feature or design before building it.
- Every change goes into a draft (a branch) first, never straight into main.
- Before a change goes into main, show a working preview in the chat.
- Main only changes after a pull request has been reviewed and approved.
- Names should say exactly what they mean (e.g. the "dairy" label, not "milk").
- When in doubt about food, go with what a cook would recommend.
- When a mistake could hurt someone (allergies, diets), prefer hiding too much
  over hiding too little.
