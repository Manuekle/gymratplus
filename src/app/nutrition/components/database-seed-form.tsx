"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function DatabaseSeedForm() {
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [loadingSupplements, setLoadingSupplements] = useState(false);
  const [foodsSeeded, setFoodsSeeded] = useState(false);
  const [recipesSeeded, setRecipesSeeded] = useState(false);
  const [supplementsSeeded, setSupplementsSeeded] = useState(false);

  const seedFoods = async () => {
    setLoadingFoods(true);
    try {
      const response = await fetch("/api/foods", {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error al inicializar alimentos");
      }

      const data = await response.json();
      setFoodsSeeded(true);

      toast({
        title: "Alimentos inicializados",
        description: data.message,
      });
    } catch (error) {
      console.error("Error seeding foods:", error);
      toast({
        title: "Error",
        description: "No se pudieron inicializar los alimentos",
        variant: "destructive",
      });
    } finally {
      setLoadingFoods(false);
    }
  };

  const seedRecipes = async () => {
    setLoadingRecipes(true);
    try {
      const response = await fetch("/api/recipes", {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error al inicializar recetas");
      }

      const data = await response.json();
      setRecipesSeeded(true);

      toast({
        title: "Recetas inicializadas",
        description: data.message,
      });
    } catch (error) {
      console.error("Error seeding recipes:", error);
      toast({
        title: "Error",
        description: "No se pudieron inicializar las recetas",
        variant: "destructive",
      });
    } finally {
      setLoadingRecipes(false);
    }
  };

  const seedSupplements = async () => {
    setLoadingSupplements(true);
    try {
      const response = await fetch("/api/supplements", {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error al inicializar suplementos");
      }

      const data = await response.json();
      setSupplementsSeeded(true);

      toast({
        title: "Suplementos inicializados",
        description: data.message,
      });
    } catch (error) {
      console.error("Error seeding supplements:", error);
      toast({
        title: "Error",
        description: "No se pudieron inicializar los suplementos",
        variant: "destructive",
      });
    } finally {
      setLoadingSupplements(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alimentos</CardTitle>
          <CardDescription>
            Inicializa la base de datos con alimentos predefinidos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            onClick={seedFoods}
            disabled={loadingFoods || foodsSeeded}
            className="w-full"
          >
            {loadingFoods ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : foodsSeeded ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Inicializado
              </>
            ) : (
              "Inicializar Alimentos"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recetas</CardTitle>
          <CardDescription>
            Inicializa la base de datos con recetas predefinidas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            onClick={seedRecipes}
            disabled={loadingRecipes || recipesSeeded || !foodsSeeded}
            className="w-full"
          >
            {loadingRecipes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : recipesSeeded ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Inicializado
              </>
            ) : !foodsSeeded ? (
              "Inicializa alimentos primero"
            ) : (
              "Inicializar Recetas"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Suplementos</CardTitle>
          <CardDescription>
            Inicializa la base de datos con suplementos predefinidos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            onClick={seedSupplements}
            disabled={loadingSupplements || supplementsSeeded}
            className="w-full"
          >
            {loadingSupplements ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : supplementsSeeded ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Inicializado
              </>
            ) : (
              "Inicializar Suplementos"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
