"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import TimePicker from "@/components/ui/time-picker";
import { Badge } from "../ui/badge";
import {
  Delete02Icon,
  PlusSignIcon,
  Search01Icon,
  Tick02Icon,
} from "hugeicons-react";
import { Icons } from "../icons";

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
  const [selectedItems, setSelectedItems] = useState<
    { id: string; supplement: Supplement }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"select" | "review">("select");
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Estado para los detalles del suplemento
  const [supplementTime, setSupplementTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [customDosage, setCustomDosage] = useState("");
  const [customTiming, setCustomTiming] = useState("");
  const [customFrequency, setCustomFrequency] = useState("");
  const [customNotes, setCustomNotes] = useState("");

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

      toast.error("Error", {
        description: "No se pudieron cargar los suplementos",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSupplements = allSupplements.filter((supp) =>
    supp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setSelectedItems([]);
    setCustomDosage("");
    setCustomTiming("");
    setCustomFrequency("");
    setCustomNotes("");
    setSearchQuery("");
    setStep("select");
    setEditingItemIndex(null);
  };

  const toggleItemSelection = (supplement: Supplement) => {
    const existingIndex = selectedItems.findIndex(
      (item) => item.id === supplement.id
    );
    if (existingIndex >= 0) {
      setSelectedItems(
        selectedItems.filter((_, index) => index !== existingIndex)
      );
    } else {
      setSelectedItems([...selectedItems, { id: supplement.id, supplement }]);
    }
  };

  const isItemSelected = (id: string) => {
    return selectedItems.some((item) => item.id === id);
  };

  const removeItem = (index: number) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems.splice(index, 1);
    setSelectedItems(newSelectedItems);
  };

  const addSupplement = async () => {
    if (selectedItems.length === 0) {
      toast.error("Error", {
        description: "Debes seleccionar al menos un suplemento",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Crear un array de promesas para añadir cada suplemento
      const promises = selectedItems.map(async (item) => {
        const payload = {
          supplementId: item.id,
          dosage: customDosage || item.supplement.dosage,
          timing: customTiming || item.supplement.timing,
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
          throw new Error(
            `Error al añadir el suplemento ${item.supplement.name}`
          );
        }

        return response.json();
      });

      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(promises);

      // Actualizar el estado con todos los nuevos suplementos
      setSupplements([...supplements, ...results]);
      setIsAddingSupp(false);
      resetForm();

      toast.error("Suplementos añadidos", {
        description: `Se han añadido ${selectedItems.length} suplementos correctamente`,
      });
    } catch (error) {
      console.error("Error adding supplements:", error);
      toast.error("Error", {
        description: "No se pudieron añadir los suplementos",
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
      toast.success("Suplemento eliminado", {
        description: "El suplemento ha sido eliminado correctamente del plan",
      });
    } catch (error) {
      console.error("Error deleting supplement:", error);
      toast.error("Error", {
        description: "No se pudo eliminar el suplemento del plan",
      });
    }
  };

  const renderSelectedItemsList = () => {
    if (selectedItems.length === 0) {
      return (
        <div className="text-center py-6 border rounded-lg">
          <p className="text-muted-foreground text-sm">
            No has seleccionado ningún suplemento
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {selectedItems.map((item, index) => (
            <div
              key={item.id}
              className="p-3 border rounded-lg flex items-center gap-3"
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium text-sm">
                    {item.supplement.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.supplement.dosage &&
                    `Dosis recomendada: ${item.supplement.dosage}`}
                </p>
              </div>
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingItemIndex(index)}
              >
                <PlusSignIcon className="h-4 w-4" />
              </Button> */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Delete02Icon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label>Hora de toma</Label>
            <div className="mt-1">
              <TimePicker value={supplementTime} onChange={setSupplementTime} />
            </div>
          </div>

          <div>
            <Label>Dosis</Label>
            <Input
              value={customDosage}
              onChange={(e) => setCustomDosage(e.target.value)}
              placeholder="Ej: 5g, 2 cápsulas"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Momento</Label>
            <Select value={customTiming} onValueChange={setCustomTiming}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona el momento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="antes_desayuno">
                  Antes del desayuno
                </SelectItem>
                <SelectItem value="despues_desayuno">
                  Después del desayuno
                </SelectItem>
                <SelectItem value="antes_almuerzo">
                  Antes del almuerzo
                </SelectItem>
                <SelectItem value="despues_almuerzo">
                  Después del almuerzo
                </SelectItem>
                <SelectItem value="antes_cena">Antes de la cena</SelectItem>
                <SelectItem value="despues_cena">Después de la cena</SelectItem>
                <SelectItem value="antes_dormir">Antes de dormir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Frecuencia</Label>
            <Select value={customFrequency} onValueChange={setCustomFrequency}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona la frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diario</SelectItem>
                <SelectItem value="dias_alternos">Días alternos</SelectItem>
                <SelectItem value="dias_entrenamiento">
                  Días de entrenamiento
                </SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notas adicionales</Label>
            <Input
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Añade notas sobre la toma del suplemento"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-6">
      {supplements.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-sm font-medium mb-2">
            No hay suplementos configurados
          </h3>
          <p className="text-muted-foreground mb-6 text-xs">
            Añade suplementos a tu plan para complementar tu alimentación
          </p>
          <Button
            className="text-xs px-6"
            size="sm"
            onClick={() => setIsAddingSupp(true)}
          >
            Añadir Suplemento
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-md font-bold">Suplementos del Plan</h3>
            <Button
              size="sm"
              className="text-xs px-6"
              onClick={() => setIsAddingSupp(true)}
            >
              Añadir Suplemento
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {supplements.map((supp) => (
              <Card key={supp.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-md">
                        {supp.supplement.name}
                      </CardTitle>
                      {supp.supplement.description && (
                        <CardDescription className="mt-1 text-sm">
                          {supp.supplement.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteSupplement(supp.supplementId)}
                    >
                      <Delete02Icon className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-1">
                  <div className="gap-3 text-sm">
                    <div className="flex items-start">
                      <span className="font-medium w-24 text-muted-foreground">
                        Dosis:
                      </span>
                      <span className="flex-1">
                        {supp.dosage ||
                          supp.supplement.dosage ||
                          "No especificada"}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-24 text-muted-foreground">
                        Momento:
                      </span>
                      <span className="flex-1">
                        {supp.timing ||
                          supp.supplement.timing ||
                          "No especificado"}
                      </span>
                    </div>
                    {supp.frequency && (
                      <div className="flex items-start">
                        <span className="font-medium w-24 text-muted-foreground">
                          Frecuencia:
                        </span>
                        <span className="flex-1">{supp.frequency}</span>
                      </div>
                    )}
                    {supp.notes && (
                      <div className="flex items-start">
                        <span className="font-medium w-24 text-muted-foreground">
                          Notas:
                        </span>
                        <span className="flex-1">{supp.notes}</span>
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
            <DialogTitle className="text-md">Añadir Suplemento</DialogTitle>
            <DialogDescription className="text-sm">
              Selecciona los suplementos que deseas añadir a tu plan
            </DialogDescription>
          </DialogHeader>

          {editingItemIndex === null ? (
            step === "review" ? (
              <>
                {renderSelectedItemsList()}
                <DialogFooter className="mt-4">
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() => setStep("select")}
                  >
                    Volver a selección
                  </Button>
                  <Button
                    className="text-xs"
                    onClick={addSupplement}
                    disabled={submitting || selectedItems.length === 0}
                  >
                    {submitting ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Badge className="text-xs px-2 py-1">
                      {selectedItems.length} seleccionados
                    </Badge>
                  </div>
                  {selectedItems.length > 0 && (
                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={() => setStep("review")}
                    >
                      Continuar
                    </Button>
                  )}
                </div>

                <div className="relative mt-2">
                  <Search01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar suplementos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <ScrollArea className="h-[400px] mt-4 pr-4">
                  {loading ? (
                    <div className="flex flex-col gap-1 justify-center items-center h-full py-32 text-muted-foreground text-sm">
                      {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div> */}
                      <Icons.spinner className="animate-spin h-12 w-12" />
                      Buscando suplementos
                    </div>
                  ) : filteredSupplements.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full p-32 text-center">
                      <p className="text-muted-foreground mb-2 text-sm">
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
                    <div className="space-y-2">
                      {filteredSupplements.map((supp) => {
                        const isSelected = isItemSelected(supp.id);
                        return (
                          <button
                            key={supp.id}
                            className={`w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-left ${
                              isSelected
                                ? "border-zinc-300 shadow-sm bg-primary/5"
                                : ""
                            }`}
                            onClick={() => toggleItemSelection(supp)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium">{supp.name}</h3>
                                {supp.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {supp.description}
                                  </p>
                                )}
                                {(supp.dosage || supp.timing) && (
                                  <div className="mt-2 text-xs space-y-1">
                                    {supp.dosage && (
                                      <div>
                                        <span className="font-medium">
                                          Dosis recomendada:
                                        </span>{" "}
                                        {supp.dosage}
                                      </div>
                                    )}
                                    {supp.timing && (
                                      <div>
                                        <span className="font-medium">
                                          Momento recomendado:
                                        </span>{" "}
                                        {supp.timing}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <div className="ml-4">
                                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                                    <Tick02Icon className="h-4 w-4" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </>
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
