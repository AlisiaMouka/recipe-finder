#!/usr/bin/env node
/* Recipe-specific, original SVG artwork. No downloads, dependencies or network.
 * Run with: node scripts/generate-recipe-art.js
 * Dish profiles are explicit; uncertain legacy forms use labelled ingredient studies.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'recipes.js'), 'utf8') + ';window.legacy=RECIPES;', context);
vm.runInContext(fs.readFileSync(path.join(root, 'recipes-extra.js'), 'utf8'), context);
const E = require(path.join(root, 'engine.js'));
const catalog = E.buildCatalog(context.window.legacy, context.window.EXTRA_RECIPES);
const profiles = Object.create(null);
function assign(type, ids, options = {}) {
  for (const id of ids.trim().split(/\s+/)) {
    if (profiles[id]) throw Error('Duplicate artwork profile: ' + id);
    profiles[id] = { type, ...options };
  }
}
// Each measured recipe has a deliberate composition. Decorations only use listed foods.
assign('tomato-pasta', 'burst-tomato-basil-pasta');
assign('couscous', 'lemon-chickpea-couscous');
assign('green-rice', 'green-goddess-rice-bowl');
assign('wraps', 'crispy-chickpea-wraps');
assign('skillet-eggs', 'spinach-feta-eggs');
assign('lentil-curry', 'red-lentil-coconut-curry');
assign('orzo', 'lemon-pea-orzo');
assign('sweet-potato-bowl', 'roasted-sweet-potato-black-bean-bowls');
assign('bean-toast', 'tomato-white-bean-toast');
assign('polenta', 'creamy-mushroom-polenta');
assign('roast-tray', 'roasted-cauliflower-chickpea-tray');
assign('jacket-potatoes', 'broccoli-cheddar-baked-potatoes');
assign('peanut-noodles', 'peanut-lime-noodles');
assign('tofu-rice', 'crispy-tofu-broccoli-rice');
assign('tomato-rice', 'one-pot-tomato-rice-beans');
assign('bean-soup', 'lemon-white-bean-soup');
assign('carrot-soup', 'carrot-ginger-lentil-soup');
assign('flatbread', 'tomato-mozzarella-flatbreads');
assign('frittata', 'courgette-pea-frittata');
assign('chickpea-skillet', 'harissa-style-chickpea-skillet');
assign('tuna-salad', 'tuna-lemon-white-bean-salad');
assign('sardine-pasta', 'sardine-tomato-pasta');
assign('sandwich', 'avocado-chickpea-sandwich');
assign('apple-salad', 'crunchy-apple-chickpea-salad');
assign('pitta', 'hummus-roasted-pepper-pittas');
assign('banana-pancakes', 'banana-oat-pancakes');
assign('porridge', 'apple-cinnamon-porridge');
assign('yogurt-bowl', 'strawberry-yogurt-breakfast-bowl');
assign('mushroom-toast', 'mushroom-spinach-breakfast-toast');
assign('egg-toast', 'tomato-scrambled-egg-toast');
assign('smoothie', 'peanut-banana-smoothie');
assign('breakfast-plate', 'cucumber-feta-breakfast-plate');
assign('hummus', 'quick-lemon-hummus');
assign('roast-chickpeas', 'smoky-roasted-chickpeas');
assign('apple-rounds', 'apple-peanut-butter-rounds');
assign('berry-cups', 'lemon-yogurt-berry-cups');
assign('cinnamon-apples', 'warm-cinnamon-apples');
assign('mug-cake', 'chocolate-banana-mug-cake');
assign('berry-crumble', 'berry-oat-crumble');
assign('courgette-pan', 'lemon-courgette-white-bean-pan');

// Legacy recipes: confident silhouettes first. These are illustrations, not photographs.
assign('cookies', `christmas-cinnamon-cookies chocolate-chip-cookies hermits shortbread anzac-biscuits`);
assign('meringues', 'meringue-cookies');
assign('muffins', 'chocolate-chocolate-chip-muffins cran-apple-bran-muffins');
assign('cake', 'irish-fruit-cake tarta-de-santiago applesauce-cake almond-cake');
assign('cheesecake', 'chocolate-cheesecake');
assign('pie', 'corned-beef-pie radish-pie radish-tart zucchini-pie');
assign('shepherd-pie', 'shepherd-s-pie');
assign('cobbler', 'apple-cobbler');
assign('tatin', 'tarte-tatin');
assign('banoffee', 'banoffee-pie');
assign('churros', 'churros');
assign('mochi', 'daifuku');
assign('pancakes', 'welsh-cakes');
assign('oat-bars', 'flapjacks');
assign('burger', 'hamburger beanburger bulgur-burgers');
assign('sandwich', 'reuben-sandwich meatless-sloppy-joes');
assign('hotdog', 'choripan');
assign('flatbread-plain', 'chapati injera-ethiopian-teff-flatbread socca-chickpea-flatbread taboon-bread');
assign('filled-flatbread', 'gozleme-turkish-flatbread');
assign('rolls', 'baati');
assign('cornbread', 'cornbread');
assign('omelette', 'french-omelette chickpea-omelette');
assign('deviled-eggs', 'deviled-eggs');
assign('breakfast', 'english-breakfast');
assign('fried-eggs', 'portable-eggs-benedict');
assign('scramble', 'latino-scramble');
assign('fish-chips', 'fish-and-chips');
assign('salmon', 'honey-peppered-salmon');
assign('breaded-fish', 'hake-in-herby-breadcrumbs');
assign('fishcakes', 'tuna-melt-fishcakes');
assign('roast-potatoes', 'rosemary-garlic-baked-potatoes oven-roasted-potatoes');
assign('drumsticks', 'roasted-spiced-chicken-drumsticks');
assign('sausage-mash', 'bangers-and-mash');
assign('meatballs', 'italian-meatballs');
assign('roast-chicken', 'easy-onion-chicken');
assign('drink', 'ayran-turkish-yogurt-drink ginger-beer');
assign('fool', 'rhubarb-fool');
assign('noodles', 'egg-noodles');
assign('raw-pasta', 'fresh-egg-pasta-pasta-fresca-all-uovo');
assign('pasta', `venison-bolognese-sauce chicken-bacon-broccoli-alfredo-spaghetti spinach-mushroom-pesto-spaghetti creamy-mushroom-pasta penne-alla-casa spaghetti-alla-carbonara garlic-shrimp-scampi-pasta`);
assign('baked-pasta', 'zucchini-pasta-bake baked-penne');
assign('salad', `crab-and-corn-salad asian-inspired-chicken-salad butternut-biltong-and-brown-rice-salad kachumbari tarbes-salad carrot-salad carrot-and-raisin-salad ensalada-rusa`);
assign('dip', 'fermented-salsa chimichurri lemon-parmesan-salad-dressing zacusca peach-salsa');
assign('soup', `borscht sayur-asem-indonesian-tamarind-vegetable-soup chanterelle-goulash creamy-tomato-and-bean-soup french-onion-soup miyan-kuka-baobab-leaf-soup dovga-azerbaijani-yogurt-soup vichyssoise asparagus-soup le-tourin taco-soup three-sisters-soup pennsylvania-pot-pie mediterranean-beef-stew chicken-and-andouille-gumbo frijoles-antioquenos faten-wake`);
assign('noodle-soup', 'soto-ayam-indonesian-chicken-noodle-soup');
assign('curry', `portuguese-feijoada rendang-indonesian-beef-and-coconut-stew tofu-in-spiced-coconut-sauce turkey-and-lima-beans chili-con-bambi-venison-chili california-curry-chicken bell-pepper-chili malvani-chicken-curry dinuguan chakalaka aloo-masala`);
assign('rice', `simple-biryani turkish-dolma-pilav rice-and-lentils-mejadra zereshk-palau puliyodarai tuscan-mushroom-risotto basic-risotto pohe-spiced-flattened-rice`);
assign('tofu', 'mapo-tofu');
// The form of these dishes is sufficiently specific that a generic meal would mislead.
// Show labelled ingredients from their own lists rather than inventing a finished dish.
assign('ingredient-study', `cochinita-pibil-mexican-braised-pork toad-in-the-hole pepes-ikan-indonesian-steamed-fish creamed-spinach pralin tahdiq-crisped-persian-rice saganaki-pan-fried-cheese pastry-for-cornish-pasties snails-with-garlic-butter-escargots-a-la-bourguignonne poppyseed-chicken tapai-ketan-indonesian-fermented-sticky-rice toston-fried-plantains sausage-egg-breakfast-dish chuu-chee-fish pachadi-cucumber-and-coconut bread-pudding habichuela-con-dulce jam-roly-poly shrimp-and-cheese-grits mediterranean-green-chicken chicken-gyros honey-apple-glazed-pork hongshao-rou garlic-pork-chops-with-black-mushrooms hominy-grits cauliflower-cheese angels-on-horseback fisherman-s-casserole leek-parsley-and-cheddar-mash papas-a-la-huancaina yerushalmi-kugel`);

const xml = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
function hash(s) { let n=2166136261; for(const c of s) n=Math.imul(n^c.charCodeAt(0),16777619); return n>>>0; }
function rng(seed) { let n=seed||1;return ()=>((n=Math.imul(1664525,n)+1013904223>>>0)/4294967296); }
const ellipse=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const circle=(x,y,r,fill,extra='')=>ellipse(x,y,r,r,fill,extra);
const rect=(x,y,w,h,fill,r=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const line=(x1,y1,x2,y2,color,width=2)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
const group=(s,x=0,y=0,scale=1,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${s}</g>`;
const shades={tomato:'#cb4d35',carrot:'#db8e35',pea:'#6b913c',broccoli:'#41734a',spinach:'#4d7750',chickpea:'#d5b66d','white bean':'#eadbb8','black bean':'#433b32','kidney bean':'#81402e',tofu:'#e8c886',feta:'#fff9e6',cheddar:'#e6a73e',avocado:'#91b05b',lemon:'#e9c34c',lime:'#91aa45',strawberry:'#cf4b41',blueberry:'#465576',banana:'#e9d18b',potato:'#b98c51','sweet potato':'#d68a39',mushroom:'#a18b70',cucumber:'#7b9b59',courgette:'#789257',rice:'#e7d8b3',oat:'#cbb783',pasta:'#dec179',parsley:'#4e7943',basil:'#517a46',coriander:'#527e4d',apple:'#bf6b48','bell pepper':'#cc633e',chicken:'#c79a66',beef:'#80553b',pork:'#b18464',fish:'#b6b8ab',salmon:'#dc9479',shrimp:'#d59b80',onion:'#d3b69a',garlic:'#e8ddbf',cauliflower:'#e6dcb5',lettuce:'#91a66a'};
function color(name) { return shades[name] || (name.includes('lentil')?'#bd8950':name.includes('bean')?'#bda276':name.includes('chocolate')||name.includes('cocoa')?'#674434':name.includes('cheese')?'#f0dc99':'#bda889'); }
function leaf(x,y,size=12,angle=0,fill='#507947') {return group(`<path d="M0 15C-21 5-13-14 0-21C13-12 20 7 0 15Z" fill="${fill}"/>${line(0,13,0,-15,'#91a770',1.5)}`,x,y,size/16,angle);}
let foodSymbols=new Map();
function food(name,x=0,y=0,scale=1,angle=0,cooked=false) {
  let s=''; const c=color(name);
  if(/tomato/.test(name)) s=circle(0,0,16,c)+ellipse(-5,-6,6,4,'#e98155')+`<path d="M0-10l-7-8 8 4 8-4-5 8 7 3-10-1-5 6 1-8Z" fill="#4e7546"/>`;
  else if(name==='radish') s=circle(0,0,19,'#b86b77')+circle(0,0,15,'#f2e7d6')+circle(0,0,3,'#e3cfbc');
  else if(name==='cucumber'||name==='courgette') s=circle(0,0,18,c)+circle(0,0,14,'#d8ddb0')+[-1,0,1].map((n)=>ellipse(n*6,0,2,6,'#f9efd1',`transform="rotate(${n*25})"`)).join('');
  else if(name==='lemon'||name==='lime') s=circle(0,0,18,c)+circle(0,0,14,'#f7e6a1')+Array.from({length:8},(_,i)=>line(0,0,Math.cos(i*Math.PI/4)*13,Math.sin(i*Math.PI/4)*13,'#fff8dc',1.5)).join('');
  else if(name==='avocado') s=`<path d="M-22 10Q-25-13 0-30Q25-13 22 10Q12 29 0 28Q-12 28-22 10" fill="#527642"/><path d="M-17 9Q-18-8 0-24Q18-8 17 9Q11 22 0 22Q-11 22-17 9" fill="#c0ce7d"/>`+circle(0,7,10,'#9b6a45');
  else if(name==='broccoli') s=rect(-4,-1,8,25,'#8b9d5c',2)+circle(-12,-8,12,'#3c6741')+circle(11,-9,13,'#487c4b')+circle(0,-17,14,'#54884c')+circle(-4,-19,5,'#71955a');
  else if(name==='cauliflower') s=leaf(-9,15,17,-70,'#829057')+leaf(13,16,16,65,'#829057')+circle(-11,-5,12,'#d9cca2')+circle(10,-7,14,'#e7dab4')+circle(0,-15,13,'#f2e7c7');
  else if(['spinach','basil','parsley','coriander','lettuce','rocket','mint','kale','dill','thyme','rosemary','sage'].includes(name)) s=leaf(0,0,21,0,c)+leaf(8,8,12,65,c);
  else if(name==='mushroom') s=rect(-5,-1,10,21,'#e4d5b5',4)+`<path d="M-23 1Q-20-23 0-24Q20-23 23 1Q0 10-23 1" fill="#9b8061"/>`+ellipse(0,1,22,5,'#c4ad87');
  else if(name==='strawberry') s=`<path d="M-15-8Q-15-20 0-14Q15-20 15-8Q13 12 0 23Q-13 12-15-8" fill="#cc4c40"/>`+[-9,0,9].map((a,i)=>ellipse(a,-4+i%2*5,1.2,2,'#edc783')).join('')+leaf(0,-16,7,90,'#527448');
  else if(name==='blueberry') s=circle(0,0,11,'#4c5877')+circle(-3,-4,5,'#667693')+`<path d="M0-3l2 2 3-1-1 3 2 2-3 1-1 2-2-3-3 0 1-3Z" fill="#34445e"/>`;
  else if(name==='banana') s=circle(0,0,16,'#d7b96f')+circle(0,0,13,'#f2e3b1')+`<path d="M0-7l4 7-4 6-4-6Z" fill="#d3b67e"/>`;
  else if(name==='peanut') s=`<path d="M-11-16C-1-25 13-18 12-6Q6 0 12 8C18 24-7 28-13 13Q-17 4-10-2Q-17-8-11-16Z" fill="#c7a16c" stroke="#a68354" stroke-width="1.5"/>`+line(0,-16,0,17,'#e6c794',2);
  else if(/almond|cashew|walnut|pecan|pistachio|hazelnut|pine nut/.test(name)) s=`<path d="M0-22Q23-3 9 16Q0 27-10 15Q-22-6 0-22Z" fill="#ad8959"/>`+line(0,-15,0,16,'#d2b179',2);
  else if(/chocolate|cocoa/.test(name)) s=rect(-12,-10,24,20,'#5e4031',2)+rect(-9,-8,8,7,'#77533d',1)+rect(2,-8,8,7,'#77533d',1);
  else if(/cranberry|raisin|currant/.test(name)) s=ellipse(0,0,10,7,name==='cranberry'?'#aa554c':'#705244')+line(-4,-2,4,1,'#9a7261',1);
  else if(/cinnamon|cumin|paprika|nutmeg/.test(name)) s=circle(-4,-4,2.4,'#9e7749')+circle(4,-3,2,'#a87b4d')+circle(0,3,2.5,'#a47a4c')+circle(-5,5,1.8,'#9e7749');
  else if(name==='apple') s=`<path d="M0-15C-23-26-27-1-17 16Q-8 29 0 20Q13 30 20 12C31-10 17-25 0-15" fill="#bc6549"/>`+`<path d="M0-12l4-15" stroke="#75553b" stroke-width="4"/>`+leaf(10,-23,7,60,'#6c874c');
  else if(name==='apple-slice') s=`<path d="M-23-4Q1-23 24-4Q12 20-9 19Z" fill="#b96745"/><path d="M-19-3Q1-17 20-3Q10 15-8 15Z" fill="#eee0b6"/>`;
  else if(name==='carrot') s=`<path d="M-12-14Q0-25 12-14L1 29Z" fill="#d68b3b"/>`+line(-5,-3,6,-7,'#b76e30',2)+line(-2,8,4,6,'#b76e30',2)+leaf(0,-22,10,0,'#6f884c');
  else if(name==='carrot-ribbon') s=`<path d="M-20-12Q-2-4 18-16L23-8Q0 5-21-2Z" fill="#df9a4d"/><path d="M-19 5Q1 14 23 0L25 8Q0 24-21 14Z" fill="#cd833b"/>`;
  else if(name==='pepper-strip') s=`<path d="M-19-18Q16-22 17 16L8 20Q10-10-17-7Z" fill="#c56643"/>`;
  else if(name==='sweet-potato-cube') s=rect(-14,-11,28,24,'#d28d43',3)+`<path d="M-14-11l7-7h27l-6 7Z" fill="#e2a355"/><path d="M14-11l6-7v24l-6 7Z" fill="#b47532"/>`;
  else if(name==='fries') s=rect(-6,-30,12,60,'#d4ac60',2)+rect(-6,-30,5,60,'#eccd86',1);
  else if(name==='onion') s=circle(0,0,18,'#ba8f6e')+circle(0,0,14,'#e0cbb0')+circle(0,0,9,'#c2a68b')+circle(0,0,6,'#ead9bd')+line(0,-18,0,-24,'#ab8566',3);
  else if(name==='garlic') s=`<path d="M0-21C-4-12-22-5-16 11Q-10 22 0 17Q13 22 19 9C23-6 6-13 0-21" fill="#e2d2ac"/>`+`<path d="M0-15Q-9 1-3 16M2-13Q12 3 5 17" fill="none" stroke="#c6b68f" stroke-width="1.5"/>`;
  else if(name==='egg') s=ellipse(0,0,20,15,'#f9f4df')+ellipse(2,0,8,8,'#e1a834')+ellipse(0,-3,4,2,'#efc764');
  else if(name==='scrambled-egg') s=`<path d="M-20-2Q-23-17-8-13Q0-24 11-12Q27-14 20 4Q24 17 6 16Q-9 26-13 13Q-29 12-20-2Z" fill="#e5c975"/>`+`<path d="M-13-4Q0-13 12-4M-7 9Q4 5 14 10" fill="none" stroke="#f2dba2" stroke-width="3" stroke-linecap="round"/>`;
  else if(name==='snail') s=`<path d="M-28 15Q0 5 28 15Q13 25-28 22Z" fill="#b6a885"/>`+circle(0,0,23,'#a08256')+`<path d="M-16 2C-18-18 14-23 17-1C19 16-10 21-10 1C-8-10 9-9 10 2C11 8 0 10-1 3" fill="none" stroke="#d6bf8d" stroke-width="3"/>`;
  else if(name==='feta'||name==='tofu'||name==='cheddar'||name==='mozzarella') s=rect(-12,-11,24,22,name==='tofu'?'#d8ac65':name==='cheddar'?'#dfaa47':'#f8f1d8',4)+`<path d="M-12-11l5-5h24l-5 5Z" fill="${name==='tofu'?'#edc67f':'#fff8df'}"/><path d="M12-11l5-5v21l-5 6Z" fill="${name==='tofu'?'#b88d4d':'#d9ceb0'}"/>`;
  else if(name==='bell pepper') s=`<path d="M-17-10Q-3-20 6-10Q26-5 15 18Q4 27 0 16Q-15 26-20 10Q-27-4-17-10Z" fill="#cc603e"/>`+line(0,-13,4,-25,'#58734b',5);
  else if(name==='potato'||name==='sweet potato') s=ellipse(0,0,23,17,c)+ellipse(-7,-5,8,4,name==='potato'?'#c99f68':'#e2a35a')+circle(11,3,1.5,'#8f6e43')+circle(-7,7,1,'#8f6e43');
  else if(name==='tuna') s=`<path d="M-25-4L-8-19L18-14L27 5L10 17L-13 13Z" fill="#caa591"/>`+line(-16,-2,10,-9,'#e5c9b4',3)+line(-13,5,17,-2,'#e5c9b4',3)+line(-6,12,20,4,'#e5c9b4',3);
  else if(name==='sardine') s=`<path d="M-35 0Q-7-18 34-5L39 2Q3 19-35 0Z" fill="#91a499"/>`+line(-22,0,28,0,'#d3d2bc',3)+line(-7,-9,0,8,'#627d76',1.5)+line(8,-10,15,8,'#627d76',1.5);
  else if(name==='fish'||name==='salmon') s=`<path d="M-32 0Q-9-23 24-4L39-13L34 2L39 14L22 5Q-9 23-32 0Z" fill="${name==='salmon'?'#dc967c':'#9ea99d'}"/>`+circle(-22,-3,2,'#334840')+`<path d="M-10-13Q-2 0-10 13" fill="none" stroke="#697e73" stroke-width="2"/>`;
  else if(name==='shrimp') s=`<path d="M13-16C-15-26-30 12-6 20Q10 25 19 9L7 4Q-2 11-7 5Q-13-6 4-10Z" fill="#dcab8d" stroke="#b98569" stroke-width="2"/>`;
  else if(name==='chicken'||name==='beef'||name==='pork') s=`<path d="M-23-9Q-9-25 11-15Q31-5 20 14Q1 28-17 13Q-28 8-23-9Z" fill="${c}"/>`+line(-11,-3,13,5,'#8c6547',3);
  else if(name==='pea') s=circle(0,0,8,c)+circle(-2,-2,3,'#9eb560');
  else if(name.includes('bean')||name==='chickpea'||name.includes('lentil')) s=`<path d="M-10-8C-19 6-1 21 9 10Q14 4 6 0Q-1-1 3-8Q-2-17-10-8Z" fill="${c}"/>`+line(-4,-6,-4,5,name==='black bean'?'#67584a':'#b79660',1.2);
  else if(name==='pasta') s=`<path d="M-17-7l24-7 12 20-25 8Z" fill="#d9b96d" stroke="#ad8d4d" stroke-width="2"/>`+[-8,-3,2,7].map(a=>line(a,-6,a+7,7,'#f1d691',1.5)).join('');
  else if(name==='rice'||name==='orzo') s=ellipse(0,0,8,3.5,name==='orzo'?'#dbc283':'#f0e5c6',`transform="rotate(-22)"`);
  else if(name==='oat') s=ellipse(0,0,8,5,'#c5ad76')+line(-5,0,5,0,'#e4d0a3',1);
  else if(name==='bread') s=`<path d="M-24 18v-28Q-32-30 0-28Q32-30 24-10v28Z" fill="#b78348"/><path d="M-19 14v-23Q-25-23 0-22Q25-23 19-9v23Z" fill="#ead5a5"/>`;
  else {const label=name.length>17?name.slice(0,16)+'…':name;s=rect(-26,-28,52,56,'#ded4ba',7)+rect(-20,-34,40,9,'#8a9b7c',3)+rect(-21,-13,42,25,'#faf4e2',2)+`<text x="0" y="2" font-family="Georgia,serif" font-size="${label.length>11?6:8}" fill="#4d5d48" text-anchor="middle">${xml(label)}</text>`;}
  if(cooked && s.includes('<text')) s=ellipse(0,0,10,7,color(name))+ellipse(-2,-2,4,2,'#ead7a8','opacity=".35"');
  const id='food-'+hash(s).toString(36);
  if(foodSymbols.has(id)&&foodSymbols.get(id)!==s)throw Error('Ingredient symbol collision');
  foodSymbols.set(id,s);
  return `<use href="#${id}" transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"/>`;
}
function scatter(name,count,cx=320,cy=223,rx=145,ry=96,seed=1,scale=.75) {
  const random=rng(seed), pieces=[];
  for(let i=0;i<count;i++){
    const a=random()*Math.PI*2,d=Math.sqrt(random()),x=cx+Math.cos(a)*rx*d,y=cy+Math.sin(a)*ry*d,sz=scale*(.85+random()*.3),rot=random()*180;
    // Pantry jars belong only to a labelled ingredient study, never on a cooked dish.
    pieces.push(food(name,x,y,sz,rot,true));
  }return pieces.join('');
}
function plate() {return ellipse(321,254,228,130,'#8c8f6b','opacity=".12"')+ellipse(320,222,224,142,'url(#ceramic)','filter="url(#shadow)"')+ellipse(320,222,191,117,'none','stroke="#dedbc6" stroke-width="2"')+ellipse(320,222,181,109,'#eee8d6');}
function bowl(base='#d9ca9b') {return ellipse(320,263,207,113,'#6e8061','opacity=".12"')+`<path d="M111 199Q133 368 320 366Q507 368 529 199Z" fill="#e1ddc8" filter="url(#shadow)"/>`+ellipse(320,199,209,129,'url(#ceramic)')+ellipse(320,201,183,108,base)+ellipse(320,199,190,114,'none','stroke="#d1d0b8" stroke-width="3"');}
function skillet(base='#c9663f') {return group(rect(-20,-85,40,133,'#343e35',16)+rect(-8,-71,16,57,'#e6e0c9',8),525,156,1,58)+ellipse(320,224,218,144,'#303a32','filter="url(#shadow)"')+ellipse(320,222,204,131,'#535c48')+ellipse(320,222,187,115,base)+ellipse(320,222,203,130,'none','stroke="#8e9680" stroke-width="3"');}
function tray() {return group(rect(120,84,400,259,'#b7c0b2',24,'filter="url(#shadow)"')+rect(131,96,378,233,'#d6d9c7',19)+rect(151,111,338,204,'#e7ddbd',8),0,0,1,-4);}
function spoon(x=540,y=226,angle=10) {return group(ellipse(0,-62,19,32,'#b4b7a3')+rect(-5,-38,10,127,'#a5aa97',4)+ellipse(-4,-68,7,20,'#d4d8c5'),x,y,1,angle);}
function grain(name,count=150,cx=320,cy=205,rx=161,ry=88,seed=6) {return scatter(name,count,cx,cy,rx,ry,seed,.66);}
function garnish(r,cx=320,cy=220) {const herb=['parsley','basil','coriander','mint','dill','thyme','rosemary'].find(i=>r.ingredients.includes(i));return herb?scatter(herb,6,cx,cy,120,65,hash(r.id),.42):'';}
function breadSlice(x,y,angle=0,kind='toast') {return group(`<path d="M-90 62V-38Q-103-87-39-88Q0-107 39-88Q103-87 90-38V62Z" fill="#aa773f" filter="url(#soft-shadow)"/><path d="M-78 51V-38Q-90-76-37-76Q0-94 37-76Q90-76 78-38V51Z" fill="${kind==='toast'?'#d8b66f':'#ead3a0'}"/>`+Array.from({length:17},(_,i)=>ellipse(-65+(i*37)%128,-50+(i*29)%91,2,1.5,'#b69458','opacity=".6"')).join(''),x,y,1,angle);}
function toastMeal(r,type) {let s=plate()+breadSlice(236,221,-13)+breadSlice(411,230,12);const centers=[[229,217],[412,226]];for(const [x,y] of centers){if(type==='bean-toast'){s+=scatter('white bean',17,x,y,59,45,hash(r.id)+x,.62)+scatter('tomato',7,x,y,60,42,x,.64);}if(type==='mushroom-toast'){s+=scatter('spinach',9,x,y,60,43,x,.7)+scatter('mushroom',7,x,y,56,38,x+9,.69);}if(type==='egg-toast'){s+=scatter('scrambled-egg',13,x,y,60,40,x,.73)+scatter('tomato',6,x,y,53,38,x,.52);}}return s+garnish(r);}
function cup(x,y,scale=1,kind='yogurt') {
 let s='';if(kind==='mug'){s=`<path d="M57-51C143-67 144 66 57 45" fill="none" stroke="#758f7b" stroke-width="23"/><path d="M-72-64L-64 62Q0 107 64 62L72-64Z" fill="url(#mug)" filter="url(#soft-shadow)"/>`+ellipse(0,-64,72,27,'#f0e7cb')+ellipse(0,-64,63,20,'#5d3f2e')+`<path d="M-60-66C-62-113-26-117-9-100C4-126 42-115 48-94Q70-88 62-63Z" fill="#66442f"/>`+scatter('banana',3,0,-87,35,8,8,.55)+circle(-27,-96,3,'#36281f')+circle(32,-89,4,'#36281f')+circle(5,-102,3,'#36281f');}
 else {s=`<path d="M-61-82L-51 75Q0 99 51 75L61-82Z" fill="#e9e5d7" stroke="#b4c2b1" stroke-width="3" filter="url(#soft-shadow)"/><path d="M-56-69L-48 70Q0 90 48 70L56-69Z" fill="${kind==='smoothie'?'#c8ae80':kind==='beer'?'#d7ba73':'#f6edd9'}"/>`;if(kind==='yogurt'||kind==='fool'){s+=`<path d="M-53-13Q-20-32 5-10Q24 10 53-7L50 28Q24 45 0 27Q-26 7-50 33Z" fill="${kind==='fool'?'#c57c78':'#ba5b58'}"/>`+ellipse(0,-68,55,19,'#fcf7e8');if(kind==='yogurt')s+=food('strawberry',-21,-73,.8,-25)+food('strawberry',15,-69,.7,15)+food('blueberry',34,-78,.8)+food('blueberry',-1,-80,.9);else s+=`<path d="M-34-70Q-8-86 28-67" fill="none" stroke="#d19a91" stroke-width="10" stroke-linecap="round"/>`;}else if(kind==='smoothie')s+=ellipse(0,-70,55,19,'#d3bd92')+line(25,-76,42,-151,'#789887',9)+food('banana',-26,-73,.85,15);else if(kind==='beer')s+=ellipse(0,-70,55,19,'#e1c98b')+Array.from({length:9},(_,i)=>circle(-29+(i*17)%62,-45+(i*31)%105,2+i%2,'#f6e9ba','opacity=".7"')).join('');else s+=ellipse(0,-70,55,19,'#fcf8e9');s+=`<path d="M-44-54l5 103" stroke="#fff" stroke-width="7" opacity=".45" stroke-linecap="round"/>`;}
 return group(s,x,y,scale);
}
function noodleNest(cx=320,cy=210,rx=146,ry=85,seed=7,color='#dec387') {const random=rng(seed);let s='';for(let i=0;i<29;i++){const a=random()*6.28,d=Math.sqrt(random());const x=cx+Math.cos(a)*rx*d,y=cy+Math.sin(a)*ry*d;s+=`<path d="M${x-24} ${y+8}c-40-27 2-59 39-31s-36 57-58 19 54-32 65-9" fill="none" stroke="${i%3?'#b39a64':color}" stroke-width="7" stroke-linecap="round"/><path d="M${x-24} ${y+6}c-40-27 2-59 39-31s-36 57-58 19 54-32 65-9" fill="none" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>`; }return s;}
function pancakeStack(r,banana=false) {let s=plate();for(let i=0;i<4;i++){const y=255-i*20;s+=ellipse(320,y,135,66,'#b98543')+ellipse(320,y-9,135,63,'#dec48b')+ellipse(320,y-12,117,49,'none','stroke="#c8a66d" stroke-width="2"');}if(banana)s+=scatter('banana',7,320,178,94,38,14,.85);else s+=scatter('oat',12,320,178,94,38,14,.5);return s;}
function sandwich(r) {let s=plate();const random=rng(hash(r.id));for(const [x,y,rot] of [[234,226,-12],[409,230,13]]) {let filling='#89a060';if(r.id==='reuben-sandwich')filling='#ab7864';if(r.id==='meatless-sloppy-joes')filling='#a26943';let inside='';for(let i=0;i<8;i++){const ingredient=r.ingredients.includes('chickpea')?'chickpea':r.ingredients.includes('tomato')?'tomato':r.ingredients[0];inside+=food(ingredient,-58+i*15,24+random()*10,.45,0,true);}s+=group(`<path d="M-88-57L84 39L-89 83Z" fill="#ba874c"/><path d="M-88-66L84 30L-89 71Z" fill="#ead6a9"/><path d="M-87-76L85 20L-87 59Z" fill="${filling}"/>${inside}<path d="M-90-94L90 12L-90 50Z" fill="#b98345"/><path d="M-80-83L77 9L-80 39Z" fill="#e8d09e"/>`+Array.from({length:10},(_,i)=>circle(-62+(i*21)%105,-61+(i*17)%77,1.5,'#c0a270')).join(''),x,y,1,rot);}return s;}
function flatbread(r,filled=false) {let s=plate();if(filled){s+=group(`<path d="M-155 80Q-201-96 0-115Q201-96 155 80Z" fill="#c79d5d"/><path d="M-148 68Q-182-88 0-102Q182-88 148 68Z" fill="#e4c98f"/>`,320,228);s+=line(179,280,458,280,'#7a8a52',7);}else{s+=ellipse(320,222,173,107,'#bc8b49')+ellipse(320,216,164,100,'#e4ca93');}return s+scatter('oat',25,320,213,146,81,hash(r.id),.45);}
function bowlToppings(r,base='#e2d2aa') {let s=bowl(base);const items=r.ingredients.filter(i=>!['olive oil','vegetable oil','water','salt','garlic','onion','lemon','lime','cumin','paprika','curry powder','sugar'].includes(i)).slice(0,4);items.forEach((i,n)=>s+=scatter(i,12,275+(n%2)*84,171+Math.floor(n/2)*65,65,35,hash(r.id)+n,.72));return s+garnish(r);}
function soupColor(r) {if(r.ingredients.includes('beetroot'))return '#9c4350';if(r.ingredients.some(i=>/tomato/.test(i)))return '#b86243';if(r.ingredients.includes('carrot'))return '#d69452';if(r.ingredients.some(i=>/spinach|asparagus|baobab|leek/.test(i)))return '#8d9d64';if(r.ingredients.includes('mushroom')||r.ingredients.includes('chanterelle'))return '#ac956f';if(r.ingredients.includes('black bean'))return '#79624d';return '#d5c29a';}
function ingredientStudy(r) {
  const skip=/oil|extract|powder|sugar|salt|water|sauce|stock|vinegar|flour|spice|paste|juice/;
  const major=/chicken|beef|pork|lamb|fish|salmon|shrimp|snail|sausage|plantain|potato|radish|courgette|rice|noodle|cauliflower|spinach|leek|cheese|almond|rhubarb|bean|apple|banana|egg|orange|lemon/;
  let selected=r.ingredients.filter(i=>!skip.test(i)).sort((a,b)=>Number(major.test(b))-Number(major.test(a))).slice(0,4);if(selected.length<4)selected=[...new Set([...selected,...r.ingredients])].slice(0,4);
  let s=rect(107,74,426,264,'#e4dcc7',22,'transform="rotate(-3 320 206)" filter="url(#soft-shadow)"')+rect(115,82,410,248,'#f0e6d1',18,'transform="rotate(-3 320 206)"');
  const places=[[226,157],[411,157],[226,263],[411,263]];
  selected.forEach((name,i)=>{const [x,y]=places[i];s+=ellipse(x,y+20,58,19,'#b9b39c','opacity=".18"')+food(name,x,y,1.65,((hash(name)%3)-1)*12);s+=`<text x="${x}" y="${y+56}" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#56604a">${xml(name)}</text>`;});
  return s;
}
function cake(r,type) {let s=plate();const chocolate=r.ingredients.some(i=>/chocolate|cocoa/.test(i));const top=chocolate?'#70503b':'#cfab6a';if(type==='cheesecake')s+=`<path d="M192 270L320 151L459 271L317 320Z" fill="#6d4c37"/><path d="M192 252L320 133L459 253L317 300Z" fill="#c7a581"/><path d="M192 235L320 116L459 236L317 283Z" fill="#684633"/>`;
  else {s+=`<path d="M174 183V268Q320 348 466 268V183Z" fill="#b38a50"/>`+ellipse(320,183,146,85,top);if(r.id==='tarta-de-santiago'){s+=`<path d="M307 155h26v15h16v20h-16v43h-26v-43h-16v-20h16Z" fill="#e7d6b4"/>`;}else s+=scatter(r.ingredients.includes('almond')?'almond':r.ingredients.includes('apple')?'apple-slice':chocolate?'chocolate':'oat',12,320,177,115,55,hash(r.id),.5);}return s;}
function cookiePlate(r,meringue=false) {let s=plate();
 if(r.id==='shortbread'||r.id==='hermits'){
  for(let i=0;i<6;i++){const x=218+(i%3)*102,y=171+Math.floor(i/3)*101;let item=rect(-40,-31,80,62,r.id==='hermits'?'#8e673d':'#d1b478',5)+rect(-40,-40,80,62,r.id==='hermits'?'#b18a57':'#e3cb92',5);if(r.id==='hermits')item+=scatter('raisin',6,0,-10,29,20,hash(r.id)+i,.5);else for(let j=0;j<8;j++)item+=circle(-24+(j%4)*16,-24+Math.floor(j/4)*21,2,'#aa8e5c');s+=group(item,x,y,1,-7);}return s;
 }
 if(r.id==='christmas-cinnamon-cookies'){
  for(let i=0;i<6;i++){const x=216+(i%3)*104,y=163+Math.floor(i/3)*109;const points=Array.from({length:10},(_,j)=>{const a=-Math.PI/2+j*Math.PI/5,d=j%2?23:47;return Math.cos(a)*d+','+Math.sin(a)*d;}).join(' ');s+=group('<polygon points="'+points+'" fill="#c5a16c" stroke="#ac8654" stroke-width="3"/>',x,y,1,13+i*5);}return s;
 }
 for(let i=0;i<7;i++){const x=217+(i%3)*102,y=164+Math.floor(i/3)*70;if(meringue)s+=group(`<path d="M-36 18Q-45-2-15-20Q-4-27 2-47Q7-22 28-13Q50 4 35 19Q0 38-36 18Z" fill="#f8f1db" stroke="#dfd6bc" stroke-width="2"/>`,x,y);else{s+=ellipse(x,y,45,33,'#ab814a')+ellipse(x,y-5,44,31,'#d6b780');if(r.ingredients.some(n=>/chocolate/.test(n)))for(let j=0;j<6;j++)s+=circle(x-25+(j*17)%53,y-19+(j*23)%35,4,'#664735');else s+=scatter('oat',7,x,y-5,27,17,i,.35);}}return s;}
function muffins(r) {let s=plate();for(const [x,y] of [[223,231],[397,245],[318,144]]){const dark=r.ingredients.some(i=>/chocolate|cocoa/.test(i));s+=group(`<path d="M-47-9L-36 60Q0 76 36 60L47-9Z" fill="#b4ab91"/>`+[-30,-15,0,15,30].map(x=>line(x,-3,x*.75,59,'#eee7d3',3)).join('')+`<path d="M-52-4C-73-34-39-61-20-51C-1-78 26-59 31-46C67-46 75-14 48 0Q0 20-52-4Z" fill="${dark?'#70513b':'#bca06b'}"/>`+scatter(dark?'chocolate':'cranberry',8,0,-28,35,18,hash(r.id),.33),x,y,.9);}return s;}
function foodDishes(r,type){
 let s=''; const seed=hash(r.id);
 if(type==='ingredient-study')return ingredientStudy(r);
 if(['bean-toast','mushroom-toast','egg-toast'].includes(type))return toastMeal(r,type);
 if(type==='mug-cake')return ellipse(320,342,147,24,'#79876b','opacity=".15"')+cup(310,238,1.27,'mug')+food('banana',170,303,.8,30);
 if(type==='berry-cups')return ellipse(322,345,205,23,'#819078','opacity=".13"')+cup(220,235,1.03,'yogurt')+cup(417,227,1.03,'yogurt')+food('lemon',510,320,.85,-20);
 if(type==='smoothie')return ellipse(320,350,110,21,'#819078','opacity=".13"')+cup(322,235,1.2,'smoothie')+food('banana',205,325,.9,15);
 if(type==='sandwich')return sandwich(r);
 if(type==='banana-pancakes'||type==='pancakes')return pancakeStack(r,type==='banana-pancakes');
 if(type==='cookies'||type==='meringues')return cookiePlate(r,type==='meringues');
 if(type==='muffins')return muffins(r);
 if(type==='cake'||type==='cheesecake')return cake(r,type);
 if(type==='flatbread-plain'||type==='filled-flatbread')return flatbread(r,type==='filled-flatbread');
 if(type==='pitta'){s=plate();for(const [x,y,a]of[[226,230,-13],[420,225,14]]){s+=group(`<path d="M-80-71Q-105 71 0 99Q105 71 80-71Z" fill="#bb925b"/><path d="M-75-64Q0-87 75-64Q68-30 0-20Q-68-30-75-64Z" fill="#d4bb8b"/>`+scatter('cucumber',5,0,-51,48,18,seed,.63)+scatter('pepper-strip',7,0,-42,51,16,seed+1,.72)+`<path d="M-78-40Q0-15 78-40Q88 55 0 94Q-88 55-78-40Z" fill="#e3c995"/>`+Array.from({length:12},(_,i)=>circle(-47+(i*19)%98,-7+(i*23)%68,2,'#c6a876')).join(''),x,y,1,a);}return s;}
 if(type==='wraps') {s=plate();for(const [x,y,a]of[[230,222,-16],[420,226,15]]){let filling=scatter(type==='wraps'?'lettuce':'bell pepper',9,0,-8,57,61,seed,.75)+scatter(type==='wraps'?'chickpea':'chickpea',13,0,0,47,65,seed+2,.65);s+=group(`<path d="M-80-93Q0-139 80-93L75 76Q0 124-75 76Z" fill="#c49b62"/>${filling}<path d="M-80-37Q-32-19 28 25L-13 106Q-53 106-75 77Z" fill="#e6ce98"/><path d="M79-32Q44-20-14 26L13 106Q54 101 75 77Z" fill="#dabc84"/>`,x,y,.87,a);}return s;}
 if(type==='skillet-eggs'){s=skillet('#608358')+scatter('spinach',34,320,222,163,96,seed,1);for(const p of[[243,197],[355,174],[395,254],[267,271]])s+=food('egg',...p,2.05,-10);return s+scatter('feta',18,320,225,165,91,seed,.4);}
 if(type==='frittata'||type==='omelette'||type==='scramble') {s=skillet('#ddbd65');if(type==='frittata')s+=scatter('courgette',11,320,222,150,80,seed,1.05)+scatter('pea',32,320,222,158,91,seed+2,.7);else if(type==='omelette'&&r.id==='chickpea-omelette')s+=ellipse(320,222,175,101,'#caa64f')+ellipse(320,216,174,98,'#debb62')+scatter('paprika',38,320,216,151,83,seed,.5);else if(type==='omelette')s+=`<path d="M164 268Q150 99 325 114Q489 102 483 270Q326 326 164 268Z" fill="#e6c778"/><path d="M174 268Q328 302 474 268" fill="none" stroke="#bc9348" stroke-width="6"/>`;else s+=scatter('egg',32,320,222,150,80,seed,1);return s+garnish(r);}
 if(type==='tomato-pasta'||type==='sardine-pasta'||type==='pasta'||type==='noodles'||type==='raw-pasta'||type==='peanut-noodles') {s=plate();const noodle=type==='noodles'||type==='peanut-noodles'||/spaghetti|fresca/.test(r.id);s+=noodle?noodleNest(320,218,141,77,seed,r.ingredients.includes('spinach')?'#94a465':'#dec388'):scatter('pasta',64,320,220,150,84,seed,1);if(r.ingredients.includes('tomato'))s+=scatter('tomato',12,320,218,140,80,seed+1,.72);if(r.ingredients.includes('mushroom'))s+=scatter('mushroom',9,320,218,140,80,seed+2,.7);if(type==='sardine-pasta')s+=food('sardine',255,200,1.05,25)+food('sardine',375,240,1.05,-20);if(type==='peanut-noodles')s+=scatter('carrot-ribbon',12,320,218,140,70,seed+3,.7)+scatter('peanut',8,320,218,140,70,seed+4,.3)+food('lime',443,287,1.25);if(r.ingredients.includes('shrimp'))s+=scatter('shrimp',8,320,218,140,70,seed+4,.9);return s+garnish(r);}
 if(type==='couscous'){s=bowl('#dfc796')+grain('oat',195,320,202,162,91,seed)+scatter('chickpea',28,320,201,157,83,seed+1,.65)+scatter('cucumber',10,320,202,155,84,seed+2,.64);return s+garnish(r)+food('lemon',453,278,1.14);}
 if(type==='green-rice'){s=bowl('#e3dcc1')+grain('rice',200,320,202,159,89,seed)+scatter('broccoli',9,252,183,61,43,seed,1.05)+scatter('pea',46,373,171,63,36,seed+1,.8)+scatter('pea',20,350,258,85,29,seed+2,.8);return s+`<path d="M221 225Q320 169 433 240M223 255Q320 199 411 269" stroke="#a0b376" stroke-width="14" stroke-linecap="round" fill="none"/>`;}
 if(type==='sweet-potato-bowl'){s=bowl('#e8dcc0')+scatter('sweet-potato-cube',24,251,191,68,55,seed,.83)+scatter('black bean',31,389,185,62,46,seed+2,.74)+food('avocado',337,263,1.8,-37)+food('lime',453,267,1);return s+garnish(r);}
 if(type==='orzo'){return bowl('#dcca99')+grain('orzo',175,320,204,160,88,seed)+scatter('pea',45,320,204,157,83,seed+1,.7)+food('lemon',441,271,1.3)+garnish(r);}
 if(type==='polenta'){s=bowl('#e5cb84')+`<path d="M190 215C220 149 428 148 445 215C433 272 234 274 221 224C236 188 394 185 410 220" fill="none" stroke="#f0dea5" stroke-width="12" stroke-linecap="round"/>`;return s+scatter('mushroom',16,323,207,115,63,seed,1.06)+garnish(r);}
 if(type==='roast-tray'){s=tray()+scatter('cauliflower',14,320,210,142,73,seed,1.19)+scatter('chickpea',38,320,210,158,82,seed+1,.67);return s+garnish(r);}
 if(type==='jacket-potatoes'){s=plate();for(const [x,y,a]of[[227,225,-18],[412,225,17]])s+=group(ellipse(0,0,78,109,'#a27b4a')+ellipse(0,0,64,92,'#d8c399')+`<path d="M0-88Q-27-4 0 89Q28 2 0-88" fill="#f0dfb6"/>`+scatter('broccoli',7,0,0,42,63,seed,.7)+scatter('cheddar',14,0,0,48,66,seed+2,.35),x,y,1,a);return s;}
 if(type==='tofu-rice'){return bowl('#e3d9b9')+grain('rice',160,320,206,161,90,seed)+scatter('broccoli',11,251,204,68,58,seed+1,1.12)+scatter('tofu',18,392,199,60,59,seed+2,1)+garnish(r);}
 if(type==='tomato-rice'){return skillet('#c47b43')+grain('orzo',165,320,222,166,94,seed)+scatter('kidney bean',32,320,222,166,94,seed+1,.74)+scatter('tomato',10,320,222,166,94,seed+2,.62)+garnish(r);}
 if(type==='lentil-curry'||type==='carrot-soup'||type==='bean-soup'){const base=type==='carrot-soup'?'#d0924b':type==='lentil-curry'?'#c88743':'#d9d4ad';s=bowl(base);if(type==='lentil-curry')s+=scatter('red lentil',45,320,202,158,83,seed,.46)+scatter('spinach',12,320,202,140,74,seed,.6);if(type==='bean-soup')s+=scatter('white bean',27,320,202,158,83,seed,.81)+garnish(r)+food('lemon',449,272,.9);if(type==='carrot-soup')s+=`<path d="M224 218C245 163 422 169 424 214C415 255 254 257 258 213C270 188 377 188 378 212" fill="none" stroke="#e3ab63" stroke-width="9" stroke-linecap="round"/>`;return s;}
 if(type==='flatbread'){s=plate()+flatbread(r).replace(plate(),'');for(const [x,y]of[[230,195],[303,157],[385,182],[417,245],[320,265],[230,260]])s+=food('tomato',x,y,1.1)+food('mozzarella',x+22,y+18,1.04,15);return s+garnish(r);}
 if(type==='chickpea-skillet'){return skillet('#bd633d')+scatter('chickpea',64,320,222,166,94,seed,.85)+scatter('tomato',10,320,222,166,94,seed+1,.68)+garnish(r);}
 if(type==='courgette-pan'){return skillet('#bcc393')+scatter('courgette',18,320,220,159,90,seed,1.08)+scatter('white bean',36,320,222,164,92,seed+1,.8)+food('lemon',453,277,1)+garnish(r);}
 if(type==='tuna-salad'||type==='apple-salad'){s=bowl('#e4dcc0')+scatter(type==='tuna-salad'?'white bean':'chickpea',48,320,204,162,88,seed,.78);if(type==='tuna-salad')s+=scatter('tuna',7,320,204,132,73,seed+1,.74)+food('lemon',451,267,.95);else s+=scatter('cucumber',13,320,204,153,80,seed+2,.81)+scatter('apple-slice',12,320,204,142,78,seed+3,.81);return s+garnish(r);}
 if(type==='porridge'||type==='yogurt-bowl'){s=bowl(type==='porridge'?'#d0bf98':'#f2edda');if(type==='porridge')s+=grain('oat',85,320,202,155,84,seed)+scatter('apple-slice',9,320,204,113,57,seed+1,1);else s+=scatter('strawberry',12,277,200,83,65,seed,.95)+scatter('oat',55,397,202,49,72,seed+1,.6);return s+spoon();}
 if(type==='hummus'){return bowl('#dcc494')+`<path d="M200 212C205 146 433 146 443 208C447 271 233 282 221 216C222 176 401 172 412 212C416 246 264 247 257 217" fill="none" stroke="#bda572" stroke-width="6"/>`+scatter('chickpea',8,330,206,51,31,seed,.8)+food('lemon',451,277,1.15);}
 if(type==='breakfast-plate'){return plate()+ellipse(244,213,84,62,'#d8bf8d')+scatter('chickpea',7,244,213,47,31,seed,.6)+scatter('cucumber',10,374,166,58,35,seed+1,1.02)+scatter('feta',15,395,261,63,39,seed+2,.85)+food('lemon',197,295,.9);}
 if(type==='roast-chickpeas'){return tray()+scatter('chickpea',105,320,211,152,82,seed,.85);}
 if(type==='apple-rounds'){s=plate();for(const [x,y]of[[215,178],[326,155],[425,204],[262,271],[374,280]])s+=circle(x,y,43,'#b96c49')+circle(x,y,38,'#ebdbac')+circle(x,y,30,'#bc925a')+scatter('oat',9,x,y,24,20,seed+x,.5);return s;}
 if(type==='cinnamon-apples'){s=bowl('#d8caa4')+scatter('apple-slice',22,320,205,146,75,seed,1.25)+scatter('cinnamon',12,320,205,140,70,seed+1,.18);return s;}
 if(type==='berry-crumble'||type==='cobbler'){s=group(rect(143,97,354,245,'#a97e65',35,'filter="url(#shadow)"')+rect(157,109,326,216,'#d5bea1',28)+rect(170,122,300,190,type==='berry-crumble'?'#884a55':'#b98b51',23),0,0,1,-4);s+=scatter(type==='berry-crumble'?'blueberry':'apple-slice',25,320,215,137,80,seed,.82)+scatter('oat',115,320,208,139,77,seed+1,.7);return s;}
 if(type==='burger'){s=plate();const meat=r.ingredients.includes('beef');s+=ellipse(320,289,145,54,'#bd8845')+ellipse(320,276,145,49,'#e0b96d')+`<path d="M177 257q20-23 40 0q20-23 40 0q20-23 40 0q20-23 40 0q20-23 40 0q20-23 40 0v18H177Z" fill="#759456"/>`+ellipse(320,246,144,48,meat?'#785237':'#947440')+ellipse(320,232,140,44,'#b86442')+`<path d="M174 207Q181 91 320 97Q459 91 466 207Q320 270 174 207Z" fill="#d4a65e"/>`+scatter('oat',22,320,174,113,48,seed,.48);return s;}
 if(type==='hotdog'){s=plate()+group(ellipse(0,0,175,68,'#b48147')+ellipse(0,-6,167,60,'#e0bd7d')+rect(-150,-31,300,57,'#9b5e39',28)+line(-130,-11,130,8,'#c5a24f',8),320,222,1,-13);return s+garnish(r);}
 if(type==='deviled-eggs'){s=plate();for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=group(ellipse(0,0,38,25,'#f8f3de')+ellipse(3,0,21,16,'#ddb754')+ellipse(0,-3,14,10,'#e9cc75'),320+Math.cos(a)*125,222+Math.sin(a)*76,1,a*180/Math.PI);}return s;}
 if(type==='fish-chips'){s=plate()+scatter('fries',24,390,227,74,70,seed,.86)+group(`<path d="M-118 10Q-35-52 113-28L126 20Q8 74-118 10Z" fill="#b58546"/><path d="M-106 5Q-30-41 103-22L115 12Q8 60-106 5Z" fill="#d1ad65"/>`,262,213,1,20)+food('lemon',196,291,1);return s;}
 if(type==='salmon'||type==='breaded-fish'){s=plate()+group(`<path d="M-120-47Q-35-78 118-42L102 65Q-14 85-123 37Z" fill="${type==='salmon'?'#c37e5d':'#b88b4e'}"/><path d="M-108-44Q-29-65 105-37L93 53Q-12 68-110 30Z" fill="${type==='salmon'?'#e7a98b':'#d8b777'}"/>`+Array.from({length:6},(_,i)=>line(-85+i*34,-40,-65+i*32,48,type==='salmon'?'#f4cab0':'#b5985f',3)).join(''),320,221,1.05,-10);return s+garnish(r)+food('lemon',460,281,1.1);}
 if(type==='fishcakes'){s=plate();for(const [x,y]of[[240,192],[398,204],[316,290]])s+=ellipse(x,y,65,38,'#aa7f43')+ellipse(x,y-8,64,37,'#d0b474')+scatter('oat',15,x,y-10,48,25,seed+x,.35);return s+garnish(r);}
 if(type==='roast-potatoes'){return tray()+scatter('potato',18,320,211,150,78,seed,1.25)+garnish(r);}
 if(type==='sausage-mash'){s=plate()+ellipse(320,232,153,84,'#e5d6a7');for(let i=0;i<3;i++)s+=group(rect(-94,-21,188,42,'#9e6039',21)+line(-68,-5,68,-5,'#bd8351',5),286+i*32,185+i*34,1,-17);return s;}
 if(type==='meatballs'){s=plate();for(const p of[[235,185],[337,153],[423,210],[360,273],[251,279]])s+=circle(p[0],p[1],44,'#9a593a')+circle(p[0]-6,p[1]-7,36,'#b36c43')+scatter('parsley',3,p[0],p[1],20,20,seed,.3);return s;}
 if(type==='drumsticks'){s=plate();for(const [x,y,a]of[[234,230,-25],[371,194,38],[391,279,5]])s+=group(rect(-13,-85,26,90,'#e5d6ac',10)+ellipse(0,17,44,66,'#a46e38')+ellipse(-7,8,30,46,'#c99857'),x,y,.92,a);return s+garnish(r);}
 if(type==='roast-chicken'){s=tray()+food('chicken',319,217,4,-8)+scatter('onion',10,320,211,150,80,seed,.85);return s;}
 if(type==='drink'){s=ellipse(320,348,100,20,'#86937d','opacity=".13"')+cup(320,234,1.2,r.id==='ayran-turkish-yogurt-drink'?'plain':'beer');return s;}
 if(type==='fool'){return cup(237,241,1,'fool')+cup(413,228,1,'fool');}
 if(type==='soup'||type==='noodle-soup'||type==='curry'||type==='rice'||type==='tofu'||type==='salad'||type==='dip'){s=bowl(soupColor(r));if(type==='rice')s+=grain('rice',180,320,201,158,86,seed);if(type==='noodle-soup')s+=noodleNest(320,202,129,67,seed);if(type==='tofu')s+=scatter('tofu',27,320,202,155,84,seed,1);const omit=/oil|water|salt|stock|sauce|powder|vinegar|flour|milk|cream|sugar|butter|rice|noodle/;const foods=r.ingredients.filter(i=>!omit.test(i)).slice(0,4);foods.forEach((n,i)=>s+=scatter(n,type==='salad'?17:7,320,202,157,85,seed+i,type==='salad'?.8:.65));return s+garnish(r);}
 if(type==='breakfast'){return plate()+food('egg',237,182,2.6)+food('tomato',434,192,1.9)+scatter('white bean',20,403,283,63,33,seed,.75)+group(rect(-81,-19,162,38,'#9b633d',19),249,282,1,-20);}
 if(type==='fried-eggs'){s=plate();for(const [x,y]of[[235,220],[410,220]])s+=ellipse(x,y+25,83,45,'#bf995f')+ellipse(x,y+18,80,43,'#e7c990')+food('egg',x,y,3)+`<path d="M${x-48} ${y+2}Q${x} ${y-23} ${x+47} ${y+4}" fill="none" stroke="#e7c76c" stroke-width="20" stroke-linecap="round"/>`;return s;}
 if(type==='pie'||type==='tatin'||type==='banoffee'||type==='shepherd-pie'||type==='baked-pasta'){s=ellipse(320,252,211,114,'#b0b69b','opacity=".18"')+ellipse(320,223,213,133,'#d6d8c3')+ellipse(320,219,194,118,'#c39a5c');if(type==='pie'&&r.id==='radish-tart'){s+=ellipse(320,214,180,104,'#e1ca8c')+scatter('radish',23,320,214,157,88,seed,1.05);}else if(type==='pie') {s+=ellipse(320,214,180,104,'#dfc080');for(let i=-3;i<=3;i++)s+=line(193,218+i*20,447,218+i*20,'#c2a269',2);s+=line(300,191,314,228,'#a88a54',4)+line(332,191,345,228,'#a88a54',4);}if(type==='tatin')s+=scatter('apple-slice',24,320,214,162,91,seed,1.36);if(type==='banoffee')s+=ellipse(320,214,180,104,'#f1e6c8')+scatter('banana',18,320,214,162,91,seed,1.1);if(type==='shepherd-pie')s+=ellipse(320,214,180,104,'#e3c892')+Array.from({length:12},(_,i)=>line(186,156+i*11,451,156+i*11,'#c5a96e',4)).join('');if(type==='baked-pasta')s+=scatter('pasta',70,320,214,161,91,seed,.9)+scatter('cheddar',20,320,214,157,88,seed+1,.45);return s+garnish(r);}
 if(type==='churros'){s=plate();for(let i=0;i<7;i++)s+=group(rect(-101,-12,202,24,'#b48043',10)+line(-92,-5,92,-5,'#e0b774',3)+line(-92,4,92,4,'#d6a961',3),320+(i%2)*22,151+i*25,1,-17);return s;}
 if(type==='mochi'){s=plate();for(const [x,y]of[[226,184],[372,172],[425,256],[285,278]])s+=ellipse(x,y,65,47,'#e6dfcc')+ellipse(x,y-10,62,46,'#f1ecdf')+ellipse(x-17,y-25,20,11,'#faf6ee');return s;}
 if(type==='oat-bars'||type==='cornbread'){s=plate();for(let i=0;i<6;i++)s+=group(rect(-46,-29,92,58,type==='cornbread'?'#ceab5f':'#b79658',4)+rect(-46,-39,92,58,type==='cornbread'?'#e5c67e':'#ccb27a',4)+scatter('oat',type==='cornbread'?10:25,0,-9,37,22,seed+i,.4),218+i%3*102,173+Math.floor(i/3)*94,1,-8);return s;}
 if(type==='rolls'){s=plate();for(const [x,y]of[[227,184],[384,174],[425,268],[267,281]])s+=ellipse(x,y,64,45,'#b38d53')+ellipse(x,y-10,64,45,'#ddbe83')+line(x-22,y-30,x+19,y+3,'#f0d6a6',6);return s;}
 throw Error('Unhandled artwork type ' + type);
}

const descriptions={
 'tomato-pasta':'Short pasta with cooked tomatoes and basil on a ceramic plate.',
 'couscous':'A bowl of couscous with chickpeas, sliced cucumber, parsley and lemon.',
 'green-rice':'Rice, broccoli and peas with green avocado dressing in a ceramic bowl.',
 'lentil-curry':'An orange lentil and coconut curry with wilted spinach.',
 'orzo':'Small orzo pasta with green peas and a lemon slice in a bowl.',
 'sweet-potato-bowl':'Roasted sweet potato cubes, black beans and avocado arranged in a bowl.',
 'bean-toast':'Two slices of toast topped with white beans, cooked tomatoes and herbs.',
 'polenta':'Creamy yellow polenta swirled in a bowl and topped with mushrooms.',
 'roast-tray':'Roasted cauliflower florets and chickpeas on a metal baking tray.',
 'tofu-rice':'Golden tofu cubes, broccoli and rice in a ceramic bowl.',
 'tomato-rice':'Tomato rice and kidney beans in a dark skillet.',
 'bean-soup':'White bean soup with herbs and a lemon slice.',
 'carrot-soup':'Smooth orange carrot, ginger and lentil soup with a visible surface swirl.',
 'frittata':'A round egg frittata with courgette slices and peas in a skillet.',
 'chickpea-skillet':'Chickpeas simmered in a red tomato sauce in a dark skillet.',
 'tuna-salad':'White beans and tuna flakes with herbs and lemon in a bowl.',
 'apple-salad':'Chickpeas, cucumber rounds and apple slices in a salad bowl.',
 'porridge':'A bowl of oat porridge topped with apple slices, with a spoon beside it.',
 'yogurt-bowl':'A yogurt bowl topped with fresh strawberry pieces and oats.',
 'mushroom-toast':'Two slices of toast topped with mushrooms and spinach.',
 'egg-toast':'Two slices of toast topped with scrambled eggs, cooked tomatoes and basil.',
 'hummus':'A bowl of hummus with a spiral surface, chickpeas and lemon.',
 'roast-chickpeas':'Golden roasted chickpeas spread over a baking tray.',
 'cinnamon-apples':'Warm sliced apples with cinnamon in a ceramic bowl.',
 'berry-crumble':'A small baking dish filled with berries and a scattered oat crumble topping.',
 'courgette-pan':'Courgette rounds and white beans with lemon in a dark skillet.',
 'mug-cake':'A chocolate cake risen in a green handled mug, with banana slices on top.',
 'berry-cups':'Two clear cups layered with lemon yogurt, strawberries and blueberries.',
 'sandwich':'Two assembled triangular sandwiches, with their filling visible between slices of bread.',
 'peanut-noodles':'A nest of noodles with carrot, peanut pieces and a lime slice on a ceramic plate.',
 'smoothie':'A tall glass of creamy banana and peanut smoothie with a straw.',
 'jacket-potatoes':'Two split baked potatoes filled with broccoli and cheddar.',
 'pitta':'Two filled pita pockets with hummus and roasted red pepper.',
 'wraps':'Two folded tortillas with crisp chickpeas and salad visible inside.',
 'banana-pancakes':'A stack of oat pancakes topped with banana slices.',
 'skillet-eggs':'Whole eggs cooked over spinach in a dark skillet, scattered with feta.',
 'flatbread':'A baked flatbread topped with tomato and mozzarella.',
 'apple-rounds':'Apple rounds spread with peanut butter and sprinkled with oats.',
 'breakfast-plate':'Hummus, sliced cucumber and feta arranged separately on a breakfast plate.',
};
const manifest={};
const out=path.join(root,'images','recipes');fs.mkdirSync(out,{recursive:true});
for(const recipe of catalog){
 const p=profiles[recipe.id];if(!p)throw Error('Missing explicit artwork profile: '+recipe.id);
 const study=p.type==='ingredient-study';
 const desc=study?`${recipe.name}: a labelled ingredient study showing foods from this recipe, rather than a representation of the finished dish.`:`${recipe.name}. ${descriptions[p.type]||'An original illustration of the recipe’s identified food form and listed ingredients.'}`;
 const titleId='title-'+recipe.id,descId='desc-'+recipe.id;
 const background=study?'#f0ede1':recipe.category==='dessert'?'#f1e8dc':recipe.category==='breakfast'?'#f1eddf':'#e9eddf';
 foodSymbols=new Map();
 const scene=foodDishes(recipe,p.type);
 const ingredientDefs=[...foodSymbols].map(([id,shape])=>`<g id="${id}">${shape}</g>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" width="640" height="420" role="img" aria-labelledby="${titleId} ${descId}"><title id="${titleId}">${xml(recipe.name)}</title><desc id="${descId}">${xml(desc)}</desc><defs><linearGradient id="ceramic" x2="0.8" y2="1"><stop stop-color="#fffbef"/><stop offset=".65" stop-color="#f0eddf"/><stop offset="1" stop-color="#d9ddc9"/></linearGradient><linearGradient id="mug"><stop stop-color="#5c7c69"/><stop offset=".4" stop-color="#9bb19c"/><stop offset="1" stop-color="#6e8e78"/></linearGradient><filter id="shadow" x="-30%" y="-40%" width="170%" height="190%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#3e543b" flood-opacity=".17"/></filter><filter id="soft-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#4a573d" flood-opacity=".15"/></filter>${ingredientDefs}</defs><rect width="640" height="420" fill="${background}"/><path d="M0 330L640 147V420H0Z" fill="#fffdf3" opacity=".24"/><path d="M0 347L640 164" stroke="#fffdf6" stroke-width="2" opacity=".45"/>${scene}</svg>\n`.replace(/-?\d+\.\d{4,}/g,n=>String(Number(Number(n).toFixed(2))));
 const src=`images/recipes/${recipe.id}.svg`;fs.writeFileSync(path.join(root,src),svg);
 manifest[recipe.id]={src,alt:desc,kind:study?'ingredient-study':'dish-illustration',profile:p.type};
}
const catalogIds=new Set(catalog.map(r=>r.id));for(const id of Object.keys(profiles))if(!catalogIds.has(id))throw Error('Profile is not in catalog: '+id);
fs.writeFileSync(path.join(root,'recipe-art-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(root,'recipe-art.js'),'/* Generated by scripts/generate-recipe-art.js. Original recipe-specific SVG artwork. */\nwindow.RECIPE_ART = '+JSON.stringify(manifest,null,2)+';\n');
console.log(`Generated ${Object.keys(manifest).length} recipe illustrations: ${Object.values(manifest).filter(m=>m.kind==='dish-illustration').length} dish illustrations and ${Object.values(manifest).filter(m=>m.kind==='ingredient-study').length} labelled ingredient studies.`);
