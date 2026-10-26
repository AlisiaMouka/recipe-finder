# Visual assets and bundled dependencies

All visual assets and fonts are local. The site makes no network requests for them.

## Original illustrations

`images/plates/*.svg` and the decorative scene in `hero.js` were created for this upgrade. They are stylized dish-category illustrations, not photographs of the individual recipes. Reuse and adapt under the **MIT license** in `LICENSE-ADDITIONS.txt`. Recipe text remains under CC BY-SA 4.0; this separate grant covers the new artwork and scene code.

`images/recipes/*.svg` contains 190 original recipe-specific artwork mappings: 159 dish illustrations and 31 labelled ingredient studies. `scripts/generate-recipe-art.js`, `recipe-art-manifest.json`, and the classic-script `recipe-art.js` mapping were authored for this edition. These new assets are covered by `LICENSE-ADDITIONS.txt` (MIT). Ingredient studies are identified in the mapping, image descriptions and recipe detail, rather than presented as photographs or exact finished dishes. All artwork is local; no external image service is used.

The supplied project's original SVG drawings remain under `images/illustrations/` with their original provenance. Recipe attribution is preserved separately in each recipe record.

## Three.js

- Version: **0.160.1** (r160), locally bundled as `vendor/three.min.js`.
- Project: https://github.com/mrdoob/three.js
- Exact package source: https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js
- License: MIT; complete text is in `vendor/THREE-LICENSE.txt`.
- The classic-script build is intentional so double-clicking `index.html` works without an HTTP server. It is used only for the decorative hero; all recipe functionality remains available without it.

The scene is loaded only when requested. It caps device pixel ratio at 1.5, batches repeated vegetable geometry, uses a static contact shadow instead of a live shadow-map pass, and is idle when the pointer is not moving. Finite easing stops after pointer movement settles. Off-screen and hidden scenes do not render. Reduced-motion preferences keep a stationary scene; missing WebGL leaves the original illustration visible. `window.RecipeHero.destroy()` releases its renderer and geometry, and `init()` explicitly re-enables it. Recipe functionality never requires the 3D scene.

## Fonts

- **DM Serif Display**, regular and italic: `fonts/serif.woff2`, `fonts/serif-italic.woff2`, with separate `-ext.woff2` files for Latin Extended.
  Source: https://github.com/google/fonts/tree/main/ofl/dmserifdisplay
  License: SIL Open Font License 1.1, complete text `fonts/DMSerifDisplay-OFL.txt`.
- **DM Sans**, variable weight: `fonts/sans.woff2`, with `fonts/sans-ext.woff2` for Latin Extended.
  Source: https://github.com/google/fonts/tree/main/ofl/dmsans
  License: SIL Open Font License 1.1, complete text `fonts/DMSans-OFL.txt`.

Downloaded 26 October 2026 from the official Google Fonts CSS service and fonts.gstatic.com. The WOFF2 files are the official unmodified Latin and Latin Extended subsets; `fonts/source-serif.css` and `fonts/source-sans.css` retain their exact source URLs. All browser font URLs in the site stylesheet are local. CSS family aliases are `Kitchen Serif` and `Kitchen Sans`; the original font names and license notices are preserved. Six WOFF2 files total 126,404 bytes, replacing 387,952 bytes of TTF font payload.
