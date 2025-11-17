# Checklist: Verificación de Planes de Alimentación

## ✅ Cambios Completados

### 1. Schema de Prisma

- ✅ Eliminados campos legacy `macros` y `meals` (JSON)
- ✅ Agregados campos normalizados: `proteinTarget`, `carbsTarget`, `fatTarget`, `description`
- ✅ Creadas tablas: `MealPlanMeal` y `MealPlanEntry`

### 2. Script de Migración

- ✅ Actualizado para usar SQL raw queries (lee campos legacy directamente de BD)
- ✅ Migra datos de JSON a estructura normalizada
- ✅ Verifica que alimentos existan antes de migrar
- ✅ Idempotente (puede ejecutarse múltiples veces)

### 3. Helpers

- ✅ `getFoodRecommendationUnified()`: Lee planes usando estructura normalizada
- ✅ `createFoodRecommendationNormalized()`: Crea planes con estructura normalizada
- ✅ `calculateMealTotals()`: Calcula totales dinámicamente

### 4. Endpoints API

- ✅ `GET /api/food-recommendations/[id]`: Usa helper unificado
- ✅ `POST /api/food-recommendations`: Crea planes normalizados
- ✅ `POST /api/recommendations`: Crea planes normalizados
- ✅ `POST /api/instructors/food-plans/assign`: Crea planes normalizados
- ✅ `GET /api/food-recommendations`: Devuelve solo metadatos
- ✅ `GET /api/instructors/students/[id]/food-plans`: Actualizado para nueva estructura

### 5. Componentes Frontend

- ✅ `food-recommendations.tsx`: Carga datos completos desde endpoint [id]
- ✅ `meal-plan.tsx`: Funciona con estructura normalizada
- ✅ `plan/[id]/page.tsx`: Usa helper unificado

## 🔍 Verificaciones Necesarias

### Endpoints

- [ ] Probar crear plan desde `/dashboard/nutrition/food-plans`
- [ ] Probar crear plan desde `/dashboard/students/list/[id]/mealplan`
- [ ] Probar ver plan en `/dashboard/nutrition/plan/[id]`
- [ ] Probar listar planes en `/dashboard/nutrition/food-plans`

### Funcionalidades

- [ ] Verificar que los totales se calculen correctamente
- [ ] Verificar que los macros se muestren correctamente
- [ ] Verificar que los alimentos se muestren con sus datos correctos
- [ ] Verificar que la cantidad se muestre correctamente

### Migración

- [ ] Ejecutar script de migración: `npx tsx scripts/migrate-food-recommendations.ts`
- [ ] Verificar que los planes antiguos se migren correctamente
- [ ] Verificar que los planes nuevos se creen con estructura normalizada

## 📝 Notas

- Los planes antiguos (con JSON) necesitan ser migrados antes de poder visualizarlos
- Los nuevos planes se crean automáticamente con estructura normalizada
- El componente `food-recommendations.tsx` ahora carga los datos completos cuando se selecciona un plan
