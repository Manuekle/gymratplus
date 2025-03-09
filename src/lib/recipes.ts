import { v4 as uuidv4 } from "uuid";

export type Recipe = {
  id: string;
  name: string;
  description: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  preparationTime: number; // in minutes
  dietaryTags: string[]; // vegetarian, keto, etc.
  imageUrl?: string;
};

export const recipes: Recipe[] = [
  // Breakfast Recipes
  {
    id: uuidv4(),
    name: "Avena con Frutas y Nueces",
    description:
      "Un desayuno nutritivo y energético con avena, frutas frescas y nueces.",
    mealType: "breakfast",
    ingredients: [
      "1 taza de avena",
      "1 plátano",
      "1/4 taza de almendras",
      "1 cucharada de miel",
      "1 taza de leche o yogur",
    ],
    instructions: [
      "Cocina la avena según las instrucciones del paquete.",
      "Corta el plátano en rodajas.",
      "Añade la avena cocida a un tazón.",
      "Agrega el plátano y las almendras encima.",
      "Vierte la leche o yogur y endulza con miel al gusto.",
    ],
    calories: 450,
    protein: 15,
    carbs: 65,
    fat: 15,
    preparationTime: 10,
    dietaryTags: ["vegetariano"],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: uuidv4(),
    name: "Huevos Revueltos con Aguacate",
    description:
      "Desayuno rico en proteínas y grasas saludables, perfecto para dietas keto.",
    mealType: "breakfast",
    ingredients: [
      "3 huevos",
      "1/2 aguacate",
      "1 cucharada de aceite de oliva",
      "Sal y pimienta al gusto",
      "Cilantro fresco picado (opcional)",
    ],
    instructions: [
      "Bate los huevos en un tazón con sal y pimienta.",
      "Calienta el aceite en una sartén a fuego medio.",
      "Vierte los huevos batidos y revuelve hasta que estén cocidos.",
      "Corta el aguacate en cubos y añádelos a los huevos.",
      "Sirve caliente y decora con cilantro si lo deseas.",
    ],
    calories: 380,
    protein: 20,
    carbs: 5,
    fat: 30,
    preparationTime: 10,
    dietaryTags: ["keto", "vegetariano"],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "breakfast-3",
    name: "Tostadas de Pan Integral con Yogur Griego y Fresas",
    description:
      "Un desayuno equilibrado con carbohidratos complejos, proteínas y frutas.",
    mealType: "breakfast",
    ingredients: [
      "2 rebanadas de pan integral",
      "1/2 taza de yogur griego",
      "1 taza de fresas",
      "1 cucharada de miel",
      "Canela al gusto",
    ],
    instructions: [
      "Tuesta el pan integral.",
      "Lava y corta las fresas en rodajas.",
      "Extiende el yogur griego sobre las tostadas.",
      "Coloca las fresas encima del yogur.",
      "Rocía con miel y espolvorea canela al gusto.",
    ],
    calories: 320,
    protein: 18,
    carbs: 45,
    fat: 8,
    preparationTime: 5,
    dietaryTags: ["vegetariano"],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },

  // Lunch Recipes
  {
    id: uuidv4(),
    name: "Ensalada de Atún con Verduras",
    description: "Una ensalada ligera y nutritiva con atún y verduras frescas.",
    mealType: "lunch",
    ingredients: [
      "1 lata de atún en agua",
      "2 tazas de espinacas",
      "1 zanahoria rallada",
      "1/2 pimiento rojo",
      "1 cucharada de aceite de oliva",
      "Jugo de limón, sal y pimienta al gusto",
    ],
    instructions: [
      "Escurre el atún y desmenúzalo en un tazón.",
      "Lava y prepara las verduras.",
      "Mezcla el atún con las espinacas, zanahoria y pimiento.",
      "Aliña con aceite de oliva, jugo de limón, sal y pimienta.",
      "Sirve fresco.",
    ],
    calories: 280,
    protein: 30,
    carbs: 10,
    fat: 12,
    preparationTime: 15,
    dietaryTags: [],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: uuidv4(),
    name: "Bowl de Quinoa con Pollo y Verduras",
    description:
      "Un plato completo con proteínas magras, carbohidratos complejos y verduras.",
    mealType: "lunch",
    ingredients: [
      "1 taza de quinoa cocida",
      "150g de pechuga de pollo",
      "1 taza de brócoli",
      "1/2 taza de zanahorias",
      "1 cucharada de aceite de oliva",
      "Especias al gusto",
    ],
    instructions: [
      "Cocina la quinoa según las instrucciones del paquete.",
      "Corta el pollo en trozos y cocínalo en una sartén con aceite.",
      "Cocina al vapor el brócoli y las zanahorias.",
      "Combina todos los ingredientes en un bowl.",
      "Aliña con aceite de oliva y especias al gusto.",
    ],
    calories: 420,
    protein: 35,
    carbs: 40,
    fat: 12,
    preparationTime: 25,
    dietaryTags: [],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "lunch-3",
    name: "Wrap de Salmón con Aguacate",
    description: "Un wrap saludable con salmón, aguacate y verduras frescas.",
    mealType: "lunch",
    ingredients: [
      "100g de salmón cocido",
      "1 tortilla integral grande",
      "1/2 aguacate",
      "1 taza de espinacas",
      "1/4 de cebolla roja",
      "Jugo de limón y sal al gusto",
    ],
    instructions: [
      "Desmenuza el salmón cocido.",
      "Corta el aguacate en rodajas y la cebolla en juliana.",
      "Calienta ligeramente la tortilla.",
      "Coloca las espinacas, el salmón, el aguacate y la cebolla sobre la tortilla.",
      "Rocía con jugo de limón, añade sal al gusto y enrolla.",
    ],
    calories: 380,
    protein: 25,
    carbs: 25,
    fat: 20,
    preparationTime: 15,
    dietaryTags: [],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },

  // Dinner Recipes
  {
    id: "dinner-1",
    name: "Pechuga de Pollo al Horno con Batata y Brócoli",
    description:
      "Una cena equilibrada con proteína magra, carbohidratos complejos y verduras.",
    mealType: "dinner",
    ingredients: [
      "150g de pechuga de pollo",
      "1 batata mediana",
      "2 tazas de brócoli",
      "2 cucharadas de aceite de oliva",
      "Especias, sal y pimienta al gusto",
    ],
    instructions: [
      "Precalienta el horno a 200°C.",
      "Corta la batata en cubos y el brócoli en floretes.",
      "Coloca el pollo, la batata y el brócoli en una bandeja para horno.",
      "Rocía con aceite de oliva y sazona con especias, sal y pimienta.",
      "Hornea por 25-30 minutos hasta que el pollo esté cocido.",
    ],
    calories: 450,
    protein: 40,
    carbs: 30,
    fat: 15,
    preparationTime: 40,
    dietaryTags: [],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: uuidv4(),
    name: "Salmón a la Plancha con Espinacas y Quinoa",
    description:
      "Una cena rica en ácidos grasos omega-3, proteínas y nutrientes esenciales.",
    mealType: "dinner",
    ingredients: [
      "150g de filete de salmón",
      "1 taza de espinacas",
      "1/2 taza de quinoa",
      "1 cucharada de aceite de oliva",
      "Jugo de limón, ajo, sal y pimienta al gusto",
    ],
    instructions: [
      "Cocina la quinoa según las instrucciones del paquete.",
      "Sazona el salmón con ajo, sal y pimienta.",
      "Cocina el salmón en una plancha o sartén con aceite de oliva.",
      "Saltea las espinacas brevemente.",
      "Sirve el salmón sobre la cama de quinoa y espinacas, rocía con jugo de limón.",
    ],
    calories: 420,
    protein: 35,
    carbs: 25,
    fat: 20,
    preparationTime: 25,
    dietaryTags: [],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: uuidv4(),
    name: "Bowl Vegetariano de Arroz Integral con Aguacate",
    description:
      "Un plato vegetariano completo con proteínas vegetales, carbohidratos complejos y grasas saludables.",
    mealType: "dinner",
    ingredients: [
      "1 taza de arroz integral cocido",
      "1/2 aguacate",
      "1/2 taza de frijoles negros",
      "1 taza de verduras mixtas (pimiento, zanahoria, brócoli)",
      "1 cucharada de aceite de oliva",
      "Limón, cilantro, sal y pimienta al gusto",
    ],
    instructions: [
      "Cocina el arroz integral según las instrucciones del paquete.",
      "Calienta los frijoles negros.",
      "Saltea las verduras mixtas con un poco de aceite.",
      "Corta el aguacate en rodajas.",
      "Sirve el arroz en un bowl, añade los frijoles, las verduras y el aguacate encima.",
      "Aliña con aceite de oliva, limón, cilantro, sal y pimienta al gusto.",
    ],
    calories: 380,
    protein: 12,
    carbs: 50,
    fat: 15,
    preparationTime: 20,
    dietaryTags: ["vegetariano"],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },

  // Snack Recipes
  {
    id: uuidv4(),
    name: "Yogur Griego con Fresas y Almendras",
    description:
      "Un snack rápido y nutritivo con proteínas, frutas y grasas saludables.",
    mealType: "snack",
    ingredients: [
      "1 taza de yogur griego",
      "1/2 taza de fresas",
      "1 cucharada de almendras picadas",
      "1 cucharadita de miel (opcional)",
    ],
    instructions: [
      "Lava y corta las fresas en trozos.",
      "Coloca el yogur griego en un bowl.",
      "Añade las fresas y las almendras encima.",
      "Endulza con miel si lo deseas.",
    ],
    calories: 200,
    protein: 15,
    carbs: 15,
    fat: 8,
    preparationTime: 5,
    dietaryTags: ["vegetariano"],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: uuidv4(),
    name: "Huevos Rellenos de Aguacate",
    description:
      "Un snack rico en proteínas y grasas saludables, ideal para dietas keto.",
    mealType: "snack",
    ingredients: [
      "2 huevos duros",
      "1/4 de aguacate",
      "1 cucharadita de aceite de oliva",
      "Sal, pimienta y pimentón al gusto",
    ],
    instructions: [
      "Hierve los huevos durante 10 minutos, enfríalos y pélalos.",
      "Corta los huevos por la mitad y retira las yemas.",
      "Machaca las yemas con el aguacate y el aceite de oliva.",
      "Rellena las claras con la mezcla de yema y aguacate.",
      "Sazona con sal, pimienta y pimentón al gusto.",
    ],
    calories: 180,
    protein: 12,
    carbs: 2,
    fat: 14,
    preparationTime: 15,
    dietaryTags: ["keto", "vegetariano"],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: uuidv4(),
    name: "Batido de Proteínas con Plátano y Almendras",
    description:
      "Un batido energético perfecto para después del entrenamiento.",
    mealType: "snack",
    ingredients: [
      "1 scoop de proteína en polvo",
      "1 plátano",
      "1 cucharada de mantequilla de almendras",
      "1 taza de leche o agua",
      "Hielo al gusto",
    ],
    instructions: [
      "Pela el plátano y córtalo en trozos.",
      "Coloca todos los ingredientes en una licuadora.",
      "Mezcla hasta obtener una textura suave.",
      "Sirve inmediatamente.",
    ],
    calories: 250,
    protein: 25,
    carbs: 25,
    fat: 8,
    preparationTime: 5,
    dietaryTags: ["vegetariano"],
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
];

export function getRecipesByMealType(mealType: string): Recipe[] {
  return recipes.filter((recipe) => recipe.mealType === mealType);
}

export function getRecipesByIngredients(ingredients: string[]): Recipe[] {
  return recipes.filter((recipe) => {
    // Check if any of the recipe ingredients contain the search ingredients
    return ingredients.some((ingredient) =>
      recipe.ingredients.some((recipeIngredient) =>
        recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
      )
    );
  });
}

export function getRecipesByDietaryTags(tags: string[]): Recipe[] {
  return recipes.filter((recipe) => {
    // Check if the recipe has all the required dietary tags
    return tags.every((tag) => recipe.dietaryTags.includes(tag));
  });
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.id === id);
}
