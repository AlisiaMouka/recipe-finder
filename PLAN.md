# Recipe Finder: Plan

## Version 1
- A single web page you open in a browser.
- A box where you type ingredients, separated by commas.
- About 15–20 recipes we write ourselves, kept separate from the matching part
  (the "pantry" is separate from the "cook").
- Each recipe carries this information:
  - Ingredients
  - Diet labels: vegetarian, vegan, gluten-free
  - Possible allergens (with a note: "always check ingredient labels")
  - Cooking time
  - Estimated price in euros (approximate)
  - Cuisine (e.g. Italian, Mexican)
  - Servings
- Filter buttons (they hide recipes): vegetarian, vegan, gluten-free.
- A switch: "only show recipes where I have everything."
- Each result shows which ingredients you're missing.
- If a filter makes one of your ingredients unusable, say so
  (e.g. "Chicken was ignored because Vegetarian is on").

## The cook's rule (how recipes are ranked)
1. Fewest missing ingredients first. (A recipe you can cook right now wins.)
2. If tied, the recipe that uses more of your ingredients comes first.
3. A recipe that uses none of your ingredients doesn't appear.

## Later (Version 2+)
- Add an online recipe source alongside our own list.
- Smarter recommendations.
- Let the user pick how results are sorted (sorting reorders, it doesn't hide):
  1. "Buy Less": fewest missing ingredients first (the default).
  2. "Use Most": uses the most of what you typed first.
  3. "Quickest": shortest cooking time first.
  4. "Cheapest": lowest estimated price first.
- More filters: by cuisine, by allergen.

## How we work
- Every change goes into a draft (a branch) first, never straight into main.
- Before a change goes into main, show a preview of how it looks in the chat.
- Main only changes after a pull request has been reviewed and approved.
