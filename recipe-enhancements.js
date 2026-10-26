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

  // ---- Amounts only, from the source page (2026-10-26) ----
  // These recipes keep their own ingredients, steps, servings and time; only the
  // amounts are added. Used only when the source gives an amount for EVERY
  // ingredient. Ounces and pounds are converted to grams, and thirds of a cup to
  // millilitres (1 cup = 240 ml, as Wikibooks uses). Ranges use their lower end.
  function measure(originalName, rows, note) {
    const original = originals.find(r => r.name === originalName);
    if (!original) throw new Error('Missing original recipe: ' + originalName);
    upgrades.push({
      originalName,
      amounts: rows.map(([ingredient, amount, unit, preparation]) => ({ingredient, amount, unit, ...(preparation ? {note: preparation} : {})})),
      quantitySource: 'source-checked',
      quantityNote: 'Amounts adapted from the linked source; ' + note,
      sourceCheckedAt: '2026-10-26',
      source: {...original.source}
    });
  }

  measure('Christmas Cinnamon Cookies',
    [['almond flour',130,'g'],['butter',130,'g','softened'],['powdered sugar',130,'g'],['flour',300,'g'],['egg',2,'whole'],['vanilla extract',1,'tsp'],['cinnamon',2,'tsp','ground']],
    'source basis: makes 40 cookies (one per serving).');
  measure('Rendang (Indonesian Beef and Coconut Stew)',
    [['garlic',2,'clove'],['shallot',4,'whole'],['ginger',25,'g'],['turmeric',15,'g'],['galangal',75,'g','young'],['chili',1,'tbsp','ground fresh red chili'],['nutmeg',0.5,'whole','dried pod'],['candlenut',2,'whole'],['palm sugar',1,'tbsp'],['beef',1000,'g','big cubes'],['lemongrass',1,'stalk'],['coconut milk',2000,'ml']],
    'source basis: 10 servings.');
  measure('Chocolate Cheesecake',
    [['butter',5,'tbsp','melted'],['chocolate cookie',2,'cup','crumbs'],['cream cheese',705,'g','room temperature'],['brown sugar',1,'cup','packed'],['egg',5,'whole'],['chocolate',285,'g','semisweet, melted'],['sour cream',0.5,'cup']],
    'source basis: 10 servings. The source lists the chocolate twice (4 oz and 6 oz); they are combined. Its gram figures disagree with its ounces, so the ounces are used (10 oz = 285 g).');
  measure('Egg Noodles',
    [['egg',3,'whole'],['olive oil',1,'tbsp'],['wine',120,'ml'],['flour',3,'cup']],
    'source gives 12–16 servings; the app uses 12. The source prints "3 cups (700 g)" flour; 3 cups weigh far less than 700 g, so the cups are used.');
  measure('English Breakfast',
    [['bacon',4,'slice','rashers'],['egg',4,'whole'],['sausage',4,'whole','pork'],['tomato',4,'whole','halved'],['mushroom',400,'g','sliced'],['bread',4,'slice']],
    'source basis: 4 servings. Bread uses 4 slices from the 4–8 range; the optional baked beans stay unmeasured.');
  measure("Fresh Egg Pasta (Pasta Fresca All'uovo)",
    [['flour',300,'g'],['egg',3,'whole'],['olive oil',1,'tbsp']],
    'source basis: 3 servings.');
  measure('Irish Fruit Cake',
    [['flour',450,'g','cake flour'],['baking powder',0.5,'tsp'],['egg',3,'whole'],['sultana',115,'g'],['sugar',170,'g'],['butter',170,'g'],['citrus peel',55,'g'],['dried cherry',55,'g']],
    'source gives 6–8 servings; the app uses 6. Pounds and ounces are converted to grams.');
  measure('Tofu in Spiced Coconut Sauce',
    [['cardamom',6,'whole','pods'],['coriander seed',2,'tsp'],['cumin',0.5,'tsp','whole seeds'],['vegetable oil',4,'tbsp'],['garlic',1,'clove'],['onion',1,'whole','large'],['tofu',1,'whole','block, extra-firm or firm'],['currant',0.5,'cup'],['sour cream',0.5,'cup'],['yogurt',0.5,'cup'],['almond',0.25,'cup','slivered, toasted']],
    'source gives 6–8 servings; the app uses 6. Ranges use their lower end (cardamom, garlic, onion). Optional butter, coconut milk and toasted coconut stay unmeasured.');
  measure('Chapati',
    [['whole wheat flour',3,'cup']],
    'source basis: 8 servings. Optional ghee stays unmeasured.');
  measure('Meringue Cookies',
    [['egg',4,'whole','whites only'],['sugar',1,'cup'],['lemon',2,'tsp','juice']],
    'source gives 4–6 servings; the app uses 4. Optional vanilla stays unmeasured.');
  measure('Pralin',
    [['almond',0.5,'cup','slivered'],['sugar',0.5,'cup']],
    'source gives about 1 cup (250 g) of pralin; the app counts it as 1 serving.');
  measure('Tahdiq (Crisped Persian Rice)',
    [['potato',2,'whole','medium'],['basmati',2,'cup','uncooked'],['vegetable oil',80,'ml']],
    'source gives 4–6 servings; the app uses 4. ⅓ cup oil is shown as 80 ml.');
  measure('Turkey and Lima Beans',
    [['turkey',500,'g','minced'],['lima bean',1,'cup','dried'],['onion',1,'whole'],['celery',2,'stalk'],['sage',1,'tsp','dried'],['ground coriander',2,'tsp'],['cumin',1,'tsp','ground'],['chili',1,'tsp','flakes or powder'],['olive oil',2,'tbsp']],
    'source gives 2–4 servings; the app uses 2. Ranges use their lower end; sage uses the dried option (1–2 tsp).');
  measure('Pastry for Cornish Pasties',
    [['flour',450,'g'],['lard',113,'g'],['butter',113,'g']],
    'source basis: 1–2 batches of pastry; the app uses 1. The source gives 225 g of fat in equal parts; with lard and butter that is 113 g each.');
  measure('Rhubarb Fool',
    [['rhubarb',500,'g'],['sugar',100,'ml'],['potato starch',3,'tbsp']],
    'source basis: 4 servings. 1 dl sugar is shown as 100 ml; milk and cream for serving stay unmeasured.');
  measure('Snails with Garlic Butter (Escargots à la Bourguignonne)',
    [['snail',24,'whole','canned'],['butter',225,'g','softened'],['shallot',1,'tbsp','minced'],['garlic',1,'tsp','grated or minced'],['parsley',1.5,'tbsp','chopped']],
    'source basis: 4 servings. ½ lb butter is shown as 225 g.');
  measure('Soto Ayam (Indonesian Chicken Noodle Soup)',
    [['chicken',1000,'g','parts with bones'],['turmeric',5,'g'],['candlenut',2,'whole'],['ginger',15,'g'],['shallot',3,'whole'],['garlic',2,'clove'],['galangal',25,'g'],['lemongrass',0.5,'stalk'],['chicken stock',1800,'ml'],['cabbage',200,'g','thinly sliced'],['bean sprout',200,'g','blanched'],['potato',4,'whole'],['tomato',2,'whole'],['rice noodle',25,'g','vermicelli'],['egg',3,'whole','hard-boiled'],['spring onion',1,'stalk']],
    'source gives 6–8 servings; the app uses 6.');
  measure('Hamburger',
    [['beef',500,'g','minced'],['hamburger bun',4,'whole']],
    'source gives 4–6 servings and 1 bun per burger; the app uses 4 burgers.');
  measure('Mapo Tofu',
    [['onion',1,'whole','sliced'],['ginger',2,'tsp','minced'],['chili',1,'tsp','crushed dried'],['beef',200,'g','minced'],['garlic',4,'clove'],['tofu',500,'g','silken'],['chili bean paste',2,'tbsp'],['sichuan pepper',1,'tbsp','roasted and ground'],['soy sauce',1,'tbsp'],['rice wine',1,'tbsp'],['spring onion',3,'whole']],
    'source basis: 2 servings. Ranges use their lower end (chili, spring onion).');
  measure('Poppyseed Chicken',
    [['chicken',4,'whole','breast pieces, boiled and diced'],['mayonnaise',1,'cup'],['sour cream',1,'cup'],['cheddar',1,'cup','grated'],['cracker',2,'cup','crushed'],['poppy seed',3,'tbsp'],['butter',115,'g','1 stick, melted']],
    'source gives 4–6 servings; the app uses 4.');
  measure('Tapai Ketan (Indonesian Fermented Sticky Rice)',
    [['sticky rice',2,'cup'],['ragi',1,'whole','cake of ragi tapai']],
    'source gives 6–8 servings; the app uses 6. Optional pandan paste stays unmeasured.');
  measure('Gözleme (Turkish Flatbread)',
    [['flour',600,'g'],['yeast',2,'tsp','dry'],['sugar',1,'tsp'],['vegetable oil',0.5,'cup'],['butter',65,'g']],
    'source basis: 10 servings.');
  measure('Pohe (Spiced Flattened Rice)',
    [['pohe',200,'g','thick'],['vegetable oil',2,'tbsp'],['mustard seed',1,'tsp'],['turmeric',0.25,'tsp'],['asafoetida',1,'pinch'],['chili',2,'whole','green, finely chopped'],['onion',0.5,'whole','medium'],['coriander',2,'stalk','sprigs']],
    'source gives 1–2 servings; the app uses 1. 2 sprigs of coriander are shown as stalks.');
  measure('Socca (Chickpea Flatbread)',
    [['chickpea flour',300,'g'],['olive oil',2,'tbsp']],
    'source basis: 16 servings.');
  measure('Crab and Corn Salad',
    [['imitation crab',225,'g'],['spring onion',1,'whole'],['corn',450,'g','canned'],['mayonnaise',0.5,'cup']],
    'source basis: 4 servings. Ounces are converted to grams; spring onion uses 1 from the 1–2 range.');
  measure('Lemon Parmesan Salad Dressing',
    [['lemon',1.5,'whole','juiced'],['parmesan',1,'cup','freshly grated'],['garlic salt',2,'tsp'],['mayonnaise',0.75,'cup'],['milk',1,'cup']],
    'source basis: 12 servings.');
  measure('Ayran (Turkish Yogurt Drink)',
    [['yogurt',320,'ml','plain']],
    'source basis: 1 serving. 1⅓ cups yogurt is shown as 320 ml; optional mint stays unmeasured.');
  measure('Chanterelle Goulash',
    [['chanterelle',800,'g'],['onion',100,'g'],['butter',60,'g'],['sour cream',125,'g'],['paprika',10,'g'],['vinegar',3,'tbsp','white wine'],['flour',1,'tsp'],['parsley',1,'tbsp']],
    'source basis: 4 servings. Vinegar uses 3 tbsp from the 3–4 range.');
  measure('Creamy Tomato and Bean Soup',
    [['olive oil',1,'tbsp'],['onion',1,'whole','medium'],['white bean',425,'g','canned, with liquid'],['garlic',5,'clove'],['oregano',0.5,'tsp','dried'],['sage',2,'leaf','fresh'],['tomato',850,'g','canned'],['tomato paste',170,'g'],['chili',1,'pinch','crushed red pepper'],['cream cheese',225,'g'],['basil',10,'leaf','fresh']],
    'source basis: 8 servings. Ranges use their lower end (garlic, basil).');
  measure('Sausage-Egg Breakfast Dish',
    [['sausage',450,'g','sage-flavored'],['egg',6,'whole'],['milk',1.5,'cup'],['bread',4,'cup','cubed, stale'],['cheddar',115,'g','shredded']],
    'source gives 6–8 servings; the app uses 6. Ounces are converted to grams.');
  measure('California Curry Chicken',
    [['vegetable oil',4,'tbsp'],['onion',1,'cup','diced'],['garlic',2,'tsp','minced'],['chicken',450,'g','boneless, cubed'],['potato',6,'whole','small, cooked'],['curry powder',4,'tbsp','mild'],['chili',1,'tbsp','powder'],['paprika',1,'tbsp'],['cumin',1,'tsp','ground'],['cardamom',2,'tsp','powder'],['turmeric',1,'tsp'],['cinnamon',0.25,'tsp'],['coconut milk',1.5,'cup'],['yogurt',1,'cup'],['tomato',340,'g','canned, diced'],['butter',4,'tbsp'],['instant mashed potato',0.25,'cup','flakes']],
    'source basis: 4 servings. Pounds and ounces are converted to grams; instant mash uses ¼ cup from the ¼–½ range.');
  measure('Easy Onion Chicken',
    [['french-fried onion',1,'cup','canned'],['egg',1,'whole','beaten'],['chicken',4,'whole','boneless breasts']],
    'source basis: 4 servings. Fried onions use 1 cup from the 1–1½ range.');
  measure('Simple Biryani',
    [['basmati',300,'g'],['chicken',600,'g'],['onion',1,'whole','large'],['butter',30,'g'],['cardamom',3,'whole','pods'],['cinnamon',1,'whole','stick'],['turmeric',1,'tsp'],['curry paste',4,'tbsp'],['raisin',100,'g'],['chicken stock',850,'ml'],['coriander',2,'tbsp']],
    'source basis: 4 servings.');
  measure('Asian-Inspired Chicken Salad',
    [['broccoli',1.5,'cup','florets'],['snow pea',0.5,'cup'],['lettuce',6,'cup','torn mixed greens'],['cabbage',2,'cup','Napa, thinly sliced'],['carrot',0.5,'cup','julienned'],['chicken',170,'g','grilled breast strips'],['salad dressing',0.75,'cup']],
    'source basis: 4 servings. 6 oz chicken is shown as 170 g; optional mango and crackers stay unmeasured.');
  measure('Butternut, Biltong and Brown Rice Salad',
    [['brown rice',320,'ml','uncooked'],['butternut squash',1,'whole','small'],['olive oil',3,'tbsp'],['biltong',0.5,'cup','finely sliced'],['roasted seed',3,'tbsp'],['cucumber',1,'cup'],['parsley',2,'tbsp','chopped']],
    'source basis: 2 servings. 1⅓ cups rice is shown as 320 ml; optional feta stays unmeasured.');
  measure('Pachadi (Cucumber and Coconut)',
    [['cucumber',1,'whole','large'],['coconut',0.5,'cup','grated'],['cumin seed',1,'tsp'],['mustard seed',1,'tsp'],['chili',1,'whole','dried red'],['vegetable oil',1,'tbsp']],
    'source basis: 4 servings. Chili uses 1 from the 1–2 range.');
  measure('Chicken Bacon Broccoli Alfredo Spaghetti',
    [['spaghetti',225,'g'],['vegetable oil',1,'tbsp'],['chicken',400,'g','2 breasts'],['garlic',2,'clove'],['broccoli',200,'g','florets'],['milk',500,'ml'],['parmesan',125,'g','grated'],['parsley',25,'g','chopped'],['bacon',4,'slice','streaky']],
    'source basis: 4 servings.');
  measure('Apple Cobbler',
    [['apple',6,'cup','sliced and peeled'],['sugar',190,'ml'],['cornflour',1,'tbsp'],['flour',1,'cup'],['baking powder',1.5,'tsp'],['butter',0.25,'cup'],['egg',1,'whole'],['milk',0.25,'cup']],
    'source basis: 8 servings. The sugar is listed twice (⅔ cup and 2 tbsp); together that is 190 ml.');
  measure('Banoffee Pie',
    [['biscuit',250,'g','gingernut or digestive'],['butter',275,'g'],['condensed milk',400,'g'],['sugar',175,'g','caster'],['cream',150,'ml','double'],['banana',2,'whole']],
    'source gives 6–8 servings; the app uses 6. The source\'s gram amounts are used.');
  measure('Chocolate Chip Cookies',
    [['butter',225,'g','softened'],['sugar',0.75,'cup'],['brown sugar',0.75,'cup','packed'],['vanilla extract',0.25,'tsp'],['egg',2,'whole'],['flour',290,'g'],['baking soda',1,'tsp'],['chocolate chip',2,'cup','semi-sweet']],
    'source basis: 10 servings. The source\'s gram amounts are used where it gives them. Optional citrus peel and nuts stay unmeasured.');
  measure('Habichuela con Dulce',
    [['kidney bean',4,'cup','soft-boiled'],['raisin',0.5,'cup'],['evaporated milk',3,'cup'],['condensed milk',2,'cup'],['vanilla extract',1,'tsp'],['sugar',1,'cup'],['cinnamon',2,'whole','sticks'],['clove',10,'whole'],['sweet potato',1,'whole','cubed small']],
    'source gives 10+ servings; the app uses 10. Optional milk cookies stay unmeasured.');
  measure('Welsh Cakes',
    [['flour',450,'g','plain'],['butter',225,'g'],['sugar',170,'g','caster'],['egg',4,'whole'],['currant',85,'g']],
    'source basis: 24 cakes (one per serving). Optional milk stays unmeasured.');
  measure('Three Sisters Soup',
    [['hominy',2,'cup','drained canned'],['green bean',2,'cup','trimmed'],['butternut squash',2,'cup','cubed'],['potato',1.5,'cup','diced'],['chicken stock',1.5,'tbsp','bouillon granules'],['butter',2,'tbsp','melted'],['flour',2,'tbsp']],
    'source basis: 6 servings. The stock is bouillon granules dissolved in the soup\'s 5 cups of water.');
  measure('Penne alla Casa',
    [['olive oil',1,'tbsp'],['garlic',0.25,'cup','freshly chopped'],['cream',2,'cup','heavy'],['sun-dried tomato',0.25,'cup','julienned'],['marinara sauce',1.5,'cup'],['spinach',225,'g','fresh'],['pecorino',0.5,'cup','grated'],['penne',450,'g']],
    'source basis: 4 servings. Pounds are converted to grams.');
  measure('Spaghetti alla Carbonara',
    [['spaghetti',450,'g'],['pancetta',225,'g','or guanciale'],['egg',5,'whole','yolks only'],['pecorino',0.75,'cup','grated'],['parmesan',0.75,'cup','grated'],['olive oil',3,'tbsp','extra-virgin']],
    'source basis: 6 servings. Ranges use their lower end (pancetta 225–500 g, oil 3–4 tbsp).');
  measure('Baked Penne',
    [['penne',1,'cup','uncooked'],['ricotta',1,'cup'],['egg',4,'whole','separated'],['butter',0.25,'cup','melted'],['cream of tartar',0.125,'tsp'],['garlic',1,'tsp','minced'],['parsley',1,'tbsp','chopped'],['mozzarella',0.5,'cup','grated'],['tomato paste',1.5,'cup'],['basil',4,'leaf','fresh']],
    'source basis: 4 servings.');
  measure('Latino Scramble',
    [['egg',6,'whole'],['onion',1,'whole','large'],['tomato',1,'whole','large'],['ham',6,'slice'],['mozzarella',100,'g','grated'],['butter',1,'tbsp'],['ketchup',1,'tbsp'],['corn',425,'g','sweet corn']],
    'source basis: 6 servings. Optional hot sauce stays unmeasured.');
  measure('Cran-Apple Bran Muffins',
    [['wheat bran',0.75,'cup'],['milk',0.75,'cup'],['flour',1.5,'cup'],['baking powder',1.5,'tsp'],['cinnamon',1.5,'tsp'],['baking soda',0.25,'tsp'],['clove',0.125,'tsp','ground'],['brown sugar',0.75,'cup'],['vegetable oil',80,'ml'],['egg',1,'whole'],['apple',1.5,'cup','chopped and peeled'],['cranberry',0.5,'cup','dried']],
    'source basis: 8 muffins. Cups are used; the source\'s gram figures match cups of water, not of these ingredients.');
  measure('Roasted Spiced Chicken Drumsticks',
    [['paprika',1.5,'tsp'],['onion powder',1,'tsp'],['chili',0.5,'tsp','powder'],['olive oil',1,'tsp'],['chicken',6,'whole','drumsticks']],
    'source basis: 4 servings.');
  measure('Honey Apple Glazed Pork',
    [['flour',1.5,'tbsp'],['mustard',1,'tsp','ground'],['sage',0.5,'tsp','dried'],['pork',1500,'g','butt roast'],['apple sauce',1,'cup'],['cinnamon',0.25,'tsp','ground'],['honey',80,'ml'],['nutmeg',0.25,'tsp','ground']],
    'source basis: 6 servings. The source\'s 1.5 kg is used; ⅓ cup honey is shown as 80 ml.');
  measure('Hongshao Rou',
    [['pork',700,'g','belly, cubed'],['vegetable oil',3,'tbsp'],['sugar',2,'tbsp'],['chicken stock',350,'ml','or pork stock'],['ginger',1,'tbsp','minced'],['soy sauce',2,'tbsp','dark'],['rice wine',50,'ml','Shaoxing'],['star anise',3,'whole','pods'],['spring onion',4,'whole','small']],
    'source basis: 4 servings. Optional rice stays unmeasured.');
  measure('Garlic Pork Chops with Black Mushrooms',
    [['chicken stock',1,'cup','or pork broth'],['chanterelle',30,'g','dried black'],['vinegar',0.25,'cup','rice wine vinegar'],['soy sauce',2,'tbsp'],['honey',2,'tbsp'],['chili',0.25,'tsp','flakes'],['sesame oil',2,'tsp'],['garlic',4,'clove'],['ginger',1,'tbsp','minced'],['pork',4,'whole','boneless chops']],
    'source basis: 4 servings. 1 oz dried mushrooms is shown as 30 g.');
  measure('Puliyodarai',
    [['split pea',3,'tbsp'],['coriander seed',1,'tbsp'],['fenugreek seed',0.5,'tsp'],['chili',5,'whole','dried red'],['rice',4,'cup','cooked white'],['sesame oil',3,'tbsp'],['mustard seed',2,'tsp'],['peanut',2,'tbsp'],['asafoetida',0.5,'tsp'],['curry leaf',4,'leaf'],['tamarind',1.5,'tbsp','concentrate'],['turmeric',1,'tsp']],
    'source basis: 5 servings. Split peas (1 + 2 tbsp) and dried chilies (2 + 3) appear twice and are added together; ranges use their lower end.');
  measure('Tuscan Mushroom Risotto',
    [['butter',0.25,'cup'],['garlic',2,'clove'],['shallot',2,'tbsp','chopped'],['mushroom',1.5,'cup','½ cup dried porcini and 1 cup diced white mushrooms'],['arborio',1.5,'cup'],['wine',0.5,'cup','white'],['chicken stock',5,'cup','or vegetable stock'],['cream',0.25,'cup'],['parmesan',1,'cup'],['parsley',1,'tbsp','chopped']],
    'source basis: 4 servings. The two mushrooms (½ cup porcini, 1 cup white) are added together.');
  measure('Bulgur Burgers',
    [['garlic',2,'clove'],['bulgur',1.5,'cup'],['vegetable oil',2,'tbsp'],['spring onion',0.5,'cup','chopped'],['carrot',0.5,'cup','grated'],['parsley',0.25,'cup','chopped'],['tahini',0.25,'cup'],['tomato paste',2,'tbsp'],['soy sauce',2,'tbsp'],['mustard',1,'tsp','Dijon']],
    'source gives 6–8 burgers; the app uses 6.');
  measure('Baati',
    [['whole wheat flour',450,'g'],['vegetable oil',3,'tbsp']],
    'source gives 4–6 servings; the app uses 4. Optional ghee stays unmeasured.');
  measure('Taboon Bread',
    [['flour',2,'cup','all-purpose'],['whole wheat flour',1,'cup'],['yeast',1,'tsp','dried'],['olive oil',1,'tbsp']],
    'source basis: 10 breads.');
  measure('Dinuguan',
    [['pork',700,'g','boneless butt, cubed'],['lard',3,'tbsp','or peanut oil'],['vinegar',120,'ml'],['onion',1,'whole','medium'],['pork blood',360,'ml'],['garlic',3,'clove'],['chili',2,'whole','jalapeño']],
    'source basis: 10 servings.');
  measure('Frijoles Antioqueños',
    [['kidney bean',450,'g','dried red or Cargamanto'],['tomato',2,'whole'],['spring onion',1,'cup','chopped'],['vegetable oil',0.25,'cup'],['cumin',2,'tbsp'],['allspice',1,'tbsp'],['stock cube',1,'whole','chicken'],['plantain',1,'whole','large']],
    'source basis: 6 servings. 1 lb beans is shown as 450 g; optional meat stays unmeasured.');
  measure('Cauliflower Cheese',
    [['cauliflower',1,'whole','large head'],['white sauce',300,'ml'],['parmesan',100,'g'],['butter',30,'g'],['breadcrumb',1,'tbsp']],
    'source gives the whole dish as 1 serving; the app shares the same dish between 4.');
  measure('Angels on Horseback',
    [['wine',0.5,'cup','dry white'],['garlic',1,'clove','minced'],['oyster',12,'whole','shucked'],['bacon',6,'slice','lean']],
    'source gives 12 pieces; the app shares them between 4 servings.');
  measure('Peach Salsa',
    [['peach',850,'g','canned, drained'],['spring onion',2,'whole'],['lime',2,'tbsp','juice'],['coriander',2,'tsp','chopped'],['chili sauce',2,'tsp','garlic chili sauce'],['five spice',0.5,'tsp']],
    'source basis: 6 servings. 30 oz peaches is shown as 850 g.');
  measure("Fisherman's Casserole",
    [['macaroni',225,'g'],['cheddar',225,'g','grated'],['milk',160,'ml'],['mustard',0.5,'tsp','dry'],['onion',0.5,'cup','chopped'],['cream of celery soup',305,'g','canned'],['salmon',420,'g','canned'],['pea',225,'g','frozen'],['breadcrumb',1,'cup'],['butter',2,'tbsp','melted']],
    'source basis: 8 servings. Ounces and pounds are converted to grams; ⅔ cup milk is shown as 160 ml.');
  measure('Honey-Peppered Salmon',
    [['olive oil',0.25,'cup'],['honey',1,'tbsp'],['mustard',2,'tbsp','Dijon'],['garlic',3,'clove'],['cayenne',2,'tsp'],['ground coriander',0.5,'tsp'],['lemon',2,'tbsp','fresh juice'],['salmon',680,'g','4 fillets of 170 g']],
    'source basis: 4 servings.');
  measure('Zucchini Pie',
    [['flour',320,'ml'],['shortening',0.5,'cup'],['courgette',4,'cup','thinly sliced'],['onion',0.5,'cup','chopped'],['parsley',0.25,'cup'],['basil',0.5,'tsp'],['oregano',0.125,'tsp'],['egg',2,'whole','beaten'],['mozzarella',225,'g','shredded'],['butter',45,'g']],
    'source gives 6–8 servings; the app uses 6. 1⅓ cups flour is shown as 320 ml; ounces are converted to grams.');
  measure('Applesauce Cake',
    [['butter',125,'g'],['sugar',1,'cup'],['raisin',1.5,'cup'],['flour',1.75,'cup'],['clove',0.5,'tsp','ground'],['allspice',0.5,'tsp','ground'],['cinnamon',0.5,'tsp','ground'],['almond',0.5,'cup','ground'],['baking soda',1,'tsp'],['apple sauce',1,'cup','unsweetened']],
    'source basis: 16 servings.');
  measure('Faten Wake',
    [['black-eyed pea',2,'cup','dried'],['onion',1,'whole','medium'],['tomato',2,'whole'],['chili',1,'whole','Scotch bonnet'],['peanut oil',1,'tbsp']],
    'source gives 3–4 servings; the app uses 3. Ranges use their lower end; optional greens, stock cube and crayfish stay unmeasured.');
  measure('Hermits',
    [['flour',275,'g'],['raisin',160,'ml'],['brown sugar',160,'ml','dark, packed'],['ginger',2.5,'tsp','ground'],['cinnamon',2,'tsp','ground'],['clove',1,'tsp','ground'],['baking powder',1,'tsp'],['treacle',0.5,'cup','molasses'],['butter',6,'tbsp','melted'],['vanilla extract',2,'tsp'],['egg',1,'whole']],
    'source basis: 8 servings. ⅔ cup is shown as 160 ml.');

  root.RECIPE_ENHANCEMENTS = upgrades;
})(typeof window !== 'undefined' ? window : globalThis);
