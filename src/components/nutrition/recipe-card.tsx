"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight } from "lucide-react";
import type { Recipe } from "@/lib/recipes";

type RecipeCardProps = {
  recipe: Recipe;
  onClick?: () => void;
};

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <div
      className="overflow-hidden cursor-pointer hover:border-zinc-300 transition-colors border rounded-lg"
      onClick={onClick}
    >
      {recipe.imageUrl && (
        <div className="overflow-hidden ">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQewdvz0HQg1CNrO1U2TTbBfyzw5d9CIINWpw&s"
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          {/* <img
            src={recipe.imageUrl || "/placeholder.svg"}
            alt={recipe.name}
            className="w-full h-full object-cover"
          /> */}
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-medium text-sm">{recipe.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {recipe.description}
        </p>

        <div className="flex items-center gap-2 mt-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {recipe.preparationTime} min
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          <Badge variant="outline">{recipe.calories} kcal</Badge>
          <Badge variant="outline">P: {recipe.protein}g</Badge>
          <Badge variant="outline">C: {recipe.carbs}g</Badge>
          <Badge variant="outline">G: {recipe.fat}g</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center ">
        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="capitalize">
              {tag}
            </Badge>
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </CardFooter>
    </div>
  );
}
