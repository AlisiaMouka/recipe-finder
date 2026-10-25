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
  dairy-free (no "dairy" allergen), and "I have everything."
- Each result shows which ingredients you're missing.
- Each recipe has 3–8 cooking steps, folded away behind "Show steps ▾".
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
- Recipe cards with a small rounded thumbnail on the left.

## The cook's rule (how recipes are ranked)
1. Fewest missing ingredients first. (A recipe you can cook right now wins.)
2. If tied, the recipe that uses more of your ingredients comes first.
3. A recipe that uses none of your ingredients doesn't appear.

## Later (Version 2+)
- Add an online recipe source alongside our own list.
- Smarter recommendations (e.g. typos, swaps like lemon for lime).
- Let the user pick how results are sorted (sorting reorders, it doesn't hide):
  1. "Buy Less": fewest missing ingredients first (the default).
  2. "Use Most": uses the most of what you typed first.
  3. "Quickest": shortest cooking time first.
  4. "Cheapest": lowest estimated price first.
- More filters: by cuisine, by allergen.
- Real recipe photos.

## How we work
- Sketch first: show a picture of a new feature or design before building it.
- Every change goes into a draft (a branch) first, never straight into main.
- Before a change goes into main, show a working preview in the chat.
- Main only changes after a pull request has been reviewed and approved.
- Names should say exactly what they mean (e.g. the "dairy" label, not "milk").
- When in doubt about food, go with what a cook would recommend.
- When a mistake could hurt someone (allergies, diets), prefer hiding too much
  over hiding too little.
