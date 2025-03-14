import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CreateNutritionPlanForm } from "@/components/nutrition/create-nutrition-plan-form";
import { ArrowLeft01Icon } from "hugeicons-react";

export const metadata: Metadata = {
  title: "Crear Plan de Nutrición",
  description: "Crea un nuevo plan de alimentación y suplementación",
};

export default function CreateNutritionPlanPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/nutrition">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft01Icon className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h2 className="text-2xl font-bold ml-2">Crear Plan de Nutrición</h2>
      </div>

      <CreateNutritionPlanForm />
    </div>
  );
}
