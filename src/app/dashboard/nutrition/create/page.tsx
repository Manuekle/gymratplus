import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateNutritionPlanForm } from "../../../nutrition/components/create-nutrition-plan-form";

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
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h2 className="text-2xl font-bold ml-2">Crear Plan de Nutrición</h2>
      </div>

      <CreateNutritionPlanForm />
    </div>
  );
}
