// Sistema de búsqueda mejorado de alimentos estilo Fitia
// Incluye coincidencias por sinónimos, priorización y agrupación

export interface FoodSearchResult {
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: number;
    category: string;
    mealType?: string[];
    synonyms?: string[]; // Sinónimos de la BD
    servingUnit?: string | null; // Unidad de porción (g, ml, unidad)
  };
  matchScore: number;
  matchType: "exact" | "partial" | "synonym" | "category";
}

// Sinónimos comunes para alimentos (fallback si no están en la BD)
// NOTA: Los sinónimos ahora se obtienen principalmente de la base de datos
// Este objeto se usa como fallback para compatibilidad
const FOOD_SYNONYMS_FALLBACK: Record<string, string[]> = {
  "Pechuga de pollo": ["pollo", "pechuga", "pollo cocido", "pechuga cocida"],
  "Huevo entero": ["huevo", "huevos", "huevo completo"],
  "Clara de huevo": ["clara", "claras"],
  "Yogur griego natural": ["yogur", "yogurt", "yogur griego", "griego"],
  "Queso cottage bajo en grasa": ["queso cottage", "cottage", "requesón"],
  Requesón: ["queso cottage", "cottage"],
  "Atún en agua": ["atún", "tuna", "atun"],
  Salmón: ["salmon", "salmón cocido"],
  Avena: ["avena", "oatmeal", "quaker"],
  "Arroz blanco": ["arroz", "rice", "arroz cocido"],
  "Arroz integral": ["arroz integral", "arroz brown"],
  Pasta: ["pasta", "spaghetti", "fideos", "macarrones"],
  Plátano: ["plátano", "banana", "banano", "plátano macho"],
  Manzana: ["manzana", "apple"],
  Aguacate: ["aguacate", "palta", "avocado"],
  Almendras: ["almendras", "almendra", "almendras crudas"],
  Nueces: ["nueces", "nuez", "walnuts"],
  Cacahuetes: ["cacahuetes", "maní", "cacahuate", "peanuts"],
  "Aceite de oliva": ["aceite", "oliva", "aceite oliva"],
  Pavo: ["pavo", "pechuga de pavo", "turkey"],
  "Carne de res": ["res", "carne", "bistec", "beef"],
  Brócoli: ["brocoli", "brócoli"],
  Espinaca: ["espinaca", "espinacas"],
  Quinoa: ["quinoa", "quinua"],
  Batata: ["batata", "camote", "boniato", "sweet potato"],
  Papas: ["papa", "patata", "potato"],
};

// Función helper para obtener sinónimos de un alimento
// Prioriza los sinónimos de la BD, luego usa el fallback
function getFoodSynonyms(foodName: string, dbSynonyms?: string[]): string[] {
  if (dbSynonyms && dbSynonyms.length > 0) {
    return dbSynonyms;
  }
  return FOOD_SYNONYMS_FALLBACK[foodName] || [];
}

// Categorías y sus términos de búsqueda relacionados
const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  meat: ["carne", "pollo", "pavo", "res", "cerdo", "proteína animal"],
  fish: ["pescado", "atún", "salmón", "trucha", "mariscos"],
  eggs: ["huevo", "huevos", "clara", "yema"],
  dairy: ["lácteo", "leche", "queso", "yogur", "yogurt"],
  legumes: ["legumbre", "lenteja", "garbanzo", "frijol", "frijoles"],
  cereals: ["cereal", "avena", "trigo", "centeno"],
  rice: ["arroz"],
  pasta: ["pasta", "fideos", "spaghetti"],
  vegetables: ["verdura", "vegetal", "hortaliza"],
  fruits: ["fruta", "fruto"],
  nuts: ["fruto seco", "nuez", "almendra", "cacahuete"],
  seeds: ["semilla", "semillas"],
  oils: ["aceite", "grasa"],
};

/**
 * Calcula el score de coincidencia para un alimento
 */
function calculateMatchScore(
  foodName: string,
  searchQuery: string,
  category: string,
  dbSynonyms?: string[],
): { score: number; matchType: FoodSearchResult["matchType"] } {
  const query = searchQuery.toLowerCase().trim();
  const name = foodName.toLowerCase();
  const categoryLower = category.toLowerCase();

  // Coincidencia exacta
  if (name === query) {
    return { score: 100, matchType: "exact" };
  }

  // Coincidencia al inicio
  if (name.startsWith(query)) {
    return { score: 80, matchType: "partial" };
  }

  // Coincidencia parcial
  if (name.includes(query)) {
    return { score: 60, matchType: "partial" };
  }

  // Coincidencia por sinónimos (prioriza BD, luego fallback)
  const synonyms = getFoodSynonyms(foodName, dbSynonyms);
  for (const synonym of synonyms) {
    if (
      synonym.toLowerCase() === query ||
      synonym.toLowerCase().includes(query)
    ) {
      return { score: 70, matchType: "synonym" };
    }
  }

  // Coincidencia por categoría
  const categoryTerms = CATEGORY_SEARCH_TERMS[categoryLower] || [];
  if (categoryTerms.some((term) => term.includes(query))) {
    return { score: 30, matchType: "category" };
  }

  return { score: 0, matchType: "partial" };
}

/**
 * Busca alimentos con sistema mejorado estilo Fitia
 */
export function searchFoods(
  foods: Array<{
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: number;
    category: string;
    mealType?: string[];
    synonyms?: string[]; // Sinónimos de la BD
    servingUnit?: string | null;
  }>,
  searchQuery: string,
  options?: {
    mealType?: string;
    category?: string;
    limit?: number;
    prioritizeFavorites?: boolean;
    favorites?: Set<string>;
  },
): FoodSearchResult[] {
  if (!searchQuery.trim()) {
    // Si no hay búsqueda, retornar todos (o filtrados por mealType/category)
    return foods
      .filter((food) => {
        if (options?.mealType && food.mealType) {
          return food.mealType.includes(options.mealType);
        }
        if (options?.category) {
          return food.category === options.category;
        }
        return true;
      })
      .map((food) => ({
        food: {
          ...food,
          synonyms: food.synonyms || [],
          servingUnit: food.servingUnit || null,
        },
        matchScore: 0,
        matchType: "partial" as const,
      }))
      .slice(0, options?.limit || 100);
  }

  // Calcular scores para cada alimento
  const results: FoodSearchResult[] = foods
    .map((food) => {
      const { score, matchType } = calculateMatchScore(
        food.name,
        searchQuery,
        food.category,
        food.synonyms,
      );

      // Bonus por favoritos
      let finalScore = score;
      if (options?.prioritizeFavorites && options?.favorites?.has(food.id)) {
        finalScore += 10;
      }

      // Filtro por mealType
      if (options?.mealType && food.mealType) {
        if (!food.mealType.includes(options.mealType)) {
          finalScore = 0; // No mostrar si no coincide con mealType
        }
      }

      // Filtro por categoría
      if (options?.category && food.category !== options.category) {
        finalScore = 0;
      }

      return {
        food: {
          ...food,
          synonyms: food.synonyms || [],
          servingUnit: food.servingUnit || null,
        },
        matchScore: finalScore,
        matchType,
      };
    })
    .filter((result) => result.matchScore > 0) // Solo resultados con score > 0
    .sort((a, b) => {
      // Ordenar por score descendente
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Si tienen el mismo score, ordenar alfabéticamente
      return a.food.name.localeCompare(b.food.name);
    });

  return results.slice(0, options?.limit || 100);
}

/**
 * Agrupa alimentos por categoría para mostrar en la UI
 */
export function groupFoodsByCategory(
  results: FoodSearchResult[],
): Record<string, FoodSearchResult[]> {
  const grouped: Record<string, FoodSearchResult[]> = {};

  for (const result of results) {
    const category = result.food.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(result);
  }

  return grouped;
}

// Mapeo de categorías en inglés a español para mostrar en la UI
const CATEGORY_LABELS: Record<string, string> = {
  meat: "Carnes",
  fish: "Pescados",
  eggs: "Huevos",
  dairy: "Lácteos",
  legumes: "Legumbres",
  plant_protein: "Proteínas Vegetales",
  cereals: "Cereales",
  rice: "Arroz",
  pasta: "Pasta",
  vegetables: "Verduras",
  fruits: "Frutas",
  nuts: "Frutos Secos",
  seeds: "Semillas",
  oils: "Aceites y Grasas",
  beverages: "Bebidas",
  supplements: "Suplementos",
  other: "Otros",
  bars: "Barras",
};

/**
 * Obtiene el label en español para una categoría
 */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

/**
 * Obtiene sugerencias de búsqueda basadas en el query parcial
 */
export function getSearchSuggestions(
  foods: Array<{ name: string; category: string; synonyms?: string[] }>,
  partialQuery: string,
  limit: number = 5,
): string[] {
  if (!partialQuery.trim() || partialQuery.length < 2) {
    return [];
  }

  const query = partialQuery.toLowerCase();
  const suggestions = new Set<string>();

  // Buscar en nombres
  for (const food of foods) {
    if (food.name.toLowerCase().includes(query)) {
      suggestions.add(food.name);
      if (suggestions.size >= limit) break;
    }
  }

  // Buscar en sinónimos de la BD primero
  for (const food of foods) {
    if (suggestions.size >= limit) break;
    const synonyms = food.synonyms || getFoodSynonyms(food.name);
    for (const synonym of synonyms) {
      if (synonym.toLowerCase().includes(query)) {
        suggestions.add(food.name);
        break;
      }
    }
  }

  // Buscar en sinónimos fallback si aún hay espacio
  for (const [name, synonyms] of Object.entries(FOOD_SYNONYMS_FALLBACK)) {
    if (suggestions.size >= limit) break;
    if (suggestions.has(name)) continue; // Ya está en la lista
    for (const synonym of synonyms) {
      if (synonym.toLowerCase().includes(query)) {
        suggestions.add(name);
        break;
      }
    }
  }

  return Array.from(suggestions).slice(0, limit);
}
