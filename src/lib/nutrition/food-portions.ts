// Sistema de porciones predefinidas estilo Fitia
// Define porciones comunes para diferentes tipos de alimentos

export interface FoodPortion {
  label: string; // Ej: "1 taza", "1 cucharada", "50 g"
  value: number; // Cantidad en gramos o ml
  unit: "g" | "ml" | "unidad"; // Unidad base
  isCustom?: boolean; // Si es una porción personalizada del usuario
}

export interface FoodPortionConfig {
  servingBase: number; // Porción base (ej: 100g)
  servingUnit: "g" | "ml" | "unidad"; // Unidad base
  predefinedPortions: FoodPortion[]; // Porciones predefinidas
}

// Porciones predefinidas por categoría de alimento
const PORTIONS_BY_CATEGORY: Record<string, FoodPortion[]> = {
  // Carnes y proteínas
  meat: [
    { label: "50 g", value: 50, unit: "g" },
    { label: "100 g", value: 100, unit: "g" },
    { label: "150 g", value: 150, unit: "g" },
    { label: "200 g", value: 200, unit: "g" },
  ],
  fish: [
    { label: "50 g", value: 50, unit: "g" },
    { label: "100 g", value: 100, unit: "g" },
    { label: "150 g", value: 150, unit: "g" },
    { label: "200 g", value: 200, unit: "g" },
  ],
  eggs: [
    { label: "1 unidad", value: 50, unit: "unidad" },
    { label: "2 unidades", value: 100, unit: "unidad" },
    { label: "3 unidades", value: 150, unit: "unidad" },
    { label: "1 clara", value: 33, unit: "unidad" },
    { label: "2 claras", value: 66, unit: "unidad" },
  ],
  dairy: [
    { label: "50 g", value: 50, unit: "g" },
    { label: "100 g", value: 100, unit: "g" },
    { label: "1 taza (240 ml)", value: 240, unit: "ml" },
    { label: "½ taza (120 ml)", value: 120, unit: "ml" },
  ],
  // Carbohidratos
  cereals: [
    { label: "30 g", value: 30, unit: "g" },
    { label: "50 g", value: 50, unit: "g" },
    { label: "100 g", value: 100, unit: "g" },
    { label: "1 taza (80 g)", value: 80, unit: "g" },
    { label: "½ taza (40 g)", value: 40, unit: "g" },
    { label: "1 cucharada (10 g)", value: 10, unit: "g" },
  ],
  rice: [
    { label: "50 g (crudo)", value: 50, unit: "g" },
    { label: "100 g (crudo)", value: 100, unit: "g" },
    { label: "1 taza cocido (158 g)", value: 158, unit: "g" },
    { label: "½ taza cocido (79 g)", value: 79, unit: "g" },
  ],
  pasta: [
    { label: "50 g (crudo)", value: 50, unit: "g" },
    { label: "100 g (crudo)", value: 100, unit: "g" },
    { label: "1 taza cocido (140 g)", value: 140, unit: "g" },
    { label: "½ taza cocido (70 g)", value: 70, unit: "g" },
  ],
  // Frutas
  fruits: [
    { label: "1 unidad pequeña", value: 100, unit: "unidad" },
    { label: "1 unidad mediana", value: 150, unit: "unidad" },
    { label: "1 unidad grande", value: 200, unit: "unidad" },
    { label: "100 g", value: 100, unit: "g" },
    { label: "150 g", value: 150, unit: "g" },
  ],
  // Verduras
  vegetables: [
    { label: "50 g", value: 50, unit: "g" },
    { label: "100 g", value: 100, unit: "g" },
    { label: "150 g", value: 150, unit: "g" },
    { label: "1 taza (90 g)", value: 90, unit: "g" },
    { label: "½ taza (45 g)", value: 45, unit: "g" },
  ],
  // Frutos secos y semillas
  nuts: [
    { label: "10 g", value: 10, unit: "g" },
    { label: "20 g", value: 20, unit: "g" },
    { label: "30 g", value: 30, unit: "g" },
    { label: "1 cucharada (15 g)", value: 15, unit: "g" },
    { label: "1 puñado (25 g)", value: 25, unit: "g" },
  ],
  seeds: [
    { label: "5 g", value: 5, unit: "g" },
    { label: "10 g", value: 10, unit: "g" },
    { label: "15 g", value: 15, unit: "g" },
    { label: "1 cucharada (10 g)", value: 10, unit: "g" },
  ],
  // Aceites y grasas
  oils: [
    { label: "5 ml", value: 5, unit: "ml" },
    { label: "10 ml", value: 10, unit: "ml" },
    { label: "15 ml", value: 15, unit: "ml" },
    { label: "1 cucharada (14 ml)", value: 14, unit: "ml" },
    { label: "1 cucharadita (5 ml)", value: 5, unit: "ml" },
  ],
  // Legumbres
  legumes: [
    { label: "50 g (crudo)", value: 50, unit: "g" },
    { label: "100 g (crudo)", value: 100, unit: "g" },
    { label: "1 taza cocido (164 g)", value: 164, unit: "g" },
    { label: "½ taza cocido (82 g)", value: 82, unit: "g" },
  ],
  // Proteínas vegetales
  plant_protein: [
    { label: "50 g", value: 50, unit: "g" },
    { label: "100 g", value: 100, unit: "g" },
    { label: "150 g", value: 150, unit: "g" },
    { label: "1 porción (85 g)", value: 85, unit: "g" },
  ],
  // Suplementos
  supplements: [
    { label: "1 scoop (25 g)", value: 25, unit: "g" },
    { label: "1 scoop (30 g)", value: 30, unit: "g" },
    { label: "½ scoop (15 g)", value: 15, unit: "g" },
  ],
  // Bebidas
  beverages: [
    { label: "100 ml", value: 100, unit: "ml" },
    { label: "200 ml", value: 200, unit: "ml" },
    { label: "250 ml (1 vaso)", value: 250, unit: "ml" },
    { label: "500 ml", value: 500, unit: "ml" },
  ],
};

// Porciones genéricas por defecto
const DEFAULT_PORTIONS: FoodPortion[] = [
  { label: "50 g", value: 50, unit: "g" },
  { label: "100 g", value: 100, unit: "g" },
  { label: "150 g", value: 150, unit: "g" },
  { label: "200 g", value: 200, unit: "g" },
];

/**
 * Obtiene las porciones predefinidas para un alimento según su categoría
 */
export function getPredefinedPortions(
  category: string,
  servingBase: number = 100,
  servingUnit: "g" | "ml" | "unidad" = "g",
): FoodPortion[] {
  const categoryPortions = PORTIONS_BY_CATEGORY[category] || DEFAULT_PORTIONS;

  // Asegurar que la porción base esté incluida
  const basePortion: FoodPortion = {
    label: `${servingBase} ${servingUnit}`,
    value: servingBase,
    unit: servingUnit,
  };

  // Verificar si la porción base ya está en la lista
  const hasBasePortion = categoryPortions.some(
    (p) => p.value === servingBase && p.unit === servingUnit,
  );

  if (!hasBasePortion) {
    return [basePortion, ...categoryPortions];
  }

  return categoryPortions;
}

/**
 * Calcula los macros para una porción específica
 */
export function calculateMacrosForPortion(
  baseMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  },
  servingBase: number,
  portionValue: number,
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  if (servingBase === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  const ratio = portionValue / servingBase;

  return {
    calories: Math.round(baseMacros.calories * ratio),
    protein: Math.round(baseMacros.protein * ratio * 10) / 10,
    carbs: Math.round(baseMacros.carbs * ratio * 10) / 10,
    fat: Math.round(baseMacros.fat * ratio * 10) / 10,
  };
}

/**
 * Convierte una cantidad personalizada a gramos/ml según la unidad
 */
export function convertToBaseUnit(
  value: number,
  unit: string,
  servingBase: number = 100,
): number {
  switch (unit.toLowerCase()) {
    case "g":
    case "gramos":
      return value;
    case "kg":
    case "kilogramos":
      return value * 1000;
    case "ml":
    case "mililitros":
      return value;
    case "l":
    case "litros":
      return value * 1000;
    case "taza":
      return value * 240; // 1 taza = 240 ml
    case "vaso":
      return value * 250; // 1 vaso = 250 ml
    case "cucharada":
      return value * 14; // 1 cucharada = 14 ml/g
    case "cucharadita":
      return value * 5; // 1 cucharadita = 5 ml/g
    case "unidad":
    case "porción":
      return value * servingBase; // Multiplicar por la porción base
    default:
      return value;
  }
}

/**
 * Formatea una cantidad para mostrar en la UI
 * Muestra valores enteros cuando es apropiado, especialmente para plan generado automáticamente
 */
export function formatPortionLabel(
  value: number,
  unit: "g" | "ml" | "unidad",
  servingBase?: number,
): string {
  // Redondear el valor a entero si es muy cercano a un entero (para evitar decimales largos)
  const roundedValue =
    Math.abs(value - Math.round(value)) < 0.01 ? Math.round(value) : value;

  if (unit === "unidad" && servingBase) {
    if (roundedValue === servingBase) {
      return "1 unidad";
    }
    const units = roundedValue / servingBase;
    const roundedUnits =
      Math.abs(units - Math.round(units)) < 0.01 ? Math.round(units) : units;

    if (roundedUnits === Math.floor(roundedUnits)) {
      return `${roundedUnits} ${roundedUnits === 1 ? "unidad" : "unidades"}`;
    }
    return `${roundedUnits.toFixed(1)} unidades`;
  }

  if (roundedValue >= 1000 && unit === "g") {
    const kg = roundedValue / 1000;
    const roundedKg =
      Math.abs(kg - Math.round(kg)) < 0.01 ? Math.round(kg) : kg;
    return `${roundedKg % 1 === 0 ? roundedKg.toString() : roundedKg.toFixed(1)} kg`;
  }

  if (roundedValue >= 1000 && unit === "ml") {
    const l = roundedValue / 1000;
    const roundedL = Math.abs(l - Math.round(l)) < 0.01 ? Math.round(l) : l;
    return `${roundedL % 1 === 0 ? roundedL.toString() : roundedL.toFixed(1)} L`;
  }

  // Mostrar como entero si es muy cercano a un entero, sino mostrar con 1 decimal máximo
  if (roundedValue % 1 === 0) {
    return `${Math.round(roundedValue)} ${unit}`;
  }

  // Si tiene decimales, mostrar máximo 1 decimal
  return `${roundedValue.toFixed(1)} ${unit}`;
}
