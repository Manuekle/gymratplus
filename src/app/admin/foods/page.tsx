import { getFoods, deleteFood } from "../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PlusSignIcon,
  Edit02Icon,
  Delete02Icon,
  Restaurant01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function FoodsPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams?.query || "";
  const foods = await getFoods(query);

  // Group foods by category
  const groupedFoods = foods.reduce(
    (acc, food) => {
      const category = food.category || "otros";
      if (!acc[category]) acc[category] = [];
      acc[category].push(food);
      return acc;
    },
    {} as Record<string, typeof foods>
  );

  const categoryColors: Record<string, string> = {
    proteína: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    carbohidratos: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    grasas: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    vegetales: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    frutas: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    lácteos: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    snacks: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Base de Datos Nutricional
          </h2>
          <p className="text-muted-foreground mt-1">
            {foods.length} alimentos disponibles
          </p>
        </div>
        <Link href="/admin/foods/new">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            Añadir Alimento
          </Button>
        </Link>
      </div>

      {/* Foods Grid */}
      {foods.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <HugeiconsIcon
              icon={Restaurant01Icon}
              className="h-12 w-12 text-muted-foreground/50 mb-4"
            />
            <h3 className="text-lg font-medium mb-1">No hay alimentos</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Comienza agregando tu primer alimento
            </p>
            <Link href="/admin/foods/new">
              <Button>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                Añadir Alimento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFoods).map(([category, categoryFoods]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-xs font-semibold capitalize ${categoryColors[category.toLowerCase()] ||
                    "bg-muted text-muted-foreground"
                    }`}
                >
                  {category}
                </Badge>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {categoryFoods.length} alimento{categoryFoods.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryFoods.map((food) => (
                  <Card
                    key={food.id}
                    className="group transition-all duration-200 hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs leading-tight line-clamp-2 mb-2">
                              {food.name}
                            </h3>
                            <div className="text-2xl font-bold text-primary">
                              {food.calories}
                              <span className="text-xs font-normal text-muted-foreground ml-1">
                                kcal
                              </span>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <HugeiconsIcon
                              icon={Restaurant01Icon}
                              className="h-4 w-4 text-primary"
                            />
                          </div>
                        </div>

                        {/* Macros */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/50">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Proteína</div>
                            <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                              {food.protein}g
                            </div>
                          </div>
                          <div className="text-center border-x border-border/50">
                            <div className="text-xs text-muted-foreground mb-1">Carbos</div>
                            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                              {food.carbs}g
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Grasas</div>
                            <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                              {food.fat}g
                            </div>
                          </div>
                        </div>

                        {/* Serving */}
                        <div className="text-xs text-muted-foreground">
                          Porción: {food.serving}g
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border/50">
                          <Link href={`/admin/foods/${food.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                            >
                              <HugeiconsIcon icon={Edit02Icon} className="h-3.5 w-3.5" />
                              Editar
                            </Button>
                          </Link>
                          <DeleteButton id={food.id} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await deleteFood(id);
      }}
    >
      <Button
        variant="outline"
        size="sm"
        className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
      >
        <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
        Eliminar
      </Button>
    </form>
  );
}
