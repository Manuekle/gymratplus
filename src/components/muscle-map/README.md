# MuscleMap Component

Componente interactivo que muestra un mapa muscular del cuerpo humano usando la librería `@mjcdev/react-body-highlighter`.

## Características

- ✅ Vista frontal y trasera del cuerpo humano
- ✅ Resaltado de músculos trabajados por ejercicios
- ✅ Interactividad: click en partes del cuerpo para ver ejercicios
- ✅ Mapeo automático de músculos específicos a grupos musculares
- ✅ Diseño minimalista y responsive

## Uso

```tsx
import { MuscleMap } from "@/components/muscle-map/muscle-map";

// Modo visualización (solo muestra músculos trabajados)
<MuscleMap
  selectedExercises={["Sentadillas", "Press de banca"]}
  mode="view"
/>

// Modo selección (permite click para ver ejercicios)
<MuscleMap
  mode="select"
  onMuscleSelect={(muscle, exercises) => {
    console.log(`Músculo: ${muscle}`, `Ejercicios: ${exercises}`);
  }}
/>
```

## Props

- `selectedExercises?: string[]` - Lista de nombres de ejercicios para resaltar músculos trabajados
- `onMuscleSelect?: (muscle: MuscleName, exercises: string[]) => void` - Callback cuando se selecciona un músculo
- `mode?: "select" | "view"` - Modo del componente (default: "select")
- `highlightedMuscles?: MuscleName[]` - Músculos adicionales a resaltar

## Mapeo de Músculos

El componente mapea automáticamente nuestros músculos específicos (definidos en `muscle-mapping.ts`) a los grupos musculares que soporta la librería:

- `chest` - Pectorales
- `biceps` - Bíceps
- `triceps` - Tríceps
- `deltoids` - Deltoides
- `quadriceps` - Cuádriceps
- `hamstring` - Isquiotibiales
- `gluteal` - Glúteos
- `calves` - Pantorrillas
- `abs` - Abdominales
- `obliques` - Oblicuos
- Y más...

Ver `muscle-to-body-slug.ts` para el mapeo completo.

## Dependencias

- `@mjcdev/react-body-highlighter` - Librería para renderizar el cuerpo humano
