import { FoodForm } from "../_components/food-form";

export default function NewFoodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Food</h2>
        <p className="text-muted-foreground">
          Add a new item to the nutritional database.
        </p>
      </div>
      <FoodForm />
    </div>
  );
}
