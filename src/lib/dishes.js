const dishImage = (fileName) => `/dishes/${encodeURIComponent(fileName)}?v=2`;

export const dishes = [
  {
    id: 1,
    name: "Doro Wat",
    description:
      "Spicy Ethiopian chicken stew simmered with berbere spice blend, onions, garlic, ginger, and served with injera. A national favorite!",
    price: 2500,
    category: "ethiopian",
    image: dishImage("doro-wot.jpg"),
    spicy: true,
    ingredients: [
      "Chicken",
      "Berbere",
      "Onions",
      "Garlic",
      "Ginger",
      "Niter Kibbeh",
      "Injera",
    ],
    tags: ["Spicy", "Popular"],
    prepMinutes: 25,
    imageAlt: "Doro Wat Ethiopian chicken stew",
  },
  {
    id: 2,
    name: "Tibs",
    description:
      "Sautéed tender meat with caramelized onions, fresh peppers, and rosemary. Available in lamb, beef, or chicken options.",
    price: 1500,
    category: "ethiopian",
    image: dishImage("tibs.jpg"),
    spicy: true,
    ingredients: [
      "Beef/Lamb",
      "Onions",
      "Peppers",
      "Rosemary",
      "Garlic",
      "Niter Kibbeh",
    ],
    tags: ["Spicy", "Classic"],
    prepMinutes: 20,
    imageAlt: "Tibs Ethiopian sautéed meat",
  },
  {
    id: 3,
    name: "Shiro Wat",
    description:
      "Smooth and savory chickpea stew seasoned with berbere, garlic, and onions. A beloved vegetarian dish served with injera.",
    price: 180,
    category: "ethiopian",
    image: dishImage("shiro.jpg"),
    spicy: true,
    ingredients: [
      "Chickpea Flour",
      "Berbere",
      "Onions",
      "Garlic",
      "Niter Kibbeh",
      "Injera",
    ],
    tags: ["Vegetarian", "Comfort"],
    prepMinutes: 18,
    imageAlt: "Shiro Wat chickpea stew",
  },
  {
    id: 4,
    name: "Kitfo",
    description:
      "Fresh minced beef seasoned with mitmita and niter kibbeh. Served slightly cooked or raw (standard) with collard greens and cottage cheese.",
    price: 2000,
    category: "ethiopian",
    image: dishImage("kitfo.jpg"),
    spicy: true,
    ingredients: [
      "Minced Beef",
      "Mitmita",
      "Niter Kibbeh",
      "Collard Greens",
      "Cottage Cheese",
      "Injera",
    ],
    tags: ["Specialty", "Spicy"],
    prepMinutes: 22,
    imageAlt: "Kitfo minced beef Ethiopian dish",
  },
  {
    id: 5,
    name: "Beyaynetu",
    description:
      "A colorful vegetarian platter featuring a variety of wats and stews. Perfect for those wanting to try multiple Ethiopian flavors.",
    price: 250,
    category: "ethiopian",
    image: dishImage("beyaynetu.jpg"),
    spicy: true,
    ingredients: [
      "Shiro Wat",
      "Kik Wat",
      "Gomen",
      "Fasolia",
      "Salad",
      "Injera",
    ],
    tags: ["Vegetarian", "Mixed Plate"],
    prepMinutes: 24,
    imageAlt: "Beyaynetu Ethiopian mixed platter",
  },
  {
    id: 6,
    name: "Firfir",
    description:
      "Spiced injera pieces sautéed with berbere, onions, and niter kibbeh. A delicious and filling breakfast or anytime meal.",
    price: 160,
    category: "ethiopian",
    image: dishImage("firfr.jpg"),
    spicy: true,
    ingredients: ["Injera", "Berbere", "Onions", "Niter Kibbeh", "Spices"],
    tags: ["Breakfast", "Spicy"],
    prepMinutes: 15,
    imageAlt: "Firfir spiced injera dish",
  },
  {
    id: 7,
    name: "Gored Gored",
    description:
      "Fresh raw beef cubes tossed in mitmita and niter kibbeh. An authentic Ethiopian delicacy for the adventurous eater.",
    price: 1500,
    category: "ethiopian",
    image: dishImage("gored-gored.jpg"),
    spicy: true,
    ingredients: ["Beef Cubes", "Mitmita", "Niter Kibbeh", "Spices", "Injera"],
    tags: ["Specialty", "Spicy"],
    prepMinutes: 18,
    imageAlt: "Gored Gored Ethiopian beef cubes",
  },
  {
    id: 8,
    name: "Margherita Pizza",
    description:
      "Classic Italian pizza with tangy tomato sauce, fresh mozzarella cheese, basil leaves, and a drizzle of olive oil.",
    price: 600,
    category: "pizza",
    image: dishImage("Margherita Pizza.jpg"),
    spicy: true,
    ingredients: [
      "Dough",
      "Tomato Sauce",
      "Mozzarella",
      "Fresh Basil",
      "Olive Oil",
    ],
    tags: ["Classic", "Cheesy"],
    prepMinutes: 20,
    imageAlt: "Margherita Pizza",
  },
  {
    id: 9,
    name: "Pepperoni Pizza",
    description:
      "American-style pizza loaded with spicy pepperoni, mozzarella cheese, and rich tomato sauce on a crispy crust.",
    price: 520,
    category: "pizza",
    image: dishImage("Pepperoni Pizza.jpg"),
    spicy: true,
    ingredients: [
      "Dough",
      "Tomato Sauce",
      "Mozzarella",
      "Pepperoni",
      "Oregano",
    ],
    tags: ["Spicy", "Popular"],
    prepMinutes: 22,
    imageAlt: "Pepperoni Pizza",
  },
  {
    id: 10,
    name: "Vegetarian Supreme Pizza",
    description:
      "Loaded with fresh bell peppers, mushrooms, olives, onions, and tomatoes with mozzarella cheese on a classic crust.",
    price: 480,
    category: "pizza",
    image: dishImage("Vegetarian Supreme Pizza.png"),
    spicy: true,
    ingredients: [
      "Dough",
      "Tomato Sauce",
      "Mozzarella",
      "Bell Peppers",
      "Mushrooms",
      "Olives",
      "Onions",
      "Tomatoes",
    ],
    tags: ["Vegetarian", "Loaded"],
    prepMinutes: 23,
    imageAlt: "Vegetarian Supreme Pizza",
  },
  {
    id: 11,
    name: "Classic Beef Burger",
    description:
      "Juicy 200g beef patty grilled to perfection, served with lettuce, tomato, red onion, cheddar cheese, and special sauce.",
    price: 800,
    category: "burgers",
    image: dishImage("Classic Beef Burger.jpg"),
    spicy: true,
    ingredients: [
      "Beef Patty",
      "Lettuce",
      "Tomato",
      "Red Onion",
      "Cheddar Cheese",
      "Burger Sauce",
      "Brioche Bun",
    ],
    tags: ["Classic", "Hearty"],
    prepMinutes: 16,
    imageAlt: "Classic Beef Burger",
  },
  {
    id: 12,
    name: "Chicken Burger",
    description:
      "Grilled chicken breast with honey mustard sauce, fresh lettuce, tomato, and red onion on a soft potato bun.",
    price: 900,
    category: "burgers",
    image: dishImage("Chicken Burger.jpg"),
    spicy: true,
    ingredients: [
      "Chicken Breast",
      "Honey Mustard",
      "Lettuce",
      "Tomato",
      "Red Onion",
      "Potato Bun",
    ],
    tags: ["Chicken", "Light"],
    prepMinutes: 15,
    imageAlt: "Chicken Burger",
  },
  {
    id: 13,
    name: "Double Cheese Burger",
    description:
      "Two beef patties with double cheddar cheese, crispy bacon, lettuce, tomato, and our signature sauce.",
    price: 1300,
    category: "burgers",
    image: dishImage("Double Cheese Burger.jpeg"),
    spicy: true,
    ingredients: [
      "Two Beef Patties",
      "Cheddar Cheese",
      "Bacon",
      "Lettuce",
      "Tomato",
      "Burger Sauce",
      "Brioche Bun",
    ],
    tags: ["Loaded", "Cheesy"],
    prepMinutes: 18,
    imageAlt: "Double Cheese Burger",
  },
  {
    id: 14,
    name: "Ethiopian Coffee (Buna)",
    description:
      "Freshly roasted and brewed Ethiopian coffee served in a traditional jebena. The best coffee in the world, right from the source.",
    price: 80,
    category: "drinks",
    image: dishImage("coffee.jpg"),
    spicy: false,
    ingredients: ["Ethiopian Coffee Beans", "Water"],
    tags: ["Café", "Traditional"],
    prepMinutes: 10,
    imageAlt: "Ethiopian Coffee",
  },
  {
    id: 15,
    name: "Fresh Mango Juice",
    description:
      "Freshly squeezed mango juice made from ripe Ethiopian mangoes. Pure, refreshing, and naturally sweet.",
    price: 180,
    category: "drinks",
    image: dishImage("Mango Juice.jpg"),
    spicy: false,
    ingredients: ["Mango", "Water", "Sugar (optional)"],
    tags: ["Fresh", "Juicy"],
    prepMinutes: 8,
    imageAlt: "Fresh Mango Juice",
  },
  {
    id: 16,
    name: "Tej",
    description:
      "Traditional Ethiopian honey wine flavored with gesho leaves. A sweet and aromatic drink enjoyed on special occasions.",
    price: 150,
    category: "drinks",
    image: dishImage("tej.jpg"),
    spicy: false,
    ingredients: ["Honey", "Water", "Gesho Leaves", "Yeast"],
    tags: ["Traditional", "Sweet"],
    prepMinutes: 7,
    imageAlt: "Tej Ethiopian honey wine",
  },
  {
    id: 17,
    name: "Chocolate Layer Cake",
    description:
      "Rich and moist chocolate cake layered with chocolate ganache and finished with chocolate shavings. A chocolate lover's dream.",
    price: 200,
    category: "desserts",
    image: dishImage("Chocolate Layer Cake.jpg"),
    spicy: false,
    ingredients: [
      "Flour",
      "Cocoa Powder",
      "Sugar",
      "Eggs",
      "Butter",
      "Chocolate Ganache",
    ],
    tags: ["Sweet", "Indulgent"],
    prepMinutes: 12,
    imageAlt: "Chocolate Layer Cake",
  },
  {
    id: 18,
    name: "Baklava",
    description:
      "Sweet layers of flaky phyllo pastry filled with chopped nuts and sweetened with honey syrup. A perfect end to any meal.",
    price: 160,
    category: "desserts",
    image: dishImage("baklava.jpg"),
    spicy: true,
    ingredients: [
      "Phyllo Dough",
      "Walnuts",
      "Pistachios",
      "Honey",
      "Butter",
      "Cinnamon",
    ],
    tags: ["Sweet", "Nutty"],
    prepMinutes: 10,
    imageAlt: "Baklava pastry",
  },
  {
    id: 19,
    name: "Full Ethiopian Breakfast",
    description:
      "A hearty breakfast featuring firfir, scrambled eggs, or boiled eggs, served with fresh awaze (spicy sauce).",
    price: 220,
    category: "breakfast",
    image: dishImage("breakfast1.jpg"),
    spicy: true,
    ingredients: ["Firfir", "Scrambled Eggs", "Boiled Eggs", "Awaze", "Injera"],
    tags: ["Breakfast", "Hearty"],
    prepMinutes: 20,
    imageAlt: "Full Ethiopian Breakfast",
  },
  {
    id: 20,
    name: "Pancake Stack",
    description:
      "Fluffy buttermilk pancakes served with honey, fresh fruit, and butter. A delicious start to your morning.",
    price: 1400,
    category: "breakfast",
    image: dishImage("pancake.jpg"),
    spicy: true,
    ingredients: ["Flour", "Milk", "Eggs", "Butter", "Honey", "Fresh Fruit"],
    tags: ["Breakfast", "Sweet"],
    prepMinutes: 14,
    imageAlt: "Pancake Stack",
  },
];

export const categories = ["All", "Main", "Sides", "Drinks"];

export const categoryMeta = {
  All: { description: "Every dish we serve" },
  Main: { description: "Meals, breakfast, pizza and burgers" },
  Sides: { description: "Desserts and sweet sides" },
  Drinks: { description: "Coffee, juice and house specialties" },
};

const normalizeCategory = (category) =>
  String(category ?? "")
    .trim()
    .toLowerCase();

export function getMenuSection(dish) {
  if (normalizeCategory(dish.category) === "drinks") return "Drinks";
  if (normalizeCategory(dish.category) === "desserts") return "Sides";
  return "Main";
}

export async function getDishes() {
  return dishes;
}

export async function getDish(id) {
  const dishId = Number(id);
  return dishes.find((dish) => dish.id === dishId) ?? null;
}

export function getDishName(id) {
  const dish = dishes.find((entry) => String(entry.id) === String(id));
  return dish?.name ?? `Dish #${id}`;
}

export async function getDishesByCategory(category = "All", query = "") {
  const normalizedCategory = normalizeCategory(category);
  const search = String(query ?? "")
    .trim()
    .toLowerCase();

  return dishes.filter((dish) => {
    const fitsCategory =
      normalizedCategory === "all" ||
      normalizeCategory(getMenuSection(dish)) === normalizedCategory;

    if (!fitsCategory) return false;

    if (!search) return true;

    const haystack = [
      dish.name,
      dish.description,
      dish.category,
      getMenuSection(dish),
      ...(dish.ingredients ?? []),
      ...(dish.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export async function getRestaurantInfo() {
  return {
    name: "Addis Eats",
    address: "Bole Road, Addis Ababa",
    tagline: "Authentic Ethiopian flavors, served with care.",
    story:
      "From the clay midat to the table, every plate is cooked with the warmth of Addis Ababa.",
  };
}

export function countByCategory() {
  return categories.reduce((counts, category) => {
    if (category === "All") {
      counts[category] = dishes.length;
      return counts;
    }

    counts[category] = dishes.filter(
      (dish) =>
        normalizeCategory(getMenuSection(dish)) === normalizeCategory(category),
    ).length;

    return counts;
  }, {});
}

export async function priceCart(items = []) {
  if (!Array.isArray(items) || items.length === 0) return 0;

  return items.reduce((total, item) => {
    const dish = dishes.find((entry) => String(entry.id) === String(item.id));
    if (!dish) return total;

    const quantity = Number(item.qty ?? 1);
    return (
      total +
      dish.price * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
    );
  }, 0);
}
