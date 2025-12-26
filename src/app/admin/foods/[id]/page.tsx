import { FoodForm } from "../_components/food-form";
import { getFoodById } from "@/app/admin/actions";
import { notFound } from "next/navigation";

export default async function EditFoodPage({
  params,
}: {
  params: { id: string };
}) {
  const food = await getFoodById(params.id);

  if (!food) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Food</h2>
        <p className="text-muted-foreground">Update nutritional details.</p>
      </div>
      <FoodForm food={food} />
    </div>
  );
}
