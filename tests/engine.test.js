'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const E = require('../engine.js');
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','recipes.js'),'utf8')+';globalThis.legacy=RECIPES;',context);
const catalog=E.buildCatalog(context.legacy,[]);
function recipe(name,ingredients,extra={}) {
  return E.buildCatalog([{name,ingredients,minutes:20,servings:2,price:4,diet:[],allergens:[],steps:['Cook.'],...extra}],[])[0];
}
function names(rows) { return rows.map(r=>r.recipe.name); }

test('natural pantry amounts and irregular plurals normalize without harming food names',()=>{
  for(const [input,want] of Object.entries({'2 eggs':'egg','200g tomatoes':'tomato','1.5 kg potatoes':'potato','1/2 cup rice':'rice','2 cloves of garlic':'garlic','bay leaves':'bay leaf','3 fresh carrots':'carrot','Zucchinis':'courgette','garbanzo beans':'chickpea','couscous':'couscous','asparagus':'asparagus','hummus':'hummus','chillies':'chili','strawberries':'strawberry','oats':'oat'})) assert.equal(E.normalizeIngredient(input),want,input);
});
test('list parsing preserves multi-word food names and deduplicates aliases',()=>{
  assert.deepEqual(E.parseIngredients('2 eggs, olive oil\n200g tomatoes; zucchini and courgette'),['egg','olive oil','tomato','courgette']);
});
test('pasted pantry sentences become individual canonical ingredient chips',()=>{
  assert.deepEqual(E.parseIngredients('eggs, tomatoes\nspinach'),['egg','tomato','spinach']);
  assert.deepEqual(E.parseIngredients('I have 2 eggs, 200g tomatoes and a little spinach'),['egg','tomato','spinach']);
  assert.deepEqual(E.parseIngredients('I have: 2 eggs; spinach'),['egg','spinach']);
  assert.deepEqual(E.parseIngredients('We have got tomatoes and spring onions'),['tomato','spring onion']);
});
test('fractional quantities and irregular ingredient plurals work in pasted lists',()=>{
  assert.deepEqual(E.parseIngredients('½ cup rice; 2 cloves of garlic; bay leaves; chillies'),['rice','garlic','bay leaf','chili']);
});
test('pasted compounds remain intact while aliases are deduplicated',()=>{
  assert.deepEqual(E.parseIngredients('peanut butter; spring onion; extra virgin olive oil'),['peanut butter','spring onion','olive oil']);
  assert.deepEqual(E.parseIngredients('zucchini+courgettes'),['courgette']);
});
test('quantity-only fragments vanish and unknown foods remain uncorrected for confirmation',()=>{
  assert.deepEqual(E.parseIngredients('200g'),[]);
  assert.deepEqual(E.parseIngredients('200 g; ½ cup; 2; 1 tbsp'),[]);
  assert.deepEqual(E.parseIngredients('I have brocoli, dragon fruit and mystery spice'),['brocoli','dragon fruit','mystery spice']);
});
test('article-based pantry quantities strip before their units',()=>{
  assert.deepEqual(E.parseIngredients('a can of chickpeas; a handful of spinach'),['chickpea','spinach']);
  assert.deepEqual(E.parseIngredients('I have a can of chickpeas and an egg'),['chickpea','egg']);
  assert.deepEqual(E.parseIngredients('a large can of tomatoes; 2 large cans of chickpeas'),['tomato','chickpea']);
  assert.deepEqual(E.parseIngredients('a little cooked rice; a handful of frozen spinach'),['cooked rice','frozen spinach']);
  assert.deepEqual(E.parseIngredients('a can; a handful; 200g'),[]);
});
test('known ingredient validation accepts explicit forms without erasing them or accepting typos',()=>{
  for(const input of ['cooked rice','dry chickpea','frozen spinach','raw chicken','uncooked rice']) assert.equal(E.isKnownIngredient(input,catalog),true,input);
  assert.equal(E.normalizeIngredient('cooked rice'),'cooked rice');
  assert.equal(E.normalizeIngredient('frozen spinach'),'frozen spinach');
  for(const input of ['brocoli','nonsense','cooked brocoli','frozen mystery food','200g']) assert.equal(E.isKnownIngredient(input,catalog),false,input);
});
test('canonical family matching is directional',()=>{
  assert.equal(E.covers('parmesan','cheese'),true);
  assert.equal(E.covers('cheese','parmesan'),false);
  assert.equal(E.covers('beef broth','stock'),true);
  assert.equal(E.covers('red lentils','lentil'),true);
});
test('family and compound exclusions cover cream cheese, stocks and nut flour',()=>{
  assert.equal(E.isExcluded('cream cheese','cheese'),true);
  assert.equal(E.isExcluded('beef stock','meat'),true);
  assert.equal(E.isExcluded('beef stock','stock'),true);
  assert.equal(E.isExcluded('almond flour','almond'),true);
  assert.equal(E.isExcluded('almond flour','nuts'),true);
  assert.equal(E.isExcluded('champignon','ham'),false);
});
test('typo suggestions are useful but do not silently change pantry content',()=>{
  assert.ok(E.suggestions('brocoli',catalog).includes('broccoli'));
  assert.equal(E.normalizeIngredient('brocoli'),'brocoli');
  assert.ok(!E.suggestions('egg',catalog,['egg']).includes('egg'));
});
test('dairy exclusions understand plant alternatives and unrelated culinary names',()=>{
  for(const ingredient of ['coconut milk','soy milk','peanut butter','almond butter','cream of tartar','oat milk','vegan butter','cocoa butter','apple butter','nut butter']) assert.equal(E.isExcluded(ingredient,'dairy'),false,ingredient);
  for(const ingredient of ['milk','cream','butter','cream cheese','whipping cream','condensed milk']) assert.equal(E.isExcluded(ingredient,'dairy'),true,ingredient);
  const a=recipe('Plant curry',['coconut milk','peanut butter'],{diet:['vegan']});
  assert.equal(E.search([a],{exclude:['dairy']}).length,1);
});
test('multiword ingredient aliases normalize before text search tokenization',()=>{
  const a=recipe('Weeknight bowl',['spring onion','chicken','tomato','lemon','rice']);
  for(const query of ['green onion','green onions','chicken breast','canned tomatoes','lemon juice','green onion rice']) assert.equal(E.search([a],{query}).length,1,query);
});
test('pita and pitta bread share the same pantry and recipe identity',()=>{
  for(const name of ['pita','pita bread','pitta','pitta bread','pitta breads']) assert.equal(E.normalizeIngredient(name),'pita',name);
  const a=recipe('Pitta pockets',['pitta bread']);
  assert.equal(E.search([a],{pantry:['pita']})[0].missing.length,0);
  assert.equal(E.search([a],{query:'pita bread'}).length,1);
});
test('assumed pantry basics alone leave the complete catalog browsable',()=>{
  assert.equal(E.search(catalog,{pantry:['salt']}).length,catalog.length);
  assert.equal(E.search(catalog,{pantry:['water','pepper']}).length,catalog.length);
  assert.deepEqual(names(E.search(catalog,{pantry:['salt','egg']})),names(E.search(catalog,{pantry:['egg']})));
});
test('no pantry means browse everything, stable ids, and no fake matches',()=>{
  const found=E.search(catalog,{});
  assert.equal(found.length,150);
  assert.equal(new Set(catalog.map(r=>r.id)).size,150);
  assert.ok(found.every(r=>r.match===0&&r.have.length===0));
});
test('fewest missing ranks first and recipes using no selected food stay out',()=>{
  const one=recipe('One',['egg','flour']), two=recipe('Two',['egg']), none=recipe('None',['rice']);
  const found=E.search([one,two,none],{pantry:['2 eggs']});
  assert.deepEqual(names(found),['Two','One']);
  assert.equal(found[0].match,100);
  assert.equal(found[1].match,50);
  assert.deepEqual(found[1].missing,['flour']);
});
test('use-most and cheapest sort use useful ingredient counts and per-serving prices',()=>{
  const a=recipe('A',['egg'],{price:10,servings:10}),b=recipe('B',['egg','flour'],{price:3,servings:1});
  assert.deepEqual(names(E.search([a,b],{pantry:['egg','flour'],sort:'use-most'})),['B','A']);
  assert.deepEqual(names(E.search([a,b],{sort:'cheapest'})),['A','B']);
});
test('all strict filters compose, including zero missing and saved recipes',()=>{
  const a=recipe('Lunch',['egg'],{category:'lunch',cuisine:'French',minutes:10,diet:['vegetarian']});
  const b=recipe('Dinner',['egg','milk'],{category:'dinner',cuisine:'French',minutes:30,diet:['vegetarian']});
  const options={pantry:['egg'],category:'lunch',cuisine:'French',maxTime:15,maxMissing:0,diets:['vegetarian'],savedOnly:true,saved:[a.id]};
  assert.deepEqual(names(E.search([a,b],options)),['Lunch']);
  assert.equal(E.search([a,b],{...options,allergens:['egg']}).length,0);
  assert.equal(E.search([a,b],{...options,exclude:['egg']}).length,0);
  assert.equal(E.search([a,b],{...options,saved:[]}).length,0);
});
test('query matches recipe, cuisine and ingredients, including typos and aliases',()=>{
  const a=recipe('Roasted green bowl',['broccoli','courgette'],{cuisine:'Mediterranean'});
  assert.equal(E.search([a],{query:'brocoli'}).length,1);
  assert.equal(E.search([a],{query:'zucchini bowl'}).length,1);
  assert.equal(E.search([a],{query:'Mediterranean'}).length,1);
  assert.equal(E.search([a],{query:'tomato'}).length,0);
});
test('known ingredient queries do not fuzzily match different foods or word interiors',()=>{
  const pasta=recipe('Pasta',['pasta']),paste=recipe('Flatbread',['tomato paste']),ham=recipe('Ham toast',['ham']),champignon=recipe('Champignon soup',['mushroom']);
  assert.deepEqual(names(E.search([pasta,paste],{query:'pasta'})),['Pasta']);
  assert.deepEqual(names(E.search([ham,champignon],{query:'ham'})),['Ham toast']);
});
test('text search cannot override an exclusion or allergy filter',()=>{
  const a=recipe('Cream cheese toast',['cream cheese','bread']);
  assert.equal(E.search([a],{query:'toast',exclude:['cheese']}).length,0);
  assert.equal(E.search([a],{query:'toast',allergens:['dairy']}).length,0);
});
test('optional dairy removes vegan and dairy-free claims and is excluded by filters',()=>{
  const a=recipe('Fruit fool',['rhubarb'],{optional:['cream'],diet:['vegan','gluten-free']});
  assert.ok(a.allergens.includes('dairy'));
  assert.ok(!a.diet.includes('vegan'));
  assert.ok(!a.diet.includes('dairy-free'));
  assert.equal(E.search([a],{diets:['vegan']}).length,0);
  assert.equal(E.search([a],{exclude:['dairy']}).length,0);
  assert.deepEqual(E.search([a],{pantry:['rhubarb']})[0].missing,[]);
});
test('inferred allergens correct misleading ingredient-level diet claims',()=>{
  const a=recipe('Mislabelled',['chicken stock','soy sauce','tahini'],{diet:['vegan','vegetarian','gluten-free']});
  assert.ok(!a.diet.includes('vegan')&&!a.diet.includes('vegetarian')&&!a.diet.includes('gluten-free'));
  assert.ok(['gluten','soy','sesame'].every(a1=>a.allergens.includes(a1)));
});
test('coconut milk and peanut butter do not acquire a dairy allergen',()=>{
  const a=recipe('Plant bowl',['coconut milk','peanut butter'],{diet:['vegan']});
  assert.ok(!a.allergens.includes('dairy'));
  assert.ok(a.allergens.includes('peanut'));
  assert.ok(a.diet.includes('vegan'));
});
test('legacy quantities stay unknown and cannot advertise scaling',()=>{
  assert.ok(catalog.every(r=>!r.hasQuantities));
  const amounts=E.servingAmounts(catalog[0],20);
  assert.ok(amounts.every(a=>a.amount===null));
});
test('quantified recipe servings scale precisely',()=>{
  const a=recipe('Lentil soup',['lentil','onion'],{amounts:[{ingredient:'lentil',amount:150,unit:'g'},{ingredient:'onion',amount:1,unit:''}],servings:2});
  assert.equal(a.hasQuantities,true);
  assert.deepEqual(E.servingAmounts(a,3).map(r=>r.amount),[225,1.5]);
});
test('shown amounts are rounded as little as possible: grams and ml whole, spoons and cups one decimal, items to halves',()=>{
  assert.equal(E.roundAmount(291.667,'g'),292);
  assert.equal(E.roundAmount(466.667,'ml'),467);
  assert.equal(E.roundAmount(0.42,'g'),0.4,'tiny weights are not rounded away');
  assert.equal(E.roundAmount(1.167,'tsp'),1.2);
  assert.equal(E.roundAmount(0.583,'cup'),0.6);
  assert.equal(E.roundAmount(0.125,'tsp'),0.125,'kitchen fractions such as ⅛ stay exact');
  assert.equal(E.roundAmount(0.75,'cup'),0.75,'kitchen fractions such as ¾ stay exact');
  assert.equal(E.roundAmount(2.333,'whole'),2.5);
  assert.equal(E.roundAmount(1.167,'whole'),1);
  assert.equal(E.roundAmount(0.2,'clove'),0.5,'an item is never rounded down to nothing');
});
test('scaled method amounts are shown rounded, while the exact amounts stay inside the app',()=>{
  const a=recipe('Banoffee test',['biscuit','banana'],{servings:6,amounts:[{ingredient:'biscuit',amount:250,unit:'g'},{ingredient:'banana',amount:2,unit:'whole'}],steps:['Crush 250 g biscuits and add 2 tablespoons butter.']});
  const seven=E.scaledSteps(a,7)[0];
  assert.match(seven,/292 g biscuits/);
  assert.match(seven,/2\.3 tablespoons butter/);
  assert.equal(E.servingAmounts(a,7)[0].amount,291.667,'the exact amount is kept for further scaling');
  assert.deepEqual(E.servingAmounts(a,6).map(r=>r.amount),[250,2],'back to 6 servings gives the source amounts');
});
test('scaled method measurements use servings but leave time, heat, dimensions and counts alone',()=>{
  const a=recipe('Couscous',['couscous'],{servings:2,amounts:[{ingredient:'couscous',amount:120,unit:'g'}],steps:['Pour over 180 ml boiling water and leave for 5 minutes. Add 2 tablespoons lemon juice and 2–3 tablespoons water. Heat to 200°C. Cut into 2 cm pieces. Make 4 wells.']});
  assert.deepEqual(E.scaledSteps(a,2),a.steps);
  const doubled=E.scaledSteps(a,4)[0];
  assert.match(doubled,/360 ml/);
  assert.match(doubled,/4 tablespoons lemon/);
  assert.match(doubled,/4–6 tablespoons water/);
  for(const fixed of ['5 minutes','200°C','2 cm','4 wells']) assert.ok(doubled.includes(fixed),fixed);
  assert.ok(a.steps[0].includes('180 ml'),'original recipe stays immutable');
});
test('scaled method units have full boundaries and handle fractions, ranges and grammar',()=>{
  const a=recipe('Test',['rice'],{servings:2,amounts:[{ingredient:'rice',amount:100,unit:'g'}],steps:['Mix 1/2 cup milk, 1.5 l water, 1 1/2 teaspoons salt and 2 to 3 tbsp oil. Do not change 5 litresized things, 200 mlb or 8 minutes.']});
  const doubled=E.scaledSteps(a,4)[0];
  assert.match(doubled,/1 cup milk/);
  assert.match(doubled,/3 l water/);
  assert.match(doubled,/3 teaspoons salt/);
  assert.match(doubled,/4 to 6 tbsp oil/);
  for(const fixed of ['5 litresized','200 mlb','8 minutes']) assert.ok(doubled.includes(fixed),fixed);
});
test('legacy method and invalid serving counts remain untouched',()=>{
  const a=recipe('Legacy',['rice'],{steps:['Add 180 ml water.']});
  assert.deepEqual(E.scaledSteps(a,4),a.steps);
  const b=recipe('Quantified',['rice'],{amounts:[{ingredient:'rice',amount:100,unit:'g'}],steps:['Add 180 ml water.']});
  for(const count of [0,-2,Infinity,undefined,'oops']) assert.deepEqual(E.scaledSteps(b,count),b.steps);
});
test('per-piece quantities, incremental additions and equipment capacity do not scale',()=>{
  const a=recipe('Small cakes',['flour'],{amounts:[{ingredient:'flour',amount:100,unit:'g'}],steps:['Use a mug with at least 350 ml capacity. Add 2 tablespoons water. Make cakes with 2 tablespoons each. Add 1 teaspoon at a time. Use 5 g per cake.']});
  const doubled=E.scaledSteps(a,4)[0];
  assert.ok(doubled.includes('350 ml capacity'));
  assert.ok(doubled.includes('4 tablespoons water'));
  assert.ok(doubled.includes('2 tablespoons each'));
  assert.ok(doubled.includes('1 teaspoon at a time'));
  assert.ok(doubled.includes('5 g per cake'));
});
test('shopping list combines compatible units, keeps unknowns, and subtracts pantry families',()=>{
  const a=recipe('Soup',['lentil','cheese'],{amounts:[{ingredient:'lentil',amount:100,unit:'g'},{ingredient:'cheese',amount:50,unit:'g'}]});
  const b=recipe('Salad',['lentil'],{amounts:[{ingredient:'lentil',amount:0.5,unit:'cup'}]});
  const c=recipe('Stew',['lentil']);
  const list=E.shoppingList([{recipe:a,servings:2},{recipe:a,servings:2},{recipe:b,servings:2},{recipe:c,servings:2}],['parmesan']);
  assert.equal(list.length,3);
  assert.equal(list.find(r=>r.unit==='g').amount,200);
  assert.equal(list.find(r=>r.unit==='cup').amount,0.5);
  assert.equal(list.find(r=>r.amount===null).ingredient,'lentil');
  assert.ok(list.every(r=>r.ingredient!=='cheese'));
});
test('catalog data retains provenance and optional ingredient warnings',()=>{
  assert.ok(catalog.every(r=>r.source&&r.source.url));
  const fool=catalog.find(r=>r.name==='Rhubarb Fool');
  assert.ok(fool);
  assert.ok(!fool.diet.includes('vegan'));
  assert.ok(fool.allergens.includes('dairy'));
  assert.ok(catalog.find(r=>r.name==='Christmas Cinnamon Cookies').minutes>=70);
});
test('exact food names never match a different food merely sharing a prefix',()=>{
  const pea=recipe('Lemon pea orzo',['pea','orzo']),peanut=recipe('Peanut noodles',['peanut','rice noodle']);
  const ham=recipe('Ham toast',['ham']),bun=recipe('Hamburger bun',['hamburger bun']);
  assert.deepEqual(names(E.search([pea,peanut],{query:'pea'})),['Lemon pea orzo']);
  assert.equal(E.search([peanut],{query:'pea'}).length,0);
  assert.deepEqual(names(E.search([ham,bun],{query:'ham'})),['Ham toast']);
  assert.equal(E.search([bun],{query:'ham'}).length,0);
  assert.ok(E.search([pea,peanut],{query:'pean'}).some(r=>r.recipe===peanut));
});
test('recommended query relevance beats browse time and quantity completeness',()=>{
  const exact=recipe('Tomato soup',['tomato'],{minutes:60});
  const incidental=recipe('Speedy toast',['tomato'],{minutes:5,amounts:[{ingredient:'tomato',amount:100,unit:'g'}]});
  assert.deepEqual(names(E.search([incidental,exact],{query:'tomato'})),['Tomato soup','Speedy toast']);
  assert.deepEqual(names(E.search([incidental,exact],{query:'tomato',sort:'quickest'})),['Speedy toast','Tomato soup']);
});
test('shopping keeps cherry tomatoes and canned tomatoes in separate quantities and keys',()=>{
  const fresh=recipe('Fresh pasta',['tomato'],{amounts:[{ingredient:'tomato',amount:350,unit:'g',note:'cherry tomatoes, halved'}]});
  const canned=recipe('Curry',['tomato'],{amounts:[{ingredient:'tomato',amount:400,unit:'g',note:'canned chopped tomatoes'}]});
  const rows=E.shoppingList([{recipe:fresh,servings:2},{recipe:canned,servings:2}],[]);
  assert.equal(rows.length,2);
  assert.deepEqual(rows.map(r=>r.amount).sort((a,b)=>a-b),[350,400]);
  assert.equal(new Set(rows.map(r=>r.key)).size,2);
  assert.ok(rows.some(r=>r.note.includes('canned')&&r.basis.includes('canned')));
  assert.ok(rows.some(r=>r.note.includes('cherry')&&r.basis.includes('cherry')));
});
test('cooked, dry and drained weights never silently combine in the shopping list',()=>{
  const raw=recipe('Pilaf',['rice'],{amounts:[{ingredient:'rice',amount:100,unit:'g',note:'dry weight'}]});
  const cooked=recipe('Fried rice',['rice'],{amounts:[{ingredient:'rice',amount:200,unit:'g',note:'cooked and cooled'}]});
  const drained=recipe('Bean salad',['chickpea'],{amounts:[{ingredient:'chickpea',amount:240,unit:'g',note:'canned, drained'}]});
  const undrained=recipe('Bean soup',['chickpea'],{amounts:[{ingredient:'chickpea',amount:400,unit:'g',note:'canned, including liquid'}]});
  const entries=[raw,cooked,drained,undrained].map(recipe=>({recipe,servings:2}));
  const rows=E.shoppingList(entries,[]);
  assert.equal(rows.length,4);
  assert.equal(rows.filter(r=>r.ingredient==='rice').length,2);
  assert.equal(rows.filter(r=>r.ingredient==='chickpea').length,2);
  assert.equal(new Set(rows.map(r=>r.key)).size,4);
});
test('compatible drained weights combine while retaining their preparation notes',()=>{
  const a=recipe('A',['chickpea'],{amounts:[{ingredient:'chickpea',amount:240,unit:'g',note:'canned, drained'}]});
  const b=recipe('B',['chickpea'],{amounts:[{ingredient:'chickpea',amount:120,unit:'g',note:'canned, drained and rinsed'}]});
  const [row]=E.shoppingList([{recipe:a,servings:2},{recipe:b,servings:2}],[]);
  assert.equal(row.amount,360);
  assert.ok(row.note.includes('rinsed'));
  assert.deepEqual(row.recipes,['A','B']);
});
test('explicit cooked pantry food cannot satisfy a raw recipe or disappear from its shopping list',()=>{
  assert.equal(E.normalizeIngredient('200 g cooked rice'),'cooked rice');
  assert.equal(E.normalizeIngredient('raw chicken'),'raw chicken');
  assert.equal(E.covers('cooked rice','rice'),false);
  const a=recipe('Pilaf',['rice'],{amounts:[{ingredient:'rice',amount:100,unit:'g',note:'dry weight'}]});
  const b=recipe('Fried rice',['rice'],{amounts:[{ingredient:'rice',amount:200,unit:'g',note:'cooked and cooled'}]});
  assert.deepEqual(names(E.search([a,b],{pantry:['cooked rice']})),['Fried rice']);
  assert.deepEqual(names(E.search([a,b],{pantry:['raw rice']})),['Pilaf']);
  assert.equal(E.shoppingList([{recipe:a,servings:2}],['cooked rice']).length,1);
  assert.equal(E.shoppingList([{recipe:b,servings:2}],['cooked rice']).length,0);
});
test('dry beans do not satisfy canned bean requirements',()=>{
  const a=recipe('Bean salad',['chickpea'],{amounts:[{ingredient:'chickpea',amount:240,unit:'g',note:'canned, drained'}]});
  assert.equal(E.search([a],{pantry:['dried chickpeas']}).length,0);
  assert.equal(E.search([a],{pantry:['cooked chickpeas']}).length,1);
  assert.equal(E.search([a],{pantry:['chickpeas']}).length,1,'unspecified ingredient names retain ordinary pantry matching');
});
test('public requirement coverage agrees with search and shopping for preparation-aware details',()=>{
  const a=recipe('Chickpea wraps',['chickpea'],{amounts:[{ingredient:'chickpea',amount:240,unit:'g',note:'canned, drained'}]});
  const row=a.amounts[0];
  for(const [pantry,expected] of [['dried chickpea',false],['cooked chickpea',true],['chickpea',true]]) {
    assert.equal(E.coversRequirement(pantry,'chickpea',row),expected,pantry);
    assert.equal(E.search([a],{pantry:[pantry]}).length>0,expected,pantry);
    assert.equal(E.shoppingList([{recipe:a,servings:2}],[pantry]).length===0,expected,pantry);
  }
  assert.equal(E.coversRequirement('rice','rice',{note:'cooked and cooled'}),false);
  assert.equal(E.coversRequirement('cooked rice','rice',{note:'cooked and cooled'}),true);
});
test('plant alternatives do not trigger dairy-name or animal-family exclusions',()=>{
  for(const [ingredient,excluded] of [['coconut milk','milk'],['peanut butter','butter'],['cream of tartar','cream'],['vegan cheese','cheese'],['vegan chicken','meat']]) assert.equal(E.isExcluded(ingredient,excluded),false,ingredient);
  assert.equal(E.isExcluded('peanut butter','peanut'),true);
  assert.equal(E.isExcluded('cream cheese','cheese'),true);
  const eggs=recipe('Egg whites',['egg white'],{diet:['vegan']});
  assert.ok(eggs.allergens.includes('egg'));
  assert.ok(!eggs.diet.includes('vegan'));
});
test('source-checked enrichment adds quantities without replacing legacy identity or provenance',()=>{
  const original={name:'Original soup',id:'original-id',ingredients:['lentil'],servings:2,minutes:30,price:3,diet:['vegan'],allergens:[],steps:['Old method.'],source:{name:'Wikibooks Cookbook',url:'https://example.org/original',license:'CC BY-SA 4.0'}};
  const enriched=[{originalName:original.name,name:'Wrong name',id:'wrong-id',source:{name:'Wrong source'},amounts:[{ingredient:'lentil',amount:150,unit:'g'}],steps:['Cook the lentils.'],quantitySource:'source-checked',quantityNote:'Checked the linked source.'}];
  const [result]=E.buildCatalog([original],[],enriched);
  assert.equal(result.id,'original-id');assert.equal(result.name,original.name);
  assert.deepEqual(result.source,original.source);assert.equal(result.hasQuantities,true);
  assert.equal(result.quantitySource,'source-checked');assert.match(result.quantityNote,/linked source/);
  assert.deepEqual(result.steps,['Cook the lentils.']);
  assert.deepEqual(original.steps,['Old method.']);assert.equal(original.amounts,undefined);
});
test('duplicate quantity rows and invalid base servings cannot claim reliable scaling',()=>{
  const duplicate=recipe('Duplicate',['tomato'],{amounts:[{ingredient:'tomato',amount:100,unit:'g'},{ingredient:'tomatoes',amount:1,unit:'whole'}]});
  assert.equal(duplicate.hasQuantities,false);
  assert.equal(E.servingAmounts(duplicate,4)[0].amount,null);
  const invalid=recipe('Invalid',['tomato'],{servings:0,amounts:[{ingredient:'tomato',amount:100,unit:'g'}]});
  assert.equal(invalid.hasQuantities,false);
});
test('indexes are reused across keystrokes and returned vocabularies cannot corrupt them',()=>{
  const a=recipe('Tomato soup',['tomato']);
  let reads=0;
  const custom=[{...a,get cuisine(){reads++;return 'Italian';}}];
  E.search(custom,{query:'tom'});
  const afterFirst=reads;
  E.search(custom,{query:'toma'});E.suggestions('tom',custom);E.suggestions('toma',custom);
  assert.equal(reads,afterFirst,'catalog fields are indexed once, not rescanned for every query');
  E.knownIngredients(custom).length=0;
  assert.ok(E.suggestions('tom',custom).includes('tomato'));
  custom.push(recipe('Egg toast',['egg']));
  assert.equal(E.search(custom,{}).length,2,'append rebuilds the catalog index');
});
test('equal sort keys produce deterministic recipe order',()=>{
  const a=recipe('Same',['rice'],{id:'a'}), b=recipe('Same',['rice'],{id:'b'});
  assert.deepEqual(E.search([b,a],{}).map(x=>x.recipe.id),['a','b']);
  assert.deepEqual(E.search([a,b],{}).map(x=>x.recipe.id),['a','b']);
});
test('API works as a browser script without require or window dependencies',()=>{
  const browser={};vm.createContext(browser);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','engine.js'),'utf8'),browser);
  assert.equal(browser.KitchenEngine.normalizeIngredient('200g tomatoes'),'tomato');
});
