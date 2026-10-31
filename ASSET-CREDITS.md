# Visual assets and bundled dependencies

All visual assets and fonts are local. The site makes no network requests for them.

## Original illustrations

`images/plates/*.svg` were created for this upgrade. They are stylized dish-category illustrations, not photographs of the individual recipes. Reuse and adapt under the **MIT license** in `LICENSE-ADDITIONS.txt`. Recipe text remains under CC BY-SA 4.0; this separate grant covers the new artwork.

`images/recipes/*.svg` contains 190 original recipe-specific artwork mappings: 159 dish illustrations and 31 labelled ingredient studies. `scripts/generate-recipe-art.js`, `recipe-art-manifest.json`, and the classic-script `recipe-art.js` mapping were authored for this edition. These new assets are covered by `LICENSE-ADDITIONS.txt` (MIT). Ingredient studies are identified in the mapping, image descriptions and recipe detail, rather than presented as photographs or exact finished dishes. All artwork is local; no external image service is used.

The supplied project's original SVG drawings remain under `images/illustrations/` with their original provenance. Recipe attribution is preserved separately in each recipe record.

## Fonts

- **DM Serif Display**, regular and italic: `fonts/serif.woff2`, `fonts/serif-italic.woff2`, with separate `-ext.woff2` files for Latin Extended.
  Source: https://github.com/google/fonts/tree/main/ofl/dmserifdisplay
  License: SIL Open Font License 1.1, complete text `fonts/DMSerifDisplay-OFL.txt`.
- **DM Sans**, variable weight: `fonts/sans.woff2`, with `fonts/sans-ext.woff2` for Latin Extended.
  Source: https://github.com/google/fonts/tree/main/ofl/dmsans
  License: SIL Open Font License 1.1, complete text `fonts/DMSans-OFL.txt`.

Downloaded 26 October 2026 from the official Google Fonts CSS service and fonts.gstatic.com. The WOFF2 files are the official unmodified Latin and Latin Extended subsets; `fonts/source-serif.css` and `fonts/source-sans.css` retain their exact source URLs. All browser font URLs in the site stylesheet are local. CSS family aliases are `Kitchen Serif` and `Kitchen Sans`; the original font names and license notices are preserved. Six WOFF2 files total 126,404 bytes, replacing 387,952 bytes of TTF font payload.
