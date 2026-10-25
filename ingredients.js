// THE REFERENCE BOOK
// What the app knows about ingredients themselves (not about recipes).
// Families follow how a cook thinks, not a scientist: tomato is a vegetable,
// herbs are not spices, fish is not meat.
// Names are lowercase and singular, like in the pantry.

// A recipe that asks for a family name (e.g. "cheese") can be made with any
// member (e.g. "cheddar"). Leaving out a family leaves out all its members.
// An ingredient can be in more than one family (chicken stock is stock AND meat).
const FAMILIES = {
  cheese: ["cheddar", "feta", "mozzarella", "parmesan", "goat cheese"],
  meat: ["chicken", "beef", "pork", "lamb", "bacon", "ham", "chicken stock"],
  fish: ["salmon", "tuna", "cod", "shrimp"],
  vegetable: [
    "tomato", "onion", "garlic", "spinach", "carrot", "pea", "bell pepper", "mushroom",
    "potato", "leek", "cucumber", "lettuce", "avocado", "courgette", "aubergine",
  ],
  fruit: ["banana", "lemon", "lime", "apple", "orange"],
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
