# Recipe collection notes

The upgrade retains the original Wikibooks recipe collection and its attribution. `recipes-extra.js` adds 40 newly written practical recipes: 8 breakfasts, 10 lunches, 15 dinners, 3 snacks and 4 desserts. Twenty-five are vegan. All 40 provide a quantity for every required ingredient.

The new recipe text is shared under CC BY-SA 4.0. Credit “Recipe Finder kitchen collection (2026)” when reusing or adapting it. These are newly authored recipes, not quotations or claims of professional kitchen testing. Prices are rough estimates for the whole recipe, not live prices. Times are approximate and depend on equipment and preparation.

`amounts` contains `{ ingredient, amount, unit, note? }` objects. Ingredient names match the `ingredients` array exactly. Grains and pasta are weighed dry unless a note says otherwise. Canned beans and fish use drained weights. Salt, pepper and water are assumed pantry basics and appear in the method when needed.

Recipes containing ordinary oats are deliberately not labelled gluten-free: product certification matters. Ordinary soy sauce is treated as containing gluten. The hummus recipes explicitly include tahini and are marked for sesame. No optional ingredients are silently included in dietary claims. Check product labels, cross-contact and personal requirements independently.

The original recipes do not all provide quantities. Do not manufacture quantities or claim that their serving amounts can be scaled. Use their original source links for additional detail.

## Source-checked originals

`recipe-enhancements.js` adds documented measured quantities and clearer methods to 22 original recipes without replacing their original names, IDs or source URLs. Together with the 40 new recipes, 62 of the 190 recipes have measured ingredients. The remaining 128 keep unknown amounts. [docs/SOURCE-CHECKS.md](docs/SOURCE-CHECKS.md) records source pages, serving bases, selected alternatives and editorial changes. The source-checked recipes are not kitchen-tested. Zacusca is presented for freshly cooked or refrigerated use, not shelf-stable canning.

Structured amounts use decimal formatting and separate units. Per-item preparation notes stay per item; compatible shopping quantities combine, while fresh/canned and cooked/dry/drained variants remain separate. Explicit method water amounts scale; times, temperatures, equipment capacity and per-piece directions do not.
