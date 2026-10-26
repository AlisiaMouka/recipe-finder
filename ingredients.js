// THE REFERENCE BOOK
// What the app knows about ingredients themselves (not about recipes).
// Families follow how a cook thinks, not a scientist: tomato is a vegetable,
// herbs are not spices, fish is not meat.
// Names are lowercase and singular, like in the pantry.

// A recipe that asks for a family name (e.g. "cheese") can be made with any
// member (e.g. "cheddar"). Leaving out a family leaves out all its members.
// An ingredient can be in more than one family (chicken stock is stock AND meat).
const FAMILIES = {
  cheese: ["cheddar", "feta", "mozzarella", "parmesan", "goat cheese", "gouda", "gruyere"],
  meat: [
    "chicken", "beef", "pork", "lamb", "bacon", "ham", "chicken stock",
    "sausage", "turkey", "venison", "corned beef", "lard", "veal", "beef stock", "biltong",
    "snail",
  ],
  fish: [
    "salmon", "tuna", "cod", "shrimp", "catfish", "crayfish", "imitation crab",
    "shrimp paste", "fish sauce",
  ],
  vegetable: [
    "tomato", "onion", "garlic", "spinach", "carrot", "pea", "bell pepper", "mushroom",
    "potato", "leek", "cucumber", "lettuce", "avocado", "courgette", "aubergine",
    "broccoli", "sweet potato",
  ],
  fruit: ["banana", "lemon", "lime", "apple", "orange", "strawberry"],
  spice: ["cumin", "curry powder", "ginger", "paprika", "cinnamon", "chili"],
  herb: ["basil", "dill", "coriander", "parsley"],
  rice: ["basmati", "jasmine rice", "arborio", "brown rice"],
  pasta: ["spaghetti", "penne", "fusilli"],
  noodle: ["rice noodle", "egg noodle", "udon"],
  stock: ["vegetable stock", "chicken stock"],
  bread: ["baguette", "sourdough"],
};

// Different words for exactly the same ingredient: other name -> name we use.
const OTHER_NAMES = {
  zucchini: "courgette",
  eggplant: "aubergine",
  "garbanzo bean": "chickpea",
  capsicum: "bell pepper",
  cilantro: "coriander",
};

// Real foods that no recipe uses yet. Typing one of these is never treated as a
// typo (e.g. "pear" isn't questioned as "pea"). Add more any time:
// lowercase and singular, and not already used in a recipe.
const OTHER_FOODS = [
  "anchovy", "apricot", "artichoke", "arugula", "asparagus", "baking soda",
  "balsamic vinegar", "barley", "bay leaf nutmeg", "blackberry", "blueberry", "brie",
  "bulgur", "buttermilk", "camembert", "cashew", "cauliflower", "chard", "cherry",
  "chia seed", "chive", "chorizo", "clam", "couscous", "crab", "cranberry", "date",
  "duck", "fennel", "fig", "flaxseed", "gelatin", "grape", "grapefruit", "haddock",
  "halloumi", "hazelnut", "hummus", "jam nutella", "kale", "kiwi", "lobster", "mackerel",
  "mango", "maple syrup", "mascarpone", "mayonnaise vinegar", "melon", "mince", "miso",
  "mussel", "mustard", "nectarine", "oatmeal", "octopus", "okra", "parsnip", "peach",
  "pear", "pecan", "pineapple", "pistachio", "plum", "polenta", "pomegranate", "prawn",
  "prosciutto", "pumpkin", "quinoa", "raspberry", "ricotta", "rocket", "saffron",
  "salami", "sardine", "scallop", "seitan", "semolina", "sesame seed", "squash", "squid",
  "sriracha", "steak", "sunflower seed", "tahini", "tarragon", "tempeh", "trout",
  "turnip", "vanilla", "watercress", "watermelon",
];
