// THE REFERENCE BOOK
// What the app knows about ingredients themselves (not about recipes).
// Families follow how a cook thinks, not a scientist: tomato is a vegetable,
// herbs are not spices, fish is not meat.
// Names are lowercase and singular, like in the pantry.

// A recipe that asks for a family name (e.g. "cheese") can be made with any
// member (e.g. "cheddar"). Leaving out a family leaves out all its members.
// An ingredient can be in more than one family (chicken stock is stock AND meat).
const FAMILIES = {
  cheese: [
    "cheddar", "feta", "mozzarella", "parmesan", "goat cheese", "gouda", "gruyere",
    "pecorino", "ricotta", "blue cheese", "swiss cheese",
  ],
  meat: [
    "chicken", "beef", "pork", "lamb", "bacon", "ham", "chicken stock",
    "sausage", "turkey", "venison", "corned beef", "lard", "veal", "beef stock", "biltong",
    "snail", "pancetta", "chorizo", "pork blood",
  ],
  fish: [
    "salmon", "tuna", "cod", "shrimp", "catfish", "crayfish", "imitation crab",
    "shrimp paste", "fish sauce", "smoked salmon", "hake", "oyster",
  ],
  vegetable: [
    "tomato", "onion", "garlic", "spinach", "carrot", "pea", "bell pepper", "mushroom",
    "potato", "leek", "cucumber", "lettuce", "avocado", "courgette", "aubergine",
    "broccoli", "sweet potato", "cauliflower", "asparagus", "green bean", "butternut squash",
  ],
  fruit: ["banana", "lemon", "lime", "apple", "orange", "strawberry", "peach", "cranberry"],
  spice: ["cumin", "curry powder", "ginger", "paprika", "cinnamon", "chili"],
  herb: ["basil", "dill", "coriander", "parsley"],
  rice: ["basmati", "jasmine rice", "arborio", "brown rice"],
  pasta: ["spaghetti", "penne", "fusilli", "macaroni"],
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
  "anchovy", "apricot", "artichoke", "arugula", "barley", "bay leaf", "blackberry",
  "blueberry", "brie", "buttermilk", "camembert", "cashew", "chard", "cherry",
  "chia seed", "chive", "clam", "couscous", "crab", "date", "duck", "fennel", "fig",
  "flaxseed", "gelatin", "grape", "grapefruit", "haddock", "halloumi", "hazelnut",
  "hummus", "kale", "kiwi", "lobster", "mackerel", "mango", "maple syrup", "mascarpone",
  "melon", "mince", "miso", "mussel", "nectarine", "nutella", "oatmeal", "octopus",
  "okra", "parsnip", "pear", "pecan", "pineapple", "pistachio", "plum", "polenta",
  "pomegranate", "prawn", "prosciutto", "pumpkin", "quinoa", "raspberry", "rocket",
  "salami", "sardine", "scallop", "seitan", "semolina", "sesame seed", "squash", "squid",
  "sriracha", "steak", "sunflower seed", "tarragon", "tempeh", "trout", "turnip",
  "vanilla", "watercress", "watermelon",
];
