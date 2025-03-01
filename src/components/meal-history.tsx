import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function MealHistory() {
  const meals = [
    {
      id: 1,
      time: "08:30",
      name: "Desayuno",
      foods: [
        { name: "Avena con leche", calories: 320, protein: 15, carbs: 45, fat: 8 },
        { name: "Plátano", calories: 105, protein: 1, carbs: 27, fat: 0 },
        { name: "Café negro", calories: 5, protein: 0, carbs: 0, fat: 0 },
      ],
    },
    {
      id: 2,
      time: "11:00",
      name: "Snack",
      foods: [
        { name: "Yogur griego", calories: 150, protein: 15, carbs: 8, fat: 5 },
        { name: "Nueces", calories: 185, protein: 4, carbs: 4, fat: 18 },
      ],
    },
    {
      id: 3,
      time: "14:00",
      name: "Almuerzo",
      foods: [
        { name: "Pechuga de pollo", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        { name: "Arroz integral", calories: 215, protein: 5, carbs: 45, fat: 1.8 },
        { name: "Ensalada mixta", calories: 35, protein: 1, carbs: 7, fat: 0 },
      ],
    },
    {
      id: 4,
      time: "17:30",
      name: "Merienda",
      foods: [
        { name: "Batido de proteínas", calories: 150, protein: 25, carbs: 5, fat: 2 },
        { name: "Manzana", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <div key={meal.id} className="pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{meal.time}</span>
              <h3 className="font-semibold">{meal.name}</h3>
            </div>
            <Badge variant="outline">{meal.foods.reduce((acc, food) => acc + food.calories, 0)} kcal</Badge>
          </div>

          <div className="space-y-2">
            {meal.foods.map((food, idx) => (
              <div key={idx} className="grid grid-cols-5 text-sm">
                <div className="col-span-2">{food.name}</div>
                <div className="text-right">{food.calories} kcal</div>
                <div className="text-right">{food.protein}g P</div>
                <div className="text-right">
                  {food.carbs}g C / {food.fat}g G
                </div>
              </div>
            ))}
          </div>

          {meal.id !== meals.length && <Separator className="mt-4" />}
        </div>
      ))}
    </div>
  )
}

