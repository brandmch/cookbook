import { config } from "dotenv";
config({ path: ".env.local" });
import bcrypt from "bcryptjs";

// Replicate db.ts adapter logic so the seed works against both Neon and local Postgres
function createClient() {
  const { PrismaClient } = require("../src/generated/prisma");
  const url = process.env.DATABASE_URL!;
  if (!url) throw new Error("DATABASE_URL is not set");

  if (url.includes("neon.tech")) {
    const { PrismaNeon } = require("@prisma/adapter-neon");
    return new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
  }

  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  return new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: url })) });
}

const db = createClient();

const RECIPES = [
  {
    title: "Sunday Pot Roast",
    category: "Mains",
    story: "Mom made this every Sunday without fail. The smell of it cooking would wake the whole house.",
    serves: 6,
    time: "3 hrs 30 min",
    ingredients: [
      { quantity: "3", unit: "lb", label: "chuck roast" },
      { quantity: "4", unit: "", label: "carrots, roughly chopped" },
      { quantity: "4", unit: "", label: "Yukon Gold potatoes, quartered" },
      { quantity: "1", unit: "", label: "yellow onion, quartered" },
      { quantity: "2", unit: "cups", label: "beef broth" },
      { quantity: "3", unit: "cloves", label: "garlic, minced" },
      { quantity: "2", unit: "tbsp", label: "tomato paste" },
    ],
    steps: [
      { text: "Preheat oven to 325°F. Season the chuck roast generously on all sides with salt and pepper." },
      { text: "Heat oil in a Dutch oven over high heat. Sear the roast 3–4 minutes per side until deeply browned. Remove and set aside." },
      { text: "Add onion and garlic to the pot, cook 2 minutes. Stir in tomato paste, then pour in the broth, scraping up any browned bits." },
      { text: "Return the roast to the pot, nestle in the carrots and potatoes, cover tightly, and braise in the oven for 3 hours until fork-tender." },
    ],
  },
  {
    title: "Grandma's Banana Bread",
    category: "Baking",
    story: "The riper the bananas, the better. Grandma kept a freezer bag of frozen black bananas just for this.",
    serves: 8,
    time: "1 hr 10 min",
    ingredients: [
      { quantity: "3", unit: "", label: "very ripe bananas, mashed" },
      { quantity: "1/3", unit: "cup", label: "melted butter" },
      { quantity: "3/4", unit: "cup", label: "sugar" },
      { quantity: "1", unit: "", label: "egg, beaten" },
      { quantity: "1", unit: "tsp", label: "vanilla extract" },
      { quantity: "1 1/2", unit: "cups", label: "all-purpose flour" },
      { quantity: "1", unit: "tsp", label: "baking soda" },
      { quantity: "1/2", unit: "cup", label: "chopped walnuts (optional)" },
    ],
    steps: [
      { text: "Preheat oven to 350°F. Grease a 9×5 loaf pan." },
      { text: "Mix mashed bananas with melted butter. Stir in sugar, egg, and vanilla." },
      { text: "Fold in flour and baking soda until just combined — a few lumps are fine. Fold in walnuts if using." },
      { text: "Pour into the prepared pan and bake 60–65 minutes until a toothpick comes out clean. Cool in the pan 10 minutes before turning out." },
    ],
  },
  {
    title: "Honey Garlic Chicken Thighs",
    category: "Mains",
    story: "Quick enough for a Tuesday but good enough for company. The sauce is absolutely addictive.",
    serves: 4,
    time: "35 min",
    ingredients: [
      { quantity: "8", unit: "", label: "bone-in, skin-on chicken thighs" },
      { quantity: "4", unit: "cloves", label: "garlic, minced" },
      { quantity: "3", unit: "tbsp", label: "honey" },
      { quantity: "2", unit: "tbsp", label: "soy sauce" },
      { quantity: "1", unit: "tbsp", label: "rice vinegar" },
      { quantity: "1", unit: "tsp", label: "sesame oil" },
    ],
    steps: [
      { text: "Pat chicken thighs dry and season with salt and pepper. Heat oil in an oven-safe skillet over medium-high heat." },
      { text: "Sear thighs skin-side down for 7–8 minutes until the skin is golden and crispy. Flip and cook another 3 minutes. Remove from pan." },
      { text: "Add garlic to the same pan and cook 30 seconds. Whisk in honey, soy sauce, vinegar, and sesame oil, scraping up the browned bits." },
      { text: "Return chicken to the pan skin-side up. Transfer to a 400°F oven and roast 15 minutes until cooked through. Spoon sauce over to serve." },
    ],
  },
  {
    title: "Creamy Mashed Potatoes",
    category: "Sides",
    story: "The secret is a ricer and warm cream. Never use a blender — you'll end up with wallpaper paste.",
    serves: 6,
    time: "30 min",
    ingredients: [
      { quantity: "3", unit: "lb", label: "Yukon Gold potatoes, peeled and cut into chunks" },
      { quantity: "6", unit: "tbsp", label: "unsalted butter" },
      { quantity: "3/4", unit: "cup", label: "heavy cream, warmed" },
      { quantity: "1", unit: "tsp", label: "salt, plus more to taste" },
      { quantity: "", unit: "", label: "freshly ground white pepper" },
    ],
    steps: [
      { text: "Place potatoes in a pot of cold salted water. Bring to a boil and cook 15–18 minutes until completely tender when pierced." },
      { text: "Drain thoroughly and let steam dry in the pot for 2 minutes. Pass through a ricer back into the pot." },
      { text: "Fold in butter until melted, then pour in the warm cream and stir until silky. Season generously with salt and white pepper." },
    ],
  },
  {
    title: "Blueberry Lemon Pancakes",
    category: "Breakfast",
    story: "Saturday morning tradition. Dad would make a triple batch and we'd still run out.",
    serves: 4,
    time: "25 min",
    ingredients: [
      { quantity: "2", unit: "cups", label: "all-purpose flour" },
      { quantity: "2", unit: "tbsp", label: "sugar" },
      { quantity: "2", unit: "tsp", label: "baking powder" },
      { quantity: "1/2", unit: "tsp", label: "salt" },
      { quantity: "2", unit: "", label: "eggs" },
      { quantity: "1 1/2", unit: "cups", label: "buttermilk" },
      { quantity: "2", unit: "tbsp", label: "melted butter" },
      { quantity: "1", unit: "", label: "lemon, zested" },
      { quantity: "1", unit: "cup", label: "fresh blueberries" },
    ],
    steps: [
      { text: "Whisk flour, sugar, baking powder, and salt in a large bowl. In another bowl, whisk eggs, buttermilk, melted butter, and lemon zest." },
      { text: "Pour wet ingredients into dry and stir until just combined — lumps are good. Fold in blueberries." },
      { text: "Heat a griddle or skillet over medium heat, lightly buttered. Pour 1/4 cup batter per pancake and cook until bubbles form on top, 2–3 minutes. Flip and cook another 90 seconds." },
    ],
  },
  {
    title: "Classic Chocolate Chip Cookies",
    category: "Desserts",
    story: "Brown the butter. It sounds fussy but it takes three minutes and the flavor difference is enormous.",
    serves: 24,
    time: "45 min",
    ingredients: [
      { quantity: "2 1/4", unit: "cups", label: "all-purpose flour" },
      { quantity: "1", unit: "tsp", label: "baking soda" },
      { quantity: "1", unit: "tsp", label: "salt" },
      { quantity: "1", unit: "cup", label: "butter (2 sticks), browned and cooled" },
      { quantity: "3/4", unit: "cup", label: "granulated sugar" },
      { quantity: "3/4", unit: "cup", label: "packed brown sugar" },
      { quantity: "2", unit: "", label: "eggs" },
      { quantity: "2", unit: "tsp", label: "vanilla extract" },
      { quantity: "2", unit: "cups", label: "semi-sweet chocolate chips" },
    ],
    steps: [
      { text: "Whisk flour, baking soda, and salt. In a large bowl, beat browned butter with both sugars until combined. Add eggs and vanilla, beat until fluffy." },
      { text: "Stir in flour mixture until a dough forms. Fold in chocolate chips. Refrigerate dough at least 30 minutes (or overnight)." },
      { text: "Preheat oven to 375°F. Scoop dough into 2-tablespoon balls onto parchment-lined baking sheets, spacing 2 inches apart." },
      { text: "Bake 9–11 minutes until edges are golden but centers still look underdone. Cool on the pan — they'll firm up as they cool." },
    ],
  },
  {
    title: "Front Porch Lemonade",
    category: "Drinks",
    story: "A true Southern summer. Make the simple syrup with fresh mint for the best version.",
    serves: 8,
    time: "15 min",
    ingredients: [
      { quantity: "1", unit: "cup", label: "sugar" },
      { quantity: "1", unit: "cup", label: "water (for simple syrup)" },
      { quantity: "1 1/2", unit: "cups", label: "fresh lemon juice (about 8 lemons)" },
      { quantity: "4", unit: "cups", label: "cold water" },
      { quantity: "8", unit: "sprigs", label: "fresh mint (optional)" },
    ],
    steps: [
      { text: "Combine sugar and 1 cup water in a small saucepan. Bring to a simmer, stirring until sugar dissolves. Cool completely." },
      { text: "Stir together lemon juice, simple syrup, and cold water in a pitcher. Taste and adjust sweetness." },
      { text: "Serve over ice with mint sprigs. Keeps in the fridge for up to a week." },
    ],
  },
  {
    title: "Holiday Sugar Cookies",
    category: "Holiday",
    story: "These are the cookies that cover the kitchen table every December. Royal icing optional but encouraged.",
    serves: 36,
    time: "2 hrs",
    ingredients: [
      { quantity: "3", unit: "cups", label: "all-purpose flour" },
      { quantity: "1", unit: "tsp", label: "baking powder" },
      { quantity: "1/4", unit: "tsp", label: "salt" },
      { quantity: "1", unit: "cup", label: "unsalted butter, softened" },
      { quantity: "1", unit: "cup", label: "sugar" },
      { quantity: "1", unit: "", label: "egg" },
      { quantity: "2", unit: "tsp", label: "vanilla extract" },
      { quantity: "2", unit: "tbsp", label: "milk" },
    ],
    steps: [
      { text: "Whisk flour, baking powder, and salt. Beat butter and sugar until pale and fluffy, 3 minutes. Add egg, vanilla, and milk; beat until smooth." },
      { text: "Add flour mixture and mix on low until just combined. Divide dough in two, flatten into discs, wrap, and refrigerate 1 hour." },
      { text: "Roll dough 1/4-inch thick on a floured surface. Cut with cookie cutters and place on parchment-lined baking sheets." },
      { text: "Bake at 350°F for 8–10 minutes until edges are just barely golden. Cool completely before decorating." },
    ],
  },
  {
    title: "Roasted Garlic Green Beans",
    category: "Sides",
    story: "Converts green bean skeptics. The key is a very hot oven and not crowding the pan.",
    serves: 4,
    time: "20 min",
    ingredients: [
      { quantity: "1", unit: "lb", label: "fresh green beans, trimmed" },
      { quantity: "4", unit: "cloves", label: "garlic, thinly sliced" },
      { quantity: "2", unit: "tbsp", label: "olive oil" },
      { quantity: "1/2", unit: "tsp", label: "salt" },
      { quantity: "1/4", unit: "tsp", label: "red pepper flakes" },
      { quantity: "2", unit: "tbsp", label: "grated Parmesan" },
    ],
    steps: [
      { text: "Preheat oven to 425°F. Toss green beans with olive oil, garlic, salt, and red pepper flakes directly on a large sheet pan." },
      { text: "Spread into a single layer — don't crowd them or they'll steam instead of roast." },
      { text: "Roast 12–15 minutes until blistered and tender-crisp. Toss with Parmesan and serve immediately." },
    ],
  },
  {
    title: "Ham and Cheese Breakfast Casserole",
    category: "Breakfast",
    story: "Assemble this the night before, refrigerate, and bake Christmas morning while everyone opens gifts.",
    serves: 10,
    time: "1 hr 15 min",
    ingredients: [
      { quantity: "1", unit: "loaf", label: "day-old white bread, cubed" },
      { quantity: "2", unit: "cups", label: "diced ham" },
      { quantity: "2", unit: "cups", label: "shredded cheddar" },
      { quantity: "8", unit: "", label: "eggs" },
      { quantity: "3", unit: "cups", label: "whole milk" },
      { quantity: "1", unit: "tsp", label: "dry mustard" },
      { quantity: "1/2", unit: "tsp", label: "salt" },
      { quantity: "1/4", unit: "tsp", label: "black pepper" },
    ],
    steps: [
      { text: "Layer bread cubes in a greased 9×13 baking dish. Scatter ham and cheese over the top." },
      { text: "Whisk eggs, milk, dry mustard, salt, and pepper. Pour evenly over the bread. Press down lightly so the bread soaks up the custard." },
      { text: "Cover and refrigerate overnight (or at least 4 hours)." },
      { text: "Remove from fridge 30 minutes before baking. Bake uncovered at 350°F for 45–50 minutes until puffed, golden, and set in the center." },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database…");

  // Upsert test user
  const hashedPassword = await bcrypt.hash("password", 10);
  const user = await db.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      name: "Test User",
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✓ User: ${user.email}`);

  // Upsert cookbook
  const cookbook = await db.cookbook.upsert({
    where: { slug: "test-kitchen" },
    update: {},
    create: {
      name: "The Test Kitchen",
      slug: "test-kitchen",
      ownerId: user.id,
    },
  });
  console.log(`  ✓ Cookbook: ${cookbook.name} (/${cookbook.slug})`);

  // Ensure owner membership
  await db.cookbookMember.upsert({
    where: { cookbookId_userId: { cookbookId: cookbook.id, userId: user.id } },
    update: {},
    create: { cookbookId: cookbook.id, userId: user.id, role: "OWNER" },
  });
  console.log(`  ✓ Owner membership set`);

  // Create recipes (skip if already exist by title + cookbook)
  let created = 0;
  for (const [idx, r] of RECIPES.entries()) {
    const existing = await db.recipe.findFirst({
      where: { cookbookId: cookbook.id, title: r.title },
    });
    if (existing) {
      console.log(`  · Recipe already exists, skipping: ${r.title}`);
      continue;
    }

    const slug = r.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 50);

    await db.recipe.create({
      data: {
        cookbookId: cookbook.id,
        contributorId: user.id,
        title: r.title,
        slug: `${slug}-${idx + 1}`,
        category: r.category,
        story: r.story,
        serves: r.serves,
        time: r.time,
        ingredients: {
          create: r.ingredients.map((i, order) => ({ ...i, order })),
        },
        steps: {
          create: r.steps.map((s, order) => ({ ...s, order })),
        },
      },
    });
    console.log(`  ✓ Recipe: ${r.title}`);
    created++;
  }

  console.log(`\n✅ Done — ${created} recipe(s) created.`);
  console.log(`   Sign in at /login with test@test.com / password`);
  console.log(`   Cookbook at /test-kitchen`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
