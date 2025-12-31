import { FoodForm } from "../_components/food-form";

export default function NewFoodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.02em]">Añadir Nuevo Alimento</h2>
        <p className="text-muted-foreground">
          Añadir un nuevo elemento a la base de datos nutricional.
        </p>
      </div>
      <FoodForm />
    </div>
  );
}
