# Handover: recipe photos (work in progress on the `photos` branch, PR 10)

Read `CLAUDE.md` and `PLAN.md` first. Then this. Delete this file when the photo work is merged.

## Decided with the owner
- Real photos from **Unsplash** where a good one exists; otherwise the recipe keeps its **drawing**
  (already in place: `images/illustrations`, and every recipe has an `illustration`).
- The owner must be able to change pictures without coding: keep `PHOTOS.md` accurate.
- Before adding photos to the project, show the owner a **contact sheet** of all 50 cards
  (photo or drawing) and get a yes. Look at every photo yourself first: wrong dish,
  blurry, or mostly not food means reject it.

## Already done on this branch
- Drawings, `photo-credits.js`, the Photo credits section, `PHOTOS.md`, and checks.
- One check fails on purpose until credits exist: "Photo credits are listed at the bottom, folded away".

## Unsplash setup (done by the owner in the environment settings)
- Access key in the environment variable `UNSPLASH_ACCESS_KEY` (never print it or ask for it in chat).
- Allowed domains: `api.unsplash.com`, `images.unsplash.com`.
- Demo apps may make **50 requests per hour**. Be polite: pause between calls, stop on a 403/429.

## Unsplash rules (API guidelines) and what they mean here
1. **Hotlink:** use the photo's `urls.raw` with size parameters as the recipe's `image`,
   e.g. `https://images.unsplash.com/photo-...?w=330&h=330&fit=crop&auto=format`.
   Don't download copies into the project.
2. **Attribution:** credit line in `photo-credits.js`, e.g.
   `"Spanish Tortilla": "Photo by NAME on Unsplash https://unsplash.com/@USERNAME?utm_source=recipe_finder&utm_medium=referral"`.
   The credits section turns the web address into a link.
3. **Track downloads:** when a photo is chosen, call its `links.download_location`
   (with the access key) once.

## Code changes still needed
- `tests/pantry.test.js`, "every photo a recipe points to exists": allow `https://images.unsplash.com/...`
  addresses (check they start with that), and keep checking local files for `images/photos/...`.
- `PHOTOS.md`: explain that some photos come from Unsplash (web addresses) and how to swap
  one for your own.
- `PLAN.md`: mention Unsplash.
- Then: contact sheet → owner's yes → preview → GitHub ✓ → owner says merge.

## Search words per recipe (a starting point)
Use the recipe name; for tricky ones try: Chickpea Curry → "chana masala",
Garlic Shrimp → "gambas al ajillo", Spanish Tortilla → "tortilla de patatas",
Lentil Dahl → "dal", Aubergine Parmigiana → "eggplant parmigiana",
Courgette Fritters → "zucchini fritters", Banana "Nice Cream" → "banana ice cream".
