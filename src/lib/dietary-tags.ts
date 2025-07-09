export type DietaryTag =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "keto"
  | "low-carb"
  | "high-protein"
  | "paleo";

// Function to determine dietary tags based on food properties
export function getDietaryTags(food: {
  category: string;
  name: string;
  carbs: number;
  protein: number;
  fat: number;
}): DietaryTag[] {
  const tags: DietaryTag[] = [];

  // Vegetarian tags (all plant-based foods)
  if (["carbohidrato", "verdura", "fruta", "grasa"].includes(food.category)) {
    tags.push("vegetarian");
  }

  // Vegan tags (exclude animal products)
  if (
    ["carbohidrato", "verdura", "fruta"].includes(food.category) ||
    (food.category === "grasa" &&
      ![
        "Mantequilla",
        "Ghee (mantequilla clarificada)",
        "Yema de huevo",
      ].includes(food.name))
  ) {
    tags.push("vegan");
  }

  // Gluten-free (exclude wheat-based products)
  if (
    ![
      "Pan integral",
      "Pasta integral",
      "Cereales de desayuno integrales",
      "Pan de centeno",
      "Pan de masa madre",
      "Pan de pita integral",
    ].includes(food.name)
  ) {
    tags.push("gluten-free");
  }

  // Dairy-free (exclude dairy products)
  if (
    ![
      "Yogur griego",
      "Leche desnatada",
      "Queso cottage",
      "Proteína de suero de leche (whey)",
      "Mantequilla",
      "Ghee (mantequilla clarificada)",
    ].includes(food.name)
  ) {
    tags.push("dairy-free");
  }

  // Keto (high fat, low carb)
  if (food.carbs <= 5 && food.fat >= 10) {
    tags.push("keto");
  }

  // Low-carb
  if (food.carbs <= 10) {
    tags.push("low-carb");
  }

  // High-protein
  if (food.protein >= 15) {
    tags.push("high-protein");
  }

  // Paleo (exclude processed foods, grains, legumes, dairy)
  if (
    ["verdura", "fruta"].includes(food.category) ||
    (food.category === "proteína" &&
      ![
        "Yogur griego",
        "Leche desnatada",
        "Queso cottage",
        "Proteína de suero de leche (whey)",
        "Proteína de soya",
        "Tofu",
        "Tempeh",
        "Seitán",
      ].includes(food.name)) ||
    (food.category === "grasa" &&
      ["Aceite de oliva", "Nueces", "Almendras", "Aguacate"].includes(
        food.name,
      ))
  ) {
    tags.push("paleo");
  }

  return tags;
}
