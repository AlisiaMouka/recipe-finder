# Verification record

Verified locally on 26 October 2026, edition 3.0.0. The downloadable source is a standalone project; no company repository code was changed.

## Automated checks

- `npm run check`: all application scripts pass syntax checks.
- `npm test`: **82 passing tests**: 47 search/ingredient/scaling tests, 15 catalog tests, 7 state/backup/session tests, 4 Three.js behavior tests, 2 artwork coverage tests and 7 actual HTTP server tests.
- `tests/browser-checks.mjs`: **12 passing browser flows**, executed in the actual Codex in-app Chromium browser at a disposable local HTTP origin. The test uses visible UI controls and read-only DOM assertions. It took approximately 18 seconds and recorded 70 UI snapshots.
- The same browser flows are supplied in `tests/browser-runner.mjs` for optional Playwright reproduction. The shared suite was executed through the in-app browser; the standalone launcher itself was syntax-checked, not independently launched in this session.
- All 150 original recipe records remain in the byte-identical supplied `recipes.js`. The catalog has 190 distinct IDs, and all 190 artwork mappings resolve to included SVG files.

The browser suite covers pagination; explicit unknown ingredient choices; typo confirmation without an obstructing suggestions menu; natural ingredient lists; query focus; a cookbook independent of pantry matching; quantity columns and serving scaling; Wednesday plan creation and editing without duplication; cooking-step focus; and timer/cooking-session restoration. Reloading a five-serving meal at step two retains that step, its scaled instruction and five servings.

## Content and artwork

The collection contains 40 new measured recipes and 22 original recipes with source-checked quantities, for **62 measured recipes**. The remaining 128 keep unknown quantities; their portion controls cannot invent amounts. Exact source URLs, serving bases, selected alternatives and editorial changes are recorded in [SOURCE-CHECKS.md](SOURCE-CHECKS.md). Recipe source attribution, including upstream adaptation credits, is displayed.

**Update, 26 October 2026:** 68 more original recipes received amounts taken only from their source pages, giving 130 measured recipes; 60 keep unknown quantities. The other figures in this report describe the version 3 delivery and were not re-measured.

**Update, 31 October 2026:** the optional 3D bowl and its Three.js library were removed at the owner's request, together with their 4 tests (a new test checks the bowl stays removed). Statements below about Three.js, WebGL and the decorative scene describe the original delivery.

Scaling checks preserve times, temperatures, dimensions, equipment capacities and per-piece cooking directions. Explicit method water amounts scale. Per-item courgette notes remain coherent. Shopping totals keep fresh/canned tomatoes and dry/cooked/drained forms distinct. The Zacusca adaptation explicitly requires fresh or refrigerated use, not untested room-temperature canning.

Every recipe has an explicit artwork mapping: 159 dish illustrations and 31 ingredient studies. All 40 new recipes have distinct compositions. Mug cake appears in a mug and yogurt cups in glasses. Full illustrations remain visible rather than being cropped into narrow strips. Ingredient studies are described honestly in the detail view. New artwork and its generator are covered by the included MIT additions license.

Recipes are source-checked or newly authored, **not kitchen-tested**. These checks do not establish nutritional analysis, exhaustive allergen detection, exact cooking times, live grocery prices or the accuracy of every original source recipe.

## Browser and accessibility checks

Actual responsive measurements:

| Viewport | Document width | Desktop document height | Pantry input top | Search top |
| --- | ---: | ---: | ---: | ---: |
| 1440 × 900 | 1440 | 900 | 266 px | 182 px |
| 1280 × 720 | 1280 | 720 | 254 px | 170 px |
| 1024 × 768 | 1024 | 768 | 235 px | 154 px |
| 390 × 844 | 390 | Natural mobile scrolling | 271 px | 457 px |
| 320 × 640 | 320 | Natural mobile scrolling | 296 px | 482 px |

Desktop controls and pagination fit in the viewport at all three checked sizes. Mobile layouts use a readable single column without horizontal document overflow. The 390 px recipe dialog remains within the viewport; after scrolling 1,299 px through it, its close button remains visible at y=23 px with a 44 × 44 px target. Short windows fall back to scrolling.

Axe-core 4.10.3 found **zero automated violations** for the WCAG 2 A/AA and 2.1 AA tag sets on the checked desktop discovery screen and 390 px recipe dialog. It reported manual-review items for color contrast and an ARIA attribute rule. Palette contrast was separately checked, and keyboard focus was exercised in the browser flows. This is a bounded audit, not a claim of complete accessibility conformance or a full assistive-technology matrix.

Additional UI checks passed: JSON backup download, validated restore preview and confirmation; real WebGL canvas creation on demand; canvas destruction on close; timer completion; pantry-form state distinctions; combined diet/allergen/time/measurement filters. No runtime console errors were recorded in these tested flows.

## Performance approach

The initial page no longer loads Three.js or the decorative scene. The 670 KB library is fetched only when the user opens the optional bowl. The scene batches geometry and stops rendering when idle, hidden or closed; reduced-motion mode stays stationary. Recipe search uses cached catalog/token indexes. Query changes update results without rerendering the pantry, planner and shopping list or writing storage. Pagination bounds rendered cards to two through six on the checked desktop sizes.

The optional included Node server compresses text and SVG responses, uses encoding-specific ETags with revalidation, and maintains a bounded cache. WOFF2 and PNG responses remain uncompressed; serving is limited to the project directory on localhost. Server checks exercise correct GET/HEAD and 304 behavior, changed-file invalidation, malformed requests and symlinks outside the project.

Six bundled WOFF2 font subsets total 126,404 bytes, down from 387,952 bytes of TTF files. Recipe SVGs total approximately 1.25 MB across the complete 190-image collection; only displayed artwork needs to load. The site has no external runtime font, image or recipe API dependency.

### Controlled cold-load measurement

One independent in-app Chromium lab sample used a 1440 × 900 viewport, disabled cache, 150 ms network latency, 200,000 bytes/s download and 93,750 bytes/s upload. CPU throttling was unavailable and was not applied. The final measurement uses the **included Node server with gzip**; the earlier edition used an uncompressed Python preview.

| Metric | Earlier edition | Delivered edition |
| --- | ---: | ---: |
| Initial transferred bytes | 1,481,705 | 206,544 |
| DOMContentLoaded | 8,089.7 ms | 1,404.8 ms |
| Load event | 8,180.1 ms | 1,426 ms |
| First Contentful Paint | 1,620 ms | 848 ms |
| Largest Contentful Paint | 1,620 ms | 1,684 ms |
| Cumulative Layout Shift | 0.00293 | 0.01915 |

This is about 86% less initial transfer and a much earlier ready interface in this test. It does **not** mean every metric improved: the page composition and LCP element changed, and the final LCP/CLS values were slightly higher. The baseline had one saved/planned recipe; the final kitchen was empty. All six visible final recipe illustrations were verified loaded. No initial requests were made for Three.js, the optional hero illustration or hidden planner images. One 156 ms long task was observed. These are lab observations, not field Core Web Vitals or guaranteed user timings; raw values are in `performance.json`.

## Limits and reproduction

Run `npm start` with Node 18+ for the verified local HTTP route. There are no runtime dependencies to install. `npm run check` and `npm test` are dependency-free. For the optional browser runner, follow its instructions to install Playwright separately and use a disposable localhost origin.

The browser tool prohibits `file://` navigation, so double-click launch was **not browser-verified**. Package/source checks confirm classic local scripts, included local assets, and no module/fetch/CDN requirement for the recipe application. No claim is made of a complete Safari/Firefox/physical-device matrix or offline HTTP reload support. There is no service worker. A saved timer cannot notify while the browser is closed; reopening restores its deadline and finished state.

Preview PNGs in this folder are actual captures of the delivered application. Test pantry data is not bundled as a default kitchen.
