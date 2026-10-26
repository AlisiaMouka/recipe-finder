// Original Recipe Finder kitchen collection, 2026.
// Recipe text is shared under CC BY-SA 4.0; see README for attribution.
// Prices are rough estimates for the WHOLE recipe, not current quotations.
// Quantities are practical starting points, not a claim of kitchen testing.
// Canned foods use drained weights. Rice, pasta and grains use dry weights
// unless a quantity note explicitly says otherwise. Salt, pepper and water
// are pantry basics and are described in the steps where needed.
(function (root) {
  'use strict';
  const source = {
    name: 'Recipe Finder kitchen collection',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  };
  const recipes = [];
  // Compact authoring helper: [ingredient, amount, unit, optional preparation note].
  function add(id, name, cuisine, illustration, minutes, servings, price, category, description, diet, allergens, rows, steps, tip) {
    recipes.push({ id, name, cuisine, illustration, minutes, servings, price, category,
      description, difficulty: 'Easy', diet, allergens,
      ingredients: rows.map(row => row[0]),
      amounts: rows.map(([ingredient, amount, unit, note]) => ({ingredient, amount, unit, ...(note ? {note} : {})})),
      steps, tip, source: {...source} });
  }
  const V = ['vegetarian'];
  const VG = ['vegetarian', 'vegan'];
  const GF = ['vegetarian', 'gluten-free'];
  const VGF = ['vegetarian', 'vegan', 'gluten-free'];

  add('burst-tomato-basil-pasta', 'Burst tomato & basil pasta', 'Italian-inspired', 'pasta', 25, 2, 4.5, 'dinner',
    'Sweet tomatoes, silky olive oil and a tangle of pasta. A small-ingredient dinner with a big summer feeling.', VG, ['gluten'],
    [['pasta',180,'g'],['tomato',350,'g','cherry tomatoes, halved'],['garlic',2,'clove','thinly sliced'],['olive oil',2,'tbsp'],['basil',10,'g','leaves torn']],
    ['Bring a large pot of salted water to the boil. Cook the pasta according to its packet; reserve 150 ml of the cooking water before draining.',
     'Meanwhile, warm the olive oil in a wide pan over medium heat. Add the garlic and cook for 30 seconds without browning.',
     'Add the tomatoes and a pinch of salt. Cook for 10–12 minutes, stirring and pressing a few tomatoes to release their juices.',
     'Add the drained pasta and 60 ml of the reserved water. Toss over the heat for a minute, adding a little more water if needed. Fold in the basil and season with pepper.'],
    'The starchy pasta water brings the sauce together. Add it gradually so the sauce clings to the pasta.');

  add('lemon-chickpea-couscous', 'Lemon chickpea couscous', 'Mediterranean-inspired', 'salad', 15, 2, 4, 'lunch',
    'Fluffy couscous, crisp cucumber and chickpeas in a bright lemon dressing. Equally good warm or at room temperature.', VG, ['gluten'],
    [['couscous',150,'g'],['chickpea',240,'g','canned, drained and rinsed'],['cucumber',0.5,'whole','diced'],['lemon',1,'whole'],['olive oil',2,'tbsp'],['parsley',15,'g','chopped']],
    ['Put the couscous in a heatproof bowl with a pinch of salt. Pour over 180 ml boiling water, cover and leave for 5 minutes, or follow the water ratio on the packet.',
     'Zest the lemon, then squeeze its juice. Whisk the olive oil with the zest and 2 tablespoons of the juice.',
     'Fluff the couscous with a fork. Fold in the chickpeas, cucumber and parsley.',
     'Toss with the dressing. Taste and add salt, pepper and more lemon juice if wanted.'],
    'Keep the dressing separate if packing ahead, then toss just before eating.');

  add('green-goddess-rice-bowl', 'Green goddess rice bowl', 'Contemporary', 'rice-bowl', 30, 2, 5, 'lunch',
    'A green-on-green bowl of rice, peas and broccoli with a creamy avocado and lemon dressing.', VGF, [],
    [['rice',140,'g'],['broccoli',250,'g','small florets'],['pea',150,'g','frozen'],['avocado',1,'whole'],['lemon',1,'whole'],['olive oil',1,'tbsp'],['parsley',15,'g']],
    ['Rinse the rice and cook it according to the packet. Keep it covered while preparing the vegetables.',
     'Steam the broccoli for 5–7 minutes until just tender. Add the peas for the final 3 minutes and make sure they are piping hot.',
     'Blend or mash the avocado with the olive oil, parsley, 2 tablespoons lemon juice and 3 tablespoons water. Season and thin with more water if needed.',
     'Divide the rice and vegetables between bowls. Spoon over the dressing and serve with the remaining lemon cut into wedges.'],
    'Make the avocado dressing just before serving to keep its colour fresh.');

  add('crispy-chickpea-wraps', 'Crispy chickpea wraps', 'Mediterranean-inspired', 'taco', 25, 2, 4.5, 'lunch',
    'Smoky pan-crisped chickpeas, crunchy salad and a lemony tahini drizzle, all tucked into warm wraps.', VG, ['gluten','sesame'],
    [['chickpea',240,'g','canned, drained and patted dry'],['tortilla',2,'whole','large wheat wraps'],['lettuce',60,'g','shredded'],['tomato',1,'whole','diced'],['tahini',2,'tbsp'],['lemon',0.5,'whole'],['paprika',1,'tsp'],['olive oil',1,'tbsp']],
    ['Heat the olive oil in a frying pan. Add the dry chickpeas and cook over medium heat for 8–10 minutes, stirring often, until lightly golden.',
     'Stir in the paprika and a pinch of salt. Cook for 30 seconds, then take off the heat.',
     'Whisk the tahini with 1 tablespoon lemon juice and 2–3 tablespoons water until pourable. Warm the tortillas in a dry pan.',
     'Fill the wraps with lettuce, tomato and chickpeas. Drizzle with the tahini sauce, fold in the ends and roll up.'],
    'Drying the chickpeas first makes the biggest difference to their crispness.');

  add('spinach-feta-eggs', 'Spinach & feta skillet eggs', 'Greek-inspired', 'egg', 25, 2, 4, 'breakfast',
    'Soft spinach and salty feta meet eggs in a simple one-pan breakfast.', GF, ['egg','dairy'],
    [['egg',4,'whole'],['spinach',150,'g'],['feta',60,'g','crumbled'],['onion',0.5,'whole','finely chopped'],['olive oil',1,'tbsp']],
    ['Warm the olive oil in a lidded frying pan over medium heat. Cook the onion for 5 minutes until softened.',
     'Add the spinach a handful at a time and stir for 2–3 minutes until wilted. Let any excess water evaporate.',
     'Make one little well for each egg and crack the eggs into the wells. Sprinkle the feta around the eggs, cover and cook on low heat for 6–9 minutes.',
     'Check that the whites and yolks are firm before serving. Season with pepper; taste before adding salt because feta is already salty.'],
    'Use a pan with a lid to cook the tops of the eggs gently without scorching the spinach.');

  add('red-lentil-coconut-curry', 'Red lentil coconut curry', 'Indian-inspired', 'curry', 40, 4, 6, 'dinner',
    'A cosy pot of creamy lentils, coconut and spinach. Built for a low-effort weeknight.', VGF, [],
    [['red lentil',250,'g','rinsed'],['coconut milk',400,'ml'],['tomato',400,'g','canned chopped tomatoes'],['spinach',150,'g'],['onion',1,'whole','chopped'],['garlic',2,'clove','minced'],['curry powder',2,'tsp'],['olive oil',1,'tbsp']],
    ['Heat the olive oil in a large saucepan. Cook the onion for 5 minutes, then stir in the garlic and curry powder for 30 seconds.',
     'Add the lentils, coconut milk, tomatoes and 350 ml water. Bring to a gentle simmer.',
     'Cook uncovered for 20–25 minutes, stirring often, until the lentils are tender. Add a splash of water if it gets too thick.',
     'Fold in the spinach and cook for 2 minutes until wilted. Season with salt and pepper and ladle into bowls.'],
    'Red lentils thicken as they cool. Loosen leftovers with a little water when reheating.');

  add('lemon-pea-orzo', 'One-pot lemon & pea orzo', 'Italian-inspired', 'pasta', 25, 2, 4, 'dinner',
    'A creamy-feeling bowl made in one pan, finished with lemon and sweet peas.', VG, ['gluten'],
    [['orzo',180,'g'],['pea',150,'g','frozen'],['onion',0.5,'whole','finely chopped'],['garlic',1,'clove','minced'],['lemon',1,'whole'],['olive oil',2,'tbsp']],
    ['Warm the olive oil in a saucepan. Cook the onion for 5 minutes, then add the garlic and cook for 30 seconds.',
     'Stir in the orzo and 500 ml hot water with a pinch of salt. Simmer gently, stirring often, for 8 minutes.',
     'Add the peas and simmer for another 4–5 minutes, until the orzo is tender and the peas are piping hot. Add a splash more water if necessary.',
     'Take off the heat. Stir in the lemon zest and 1 tablespoon juice. Season and let it stand for 2 minutes before serving.'],
    'Stir frequently so the orzo does not stick to the bottom of the pan.');

  add('roasted-sweet-potato-black-bean-bowls', 'Sweet potato & black bean bowls', 'Mexican-inspired', 'rice-bowl', 40, 2, 5.5, 'dinner',
    'Roasted sweet potato, warm black beans and creamy avocado with a lively squeeze of lime.', VGF, [],
    [['sweet potato',400,'g','cut into 2 cm cubes'],['black bean',240,'g','canned, drained'],['avocado',1,'whole','sliced'],['lime',1,'whole'],['cumin',1,'tsp'],['paprika',1,'tsp'],['olive oil',1.5,'tbsp'],['coriander',10,'g','chopped']],
    ['Heat the oven to 210°C. Toss the sweet potato with the olive oil, cumin, paprika and a pinch of salt on a baking tray.',
     'Roast for 25–30 minutes, turning halfway, until browned and tender.',
     'Warm the black beans in a saucepan with 3 tablespoons water for 5 minutes until piping hot. Season and squeeze in half the lime.',
     'Divide the sweet potato and beans between bowls. Add the avocado, coriander and remaining lime wedges.'],
    'Give the sweet potato room on the tray so it roasts instead of steaming.');

  add('tomato-white-bean-toast', 'Tomato & white bean toast', 'Mediterranean-inspired', 'toast', 15, 2, 3.5, 'lunch',
    'Saucy white beans and tomatoes piled over toast, finished with a little basil.', VG, ['gluten'],
    [['white bean',240,'g','canned, drained'],['tomato',250,'g','chopped'],['bread',4,'slice'],['garlic',1,'clove','minced'],['olive oil',1,'tbsp'],['basil',5,'g','torn']],
    ['Heat the olive oil in a small pan. Cook the garlic for 30 seconds over medium heat.',
     'Add the tomato and a pinch of salt. Cook for 5 minutes until juicy and softened.',
     'Stir in the white beans and 2 tablespoons water. Simmer for 4–5 minutes until hot, lightly crushing a few beans to thicken the sauce.',
     'Toast the bread. Spoon the beans over it, add the basil and season with pepper.'],
    'Serve immediately so the toast keeps some crunch under the saucy beans.');

  add('creamy-mushroom-polenta', 'Creamy mushroom polenta', 'Italian-inspired', 'rice-bowl', 25, 2, 4.5, 'dinner',
    'Golden mushrooms over soft polenta. A comforting dinner with very little washing up.', VGF, [],
    [['polenta',120,'g','quick-cooking'],['mushroom',300,'g','sliced'],['garlic',2,'clove','minced'],['olive oil',2,'tbsp'],['parsley',10,'g','chopped'],['lemon',0.5,'whole']],
    ['Bring 600 ml water and a pinch of salt to a simmer in a saucepan. Whisk in the polenta slowly.',
     'Cook over low heat according to the packet, stirring often, until soft. Add a little hot water if it becomes too thick.',
     'Meanwhile, heat the olive oil in a wide frying pan. Cook the mushrooms for 8–10 minutes until golden. Add the garlic for the final minute.',
     'Season the mushrooms, add a squeeze of lemon and the parsley. Spoon the polenta into bowls and pile the mushrooms on top.'],
    'Use quick-cooking polenta for the stated time; traditional polenta takes substantially longer.');

  add('roasted-cauliflower-chickpea-tray', 'Roasted cauliflower & chickpeas', 'Middle Eastern-inspired', 'baked-dish', 40, 2, 4.5, 'dinner',
    'A crisp-edged tray of cauliflower and chickpeas with a tangy tahini dressing.', VGF, ['sesame'],
    [['cauliflower',500,'g','small florets'],['chickpea',240,'g','canned, drained and dried'],['olive oil',2,'tbsp'],['cumin',1,'tsp'],['tahini',2,'tbsp'],['lemon',1,'whole'],['parsley',10,'g','chopped']],
    ['Heat the oven to 210°C. Toss the cauliflower and chickpeas with the olive oil, cumin and a pinch of salt on a large tray.',
     'Roast for 25–30 minutes, turning halfway, until the cauliflower is tender and browned at the edges.',
     'Whisk the tahini with 2 tablespoons lemon juice and 3 tablespoons water. Add more water a teaspoon at a time until it drizzles easily.',
     'Spoon the dressing over the warm vegetables. Scatter with parsley and serve with the remaining lemon cut into wedges.'],
    'Use two trays if necessary; crowded vegetables will not brown as well.');

  add('broccoli-cheddar-baked-potatoes', 'Broccoli & cheddar jacket potatoes', 'British-inspired', 'baked-dish', 70, 2, 4, 'dinner',
    'Crisp potato skins with a warm broccoli and cheddar filling. Familiar, simple and satisfying.', GF, ['dairy'],
    [['potato',2,'whole','large baking potatoes, about 250 g each'],['broccoli',200,'g','small florets'],['cheddar',70,'g','grated'],['yogurt',3,'tbsp','plain'],['olive oil',1,'tsp']],
    ['Heat the oven to 220°C. Scrub and dry the potatoes, prick them with a fork and rub with olive oil and a little salt.',
     'Bake directly on an oven shelf, with a tray underneath, for 50–60 minutes until a knife slides easily into the centre.',
     'Near the end of cooking, steam the broccoli for 5–7 minutes until tender. Roughly chop it and mix with the yogurt and half the cheddar.',
     'Split the potatoes and fluff the insides with a fork. Fill with the broccoli mixture, scatter with the remaining cheddar and return to the oven for 3 minutes to melt.'],
    'Potato size changes the baking time; check tenderness in the centre before filling.');

  add('peanut-lime-noodles', 'Peanut & lime noodles', 'Southeast Asian-inspired', 'noodles', 20, 2, 4.5, 'dinner',
    'Slippery rice noodles, crunchy vegetables and a creamy peanut dressing with a lime kick.', VG, ['peanut','soy','gluten'],
    [['rice noodle',150,'g'],['peanut butter',3,'tbsp','smooth'],['soy sauce',1.5,'tbsp'],['lime',1,'whole'],['carrot',1,'whole','cut into thin matchsticks'],['cucumber',0.5,'whole','cut into thin matchsticks'],['coriander',10,'g','chopped']],
    ['Cook or soak the rice noodles according to the packet. Drain and rinse briefly with cool water to stop them sticking.',
     'Whisk the peanut butter, soy sauce and 2 tablespoons lime juice with 3 tablespoons warm water. Add more water if needed for a silky dressing.',
     'Toss the noodles with the carrot, cucumber and dressing until well coated.',
     'Divide between bowls and finish with coriander and the remaining lime wedges.'],
    'Standard soy sauce may contain wheat, so this recipe is deliberately not labelled gluten-free.');

  add('crispy-tofu-broccoli-rice', 'Crispy tofu & broccoli rice', 'East Asian-inspired', 'rice-bowl', 35, 2, 5.5, 'dinner',
    'Golden tofu, tender broccoli and a glossy ginger-soy sauce over rice.', VG, ['soy','gluten','sesame'],
    [['tofu',300,'g','firm, drained and patted dry'],['broccoli',250,'g','small florets'],['rice',140,'g'],['soy sauce',2,'tbsp'],['ginger',15,'g','grated'],['cornstarch',1,'tbsp'],['vegetable oil',2,'tbsp'],['sesame seed',1,'tsp']],
    ['Cook the rice according to its packet. Cut the tofu into 2 cm cubes and toss with the cornstarch.',
     'Heat the oil in a wide non-stick pan. Cook the tofu for 10–12 minutes, turning occasionally, until golden on several sides. Transfer to a plate.',
     'Add the broccoli and 60 ml water to the same pan. Cover and steam for 4 minutes, then uncover. Stir in the ginger, soy sauce and 2 tablespoons water.',
     'Return the tofu and toss for 1–2 minutes until everything is hot and coated. Serve over rice with the sesame seeds.'],
    'Pat the tofu dry well before coating it; excess moisture stops the crust forming.');

  add('one-pot-tomato-rice-beans', 'One-pot tomato rice & beans', 'Latin American-inspired', 'rice-bowl', 35, 4, 5.5, 'dinner',
    'A colourful pot of tomato rice and kidney beans with sweet pepper and cumin.', VGF, [],
    [['rice',250,'g'],['kidney bean',240,'g','canned, drained and rinsed'],['tomato',400,'g','canned chopped tomatoes'],['bell pepper',1,'whole','diced'],['onion',1,'whole','chopped'],['garlic',2,'clove','minced'],['cumin',1,'tsp'],['olive oil',1,'tbsp']],
    ['Heat the olive oil in a large saucepan with a lid. Cook the onion and pepper for 6 minutes until softened; stir in the garlic and cumin.',
     'Add the rice, tomatoes, kidney beans and 400 ml water. Season with a pinch of salt and bring to a gentle boil.',
     'Cover, reduce to low heat and cook for 18–20 minutes until the rice is tender. Check once near the end and add a splash of hot water if dry.',
     'Take off the heat and leave covered for 5 minutes. Fluff gently, check that the beans are piping hot, and season to taste.'],
    'Use canned, already cooked kidney beans here. Dried beans need a separate preparation and cooking process.');

  add('lemon-white-bean-soup', 'Lemon & white bean soup', 'Mediterranean-inspired', 'soup', 30, 4, 5, 'dinner',
    'A bright, hearty soup made creamy by mashing some of the beans, with no cream needed.', VGF, [],
    [['white bean',480,'g','canned, drained'],['carrot',2,'whole','diced'],['onion',1,'whole','chopped'],['garlic',2,'clove','minced'],['spinach',120,'g'],['lemon',1,'whole'],['olive oil',2,'tbsp']],
    ['Warm the olive oil in a saucepan. Cook the onion and carrots for 7–8 minutes until starting to soften. Add the garlic for 30 seconds.',
     'Add the beans, 800 ml water and a pinch of salt. Bring to a simmer and cook for 12 minutes until the carrots are tender.',
     'Mash a few spoonfuls of beans against the side of the pan to thicken the soup. Stir in the spinach until wilted.',
     'Add the lemon zest and 2 tablespoons juice. Taste and adjust with salt, pepper or more lemon juice.'],
    'For a thicker soup, blend one mugful and stir it back into the pan.');

  add('carrot-ginger-lentil-soup', 'Carrot, ginger & lentil soup', 'Contemporary', 'soup', 40, 4, 4.5, 'dinner',
    'Sweet carrots and warming ginger make a smooth, velvety soup with red lentils for body.', VGF, [],
    [['carrot',500,'g','thinly sliced'],['red lentil',150,'g','rinsed'],['onion',1,'whole','chopped'],['ginger',20,'g','grated'],['coconut milk',200,'ml'],['olive oil',1,'tbsp']],
    ['Heat the olive oil in a saucepan. Cook the onion for 5 minutes, then stir in the ginger for 30 seconds.',
     'Add the carrots, lentils and 800 ml water. Bring to the boil, then simmer for 20–25 minutes until the carrots and lentils are soft.',
     'Add the coconut milk. Blend with a stick blender until smooth, taking care with the hot liquid.',
     'Return to a gentle simmer, adding water if needed. Season with salt and pepper and serve hot.'],
    'If using a jug blender, cool the soup slightly and follow its instructions for hot liquids; never seal steaming soup in a closed blender.');

  add('tomato-mozzarella-flatbreads', 'Tomato & mozzarella flatbreads', 'Italian-inspired', 'baked-dish', 25, 2, 5, 'lunch',
    'Crisp flatbreads with juicy tomatoes, melted mozzarella and fresh basil.', V, ['gluten','dairy'],
    [['pitta bread',2,'whole','large'],['tomato',200,'g','thinly sliced'],['mozzarella',125,'g','drained and torn'],['tomato paste',2,'tbsp'],['olive oil',1,'tsp'],['basil',5,'g','torn']],
    ['Heat the oven to 220°C with a baking tray inside. Mix the tomato paste with the olive oil and 1 tablespoon water.',
     'Spread the tomato mixture over the pittas. Add the sliced tomatoes and mozzarella, leaving a small border.',
     'Carefully transfer to the hot tray and bake for 10–12 minutes until the edges are crisp and the cheese has melted.',
     'Finish with basil and black pepper. Rest for 2 minutes before cutting.'],
    'Drain the mozzarella thoroughly to keep the bases crisp.');

  add('courgette-pea-frittata', 'Courgette & pea frittata', 'Italian-inspired', 'egg', 30, 2, 4, 'lunch',
    'A tender, vegetable-packed frittata that makes a lovely lunch or simple supper.', GF, ['egg','dairy'],
    [['egg',4,'whole'],['courgette',1,'whole','about 250 g each, thinly sliced'],['pea',100,'g','frozen'],['feta',50,'g','crumbled'],['olive oil',1,'tbsp']],
    ['Warm the olive oil in a small non-stick frying pan with a lid. Cook the courgette over medium heat for 8–10 minutes until softened and lightly golden.',
     'Add the peas and 2 tablespoons water. Cover and cook for 3 minutes until the peas are hot, then let any excess water evaporate.',
     'Beat the eggs with pepper and a small pinch of salt. Pour into the pan and scatter with feta.',
     'Cover and cook over low heat for 10–12 minutes until the eggs are fully set in the centre. Slide onto a plate and cut into wedges.'],
    'Keep the heat low once the eggs go in so the bottom cooks gently while the centre sets.');

  add('harissa-style-chickpea-skillet', 'Smoky tomato & chickpea skillet', 'North African-inspired', 'curry', 25, 2, 4, 'dinner',
    'A bubbling pan of chickpeas and peppers in a smoky tomato sauce.', VGF, [],
    [['chickpea',240,'g','canned, drained'],['tomato',400,'g','canned chopped tomatoes'],['bell pepper',1,'whole','thinly sliced'],['onion',1,'whole','thinly sliced'],['garlic',2,'clove','minced'],['paprika',1.5,'tsp'],['cumin',0.5,'tsp'],['olive oil',1,'tbsp']],
    ['Heat the olive oil in a wide pan. Cook the onion and pepper for 7–8 minutes until soft.',
     'Add the garlic, paprika and cumin. Stir for 30 seconds, then add the tomatoes and chickpeas.',
     'Simmer uncovered for 12–15 minutes, stirring occasionally, until the sauce thickens and the chickpeas are piping hot.',
     'Season with salt and pepper and serve in shallow bowls.'],
    'Smoked paprika gives a deeper flavour, while sweet paprika makes a gentler version.');

  add('tuna-lemon-white-bean-salad', 'Tuna, lemon & white bean salad', 'Mediterranean-inspired', 'salad', 10, 2, 5.5, 'lunch',
    'A no-cook lunch with flaky tuna, creamy beans and a fresh lemon-parsley dressing.', ['gluten-free'], ['fish'],
    [['tuna',160,'g','canned, drained'],['white bean',240,'g','canned, drained and rinsed'],['cucumber',0.5,'whole','diced'],['onion',0.25,'whole','very finely sliced'],['lemon',1,'whole'],['olive oil',1.5,'tbsp'],['parsley',10,'g','chopped']],
    ['Put the white beans, cucumber and sliced onion in a mixing bowl.',
     'Whisk the olive oil with 2 tablespoons lemon juice and a little black pepper.',
     'Flake the tuna into the bowl and fold everything together gently with the dressing and parsley.',
     'Taste before adding salt, and serve with extra lemon wedges.'],
    'If raw onion tastes too strong, rinse the slices in cold water and drain before adding.');

  add('sardine-tomato-pasta', 'Sardine & tomato pasta', 'Portuguese-inspired', 'pasta', 25, 2, 4.5, 'dinner',
    'A pantry pasta with tomato sauce, flaked sardines and a bright parsley finish.', [], ['fish','gluten'],
    [['pasta',180,'g'],['sardine',120,'g','canned in oil, drained'],['tomato',400,'g','canned chopped tomatoes'],['garlic',2,'clove','sliced'],['olive oil',1,'tbsp'],['parsley',10,'g','chopped'],['lemon',0.5,'whole']],
    ['Cook the pasta in salted water according to its packet. Reserve a mug of cooking water, then drain.',
     'Meanwhile, warm the olive oil in a pan. Add the garlic for 30 seconds, then the tomatoes. Simmer for 12 minutes until thickened.',
     'Break the sardines into large flakes and fold them into the sauce. Heat for 2–3 minutes until hot throughout.',
     'Toss in the pasta, parsley and a squeeze of lemon. Add a little reserved cooking water to loosen the sauce and season with pepper.'],
    'Fold the sardines in gently near the end so some generous flakes stay intact.');

  add('avocado-chickpea-sandwich', 'Avocado & chickpea sandwich', 'Contemporary', 'toast', 10, 2, 4.5, 'lunch',
    'A creamy, crunchy sandwich filling made with smashed chickpeas, avocado and lemon.', VG, ['gluten'],
    [['chickpea',240,'g','canned, drained'],['avocado',1,'whole'],['lemon',0.5,'whole'],['bread',4,'slice'],['cucumber',0.25,'whole','thinly sliced'],['lettuce',30,'g']],
    ['Mash the chickpeas roughly in a bowl with a fork, leaving some texture.',
     'Add the avocado flesh and 1 tablespoon lemon juice. Mash together, then season with salt and pepper.',
     'Toast the bread if desired. Spread the filling over half the bread slices.',
     'Add the cucumber and lettuce, close with the remaining bread and cut in half.'],
    'This filling is best made just before serving; the lemon helps slow browning.');

  add('crunchy-apple-chickpea-salad', 'Crunchy apple & chickpea salad', 'Contemporary', 'salad', 15, 2, 4, 'lunch',
    'Sweet apple, crisp cucumber and chickpeas in a light yogurt dressing.', GF, ['dairy'],
    [['chickpea',240,'g','canned, drained'],['apple',1,'whole','cored and diced'],['cucumber',0.5,'whole','diced'],['yogurt',100,'g','plain'],['lemon',0.5,'whole'],['parsley',10,'g','chopped']],
    ['Whisk the yogurt with 1 tablespoon lemon juice, a pinch of salt and some black pepper.',
     'Add the chickpeas, diced apple and cucumber to a bowl.',
     'Fold in the dressing and parsley until everything is evenly coated.',
     'Taste and add a little more lemon juice if you prefer a sharper dressing.'],
    'Keep the apple in chunky pieces for a satisfying crunch.');

  add('hummus-roasted-pepper-pittas', 'Hummus & roasted pepper pittas', 'Mediterranean-inspired', 'taco', 30, 2, 4.5, 'lunch',
    'Warm pockets of bread filled with sweet peppers, hummus and crisp cucumber.', VG, ['gluten','sesame'],
    [['pitta bread',2,'whole','large'],['bell pepper',2,'whole','sliced'],['hummus',120,'g','with tahini'],['cucumber',0.5,'whole','sliced'],['olive oil',1,'tbsp'],['lemon',0.5,'whole']],
    ['Heat the oven to 220°C. Toss the pepper slices with the olive oil and a pinch of salt on a tray.',
     'Roast for 20–25 minutes until tender and browned at the edges.',
     'Warm the pittas in the oven for the final 2 minutes. Carefully open each into a pocket.',
     'Spread the hummus inside, fill with peppers and cucumber, and finish with a squeeze of lemon.'],
    'Let the pittas cool slightly before opening them; trapped steam can be hot.');

  add('banana-oat-pancakes', 'Banana & oat pancakes', 'Contemporary', 'pancakes', 25, 2, 2.5, 'breakfast',
    'Small, tender pancakes with ripe banana sweetness and a short ingredient list.', V, ['egg'],
    [['banana',2,'whole','ripe'],['oat',100,'g'],['egg',2,'whole'],['cinnamon',0.5,'tsp'],['vegetable oil',1,'tsp']],
    ['Blend the oats into a coarse flour. Add the bananas, eggs, cinnamon and 2 tablespoons water; blend to a thick batter.',
     'Leave the batter to stand for 3 minutes. Warm a non-stick pan over medium-low heat and brush with a little oil.',
     'Add small spoonfuls of batter, about 2 tablespoons each. Cook for 2–3 minutes until the edges look set, then turn carefully.',
     'Cook the second side for 2 minutes, until the pancakes are cooked through. Repeat with the remaining batter.'],
    'Keep them small; banana pancakes are delicate and easier to turn at about 8 cm across. Oats need certified gluten-free labelling for gluten avoidance.');

  add('apple-cinnamon-porridge', 'Apple & cinnamon porridge', 'British-inspired', 'yogurt-bowl', 15, 2, 2, 'breakfast',
    'Creamy oats with soft apple and cinnamon for a calm start to the morning.', V, ['dairy'],
    [['oat',100,'g'],['milk',400,'ml'],['apple',1,'whole','cored and diced'],['cinnamon',0.5,'tsp'],['maple syrup',1,'tbsp']],
    ['Put the oats, milk, diced apple and cinnamon in a saucepan with 100 ml water and a tiny pinch of salt.',
     'Bring to a gentle simmer, then cook over low heat for 8–10 minutes, stirring often.',
     'When the apple is tender and the oats are creamy, add a splash more water if needed for your preferred texture.',
     'Spoon into bowls and drizzle with the maple syrup.'],
    'Smaller apple pieces soften faster, so dice them quite finely.');

  add('strawberry-yogurt-breakfast-bowl', 'Strawberry yogurt breakfast bowl', 'Contemporary', 'yogurt-bowl', 10, 2, 3.5, 'breakfast',
    'Cool yogurt, fresh strawberries and toasted oats with a little honey.', V, ['dairy'],
    [['yogurt',350,'g','plain'],['strawberry',200,'g','hulled and sliced'],['oat',50,'g'],['honey',2,'tsp']],
    ['Toast the oats in a dry frying pan over medium-low heat for 3–4 minutes, stirring until lightly golden. Spread on a plate to cool.',
     'Divide the yogurt between serving bowls.',
     'Add the sliced strawberries and cooled toasted oats.',
     'Drizzle with honey and serve straight away.'],
    'Cool the oats before adding them to keep the yogurt pleasantly chilled.');

  add('mushroom-spinach-breakfast-toast', 'Mushroom & spinach breakfast toast', 'Contemporary', 'toast', 20, 2, 3.5, 'breakfast',
    'Golden mushrooms and tender spinach on crisp toast with a little lemon.', VG, ['gluten'],
    [['bread',4,'slice'],['mushroom',250,'g','sliced'],['spinach',100,'g'],['garlic',1,'clove','minced'],['olive oil',1.5,'tbsp'],['lemon',0.5,'whole']],
    ['Heat the olive oil in a wide frying pan. Add the mushrooms and cook over medium-high heat for 7–9 minutes until golden.',
     'Stir in the garlic for 30 seconds, then add the spinach and cook until wilted.',
     'Toast the bread while the spinach cooks. Season the vegetables with salt, pepper and a squeeze of lemon.',
     'Pile the mushrooms and spinach onto the toast and serve immediately.'],
    'Let the mushrooms sit undisturbed for a minute or two between stirs to help them brown.');

  add('tomato-scrambled-egg-toast', 'Tomato scrambled egg toast', 'Contemporary', 'toast', 15, 2, 3, 'breakfast',
    'Soft scrambled eggs with juicy tomato and basil on warm toast.', V, ['gluten','egg'],
    [['egg',4,'whole'],['tomato',2,'whole','diced'],['bread',4,'slice'],['olive oil',1,'tbsp'],['basil',5,'g','torn']],
    ['Warm the olive oil in a non-stick frying pan. Add the tomatoes and a pinch of salt; cook for 4–5 minutes until softened.',
     'Beat the eggs with black pepper. Reduce the heat, pour them into the pan and stir gently with a spatula.',
     'Cook until the eggs are fully set with no liquid egg remaining, then fold in the basil.',
     'Toast the bread and spoon the eggs over it. Serve immediately.'],
    'Lower heat gives you more control over the texture of the eggs.');

  add('peanut-banana-smoothie', 'Peanut butter & banana smoothie', 'Contemporary', 'smoothie', 5, 2, 2.5, 'breakfast',
    'A thick, creamy breakfast smoothie with banana, oats and peanut butter.', V, ['dairy','peanut'],
    [['banana',2,'whole','ripe'],['milk',400,'ml'],['peanut butter',2,'tbsp'],['oat',30,'g'],['cinnamon',0.25,'tsp']],
    ['Peel the bananas and break them into pieces.',
     'Put the bananas, milk, peanut butter, oats and cinnamon in a blender.',
     'Blend until smooth, pausing to scrape down the jug if needed.',
     'Add a little water if you prefer it thinner, then divide between serving glasses and serve.'],
    'Use a chilled banana for a cooler smoothie without diluting it with ice.');

  add('cucumber-feta-breakfast-plate', 'Cucumber, feta & hummus plate', 'Mediterranean-inspired', 'salad', 10, 2, 4.5, 'breakfast',
    'A savoury breakfast plate with crisp vegetables, creamy hummus and warm pitta.', V, ['gluten','dairy','sesame'],
    [['cucumber',1,'whole','sliced'],['tomato',2,'whole','cut into wedges'],['feta',80,'g'],['hummus',100,'g','with tahini'],['pitta bread',2,'whole'],['olive oil',1,'tsp']],
    ['Warm the pittas in a toaster or dry frying pan, then cut them into wedges.',
     'Arrange the cucumber and tomato on serving plates.',
     'Add the feta and spoonfuls of hummus. Drizzle the tomatoes with the olive oil and season with pepper.',
     'Serve with the warm pitta wedges for scooping.'],
    'Taste the feta and hummus before salting the vegetables; they may provide all the seasoning you need.');

  add('quick-lemon-hummus', 'Quick lemon hummus', 'Middle Eastern-inspired', 'salad', 10, 4, 2.5, 'snack',
    'Smooth, lemony hummus made from a tin of chickpeas and a few pantry ingredients.', VGF, ['sesame'],
    [['chickpea',240,'g','canned, drained and rinsed'],['tahini',2,'tbsp'],['lemon',1,'whole'],['garlic',1,'clove','small'],['olive oil',1,'tbsp'],['cumin',0.25,'tsp']],
    ['Put the chickpeas, tahini, garlic, olive oil and cumin in a food processor.',
     'Add 2 tablespoons lemon juice, 3 tablespoons cold water and a pinch of salt.',
     'Blend for 2–3 minutes, scraping down the sides. Add more water a tablespoon at a time until smooth.',
     'Taste and adjust the lemon and salt. Spoon into a bowl and serve.'],
    'Extra blending time makes it smoother. Pause if your processor starts to get warm.');

  add('smoky-roasted-chickpeas', 'Smoky roasted chickpeas', 'Contemporary', 'baked-dish', 40, 4, 2, 'snack',
    'Crunchy, smoky chickpeas for snacking or scattering over a salad.', VGF, [],
    [['chickpea',240,'g','canned, drained and very well dried'],['olive oil',1,'tbsp'],['paprika',1,'tsp'],['cumin',0.5,'tsp']],
    ['Heat the oven to 200°C. Pat the chickpeas thoroughly dry with a clean towel; remove any loose skins.',
     'Toss the chickpeas with the olive oil and spread in a single layer on a baking tray.',
     'Roast for 25–30 minutes, shaking the tray halfway, until golden and dry on the outside.',
     'Toss with the paprika, cumin and a pinch of salt. Let them cool for 5 minutes before eating.'],
    'They are crispest on the day they are made; let them cool uncovered so steam can escape.');

  add('apple-peanut-butter-rounds', 'Apple & peanut butter crunch', 'Contemporary', 'toast', 10, 2, 2, 'snack',
    'Crisp apple wedges with peanut butter and a scattering of toasted oats.', VG, ['peanut'],
    [['apple',2,'whole'],['peanut butter',2,'tbsp'],['oat',20,'g'],['cinnamon',0.25,'tsp']],
    ['Toast the oats in a dry pan over medium-low heat for 3 minutes, stirring. Let them cool.',
     'Core the apples and cut each into thick wedges.',
     'Spread the cut sides with the peanut butter.',
     'Sprinkle with the oats and cinnamon, then serve straight away.'],
    'A spoonful of yogurt alongside is a serving idea, but it changes the dairy-free and vegan suitability.');

  add('lemon-yogurt-berry-cups', 'Lemon yogurt & berry cups', 'Contemporary', 'yogurt-bowl', 10, 2, 3.5, 'dessert',
    'A fresh, creamy little dessert with lemon zest, honey and berries.', GF, ['dairy'],
    [['yogurt',300,'g','thick plain yogurt'],['strawberry',150,'g','hulled and chopped'],['blueberry',100,'g'],['lemon',0.5,'whole'],['honey',1,'tbsp']],
    ['Wash the lemon and finely grate a little of its zest, avoiding the white pith.',
     'Stir the yogurt with the honey and lemon zest.',
     'Layer the yogurt and berries in small serving bowls or glasses.',
     'Finish with the remaining berries and serve.'],
    'Use only the coloured part of the lemon skin for fragrant zest without bitterness.');

  add('warm-cinnamon-apples', 'Warm cinnamon apples', 'Contemporary', 'baked-dish', 20, 2, 2, 'dessert',
    'Tender apple slices with cinnamon and a glossy maple coating.', VGF, [],
    [['apple',2,'whole','cored and sliced'],['maple syrup',1,'tbsp'],['cinnamon',0.5,'tsp'],['lemon',0.5,'whole']],
    ['Put the apple slices in a small frying pan with 3 tablespoons water, the cinnamon and 1 teaspoon lemon juice.',
     'Cover and cook over medium-low heat for 6–8 minutes, stirring once, until the apples begin to soften.',
     'Uncover, add the maple syrup and cook for another 3–5 minutes until the apples are tender and the liquid is syrupy.',
     'Serve warm, dividing the apples and their syrup between serving bowls.'],
    'Firm eating apples keep their shape; softer varieties will become more like a compote.');

  add('chocolate-banana-mug-cake', 'Chocolate banana mug cake', 'Contemporary', 'cake', 10, 1, 1.5, 'dessert',
    'A small chocolate cake made with ripe banana and cooked in the microwave.', VG, ['gluten'],
    [['banana',0.5,'whole','ripe'],['flour',3,'tbsp'],['cocoa powder',1,'tbsp'],['sugar',1,'tbsp'],['baking powder',0.25,'tsp'],['vegetable oil',1,'tsp']],
    ['Mash the banana in a mixing bowl. Stir in the oil and 2 tablespoons water.',
     'Add the flour, cocoa, sugar and baking powder. Mix thoroughly, scraping the bottom of the bowl so no dry flour remains.',
     'Set out one microwave-safe mug per serving, each with at least 350 ml capacity. Divide the batter evenly between the mugs; do not cook a multiplied batch in one mug.',
     'Microwave each mug separately at 800 W for 75 seconds, then in 15-second bursts until the centre is set with no wet batter. Keep these timings per mug when making more servings. Microwave power varies; do not eat uncooked flour batter.',
     'Let each mug stand for 2 minutes before eating. Handle carefully because both the mug and cake will be hot.'],
    'A wide mug helps the cake cook evenly. Stop once the centre is cooked so it stays soft. More servings take extra time because each mug cooks separately.');

  add('berry-oat-crumble', 'Small-batch berry oat crumble', 'British-inspired', 'baked-dish', 45, 4, 4, 'dessert',
    'Juicy berries under a crisp oat topping, made in one small baking dish.', V, ['gluten','dairy'],
    [['strawberry',250,'g','hulled and halved'],['blueberry',200,'g'],['oat',70,'g'],['flour',50,'g'],['butter',50,'g','cold, cubed'],['sugar',50,'g']],
    ['Heat the oven to 190°C. Put the berries in a small baking dish and toss with 15 g of the sugar.',
     'Rub the butter into the flour with your fingertips until it looks like coarse crumbs.',
     'Stir the oats and remaining sugar into the crumbs. Scatter evenly over the berries without pressing down.',
     'Bake for 25–30 minutes until the topping is golden and the fruit bubbles at the edges. Rest for 5 minutes before serving.'],
    'Place the dish on a baking tray to catch any fruit juices that bubble over.');

  add('lemon-courgette-white-bean-pan', 'Lemon courgette & white bean pan', 'Mediterranean-inspired', 'pan', 25, 2, 4, 'dinner',
    'Golden courgette and creamy white beans in a bright, herby one-pan dinner.', VGF, [],
    [['courgette',2,'whole','about 250 g each, sliced'],['white bean',240,'g','canned, drained'],['garlic',2,'clove','sliced'],['lemon',1,'whole'],['olive oil',2,'tbsp'],['basil',10,'g','torn']],
    ['Heat the olive oil in a wide frying pan. Add the courgette and cook for 8–10 minutes, turning occasionally, until golden and tender.',
     'Add the garlic and stir for 30 seconds. Add the white beans and 80 ml water.',
     'Simmer for 5 minutes until the beans are hot. Crush a few against the side of the pan to make a light sauce.',
     'Stir in the lemon zest, 1 tablespoon lemon juice and basil. Season with salt and pepper, then serve.'],
    'If your pan is small, brown the courgette in two batches for better colour.');

  root.EXTRA_RECIPES = recipes;
})(typeof window !== 'undefined' ? window : globalThis);
