/* Source-checked quantity upgrades. Loaded after recipes.js.
 * Original RECIPES are preserved. See docs/SOURCE-CHECKS.md for evidence,
 * source ranges, unit choices, timing estimates and editorial changes.
 * Adapted from the linked Wikibooks Cookbook articles under CC BY-SA 4.0.
 */
(function (root) {
  'use strict';
  const originals = typeof RECIPES !== 'undefined' ? RECIPES : [];
  const upgrades = [];
  function add(originalName, servings, minutes, rows, steps, description, note, optional, extra) {
    const original = originals.find(r => r.name === originalName);
    if (!original) throw new Error('Missing original recipe: ' + originalName);
    upgrades.push({
      originalName, servings, minutes, description,
      ingredients: rows.map(row => row[0]),
      amounts: rows.map(([ingredient, amount, unit, preparation]) => ({ingredient, amount, unit, ...(preparation ? {note: preparation} : {})})),
      steps, optional: optional || [],
      quantitySource: 'source-checked',
      quantityNote: 'Amounts adapted from the linked source; ' + note,
      sourceCheckedAt: '2026-10-26',
      source: {...original.source},
      ...extra
    });
  }

  add('Chickpea Omelette', 1, 10,
    [['chickpea flour',1,'cup'],['baking powder',1,'tsp'],['turmeric',1,'tsp','ground'],['paprika',1,'tsp'],['soy milk',1,'cup'],['olive oil',1,'tbsp']],
    ['Whisk the chickpea flour, baking powder, turmeric, paprika and a pinch of salt in a bowl. Slowly mix in the soy milk until smooth.',
     'Warm the olive oil in a non-stick frying pan over medium heat. For extra servings, cook separate omelettes in batches.',
     'Pour in a portion of batter. Cook until the surface bubbles and the edges are set enough to lift, then carefully turn it over.',
     'Cook the second side until the centre is cooked through with no wet batter. Serve hot.'],
    'A golden, egg-free omelette made with chickpea flour and warming spices.',
    'source basis: 1 serving. Soy milk selected from the soy-milk-or-water choice. Cups are retained as printed. Allow about 10 minutes including mixing; batches take longer.');

  add('Creamed Spinach', 4, 15,
    [['spinach',500,'g','fresh whole leaves'],['cream',50,'ml']],
    ['Wash the spinach. Put it in a saucepan with 200 ml water and a little salt; cook gently for about 5 minutes until wilted.',
     'Drain thoroughly and let excess steam escape briefly.',
     'Return the spinach to the pan and stir in the cream. Simmer for a few minutes until hot, then season with pepper.'],
    'Tender spinach with a little cream: a simple, rich vegetable side.',
    'source variation I, 4 side servings. Half a decilitre of cream equals 50 ml; 2 dl water equals 200 ml. The cream option is used, with preparation time allowed.');

  add('Creamy Mushroom Pasta', 1, 25,
    [['pasta',75,'g','dry'],['butter',1,'tbsp'],['garlic',2,'clove','minced'],['mushroom',230,'g','button mushrooms, stems removed'],['wine',2,'tbsp','dry white'],['cream',60,'ml','heavy cream'],['chicken stock',60,'ml','low-sodium'],['parmesan',30,'g','grated']],
    ['Cook the pasta in salted water according to its packet, then drain.',
     'Melt the butter in a frying pan. Stir in the garlic briefly, add the mushrooms and cook for 3–5 minutes, turning occasionally.',
     'Add the wine and cook for about 3 minutes. Stir in the cream and chicken stock; simmer until the sauce thickens slightly.',
     'Stir in the parmesan until melted, then toss with the pasta. Season and add optional chopped parsley.'],
    'Mushrooms in a creamy garlic sauce, tossed with pasta and parmesan.',
    'source basis: 1 serving. Metric amounts printed in the source are used. Parsley remains an optional unmeasured garnish; about 5 minutes is allowed for preparation.', ['parsley'],
    {diet:[],allergens:['gluten','dairy'],sourceAttribution:'Wikibooks adaptation of a Foodista recipe by Sharon Chen (CC BY).'});

  add('Oven-Roasted Potatoes', 2, 40,
    [['potato',2,'whole','large'],['olive oil',2,'tbsp'],['thyme',0.5,'tsp']],
    ['Heat the oven to 230°C / 450°F. Wash the potatoes and cut them lengthways into wedges.',
     'Toss the wedges with the olive oil, thyme, salt and pepper. Spread them in a single layer on a baking tray.',
     'Roast for 15 minutes, turn the wedges and roast for about 15 minutes more, until golden and tender throughout.'],
    'Golden wedges with crisp edges and thyme, made from everyday potatoes.',
    'source basis: 2 servings; 10 minutes preparation plus 30 minutes baking. The source oven setting is 450°F, rounded to 230°C.');

  add('Rosemary Garlic Baked Potatoes', 4, 70,
    [['potato',4,'whole','baking potatoes'],['olive oil',4,'tbsp'],['garlic',2,'clove','chopped'],['rosemary',1,'tsp','dried and crushed']],
    ['Heat the oven to 205°C / 400°F. Scrub the potatoes, dry them and prick each with a fork.',
     'Place each potato on a piece of foil. Divide the olive oil, garlic and rosemary evenly over the skins, then season with salt and pepper.',
     'Wrap the potatoes, put them on a tray and bake for about 1 hour, until tender in the centre. Open the foil carefully and serve.'],
    'Whole baked potatoes scented with garlic and rosemary.',
    'source basis: 4 servings; 10 minutes preparation plus 60 minutes baking. Uses 2 cloves from the source range of 2–4. Seasoning is divided by potato count.');

  add('Spinach Mushroom Pesto Spaghetti', 4, 20,
    [['spaghetti',225,'g','dry'],['olive oil',2,'tbsp'],['spinach',140,'g'],['mushroom',200,'g','sliced'],['pesto',275,'g'],['parmesan',60,'g','grated']],
    ['Cook the spaghetti in boiling water according to its packet, then drain.',
     'Meanwhile, heat the olive oil in a pan. Add the spinach and cook until wilted, about 5 minutes.',
     'Add the mushrooms and cook for about 3 minutes, stirring. Stir in the pesto and parmesan and warm for another 2 minutes.',
     'Toss the spaghetti through the sauce and season to taste. Divide between serving plates.'],
    'Pesto-coated spaghetti with spinach, mushrooms and a parmesan finish.',
    'source basis: 4 servings. Uses all printed metric amounts; the extra cheese garnish is omitted. About 5 minutes is allowed for preparation.', [],
    {sourceAttribution:'Wikibooks adaptation credited there to the Tasty channel.'});

  add('Borscht', 6, 75,
    [['potato',1.5,'cup','thinly sliced'],['beetroot',1,'cup','thinly sliced'],['butter',1,'tbsp'],['onion',1.5,'cup','chopped'],['celery',1,'stalk','chopped'],['carrot',1,'whole','medium, chopped'],['cabbage',3,'cup','shredded'],['dill',1,'tsp'],['vinegar',1,'tbsp','cider vinegar'],['brown sugar',1,'tbsp'],['tomato paste',0.25,'cup']],
    ['Put the potatoes and beetroot in a saucepan with 4 cups water. Cover and cook over medium heat for 20–30 minutes until tender.',
     'Meanwhile, melt the butter in a soup pot. Cook the onion with a pinch of salt for 8–10 minutes. Add the celery, carrot and cabbage with 2 cups of the cooking water from the first pan; cover and cook for 8–10 minutes.',
     'Add the potatoes, beetroot and remaining cooking water. Stir in the dill, vinegar, brown sugar and tomato paste.',
     'Simmer for at least 15 minutes until all the vegetables are tender. Season and serve, with optional sour cream.'],
    'A hearty beetroot soup with cabbage, potatoes and a gentle sweet-sour balance.',
    'source basis: about 6 servings. Lower ends of its butter, cabbage, vinegar, sugar and paste ranges are selected. Brown sugar is chosen over honey; cups remain cups.', ['sour cream']);

  add('Aloo Masala', 4, 40,
    [['vegetable oil',1,'tbsp'],['mustard seed',0.5,'tsp'],['curry leaf',5,'leaf'],['onion',1,'whole','medium, thinly chopped'],['chili',4,'whole','green, split'],['potato',4,'whole','large, cubed'],['turmeric',1,'pinch','ground']],
    ['Boil the potato cubes in water until just tender, then drain. This preparation is included in the estimated total time.',
     'Heat the oil in a pan. Add the mustard seeds, followed by the curry leaves, onion and chilies. Cook until the onion starts to colour.',
     'Add the potatoes and turmeric, stirring to coat. Cover and cook over medium heat for about 5 minutes until very soft; stir occasionally.',
     'Season with salt. Lightly break up some of the potato and serve hot.'],
    'Soft potatoes with mustard seeds, curry leaves and green chili.',
    'source gives 4–6 servings and already parboiled potatoes; the app uses 4 servings and allows about 20 extra minutes for fresh-potato preparation. Uses 4 chilies from the 4–5 range; optional chana dhal is omitted.');

  add('Deviled Eggs', 6, 25,
    [['egg',6,'whole','large'],['mayonnaise',3,'tbsp'],['sugar',1,'tbsp'],['mustard',1,'tsp'],['vinegar',1,'tsp']],
    ['Hard-boil the eggs until the yolks and whites are firm, then cool in cold water and peel. Already cooked eggs shorten the preparation.',
     'Halve each egg lengthways. Scoop the yolks into a bowl, keeping the whites intact.',
     'Mash the yolks with the mayonnaise, sugar, mustard and vinegar. Season with salt and pepper.',
     'Spoon the mixture into the egg-white halves. Add optional paprika and refrigerate until serving.'],
    'Classic filled eggs with a creamy, tangy mustard centre.',
    'source basis: 6 servings, each with 2 egg halves. Its 5–10 minute assembly time plus 10–15 minutes for hard-boiling is allowed. All method counts follow the selected ingredient quantities.', ['paprika']);

  add('Carrot and Raisin Salad', 2, 30,
    [['carrot',250,'g','shredded'],['raisin',40,'g'],['lemon',1,'whole'],['orange',1,'whole']],
    ['Combine the shredded carrot and raisins in a bowl.',
     'Finely grate a little zest from the lemon and orange, avoiding the white pith. Add the zest and the juice of both fruits.',
     'Toss well, adding optional sugar to taste only if wanted. Refrigerate before serving.'],
    'Crunchy carrots and raisins in a bright citrus dressing.',
    'source basis: 2 servings. Uses its 250 g carrot and 40 g raisin weights. Unmeasured sweetener is optional; the sugar version is selected rather than honey.', ['sugar'],
    {diet:['vegetarian','vegan','gluten-free'],allergens:[]});

  add('Kachumbari', 4, 15,
    [['tomato',4,'whole','large and ripe, diced'],['onion',1,'whole','large red onion, thinly sliced'],['coriander',2,'tbsp','fresh, chopped'],['lemon',1,'whole','juice']],
    ['Put the diced tomatoes and sliced onion in a bowl. Add the coriander and lemon juice.',
     'If wanted, add optional diced cucumber or chopped chili. Toss gently and season with salt and pepper to taste.',
     'Leave for 5–10 minutes, then taste and serve fresh.'],
    'A crisp East African tomato and onion salad with lemon and coriander.',
    'source basis: 4 servings. Lemon selected from lemon-or-lime; cucumber and chili remain optional. Salt and pepper are adjusted to taste.', ['cucumber','chili']);

  add('Ensalada Rusa', 4, 60,
    [['potato',2,'whole','large, diced'],['pea',1,'cup','fresh'],['carrot',2,'whole','diced'],['mayonnaise',0.5,'cup','unsweetened']],
    ['Cook the potatoes, peas and carrots separately in water until tender but still holding their shape, then drain well.',
     'Spread the vegetables in shallow containers to cool promptly. Refrigerate until cold before adding the dressing.',
     'Gently fold through the mayonnaise and season with salt and pepper. Keep refrigerated until serving.'],
    'A simple, creamy potato salad with peas and carrots.',
    'source gives 3–4 servings; the app uses 4 and the lower ½-cup mayonnaise amount. Its 15-minute label excludes complete cooling; the displayed hour is an estimate including cooking and cooling.');

  add('Shortbread', 12, 80,
    [['flour',380,'g'],['butter',220,'g','softened'],['sugar',110,'g','white granulated']],
    ['Heat the oven to 140°C / 275°F. Beat the butter and sugar together until light.',
     'Work in the flour and a pinch of salt to form a dough. Roll to about 1.3 cm thick; chill for 10–15 minutes if too soft to handle.',
     'Cut into pieces and prick with a fork. Bake for 30–40 minutes until lightly golden.',
     'Move to a rack and cool before serving. Keep the same thickness when changing the batch size and use more trays if needed.'],
    'Crumbly butter shortbread with just three main ingredients.',
    'source basis: 12 servings. Uses its printed gram weights because its flour cup equivalent is inconsistent. Estimated total allows preparation, optional chilling, baking and cooling.');

  add('Anzac Biscuits', 25, 45,
    [['flour',2,'cup'],['sugar',1,'cup'],['oat',2,'cup','rolled'],['coconut',1,'cup','desiccated flakes'],['golden syrup',4,'tbsp'],['butter',225,'g'],['baking soda',1,'tsp']],
    ['Heat the oven to 150°C / 300°F. Mix the flour, sugar, oats and coconut in a bowl.',
     'Gently melt the butter with the golden syrup. Stir in the baking soda and 2 tablespoons water, then combine with the dry mixture.',
     'Roll into small balls and flatten on lined trays, leaving room to spread. Keep the biscuits the same size when increasing the batch.',
     'Bake for about 20 minutes until golden. Cool on the trays briefly, then transfer to a rack. Extra trays may need separate batches.'],
    'Chewy oat and coconut biscuits with golden syrup.',
    'source basis: 25 biscuits. Golden syrup and butter selected from the listed alternatives. Source cup measures retained; the 35-minute preparation/baking time gains a cooling allowance.');

  add('Flapjacks', 10, 90,
    [['brown sugar',110,'g','light brown'],['butter',175,'g'],['golden syrup',1,'dessert spoon'],['oat',175,'g','rolled']],
    ['Heat the oven to 150°C / 300°F. Line a 19 cm square tin for the base batch; use more tins at the same depth when scaling up.',
     'Gently melt the sugar, butter and golden syrup in a saucepan. Take off the heat and stir in the oats.',
     'Press evenly into the tin and bake for about 40 minutes.',
     'Cool in the tin for 10–15 minutes before marking into bars. Leave until cold before lifting out.'],
    'Rich, buttery oat bars with brown sugar and golden syrup.',
    'source basis: 10 bars. Its gram weights are retained; the syrup stays as 1 dessert spoon rather than an invented gram conversion. Estimated total includes full cooling after the 40-minute bake.');

  add('Bread Pudding', 12, 75,
    [['bread',6,'slice','slightly stale or fresh'],['butter',30,'g','melted'],['egg',4,'whole'],['sugar',150,'g'],['milk',475,'ml'],['cinnamon',1,'tsp','ground'],['vanilla extract',1,'tsp']],
    ['Heat the oven to 175°C / 350°F. Tear the bread into an ovenproof dish and pour the melted butter over it. Add optional raisins if wanted.',
     'Beat the eggs with the sugar, milk, cinnamon and vanilla. Pour over the bread and press gently so every piece absorbs liquid.',
     'Bake for about 45 minutes until the centre is set. When scaling, keep a similar pudding depth and use extra dishes as needed.',
     'Allow to cool before serving warm. Refrigerate any leftovers promptly.'],
    'A comforting baked bread-and-custard pudding with cinnamon and vanilla.',
    'source basis: 12 servings. Uses the printed metric amounts and teaspoon measures. Raisins remain optional; the total allows extra cooling after the source 60-minute preparation/bake.', ['raisin']);

  add('Chocolate Chocolate Chip Muffins', 12, 40,
    [['flour',250,'g'],['chocolate chip',80,'g'],['sugar',175,'g'],['cocoa',40,'g','sifted'],['baking powder',1,'tbsp'],['egg',1,'whole'],['milk',250,'ml'],['vegetable oil',80,'ml'],['vanilla extract',1,'tsp']],
    ['Heat the oven to 205°C / 400°F. Line muffin cups with paper cases; the base batch makes 12 muffins.',
     'Combine the flour, chocolate chips, sugar, cocoa, baking powder and a pinch of salt. In another bowl, beat the egg with the milk, oil and vanilla.',
     'Stir wet ingredients into dry just until combined. Fill each case about three-quarters full, keeping this fill level for every batch.',
     'Bake for about 20 minutes, until a skewer through the centre comes out without wet batter. Cool briefly before serving.'],
    'Double-chocolate muffins with a soft cocoa crumb.',
    'source basis: 12 muffins. Uses its printed metric quantities, including 80 g chocolate chips; its cup equivalent for chips is inconsistent. Time includes a short cooling allowance.');

  add('Garlic Shrimp Scampi Pasta', 4, 20,
    [['spaghetti',225,'g','dry'],['butter',3,'tbsp'],['garlic',3,'clove','minced'],['shrimp',450,'g','peeled and deveined'],['lemon',0.5,'whole','juice'],['chili',1,'tsp','dried red chili flakes'],['parsley',25,'g','chopped']],
    ['Cook the spaghetti in boiling water according to its packet, then drain.',
     'Meanwhile, melt the butter in a frying pan over medium heat and stir in the garlic.',
     'Add the shrimp and cook, turning occasionally, for about 6 minutes or until firm and opaque throughout.',
     'Stir in the lemon juice, chili and parsley. Toss with the pasta and season to taste.'],
    'Garlicky shrimp and spaghetti with lemon, parsley and chili.',
    'source basis: 4 servings. Uses the source metric amounts and ½-lemon juice. A short preparation allowance is included.', [],
    {sourceAttribution:'Wikibooks adaptation credited there to the Tasty channel.'});

  add('Leek, Parsley and Cheddar Mash', 6, 35,
    [['potato',600,'g','peeled and cut into chunks'],['olive oil',4,'tsp'],['leek',1,'whole','large, trimmed and sliced'],['cheddar',125,'g','grated'],['parsley',20,'g','chopped'],['butter',30,'g','diced']],
    ['Boil the potatoes for 15–20 minutes until tender.',
     'Meanwhile, warm the olive oil in a lidded pan. Cover and cook the leek over low-medium heat for about 10 minutes until soft.',
     'Drain the potatoes and let them steam-dry for 5 minutes. Mash with the leek, cheddar, butter and most of the parsley.',
     'Let stand for 5 minutes, then stir. If wanted, loosen with optional milk. Scatter with the remaining parsley and serve.'],
    'Soft potato mash enriched with sweet leeks, cheddar and parsley.',
    'source basis: 6 side servings. Its ingredient list gives 4 tsp oil but its method uses 3; this version uses all 4 for the leeks. Optional milk remains optional.', ['milk'],
    {sourceAttribution:'Wikibooks adaptation credited there to Tesco magazine, April 2023, page 28.'});

  add('Hominy Grits', 8, 30,
    [['hominy grits',1,'cup','dry grits, not canned whole hominy'],['butter',1,'tbsp']],
    ['Bring 5 cups water to the boil in a saucepan.',
     'Gradually stir in the dry hominy grits, then lower the heat and add the butter.',
     'Cook gently for about 20 minutes, stirring, until tender and the water is absorbed. Serve hot.'],
    'A warm bowl of creamy hominy grits, finished with butter.',
    'source basis: 8 side servings. Dry hominy grits are explicitly identified; cups are retained. Optional sweeteners and toppings from the source are omitted.');

  add('Cornbread', 8, 45,
    [['cornmeal',140,'g'],['flour',140,'g'],['baking powder',4,'tsp'],['milk',250,'ml'],['egg',1,'whole'],['shortening',60,'g','vegetable shortening, melted']],
    ['Heat the oven to 218°C / 425°F. Line a 20 cm baking pan for the base batch; keep a similar batter depth when using extra pans.',
     'Mix the cornmeal, flour, baking powder and a pinch of salt.',
     'Add the egg, milk and melted shortening. Beat briefly until fairly smooth, then transfer to the pan.',
     'Bake for 20–25 minutes until a skewer through the centre comes out clean. Allow to cool slightly before cutting.'],
    'A simple savoury cornbread to serve alongside soup or a warm bowl of beans.',
    'source basis: 8 servings. Printed metric quantities are used. Optional sugar, corn and onion are omitted; vegetable shortening is selected. A lined pan replaces unmeasured greasing fat.');

  add('Zacusca', 15, 180,
    [['aubergine',3000,'g'],['onion',500,'g','finely chopped'],['bell pepper',2000,'g','half red gogoșar or similar sweet red peppers, half other bell peppers'],['tomato paste',200,'g'],['sunflower oil',700,'ml'],['bay leaf',4,'whole','dried']],
    ['Roast the aubergines and peppers until the skins char and the flesh softens. Let them cool enough to handle, then peel and chop.',
     'Cook the onion in the sunflower oil over medium heat until golden. Add the peppers and cook for about 15 minutes, stirring.',
     'Add the aubergine, tomato paste and bay leaves. Season with salt and pepper to taste and simmer, stirring, until the spread thickens and oil rises to the surface. Remove the bay leaves.',
     'Serve as a freshly cooked spread. Divide leftovers into shallow containers and refrigerate promptly. This recipe is not a tested canning process: do not seal jars for storage at room temperature.'],
    'A rich Romanian aubergine and pepper spread for serving fresh or refrigerated.',
    'source basis: 15 servings. The two 1 kg pepper entries are combined with their varieties noted; uses 4 bay leaves from the 4–6 range. Shelf-storage instructions have been removed; this is a refrigerated preparation.', [],
    {safetySource:'https://nchfp.uga.edu/faqs/general-canning/category/faq-canning',safetyNote:'Refrigerated preparation only. A sealed or sterilized jar does not make an untested recipe suitable for room-temperature storage.'});

  root.RECIPE_ENHANCEMENTS = upgrades;
})(typeof window !== 'undefined' ? window : globalThis);
