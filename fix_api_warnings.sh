#!/bin/bash

# Script para arreglar warnings de TypeScript en archivos API

echo "🔧 Arreglando warnings de TypeScript en archivos API..."

# Lista de archivos que necesitan corrección
FILES=(
  "src/app/api/instructors/profile/route.ts"
  "src/app/api/config/exercise/route.ts"
  "src/app/api/instructors/register/route.ts"
  "src/app/api/config/exercise/[id]/route.ts"
  "src/app/api/custom-workout/route.ts"
  "src/app/api/instructors/students/[id]/accept/route.ts"
  "src/app/api/upload/route.ts"
  "src/app/api/student-instructor-requests/route.ts"
  "src/app/api/personalized-workout/route.ts"
  "src/app/api/workout-streak/route.ts"
  "src/app/api/instructors/workouts/assign/route.ts"
  "src/app/api/student-instructor-requests/[id]/reject/route.ts"
  "src/app/api/student-instructor-requests/[id]/accept/route.ts"
  "src/app/api/instructors/workouts/assigned/[id]/route.ts"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "📝 Procesando $file..."
    
    # 1. Agregar NextRequest al import si no existe
    if ! grep -q "NextRequest" "$file"; then
      sed -i 's/import { NextResponse }/import { NextResponse, NextRequest }/' "$file"
      sed -i 's/from "next\/server"/from "next\/server"/' "$file"
    fi
    
    # 2. Reemplazar Request por NextRequest en las funciones
    sed -i 's/export async function \([A-Z][A-Z]*\)(.*: Request)/export async function \1(request: NextRequest)/' "$file"
    sed -i 's/export async function \([A-Z][A-Z]*\)(req: Request)/export async function \1(req: NextRequest)/' "$file"
    
    echo "✅ $file actualizado"
  else
    echo "❌ $file no encontrado"
  fi
done

echo "🎉 Todas las correcciones completadas!"
