import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { EditNutritionPlanForm } from "@/components/nutrition/edit-nutrition-plan-form";
import { ArrowLeft01Icon } from "hugeicons-react";

export const metadata: Metadata = {
  title: "Editar Plan de Nutrición",
  description: "Editar los detalles de tu plan de nutrición",
};

async function getNutritionPlan(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const prisma = new PrismaClient();

  try {
    const plan = await prisma.nutritionPlan.findUnique({
      where: {
        id,
      },
    });

    if (!plan || plan.userId !== session.user.id) {
      return null;
    }

    return plan;
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function EditNutritionPlanPage({
  params,
}: {
  params: { id: string };
}) {
  const plan = await getNutritionPlan(params.id);

  if (!plan) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href={`/dashboard/nutrition/plans/${plan.id}`}>
          <Button variant="outline" className="text-xs">
            <ArrowLeft01Icon className="mr-2 h-4 w-4" /> Volver al plan
          </Button>
        </Link>
      </div>

      <EditNutritionPlanForm plan={plan} />
    </div>
  );
}
