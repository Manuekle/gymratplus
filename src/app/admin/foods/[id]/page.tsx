import { FoodForm } from "../_components/food-form";
import { getFoodById } from "@/app/admin/actions";
import { notFound } from "next/navigation";

export default async function EditFoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const food = await getFoodById(id);

  if (!food) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Editar Alimento</h2>
        <p className="text-muted-foreground">Actualizar detalles nutricionales.</p>
      </div>
      <FoodForm food={food} />
    </div>
  );
}
