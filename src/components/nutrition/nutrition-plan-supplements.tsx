"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type Supplement = {
  id: string;
  name: string;
  description: string | null;
  dosage: string | null;
  timing: string | null;
};

type PlanSupplement = {
  id: string;
  supplementId: string;
  dosage: string | null;
  timing: string | null;
  frequency: string | null;
  notes: string | null;
  supplement: Supplement;
};

type NutritionPlan = {
  id: string;
  supplements: PlanSupplement[];
};

export function NutritionPlanSupplements({ plan }: { plan: NutritionPlan }) {
  const [supplements, setSupplements] = useState<PlanSupplement[]>(
    plan.supplements
  );
  const [isAddingSupp, setIsAddingSupp] = useState(false);
  const [allSupplements, setAllSupplements] = useState<Supplement[]>([]);
  const [selectedSuppId, setSelectedSuppId] = useState("");
  const [customDosage, setCustomDosage] = useState("");
  const [customTiming, setCustomTiming] = useState("");
  const [customFrequency, setCustomFrequency] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAddingSupp) {
      fetchSupplements();
    }
  }, [isAddingSupp]);

  const fetchSupplements = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/supplements");
      if (!response.ok) {
        throw new Error("Error al cargar los suplementos");
      }
      const data = await response.json();

      // Filter out supplements that are already in the plan
      const existingIds = supplements.map((s) => s.supplementId);
      const availableSupplements = data.filter(
        (s: Supplement) => !existingIds.includes(s.id)
      );

      setAllSupplements(availableSupplements);
    } catch (error) {
      console.error("Error fetching supplements:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los suplementos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSupplements = allSupplements.filter((supp) =>
    supp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setSelectedSuppId("");
    setCustomDosage("");
    setCustomTiming("");
    setCustomFrequency("");
    setCustomNotes("");
    setSearchQuery("");
  };

  const addSupplement = async () => {
    if (!selectedSuppId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un suplemento",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        supplementId: selectedSuppId,
        dosage: customDosage || null,
        timing: customTiming || null,
        frequency: customFrequency || null,
        notes: customNotes || null,
      };

      const response = await fetch(
        `/api/nutrition-plans/${plan.id}/supplements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Error al añadir el suplemento");
      }

      const newSupplement = await response.json();
      setSupplements([...supplements, newSupplement]);
      setIsAddingSupp(false);
      resetForm();

      toast({
        title: "Suplemento añadido",
        description: "El suplemento ha sido añadido correctamente al plan",
      });
    } catch (error) {
      console.error("Error adding supplement:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el suplemento al plan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSupplement = async (supplementId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este suplemento?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/nutrition-plans/${plan.id}/supplements/${supplementId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el suplemento");
      }

      setSupplements(
        supplements.filter((s) => s.supplementId !== supplementId)
      );

      toast({
        title: "Suplemento eliminado",
        description: "El suplemento ha sido eliminado correctamente del plan",
      });
    } catch (error) {
      console.error("Error deleting supplement:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el suplemento del plan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {supplements.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">
            No hay suplementos configurados
          </h3>
          <p className="text-muted-foreground mb-6">
            Añade suplementos a tu plan para complementar tu alimentación
          </p>
          <Button onClick={() => setIsAddingSupp(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Suplemento
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Suplementos del Plan</h3>
            <Button onClick={() => setIsAddingSupp(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Suplemento
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supplements.map((supp) => (
              <Card key={supp.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {supp.supplement.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteSupplement(supp.supplementId)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                  <CardDescription>
                    {supp.supplement.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-medium w-24">Dosis:</span>
                      <span>
                        {supp.dosage ||
                          supp.supplement.dosage ||
                          "No especificada"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-24">Momento:</span>
                      <span>
                        {supp.timing ||
                          supp.supplement.timing ||
                          "No especificado"}
                      </span>
                    </div>
                    {supp.frequency && (
                      <div className="flex">
                        <span className="font-medium w-24">Frecuencia:</span>
                        <span>{supp.frequency}</span>
                      </div>
                    )}
                    {supp.notes && (
                      <div className="flex">
                        <span className="font-medium w-24">Notas:</span>
                        <span>{supp.notes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={isAddingSupp} onOpenChange={setIsAddingSupp}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Añadir Suplemento</DialogTitle>
            <DialogDescription>
              Selecciona un suplemento para añadir a tu plan
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center border rounded-md px-3 py-2 mt-4">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Buscar suplementos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 p-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="h-[200px] overflow-y-auto border rounded-md p-2 mt-2">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <p>Cargando suplementos...</p>
              </div>
            ) : filteredSupplements.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                <p className="text-muted-foreground mb-2">
                  {searchQuery
                    ? "No se encontraron suplementos que coincidan con la búsqueda"
                    : "No hay suplementos disponibles para añadir"}
                </p>
                {!searchQuery && (
                  <p className="text-sm">
                    Ve a la página de{" "}
                    <Link
                      href="/nutrition/admin"
                      className="text-primary hover:underline"
                    >
                      Administración
                    </Link>{" "}
                    para inicializar los suplementos
                  </p>
                )}
              </div>
            ) : (
              <RadioGroup
                value={selectedSuppId}
                onValueChange={setSelectedSuppId}
              >
                <div className="space-y-2">
                  {filteredSupplements.map((supp) => (
                    <div key={supp.id} className="flex items-start space-x-2">
                      <RadioGroupItem
                        value={supp.id}
                        id={`supp-${supp.id}`}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`supp-${supp.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <Card className="border-0 shadow-none hover:bg-muted/50">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-base">
                              {supp.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <p className="text-sm text-muted-foreground">
                              {supp.description}
                            </p>
                            {(supp.dosage || supp.timing) && (
                              <div className="mt-2 text-xs">
                                {supp.dosage && (
                                  <div>
                                    <span className="font-medium">
                                      Dosis recomendada:
                                    </span>
                                    <span className="ml-1">{supp.dosage}</span>
                                  </div>
                                )}
                                {supp.timing && (
                                  <div>
                                    <span className="font-medium">
                                      Momento recomendado:
                                    </span>
                                    <span className="ml-1">{supp.timing}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>

          <div className="grid gap-4 py-4 mt-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customDosage" className="text-right">
                Dosis
              </Label>
              <Input
                id="customDosage"
                placeholder="Ej: 5g"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customTiming" className="text-right">
                Momento
              </Label>
              <Input
                id="customTiming"
                placeholder="Ej: Antes del entrenamiento"
                value={customTiming}
                onChange={(e) => setCustomTiming(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customFrequency" className="text-right">
                Frecuencia
              </Label>
              <Input
                id="customFrequency"
                placeholder="Ej: Diario, Días de entrenamiento"
                value={customFrequency}
                onChange={(e) => setCustomFrequency(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customNotes" className="text-right">
                Notas
              </Label>
              <Input
                id="customNotes"
                placeholder="Notas adicionales"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingSupp(false)}>
              Cancelar
            </Button>
            <Button onClick={addSupplement} disabled={submitting}>
              {submitting ? "Añadiendo..." : "Añadir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
