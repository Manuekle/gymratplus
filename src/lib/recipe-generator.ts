import { foodsToCreate } from "../data/food"
import { getDietaryTags } from "./dietary-tags"

// Define recipe types
export type RecipeType = "breakfast" | "lunch" | "dinner" | "snack"

// Define recipe difficulty
export type RecipeDifficulty = "easy" | "medium" | "hard"

// Define recipe structure
export interface Recipe {
  name: string
  description: string
  instructions: string
  preparationTime: number // in minutes
  servings: number
  mealType: string[]
  ingredients: {
    foodId: string
    quantity: number
    unit: string
  }[]
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  dietaryTags: string[]
  difficulty: RecipeDifficulty
}

// Add dietary tags to foods
const foodsWithTags = foodsToCreate.map((food) => ({
  ...food,
  id: `food_${food.name.toLowerCase().replace(/\s+/g, "_")}`,
  dietaryTags: getDietaryTags(food),
}))

// Generate breakfast recipes
export const breakfastRecipes: Recipe[] = [
  {
    name: "Avena con frutas y nueces",
    description: "Un desayuno nutritivo y energético con avena, frutas frescas y nueces.",
    instructions:
      "1. Cocina la avena en agua o leche según las instrucciones del paquete.\n2. Añade las frutas picadas y las nueces.\n3. Endulza con miel si lo deseas.",
    preparationTime: 10,
    servings: 1,
    mealType: ["desayuno"],
    ingredients: [
      {
        foodId: foodsWithTags.find((f) => f.name === "Avena")?.id || "",
        quantity: 50,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Plátano")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Nueces")?.id || "",
        quantity: 15,
        unit: "g",
      },
    ],
    calories: 350,
    protein: 10,
    carbs: 45,
    fat: 15,
    fiber: 7,
    sugar: 10,
    dietaryTags: ["vegetarian"],
    difficulty: "easy",
  },
  {
    name: "Tostadas de aguacate y huevo",
    description: "Tostadas integrales con aguacate y huevo, ricas en proteínas y grasas saludables.",
    instructions:
      "1. Tuesta el pan integral.\n2. Machaca el aguacate y extiéndelo sobre las tostadas.\n3. Cocina los huevos al gusto y colócalos encima.\n4. Sazona con sal, pimienta y un poco de zumo de limón.",
    preparationTime: 15,
    servings: 1,
    mealType: ["desayuno"],
    ingredients: [
      {
        foodId: foodsWithTags.find((f) => f.name === "Pan integral")?.id || "",
        quantity: 60,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Aguacate")?.id || "",
        quantity: 50,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Huevos")?.id || "",
        quantity: 100,
        unit: "g",
      },
    ],
    calories: 400,
    protein: 15,
    carbs: 30,
    fat: 25,
    fiber: 6,
    sugar: 2,
    dietaryTags: ["vegetarian", "high-protein"],
    difficulty: "easy",
  },
  {
    name: "Batido proteico de frutas",
    description: "Batido rico en proteínas con frutas y proteína en polvo, ideal para después del entrenamiento.",
    instructions:
      "1. Mezcla todos los ingredientes en una batidora.\n2. Bate hasta conseguir una textura suave.\n3. Sirve inmediatamente.",
    preparationTime: 5,
    servings: 1,
    mealType: ["desayuno", "snack"],
    ingredients: [
      {
        foodId: foodsWithTags.find((f) => f.name === "Proteína de suero de leche (whey)")?.id || "",
        quantity: 25,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Plátano")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Fresas")?.id || "",
        quantity: 100,
        unit: "g",
      },
    ],
    calories: 250,
    protein: 25,
    carbs: 30,
    fat: 2,
    fiber: 4,
    sugar: 20,
    dietaryTags: ["high-protein"],
    difficulty: "easy",
  },
]

// Generate lunch/dinner recipes
export const mainMealRecipes: Recipe[] = [
  {
    name: "Pollo a la plancha con verduras",
    description: "Pechuga de pollo a la plancha con una guarnición de verduras salteadas.",
    instructions:
      "1. Sazona la pechuga de pollo con sal, pimienta y hierbas al gusto.\n2. Cocina a la plancha hasta que esté bien hecha.\n3. Saltea las verduras en una sartén con un poco de aceite de oliva.\n4. Sirve el pollo con las verduras.",
    preparationTime: 25,
    servings: 1,
    mealType: ["almuerzo", "cena"],
    ingredients: [
      {
        foodId: foodsWithTags.find((f) => f.name === "Pechuga de pollo")?.id || "",
        quantity: 150,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Brócoli")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Zanahoria")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Aceite de oliva")?.id || "",
        quantity: 10,
        unit: "ml",
      },
    ],
    calories: 400,
    protein: 40,
    carbs: 15,
    fat: 20,
    fiber: 5,
    sugar: 5,
    dietaryTags: ["high-protein", "gluten-free", "dairy-free"],
    difficulty: "medium",
  },
  {
    name: "Bowl de quinoa con verduras y tofu",
    description: "Bowl vegetariano de quinoa con verduras asadas y tofu marinado.",
    instructions:
      "1. Cocina la quinoa según las instrucciones del paquete.\n2. Corta las verduras y ásalas en el horno con un poco de aceite.\n3. Marina el tofu en salsa de soja y especias, y cocínalo a la plancha.\n4. Monta el bowl con la quinoa como base, las verduras y el tofu encima.",
    preparationTime: 35,
    servings: 1,
    mealType: ["almuerzo", "cena"],
    ingredients: [
      {
        foodId: foodsWithTags.find((f) => f.name === "Quinoa")?.id || "",
        quantity: 70,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Tofu")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Pimiento")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Calabacín")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Aceite de oliva")?.id || "",
        quantity: 10,
        unit: "ml",
      },
    ],
    calories: 450,
    protein: 20,
    carbs: 50,
    fat: 20,
    fiber: 8,
    sugar: 5,
    dietaryTags: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
    difficulty: "medium",
  },
  {
    name: "Salmón al horno con batata y espárragos",
    description: "Filete de salmón al horno con batata asada y espárragos.",
    instructions:
      "1. Precalienta el horno a 200°C.\n2. Coloca el salmón en una bandeja de horno con un poco de aceite, sal y pimienta.\n3. En otra bandeja, coloca la batata cortada en cubos y los espárragos con aceite y especias.\n4. Hornea el salmón durante 15-20 minutos y las verduras durante 25-30 minutos.",
    preparationTime: 40,
    servings: 1,
    mealType: ["almuerzo", "cena"],
    ingredients: [
      {
        foodId: foodsWithTags.find((f) => f.name === "Salmón")?.id || "",
        quantity: 150,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Batata (camote)")?.id || "",
        quantity: 150,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Espárragos")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Aceite de oliva")?.id || "",
        quantity: 10,
        unit: "ml",
      },
    ],
    calories: 500,
    protein: 35,
    carbs: 40,
    fat: 25,
    fiber: 6,
    sugar: 10,
    dietaryTags: ["high-protein", "gluten-free", "dairy-free"],
    difficulty: "medium",
  },
]

// Generate snack recipes
export const snackRecipes: Recipe[] = [
  {
    name: "Mix de frutos secos y frutas deshidratadas",
    description: "Mezcla energética de frutos secos y frutas deshidratadas, perfecta como snack.",
    instructions:
      "1. Mezcla todos los ingredientes en un recipiente.\n2. Guarda en un recipiente hermético para consumir durante la semana.",
    preparationTime: 5,
    servings: 4,
    mealType: ["snack"],
    ingredients: [
      {
        foodId: foodsWithTags.find((f) => f.name === "Almendras")?.id || "",
        quantity: 30,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Nueces")?.id || "",
        quantity: 30,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Plátano")?.id || "",
        quantity: 50,
        unit: "g",
      },
    ],
    calories: 300,
    protein: 8,
    carbs: 20,
    fat: 22,
    fiber: 5,
    sugar: 10,
    dietaryTags: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
    difficulty: "easy",
  },
  {
    name: "Yogur griego con miel y frutas",
    description: "Yogur griego con miel y frutas frescas, rico en proteínas y probióticos.",
    instructions: "1. Coloca el yogur en un bol.\n2. Añade la miel y mezcla.\n3. Añade las frutas picadas por encima.",
    preparationTime: 5,
    servings: 1,
    mealType: ["snack", "desayuno"],
    ingredients: [
      {
        foodId: foodsWithTags.find((f) => f.name === "Yogur griego")?.id || "",
        quantity: 150,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Fresas")?.id || "",
        quantity: 100,
        unit: "g",
      },
      {
        foodId: foodsWithTags.find((f) => f.name === "Arándanos")?.id || "",
        quantity: 50,
        unit: "g",
      },
    ],
    calories: 200,
    protein: 15,
    carbs: 25,
    fat: 5,
    fiber: 3,
    sugar: 20,
    dietaryTags: ["vegetarian", "gluten-free", "high-protein"],
    difficulty: "easy",
  },
]

// Combine all recipes
export const allRecipes = [...breakfastRecipes, ...mainMealRecipes, ...snackRecipes]

// Function to get recipes by dietary preference
export function getRecipesByDietaryPreference(preference: string): Recipe[] {
  return allRecipes.filter((recipe) => recipe.dietaryTags.includes(preference.toLowerCase()))
}

// Function to get recipes by meal type
export function getRecipesByMealType(mealType: string): Recipe[] {
  return allRecipes.filter((recipe) => recipe.mealType.includes(mealType.toLowerCase()))
}

