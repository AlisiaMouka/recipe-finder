# Notes for Claude (read this first)

This project belongs to someone learning to build apps with AI agents.
**Teaching matters as much as the product.**

## How to talk
- Explain in plain language, without jargon. If a technical word is needed, explain it.
- Explain *before* doing, and the principle behind each step.
- Ask a short question now and then to check understanding.

## How to work
- Read `PLAN.md` first. It says what we're building and the decisions made so far.
- Sketch first: show a picture of a new feature or design and get a yes before building.
- Never change `main` directly. Every change goes on its own branch with a draft pull request.
- Show a working preview in the chat before anything is merged.
- When in doubt about food, go with what a cook would recommend.
- When a mistake could hurt someone (allergies, diets), hide too much rather than too little.
- Code from outside (a ZIP, another tool) is inspected before it goes in, and compared
  with the decisions in `PLAN.md`. Point out anything that undoes a decision.

## Checks (tests)
- Run the checks **before** changing anything (to know it worked to begin with)
  and **after** (to catch anything you broke):
  - `npm run check` (every script can be read) and `npm test` (83 checks).
  - The 14 browser checks: start `PORT=8768 npm start`, then run
    `node tests/browser-runner.mjs http://127.0.0.1:8768` (needs Playwright).
- Every new rule or feature gets a new check, with a plain-language name.
- Never delete or weaken a check to make it pass. If a check is wrong, explain why and ask first.
- GitHub runs `npm run check` and `npm test` on every pull request. Only merge when they're green.

## How the code is organized (the kitchen)
| File | Role |
|---|---|
| `recipes.js` | The pantry: the 150 Wikibooks recipes, information only |
| `recipes-extra.js` | The 40 recipes written for version 3, with measured amounts |
| `recipe-enhancements.js` | Measured amounts for 90 Wikibooks recipes, from their source pages only (originals stay untouched) |
| `engine.js` | The cook: food families, matching, labels, search, amounts, shopping list; knows nothing about the page |
| `kitchen-state.js` | The fridge notes: what's saved in the browser, and backups |
| `app.js` | The waiter: connects the page to the cook |
| `index.html`, `style.css`, `fonts/` | The dining room: what the page looks like |
| `recipe-art.js`, `recipe-art-manifest.json`, `images/` | The drawings for each recipe |
| `serve.js` | Optional local preview server (only on your own computer) |
| `tests/` | The checks |

Keep these roles separate. For example, adding a recipe should only touch the recipe files.
