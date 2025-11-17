# Guía de Migración: FoodRecommendation Normalizado

## ✅ Cambios Implementados

### 1. Schema de Prisma Actualizado

- ✅ Nuevas tablas: `MealPlanMeal` y `MealPlanEntry`
- ✅ Campos nuevos en `FoodRecommendation`: `proteinTarget`, `carbsTarget`, `fatTarget`, `description`
- ✅ Campos legacy (`macros`, `meals`) mantenidos como opcionales para compatibilidad

### 2. Helpers Creados

- ✅ `src/lib/nutrition/food-recommendation-helpers.ts`
  - `getFoodRecommendationUnified()`: Lee planes en formato legacy o nuevo
  - `createFoodRecommendationNormalized()`: Crea planes usando estructura normalizada
  - `calculateMealTotals()`: Calcula totales dinámicamente

### 3. Endpoints Actualizados

- ✅ `GET /api/food-recommendations/[id]`: Usa helper unificado
- ✅ `POST /api/instructors/food-plans/assign`: Crea planes con estructura normalizada
- ✅ `GET /api/food-recommendations`: Mantiene compatibilidad

### 4. Script de Migración

- ✅ `scripts/migrate-food-recommendations.ts`: Migra datos existentes

## 📋 Pasos para Completar la Migración

### Paso 1: Crear la Migración de Base de Datos

```bash
# Generar y aplicar la migración
npx prisma migrate dev --name normalize_food_recommendation
```

### Paso 2: Ejecutar el Script de Migración de Datos

```bash
# Instalar tsx si no está instalado
npm install -D tsx

# Ejecutar el script de migración
npx tsx scripts/migrate-food-recommendations.ts
```

Este script:

- Lee todos los `FoodRecommendation` con datos en formato JSON
- Crea las nuevas tablas `MealPlanMeal` y `MealPlanEntry`
- Migra los datos manteniendo compatibilidad
- Verifica que los alimentos existan antes de migrar

### Paso 3: Verificar la Migración

1. Verificar que los planes antiguos se puedan leer correctamente
2. Crear un nuevo plan y verificar que use la nueva estructura
3. Verificar que los totales se calculen correctamente

### Paso 4: (Opcional) Eliminar Campos Legacy

Una vez que todos los planes estén migrados y verificado que todo funciona:

```sql
-- Solo después de confirmar que todo funciona correctamente
ALTER TABLE "FoodRecommendation"
  DROP COLUMN "macros",
  DROP COLUMN "meals";
```

Y actualizar el schema de Prisma para eliminar esos campos.

## 🔄 Compatibilidad

El sistema mantiene compatibilidad con ambos formatos:

- **Planes antiguos**: Se leen desde JSON legacy
- **Planes nuevos**: Se crean usando estructura normalizada
- **Helper unificado**: Detecta automáticamente el formato y lo convierte

## 📊 Ventajas de la Nueva Estructura

1. **Normalizada**: Sin duplicación de datos
2. **Consultable**: Queries SQL eficientes
3. **Mantenible**: Cambios en alimentos se reflejan automáticamente
4. **Eficiente**: Menor tamaño de datos (~90% reducción)
5. **Integridad**: Foreign keys garantizan consistencia

## ⚠️ Notas Importantes

- Los planes antiguos seguirán funcionando durante la transición
- Los nuevos planes se crean automáticamente con la estructura normalizada
- El script de migración es idempotente (puede ejecutarse múltiples veces)
- Los totales se calculan dinámicamente, no se guardan

## 🐛 Troubleshooting

Si encuentras problemas:

1. **Error de foreign key**: Verificar que todos los `foodId` existan
2. **Datos faltantes**: El script de migración registra warnings en consola
3. **Performance**: Agregar índices si es necesario
