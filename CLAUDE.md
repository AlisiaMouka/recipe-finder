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

## Checks (tests)
- Run `npm test` **before** changing anything (to know it worked to begin with)
  and **after** (to catch anything you broke).
- Every new rule or feature gets a new check, with a plain-language sentence.
- Never delete or weaken a check to make it pass. If a check is wrong, explain why and ask first.
- GitHub runs the same checks on every pull request. Only merge when they're green.

## How the code is organized (the kitchen)
| File | Role |
|---|---|
| `recipes.js` | The pantry: recipe information only, no logic |
| `ingredients.js` | The reference book: ingredient families and other names |
| `matcher.js` | The cook: picks and ranks recipes; knows nothing about the page |
| `app.js` | The waiter: connects the page to the cook |
| `index.html`, `style.css` | The dining room: what the page looks like |
| `tests/` | Pantry, cook and page checks |

Keep these roles separate. For example, adding a recipe should only touch `recipes.js`.
