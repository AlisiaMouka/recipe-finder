# Changing recipe pictures

Every recipe card shows a picture:

- a **photo**, if the recipe has one, or otherwise
- a **drawing** (one of the illustrations in `images/illustrations`).

A photo always wins over the drawing. You can change any of this on github.com,
with no coding tools. After each change, the live site updates within a minute or two.

## Replace a photo with your own

1. Take a photo of the dish. Square-ish photos look best. Any size works, but
   smaller files (under 300 KB) load faster.
2. Name it after the recipe, in lowercase with dashes, e.g. `spanish-tortilla.jpg`.
3. On GitHub, open the `images/photos` folder → **Add file** → **Upload files**,
   drop your photo in, and click **Commit changes**.
   If a photo with that name already exists, yours replaces it.
4. Open `photo-credits.js` (click it, then the ✏️ pencil) and change that recipe's line to:
   ```
   "Spanish Tortilla": "Own photo",
   ```
5. Click **Commit changes**.

## Add a photo to a recipe that only has a drawing

1. Upload the photo to `images/photos`, as above.
2. Open `recipes.js` (✏️ pencil), find the recipe, and add a line under its `name`:
   ```
   image: "images/photos/lentil-soup.jpg",
   ```
3. Add a line for it in `photo-credits.js`: `"Own photo"` for your own, or the
   photographer, license and web address for someone else's.
4. Commit both changes.

## Go back to the drawing

1. In `recipes.js`, delete the recipe's `image: ...` line.
2. In `photo-credits.js`, delete its credit line.
3. Optionally delete the photo file from `images/photos`.

## Change which drawing a recipe uses

In `recipes.js`, change the recipe's `illustration` word. The choices are the
file names in `images/illustrations`, without `.svg`:
soup, curry, pasta, noodles, rice-bowl, pan, salad, taco, toast, egg, fish,
skewer, baked-dish, pancakes, cake, smoothie, yogurt-bowl, ice-cream.

## Using someone else's photo

Only use photos you're allowed to: your own, or ones with a free license such as
public domain, CC0, CC BY or CC BY-SA (common on Wikimedia Commons). CC BY and
CC BY-SA **require a credit**: the photographer, the license, and a link.

## If something goes wrong

GitHub runs the checks on every change. A red ✗ means something doesn't match.
For example: a recipe points to a photo that doesn't exist, a photo has no credit
line, or a drawing name is misspelled. The failed check says which recipe and
what's wrong, so fix that line and commit again.
