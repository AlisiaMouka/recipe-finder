/* Recipe Finder search and planning. Pure functions, no network or browser storage.
 * Dietary labels describe the listed ingredients, including optional additions.
 * They are not an allergy guarantee: packaged ingredients and cross-contact vary.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KitchenEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FAMILIES = {
    cheese: ['cheddar','feta','mozzarella','parmesan','goat cheese','gouda','gruyere','pecorino','ricotta','blue cheese','swiss cheese','cream cheese','halloumi','brie','camembert','mascarpone'],
    meat: ['chicken','beef','pork','lamb','bacon','ham','chicken stock','beef stock','sausage','turkey','venison','corned beef','lard','veal','biltong','snail','pancetta','chorizo','pork blood','duck','suet','gelatin','prosciutto','salami','steak','mince'],
    fish: ['salmon','tuna','cod','fish stock','shrimp','catfish','crayfish','imitation crab','shrimp paste','fish sauce','smoked salmon','hake','oyster','anchovy','sardine','mackerel','trout','haddock','crab','clam','mussel','lobster','scallop','squid','octopus','worcestershire sauce'],
    shellfish: ['shrimp','crayfish','imitation crab','shrimp paste','oyster','crab','clam','mussel','lobster','scallop','squid','octopus','snail'],
    dairy: ['cheese','milk','cream','butter','ghee','yogurt','sour cream','buttermilk','condensed milk','evaporated milk','white sauce','cream of celery soup','tzatziki','margarine'],
    vegetable: ['tomato','onion','garlic','spinach','carrot','pea','bell pepper','mushroom','potato','leek','cucumber','lettuce','avocado','courgette','aubergine','broccoli','sweet potato','cauliflower','asparagus','green bean','butternut squash','cabbage','kale','beetroot','celery'],
    fruit: ['banana','lemon','lime','apple','orange','strawberry','peach','cranberry','mango','blueberry','raspberry','pear','pineapple'],
    spice: ['cumin','curry powder','ginger','paprika','cinnamon','chili','turmeric','coriander seed','cumin seed','allspice','nutmeg'],
    herb: ['basil','dill','coriander','parsley','mint','oregano','thyme','rosemary','sage','tarragon','bay leaf'],
    rice: ['basmati','jasmine rice','arborio','brown rice','sticky rice'],
    pasta: ['spaghetti','penne','fusilli','macaroni','rigatoni','farfalle','linguine','orzo'],
    noodle: ['rice noodle','egg noodle','udon','soba noodle'],
    stock: ['vegetable stock','chicken stock','beef stock','fish stock','stock cube'],
    bread: ['baguette','sourdough','pita','hamburger bun','wholemeal bread','rye bread'],
    bean: ['white bean','black bean','kidney bean','chickpea','cannellini bean','butter bean','lima bean','mixed bean','baked bean'],
    lentil: ['red lentil','green lentil','brown lentil'],
    tomato: ['cherry tomato','plum tomato'],
    onion: ['red onion','white onion','yellow onion'],
    nut: ['almond','walnut','pecan','cashew','hazelnut','pistachio','pine nut','candlenut','peanut'],
    oil: ['olive oil','vegetable oil','sunflower oil','sesame oil','peanut oil','almond oil','coconut oil'],
  };
  const ALIASES = {
    zucchini:'courgette', eggplant:'aubergine', 'garbanzo bean':'chickpea', garbanzo:'chickpea', capsicum:'bell pepper', cilantro:'coriander', scallion:'spring onion', 'green onion':'spring onion', prawn:'shrimp', 'bell pepper':'bell pepper', 'chilli':'chili', 'chilli pepper':'chili', 'chili pepper':'chili', 'red pepper':'bell pepper', 'green pepper':'bell pepper', 'sweet pepper':'bell pepper', 'caster sugar':'sugar', 'icing sugar':'powdered sugar', 'all purpose flour':'flour', 'all-purpose flour':'flour', 'plain flour':'flour', 'baking flour':'flour', 'ground beef':'beef', 'ground pork':'pork', 'minced beef':'beef', 'minced pork':'pork', 'chicken breast':'chicken', 'chicken thigh':'chicken', 'extra virgin olive oil':'olive oil', 'extra-virgin olive oil':'olive oil', 'chopped tomato':'tomato', 'diced tomato':'tomato', 'tinned tomato':'tomato', 'canned tomato':'tomato', 'canned chickpea':'chickpea', 'tinned chickpea':'chickpea', 'canned black bean':'black bean', 'canned white bean':'white bean', 'cannellini bean':'white bean', 'greek yogurt':'yogurt', yoghurt:'yogurt', 'greek yoghurt':'yogurt', 'natural yogurt':'yogurt', 'vegetable broth':'vegetable stock', 'chicken broth':'chicken stock', 'beef broth':'beef stock', broth:'stock', 'ground cumin':'cumin', 'ground cinnamon':'cinnamon', 'ground paprika':'paprika', 'rolled oat':'oat', 'porridge oat':'oat', 'arugula':'rocket', 'sweetcorn':'corn', 'sweet corn':'corn', 'lemon juice':'lemon', 'lime juice':'lime', 'basil leaf':'basil', 'spinach leaf':'spinach', 'mint leaf':'mint', 'coriander leaf':'coriander', 'parsley leaf':'parsley', 'garlic clove':'garlic', 'clove of garlic':'garlic', 'cloves of garlic':'garlic', 'fresh basil':'basil', 'fresh spinach':'spinach', 'basmati rice':'basmati', 'arborio rice':'arborio', 'brown lentil':'brown lentil', 'peanut butter':'peanut butter', 'ground black pepper':'black pepper', pepper:'black pepper', nuts:'nut', legumes:'bean', 'green salad':'lettuce', 'soya sauce':'soy sauce', 'soya milk':'soy milk', 'soya yogurt':'soy yogurt', 'bicarbonate of soda':'baking soda', 'self raising flour':'self-raising flour', 'chick pea':'chickpea', 'chick-pea':'chickpea', 'sun dried tomato':'sun-dried tomato', 'pita bread':'pita', pitta:'pita', 'pitta bread':'pita', 'gelatine':'gelatin'
  };
  const ALIAS_TARGETS = new Set(Object.values(ALIASES));
  const CATALOG_INDEX = new WeakMap();
  const EMPTY_CATALOG = [];
  const compareText = new Intl.Collator('en', {sensitivity:'base',numeric:true}).compare;
  const IRREGULAR = {leaves:'leaf', tomatoes:'tomato', potatoes:'potato', chillies:'chili', chilies:'chili', berries:'berry', strawberries:'strawberry', raspberries:'raspberry', blueberries:'blueberry', blackberries:'blackberry', cranberries:'cranberry', cherries:'cherry', anchovies:'anchovy', knives:'knife', loaves:'loaf', halves:'half', 'black-eyed peas':'black-eyed pea'};
  const NO_SINGULAR = new Set(['asparagus','couscous','hummus','molasses','watercress','lemongrass','swiss','citrus','anise','rice','miso','pasta','passata','tahini','nutmeg','oats','five spice']);
  const STAPLES = new Set(['salt','black pepper','water']);
  const COMMON = ['egg','tomato','onion','garlic','pasta','rice','chicken','spinach','chickpea','potato','carrot','cheese','milk','olive oil','lemon','broccoli','courgette','aubergine','avocado','mushroom','lentil','tofu','flour','butter','bread','yogurt','oat','banana','apple','bell pepper','bay leaf','quinoa','couscous','cucumber','tuna','salmon','feta','basil','coconut milk','black bean','white bean','red lentil','rocket','sesame seed','peanut butter'];

  function fold(text) { return String(text == null ? '' : text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }
  function normalizeIngredient(value) {
    let text = fold(value).replace(/[\u2018\u2019]/g,"'").replace(/[\u00bc\u00bd\u00be\u2153\u2154\u215b]/g,'1/2').replace(/\([^)]*\)/g,' ').replace(/\s+/g,' ');
    // Quantities belong to the recipe, not to an ingredient's search identity.
    // Articles come before units in natural phrases such as a can of beans.
    text = text.replace(/^(?:some|a few|a little|an?)\s+/,'');
    text = text.replace(/^(?:about\s+|approximately\s+)?(?:\d+(?:[.,]\d+)?(?:\s+\d+\/\d+|\/\d+)?)(?:\s*[-–]\s*\d+)?\s*(?:x\s*)?/,'');
    text = text.replace(/^(?:(?:fresh|large|medium|small)\s+)+/,'');
    text = text.replace(/^(?:(?:kg|g|mg|ml|cl|l|oz|lb|lbs|gram|grams|kilogram|kilograms|millilitre|millilitres|milliliter|milliliters|litre|litres|liter|liters|ounce|ounces|pound|pounds|cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|can|cans|tin|tins|packet|packets|pack|packs|bunch|bunches|handful|handfuls|slice|slices)\b\s*(?:of\s+)?)+/,'');
    text = text.replace(/^(?:some|a few|a little|an?|fresh|large|medium|small)\s+/g,'').replace(/^(?:fresh|large|medium|small)\s+/,'').replace(/\s*,.*$/,'').replace(/[.!?]+$/,'').trim();
    if (!text) return '';
    const words = text.split(' '), last = words[words.length-1];
    if (IRREGULAR[text]) text=IRREGULAR[text];
    else if (IRREGULAR[last]) { words[words.length-1]=IRREGULAR[last]; text=words.join(' '); }
    else if (!NO_SINGULAR.has(last)) {
      if (/ies$/.test(last)) words[words.length-1]=last.slice(0,-3)+'y';
      else if (/(?:ches|shes|xes|sses)$/.test(last)) words[words.length-1]=last.slice(0,-2);
      else if (/s$/.test(last) && !/(?:ss|us)$/.test(last)) words[words.length-1]=last.slice(0,-1);
      text=words.join(' ');
    }
    if(text==='oats') text='oat';
    const form=text.match(/^(cooked|raw|uncooked|dry|dried|frozen) (.+)$/);
    if(form) return (form[1]==='uncooked'?'raw':form[1])+' '+(ALIASES[form[2]] || form[2]);
    return ALIASES[text] || text;
  }
  function unique(values) { return [...new Set(values.filter(Boolean))]; }
  function parseIngredients(text) {
    // Strip only a recognised introduction, then split at list delimiters.
    // Spaces inside ingredient names and unknown words are preserved.
    const list=String(text || '').replace(/^\s*(?:(?:i|we)\s+have(?:\s+got)?|(?:i|we)['’]ve\s+got)(?:\s*:\s*|\s+|$)/i,'');
    return unique(list.split(/[,;\r\n+]+|\s+(?:and|&)\s+/i).map(normalizeIngredient)).slice(0,100);
  }
  function member(item,family,seen) {
    if(item===family) return true;
    seen=seen || new Set();
    if(seen.has(family)) return false;
    seen.add(family);
    return (FAMILIES[family] || []).some(child=>child===item || member(item,child,new Set(seen)));
  }
  function ingredientForm(value) {
    const name=normalizeIngredient(value), match=name.match(/^(cooked|raw|dry|dried|frozen) (.+)$/);
    return match ? {name,base:match[2],form:match[1]} : {name,base:name,form:''};
  }
  function covers(have,needed) {
    const a=ingredientForm(have), b=ingredientForm(needed);
    if(a.form==='cooked'&&b.form!=='cooked' || b.form==='cooked'&&a.form!=='cooked') return false;
    if(b.form&&a.form&&b.form!==a.form&&!['raw','dry'].includes(a.form)&&!['raw','dry'].includes(b.form)) return false;
    return member(a.base,b.base);
  }
  function isPlantAlternative(name) {
    return /^(?:coconut|soy|oat|almond|rice|cashew|peanut|sunflower|nut|cocoa|apple|plant|plant-based|vegan|vegetarian|mock)\b/.test(name);
  }
  function isExcluded(ingredient,excluded,seen) {
    const a=ingredientForm(ingredient).base, b=ingredientForm(excluded).base;
    if(a===b) return true;
    // Plant milks and nut butters are not dairy milk or butter. The ingredient
    // named by the exclusion still matches (e.g. peanut in peanut butter).
    if(b==='dairy') return inferredAllergens([a]).includes('dairy');
    if(['milk','cream','butter','cheese','yogurt'].includes(b)&&!inferredAllergens([a]).includes('dairy')) return false;
    if(['meat','fish','shellfish'].includes(b)&&/^(?:plant-based|vegan|vegetarian|mock)\b/.test(a)) return false;
    if(member(a,b) || member(b,a)) return true;
    seen=seen || new Set();
    if(!seen.has(b)) {
      seen.add(b);
      if((FAMILIES[b]||[]).some(child=>isExcluded(a,child,new Set(seen)))) return true;
    }
    return (' '+a.replace(/-/g,' ')+' ').includes(' '+b.replace(/-/g,' ')+' ');
  }
  function distance(a,b) {
    let prior=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++) { const row=[i]; for(let j=1;j<=b.length;j++) row[j]=Math.min(prior[j]+1,row[j-1]+1,prior[j-1]+(a[i-1]===b[j-1]?0:1)); prior=row; }
    return prior[b.length];
  }
  function tokens(text) { return fold(text).split(/[^a-z0-9]+/).filter(Boolean); }
  function tokenForms(text) { return unique(tokens(text).flatMap(t=>[t,...tokens(normalizeIngredient(t))])); }
  function indexCatalog(catalog) {
    const list=Array.isArray(catalog)?catalog:EMPTY_CATALOG;
    const entries=list.map((recipe,order)=>{
      const title=normalizeQuery(recipe.name), ingredients=recipe.ingredients||[];
      return {recipe,order,title,titleTokens:tokenForms(title),bodyTokens:tokenForms([title,recipe.cuisine,...ingredients,...recipe.diet||[]].join(' ')),ingredients,
        allIngredients:[...ingredients,...recipe.optional||[]],cuisine:fold(recipe.cuisine),diets:new Set(recipe.diet||[]),allergens:new Set(recipe.allergens||[]),
        amountRows:new Map((recipe.amounts||[]).map(row=>[normalizeIngredient(row.ingredient),row]))};
    });
    const names=unique([...COMMON,...Object.keys(FAMILIES),...Object.values(FAMILIES).flat(),...entries.flatMap(entry=>entry.allIngredients)]).sort(compareText);
    const words=new Set([...entries.flatMap(entry=>entry.bodyTokens),...names.flatMap(tokenForms)]);
    const index={entries,words,names,nameSet:new Set(names),length:list.length};
    CATALOG_INDEX.set(list,index);
    return index;
  }
  function getIndex(catalog) {
    const list=Array.isArray(catalog)?catalog:EMPTY_CATALOG, cached=CATALOG_INDEX.get(list);
    return cached&&cached.length===list.length?cached:indexCatalog(list);
  }
  // Catalogs are snapshots. Rebuild through buildCatalog after editing source
  // data, or call reindexCatalog after intentionally mutating a custom catalog.
  function reindexCatalog(catalog) { indexCatalog(catalog); }
  function knownIngredients(catalog) { return getIndex(catalog).names.slice(); }
  function isKnownIngredient(input,catalog) {
    const identity=ingredientForm(input), names=getIndex(catalog).nameSet;
    return !!identity.name&&(names.has(identity.name)||names.has(identity.base));
  }
  function suggestions(query,catalog,selected) {
    const text=normalizeIngredient(query).slice(0,120), chosen=new Set((selected||[]).map(normalizeIngredient));
    const scored=getIndex(catalog).names.filter(n=>!chosen.has(n)).map(name=>{
      if(!text) return {name,score:COMMON.includes(name)?COMMON.indexOf(name):1000};
      if(name===text) return {name,score:0};
      if(name.startsWith(text)) return {name,score:1+(name.length-text.length)/100};
      if(name.includes(text)) return {name,score:2};
      const allowed=text.length<=5?1:2;
      if(text.length<3||Math.abs(name.length-text.length)>allowed) return {name,score:Infinity};
      const d=distance(text,name); return {name,score:d<=allowed?3+d:Infinity};
    });
    return scored.filter(x=>Number.isFinite(x.score)).sort((a,b)=>a.score-b.score||compareText(a.name,b.name)).slice(0,8).map(x=>x.name);
  }

  function inferredAllergens(ingredients) {
    const found=new Set();
    for(const value of ingredients) {
      const i=ingredientForm(value).base;
      if(member(i,'dairy') || /(?:^|\s)(?:milk|cream|cheese|butter|yogurt)$/.test(i) && !isPlantAlternative(i)) found.add('dairy');
      if(member(i,'shellfish')) found.add('shellfish');
      else if(member(i,'fish') || i==='fish stock') found.add('fish');
      if(['egg','egg white','egg yolk','egg powder'].includes(i) || i==='egg noodle' || ['mayonnaise','russian dressing','imitation crab'].includes(i)) found.add('egg');
      if(/(?:^|[\s-])(?:almond|walnut|pecan|cashew|hazelnut|pistachio|candlenut|pine nut)(?:$|\s)/.test(i) || i==='nut' || i==='pesto') found.add('nuts');
      if(i.includes('peanut')) found.add('peanut');
      if(i.includes('sesame') || i==='tahini') found.add('sesame');
      if(['tofu','tempeh','miso','edamame','soy sauce','soy milk','soy yogurt','soybean'].includes(i) || /^soy\b/.test(i)) found.add('soy');
      if(member(i,'pasta') || member(i,'bread') || ['flour','whole wheat flour','self-raising flour','wheat bran','bulgur','couscous','semolina','barley','rye','malt vinegar','soy sauce','egg noodle','udon','soba noodle','breadcrumb','cracker','biscuit','cookie','chocolate cookie','pastry','phyllo dough','tortilla','white sauce','seitan','stock cube','oat'].includes(i)) found.add('gluten');
      if(i==='pesto' || i==='white sauce' || i==='chocolate' || i==='chocolate chip') found.add('dairy');
      if(i.includes('mustard')) found.add('mustard');
      if(i.includes('celery')) found.add('celery');
    }
    return [...found].sort();
  }
  function categoryOf(recipe) {
    if(['breakfast','lunch','dinner','snack','dessert'].includes(recipe.category)) return recipe.category;
    if(['cake','ice-cream'].includes(recipe.illustration) || /cookie|pudding|fool|brownie|dessert|daifuku|sweet|sorbet/i.test(recipe.name)) return 'dessert';
    if(['pancakes','yogurt-bowl','smoothie'].includes(recipe.illustration) || /porridge|breakfast|granola/i.test(recipe.name)) return 'breakfast';
    if(['salad','toast','soup'].includes(recipe.illustration)) return 'lunch';
    return 'dinner';
  }
  function slug(text) { return fold(text).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  function buildCatalog(legacy,extra,enriched=[]) {
    const ids=new Set(), enhancements=new Map((enriched||[]).filter(e=>e&&typeof e.originalName==='string').map(e=>[e.originalName,e]));
    const result=[...(legacy||[]),...(extra||[])].map((input,index)=>{
      const enhancement=index<(legacy||[]).length?(enhancements.get(input.name)||{}):{};
      const {originalName,id:ignoredId,name:ignoredName,source:ignoredSource,...updates}=enhancement;
      const original={...input,...updates,name:input.name,id:input.id,source:input.source?{...input.source}:input.source};
      const ingredients=unique((original.ingredients||[]).map(normalizeIngredient)).filter(x=>!STAPLES.has(x));
      const optional=unique((original.optional||[]).map(normalizeIngredient)).filter(x=>!ingredients.includes(x));
      const allergens=unique([...(original.allergens||[]),...inferredAllergens([...ingredients,...optional])]).sort();
      const all=[...ingredients,...optional];
      const animals=all.some(i=>isExcluded(i,'meat')||isExcluded(i,'fish')||isExcluded(i,'shellfish'));
      let diet=unique(original.diet||[]).filter(d=> !((d==='vegan'||d==='vegetarian') && animals) && !(d==='vegan' && (allergens.includes('dairy')||allergens.includes('egg')||all.includes('honey'))) && !(d==='gluten-free'&&allergens.includes('gluten')) && !(d==='dairy-free'&&allergens.includes('dairy')));
      if(diet.includes('vegan')&&!diet.includes('vegetarian')) diet.push('vegetarian');
      if(!allergens.includes('dairy')) diet.push('dairy-free');
      let id=original.id || slug(original.name);
      if(ids.has(id)) id=id+'-'+(index+1);
      ids.add(id);
      const amounts=Array.isArray(original.amounts) ? original.amounts.map(a=>({...a,ingredient:normalizeIngredient(a.ingredient)})) : [];
      const hasQuantities=ingredients.length>0 && Number.isFinite(original.servings)&&original.servings>0 && ingredients.every(i=>{
        const rows=amounts.filter(a=>a.ingredient===i);
        return rows.length===1&&Number.isFinite(rows[0].amount)&&rows[0].amount>0;
      });
      const recipe={...original,id,ingredients,optional,allergens,diet:unique(diet),steps:[...(original.steps||[])],category:categoryOf(original),amounts,hasQuantities,difficulty:original.difficulty||'Classic',description:original.description||`${original.cuisine||'World'} cooking, made with ${ingredients.slice(0,3).join(', ')}${ingredients.length>3?' and more':''}.`};
      if(original.name==='Christmas Cinnamon Cookies' && original.minutes<80) recipe.minutes=80;
      return recipe;
    });
    indexCatalog(result);
    return result;
  }
  function normalizeQuery(query) {
    const words=fold(query).split(/[^a-z0-9'-]+/).filter(Boolean), result=[];
    for(let i=0;i<words.length;) {
      let mapped=false;
      for(let width=Math.min(5,words.length-i);width>0;width--) {
        const phrase=words.slice(i,i+width).join(' '), canonical=normalizeIngredient(phrase);
        if(ALIASES[phrase] || (canonical!==phrase&&ALIAS_TARGETS.has(canonical))) {
          result.push(canonical); i+=width; mapped=true; break;
        }
      }
      if(!mapped) result.push(words[i++]);
    }
    return result.join(' ');
  }
  function prepareQuery(value,index) {
    const text=normalizeQuery(String(value||'').slice(0,300));
    const words=unique(tokens(text).filter(w=>!['recipe','recipes','with','and','the','for'].includes(w)));
    return {text,terms:words.map(raw=>{
      const term=normalizeIngredient(raw);
      return {raw,term,exact:index.words.has(raw)||index.words.has(term),fuzzy:new Map()};
    })};
  }
  function textScore(entry,query) {
    if(!query.terms.length) return 0;
    let score=entry.title===query.text?40:0;
    for(const q of query.terms) {
      const matches=token=>token===q.term||token===q.raw||(!q.exact&&q.raw.length>=3&&(token.startsWith(q.raw)||token.startsWith(q.term)));
      if(entry.titleTokens.some(matches)) score+=12;
      else if(entry.bodyTokens.some(matches)||entry.ingredients.some(i=>member(ingredientForm(i).base,q.term))) score+=4;
      else if(!q.exact&&q.raw.length>=4&&entry.bodyTokens.some(token=>{
        if(!q.fuzzy.has(token)) {
          const allowed=q.raw.length>=8?2:1;
          q.fuzzy.set(token,Math.abs(q.raw.length-token.length)<=allowed&&distance(q.raw,token)<=allowed);
        }
        return q.fuzzy.get(token);
      })) score+=1;
      else return -1;
    }
    return score;
  }
  function requirementForm(ingredient,row) {
    const identity=ingredientForm(ingredient), note=fold(row&&row.note||'');
    const cooked=/\b(?:cooked|ready.to.eat)\b/.test(note)&&!/\b(?:uncooked|not cooked)\b/.test(note);
    const dry=/\b(?:dry|dried|uncooked|raw)\b/.test(note)&&!/patted dry|pat dry/.test(note);
    const canned=/\b(?:canned|tinned)\b/.test(note);
    return {...identity,cooked:cooked||identity.form==='cooked',dry:dry||['dry','dried','raw'].includes(identity.form),canned};
  }
  function coversRequirement(have,needed,row) {
    const a=ingredientForm(have), b=requirementForm(needed,row);
    if(a.form==='cooked'&&!b.cooked&&!b.canned || b.cooked&&a.form!=='cooked') return false;
    if(['raw','dry','dried'].includes(a.form)&&(b.cooked||b.canned)) return false;
    return member(a.base,b.base);
  }
  function search(catalog,opts) {
    const o=opts||{}, index=getIndex(catalog), query=prepareQuery(o.query,index);
    const pantry=unique((o.pantry||[]).map(normalizeIngredient)).filter(i=>!STAPLES.has(i)), exclude=(o.exclude||[]).map(normalizeIngredient), diets=o.diets||[], allergens=o.allergens||[], saved=new Set(o.saved||[]);
    const maxTime=Number(o.maxTime)||0, cuisine=fold(o.cuisine);
    const maxMissing=o.maxMissing==null||o.maxMissing===''?null:Number(o.maxMissing);
    const results=[];
    for(const entry of index.entries) {
      const recipe=entry.recipe;
      if(o.savedOnly&&!saved.has(recipe.id)) continue;
      if(o.category&&o.category!=='all'&&recipe.category!==o.category) continue;
      if(cuisine&&cuisine!=='all'&&entry.cuisine!==cuisine) continue;
      if(maxTime>0&&(!Number.isFinite(recipe.minutes)||recipe.minutes>maxTime)) continue;
      if(diets.some(d=>!entry.diets.has(d))) continue;
      if(allergens.some(a=>entry.allergens.has(a))) continue;
      if(entry.allIngredients.some(i=>exclude.some(e=>isExcluded(i,e)))) continue;
      const relevance=textScore(entry,query);
      if(relevance<0) continue;
      const have=[],missing=[];
      for(const needed of entry.ingredients) {
        const amount=entry.amountRows.get(needed);
        const using=pantry.find(p=>p===needed&&coversRequirement(p,needed,amount))||pantry.find(p=>coversRequirement(p,needed,amount));
        if(using) have.push({needed,using}); else missing.push(needed);
      }
      if(pantry.length && !have.length) continue;
      if(maxMissing!==null&&Number.isFinite(maxMissing)&&missing.length>maxMissing) continue;
      results.push({recipe,have,missing,match:entry.ingredients.length?Math.round(100*have.length/entry.ingredients.length):0,relevance,order:entry.order});
    }
    const name=(a,b)=>compareText(a.recipe.name,b.recipe.name)||compareText(a.recipe.id,b.recipe.id)||a.order-b.order;
    const time=recipe=>Number.isFinite(recipe.minutes)&&recipe.minutes>=0?recipe.minutes:Infinity;
    const cost=recipe=>Number.isFinite(recipe.price)&&recipe.price>=0&&recipe.servings>0?recipe.price/recipe.servings:Infinity;
    const pantryRank=(a,b)=>pantry.length?a.missing.length-b.missing.length||b.have.length-a.have.length:0;
    const best=(a,b)=>(query.terms.length?b.relevance-a.relevance:0)||pantryRank(a,b)||Number(b.recipe.hasQuantities)-Number(a.recipe.hasQuantities)||time(a.recipe)-time(b.recipe)||name(a,b);
    const sorting={
      recommended:best,
      'buy-less':(a,b)=>pantryRank(a,b)||best(a,b),
      quickest:(a,b)=>time(a.recipe)-time(b.recipe)||best(a,b),
      cheapest:(a,b)=>cost(a.recipe)-cost(b.recipe)||best(a,b),
      'use-most':(a,b)=>b.have.length-a.have.length||best(a,b),
      'a-z':name,
    };
    return results.sort(sorting[o.sort]||best).map(({relevance,order,...result})=>result);
  }
  function servingAmounts(recipe,servings) {
    const base=Number(recipe.servings)||1, count=Number(servings);
    const ratio=recipe.hasQuantities&&Number.isFinite(count)&&count>0?count/base:1;
    return recipe.ingredients.map(ingredient=>{
      const matching=(recipe.amounts||[]).filter(a=>normalizeIngredient(a.ingredient)===ingredient);
      const row=matching.length===1?matching[0]:null;
      const amount=row&&Number.isFinite(row.amount)&&row.amount>0 ? Math.round(row.amount*ratio*1000)/1000 : null;
      return {ingredient,amount,unit:amount===null?'':String(row.unit||''),note:row?String(row.note||''):'',basis:row?String(row.basis||''):''};
    });
  }
  function scaledSteps(recipe,servings) {
    const steps=Array.isArray(recipe.steps)?recipe.steps:[];
    const base=Number(recipe.servings), count=Number(servings);
    if(!recipe.hasQuantities || !Number.isFinite(base) || base<=0 || !Number.isFinite(count) || count<=0 || count===base) return steps.slice();
    const ratio=count/base;
    const numeric=String.raw`\d+(?:\.\d+)?(?:[ \t]+\d+\/\d+|\/\d+)?`;
    const measure=new RegExp(String.raw`(^|[^\w./])(${numeric})(?:([ \t]*[–-][ \t]*|[ \t]+to[ \t]+)(${numeric}))?([ \t]*)(millilitres?|litres?|tablespoons?|teaspoons?|cups?|tbsp|tsp|kg|ml|g|l)\b`,'gi');
    function number(value) {
      const parts=value.trim().split(/\s+/);
      const component=text=>text.includes('/') ? text.split('/').map(Number).reduce((a,b)=>a/b) : Number(text);
      return parts.reduce((sum,part)=>sum+component(part),0);
    }
    const formatted=value=>String(Math.round(value*ratio*1000)/1000);
    return steps.map(step=>String(step).replace(measure,(match,prefix,first,separator,last,space,unit,offset,whole)=>{
      const after=whole.slice(offset+match.length);
      // Per-item size, gradual additions and equipment capacities are process
      // instructions, not batch quantities. Keep these measurements fixed.
      if(/^\s*(?:each\b|per\b|at a time\b|capacity\b)/i.test(after)) return match;
      const firstValue=number(first),lastValue=last?number(last):null;
      if(!Number.isFinite(firstValue)||lastValue!==null&&!Number.isFinite(lastValue)) return match;
      const amount=formatted(firstValue)+(last?separator+formatted(lastValue):'');
      const lower=unit.toLowerCase(), singular=lower.replace(/s$/,'');
      if(/^(?:millilitre|litre|tablespoon|teaspoon|cup)$/.test(singular)) {
        const isOne=Number(formatted(firstValue))===1&&(!last||Number(formatted(lastValue))===1);
        unit=singular+(isOne?'':'s');
      }
      return prefix+amount+space+unit;
    }));
  }
  function quantityBasis(row) {
    if(row.basis) return fold(row.basis);
    // Preparation that does not change purchase identity can combine. Subtypes,
    // cooked/dry state, drained weights and per-item sizes must remain distinct.
    return fold(row.note||'').replace(/\b(?:(?:finely|roughly|thinly|coarsely)\s+)?(?:chopped|sliced|diced|grated|crumbled|rinsed|torn|halved)\b/g,' ')
      .replace(/\b(?:leaves|patted dry|and)\b/g,' ').replace(/[^a-z0-9.-]+/g,' ').replace(/\s+/g,' ').trim();
  }
  function shoppingList(entries,pantry) {
    const available=(pantry||[]).map(normalizeIngredient), rows=new Map();
    for(const entry of entries||[]) {
      if(!entry || !entry.recipe) continue;
      for(const row of servingAmounts(entry.recipe,entry.servings)) {
        if(available.some(item=>coversRequirement(item,row.ingredient,row))) continue;
        const basis=quantityBasis(row);
        const key=JSON.stringify([row.ingredient,row.unit,basis,row.amount===null?'unknown':'known']);
        if(!rows.has(key)) rows.set(key,{...row,key,basis,notes:row.note?[row.note]:[],recipes:[]});
        else if(row.amount!==null) rows.get(key).amount=Math.round((rows.get(key).amount+row.amount)*1000)/1000;
        const current=rows.get(key);
        if(row.note&&!current.notes.includes(row.note)) current.notes.push(row.note);
        current.note=current.notes.join('; ');
        if(!current.recipes.includes(entry.recipe.name)) current.recipes.push(entry.recipe.name);
      }
    }
    return [...rows.values()].sort((a,b)=>compareText(a.ingredient,b.ingredient)||compareText(a.basis,b.basis)||compareText(a.unit,b.unit));
  }
  return {normalizeIngredient,parseIngredients,suggestions,buildCatalog,search,servingAmounts,scaledSteps,shoppingList,covers,coversRequirement,isExcluded,inferredAllergens,knownIngredients,isKnownIngredient,reindexCatalog,FAMILIES};
});
