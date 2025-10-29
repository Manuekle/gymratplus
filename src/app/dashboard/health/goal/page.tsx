"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoals, type Goal, type GoalType } from "@/hooks/use-goals";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-react";

export default function GoalPage() {
  const router = useRouter();
  const [type, setType] = useState<GoalType>("weight");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [initialValue, setInitialValue] = useState<string>("");
  const [targetValue, setTargetValue] = useState<string>("");
  const [unit, setUnit] = useState("");
  const [exerciseType, setExerciseType] = useState("");
  const [measurementType, setMeasurementType] = useState("");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [unitSearchValue, setUnitSearchValue] = useState("");
  const [unitOpen, setUnitOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());

  const exercises = [
    { value: "press_banca", label: "Press de banca" },
    { value: "press_militar", label: "Press militar" },
    { value: "press_arnold", label: "Press Arnold" },
    { value: "fondos", label: "Fondos en paralelas" },
    { value: "dominadas", label: "Dominadas" },
    { value: "dominadas_agarre_ancho", label: "Dominadas agarre ancho" },
    { value: "dominadas_agarre_cerrado", label: "Dominadas agarre cerrado" },
    { value: "remo_con_barra", label: "Remo con barra" },
    { value: "remo_mancuerna", label: "Remo con mancuerna" },
    { value: "sentadilla_libre", label: "Sentadilla libre" },
    { value: "sentadilla_frontal", label: "Sentadilla frontal" },
    { value: "prensa", label: "Prensa de piernas" },
    { value: "prensa_45", label: "Prensa 45°" },
    { value: "prensa_horizontal", label: "Prensa horizontal" },
    { value: "prensa_vertical", label: "Prensa vertical" },
    { value: "prensa_inclinada", label: "Prensa inclinada" },
    { value: "prensa_sentadilla", label: "Prensa sentadilla" },
    { value: "prensa_piernas_sentado", label: "Prensa de piernas sentado" },
    { value: "prensa_piernas_parado", label: "Prensa de piernas de pie" },
    { value: "prensa_piernas_tumbado", label: "Prensa de piernas tumbado" },
    { value: "prensa_piernas_maquina", label: "Prensa de piernas en máquina" },
    { value: "peso_muerto", label: "Peso muerto" },
    { value: "curl_biceps", label: "Curl de bíceps" },
    { value: "extension_triceps", label: "Extensión de tríceps" },
    { value: "elevaciones_laterales", label: "Elevaciones laterales" },
    { value: "vuelos_posteriores", label: "Vuelos posteriores" },
    { value: "plancha", label: "Plancha" },
    { value: "crunches", label: "Abdominales tradicionales" },
    { value: "elevacion_piernas", label: "Elevación de piernas" },
    { value: "russian_twist", label: "Russian twist" },
    { value: "cinta", label: "Cinta de correr" },
    { value: "elíptica", label: "Elíptica" },
    { value: "bicicleta", label: "Bicicleta estática" },
    { value: "remo_maquina", label: "Máquina de remo" },
    { value: "otro", label: "Otro ejercicio" },
  ];

  // Unit options with categories
  const unitOptions = [
    {
      category: "Peso",
      items: [
        { value: "kg", label: "Kilogramos (kg)" },
        { value: "g", label: "Gramos (g)" },
        { value: "lb", label: "Libras (lb)" },
        { value: "oz", label: "Onzas (oz)" },
      ],
    },
    {
      category: "Longitud",
      items: [
        { value: "cm", label: "Centímetros (cm)" },
        { value: "m", label: "Metros (m)" },
        { value: "in", label: "Pulgadas (in)" },
        { value: "ft", label: "Pies (ft)" },
      ],
    },
    {
      category: "Tiempo",
      items: [
        { value: "min", label: "Minutos (min)" },
        { value: "h", label: "Horas (h)" },
        { value: "d", label: "Días (d)" },
        { value: "sem", label: "Semanas" },
      ],
    },
    {
      category: "Otras unidades",
      items: [
        { value: "%", label: "Porcentaje (%)" },
        { value: "kcal", label: "Kilocalorías (kcal)" },
        { value: "km", label: "Kilómetros (km)" },
        { value: "mi", label: "Millas (mi)" },
        { value: "l", label: "Litros (l)" },
        { value: "ml", label: "Mililitros (ml)" },
      ],
    },
  ];

  // Filter unit options based on search
  const filteredUnitOptions = unitOptions
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(unitSearchValue.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  // Measurement type options with categories
  const measurementOptions = [
    {
      category: "Medidas corporales principales",
      items: [
        { value: "peso", label: "Peso corporal" },
        { value: "grasa_corporal", label: "% Grasa corporal" },
        { value: "musculo", label: "% Músculo" },
        { value: "agua", label: "% Agua corporal" },
        { value: "hueso", label: "Masa ósea" },
        { value: "imc", label: "Índice de Masa Corporal (IMC)" },
      ],
    },
    {
      category: "Circunferencias",
      items: [
        { value: "cuello", label: "Cuello" },
        { value: "hombros", label: "Hombros" },
        { value: "pecho", label: "Pecho (tórax)" },
        { value: "biceps_izq", label: "Bíceps izquierdo" },
        { value: "biceps_der", label: "Bíceps derecho" },
        { value: "antebrazo_izq", label: "Antebrazo izquierdo" },
        { value: "antebrazo_der", label: "Antebrazo derecho" },
        { value: "cintura", label: "Cintura (a la altura del ombligo)" },
        { value: "abdomen", label: "Abdomen (a la altura de la cintura)" },
        { value: "cadera", label: "Cadera (parte más ancha)" },
        { value: "muslo_izq", label: "Muslo izquierdo" },
        { value: "muslo_der", label: "Muslo derecho" },
        { value: "pantorrilla_izq", label: "Pantorrilla izquierda" },
        { value: "pantorrilla_der", label: "Pantorrilla derecha" },
      ],
    },
    {
      category: "Pliegues cutáneos",
      items: [
        { value: "pliegue_tricipital", label: "Pliegue tricipital" },
        { value: "pliegue_bicipital", label: "Pliegue bicipital" },
        { value: "pliegue_subescapular", label: "Pliegue subescapular" },
        { value: "pliegue_suprailiaco", label: "Pliegue suprailíaco" },
        { value: "pliegue_abdominal", label: "Pliegue abdominal" },
        { value: "pliegue_muslo", label: "Pliegue del muslo" },
        { value: "pliegue_pantorrilla", label: "Pliegue de la pantorrilla" },
      ],
    },
    {
      category: "Otras medidas",
      items: [
        { value: "altura", label: "Estatura" },
        { value: "tension_arterial", label: "Tensión arterial" },
        {
          value: "frecuencia_cardiaca",
          label: "Frecuencia cardíaca en reposo",
        },
        { value: "cintura_cadera", label: "Relación cintura-cadera" },
        { value: "otro", label: "Otra medida" },
      ],
    },
  ];

  // Filter options based on search
  const filteredOptions = measurementOptions
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.value.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  // Get the selected measurement label
  const selectedMeasurement =
    measurementOptions
      .flatMap((group) => group.items)
      .find((item) => item.value === measurementType)?.label ||
    "Selecciona una parte";
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createGoal } = useGoals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }

    if (!type) {
      setError("El tipo de objetivo es obligatorio");
      return;
    }

    if (!startDate) {
      setError("La fecha de inicio es obligatoria");
      return;
    }

    if (initialValue && isNaN(Number.parseFloat(initialValue))) {
      setError("El valor inicial debe ser un número válido");
      return;
    }

    if (targetValue && isNaN(Number.parseFloat(targetValue))) {
      setError("El valor objetivo debe ser un número válido");
      return;
    }

    setIsSubmitting(true);

    try {
      const data: Partial<Goal> = {
        type,
        title: title.trim(),
        description: description.trim(),
        initialValue: initialValue
          ? Number.parseFloat(initialValue)
          : undefined,
        targetValue: targetValue ? Number.parseFloat(targetValue) : undefined,
        unit: unit || undefined,
        startDate: startDate.toISOString(),
        targetDate: targetDate ? targetDate.toISOString() : undefined,
      };

      // Añadir campos específicos según el tipo
      if (type === "strength" && exerciseType) {
        data.exerciseType = exerciseType;
      } else if (type === "measurement" && measurementType) {
        data.measurementType = measurementType;
      }

      await createGoal(data as Goal);
      router.push("/dashboard"); // Redirigir al dashboard
    } catch (error) {
      console.error("Error al guardar:", error);
      setError(
        "Ocurrió un error al guardar el objetivo. Por favor, intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: GoalType) => {
    switch (type) {
      case "weight":
        return "🏋🏻";
      case "strength":
        return "💪🏻";
      case "measurement":
        return "📏";
      case "activity":
        return "🏃🏻";
      default:
        return "🎯";
    }
  };

  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-2">
        <Button
          variant="outline"
          className="text-xs"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />{" "}
          Volver al dashboard
        </Button>
      </div>

      {/* Main Form Card */}
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-semibold tracking-heading">
            Detalles del objetivo
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Completa la información para crear tu objetivo personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de objetivo */}
            <div className="space-y-3">
              <Label htmlFor="type" className="text-xs font-medium">
                Tipo de objetivo
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(
                  [
                    "weight",
                    "strength",
                    "measurement",
                    "activity",
                  ] as GoalType[]
                ).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex flex-col items-center border border-zinc-200 dark:border-zinc-800 justify-center p-3 rounded-lg transition-all h-full min-h-[100px]",
                      type === t
                        ? "bg-zinc-100 dark:bg-zinc-800 shadow-sm"
                        : "bg-card hover:bg-accent/50 dark:hover:bg-zinc-800/70",
                    )}
                  >
                    <span className="text-2xl mb-1">{getTypeIcon(t)}</span>
                    <span className="text-xs font-medium capitalize">
                      {t === "weight" && "Peso"}
                      {t === "strength" && "Fuerza"}
                      {t === "measurement" && "Medidas"}
                      {t === "activity" && "Actividad"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Título y Descripción */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-medium">
                  Título del objetivo{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Perder 5kg en 3 meses"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-medium">
                  Descripción (opcional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu objetivo y por qué es importante para ti..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-xs resize-none w-full"
                />
              </div>
            </div>

            {/* Valores y Unidad */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="initialValue" className="text-xs font-medium">
                  Valor inicial
                </Label>
                <Input
                  id="initialValue"
                  type="number"
                  step="0.1"
                  placeholder="80"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetValue" className="text-xs font-medium">
                  Valor objetivo
                </Label>
                <Input
                  id="targetValue"
                  type="number"
                  step="0.1"
                  placeholder="75"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Unidad</Label>
                <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={`w-full justify-between text-xs h-9 ${unit ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {unit
                        ? unitOptions
                            .flatMap((group) => group.items)
                            .find((u) => u.value === unit)?.label ||
                          "Seleccionar unidad"
                        : "Seleccionar unidad"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <div className="px-2">
                        <div className="relative">
                          <CommandInput
                            placeholder="Buscar unidad..."
                            className="text-xs"
                            value={unitSearchValue}
                            onValueChange={setUnitSearchValue}
                          />
                        </div>
                      </div>
                      <CommandList className="max-h-[300px] overflow-auto">
                        {filteredUnitOptions.length > 0 ? (
                          filteredUnitOptions.map((group) => (
                            <CommandGroup
                              key={group.category}
                              heading={group.category}
                            >
                              {group.items.map((item) => (
                                <CommandItem
                                  key={item.value}
                                  value={item.value}
                                  onSelect={() => {
                                    setUnit(
                                      item.value === unit ? "" : item.value,
                                    );
                                    setUnitOpen(false);
                                    setUnitSearchValue("");
                                  }}
                                  className="text-xs"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      unit === item.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {item.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))
                        ) : (
                          <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                            No se encontraron unidades.
                          </CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Campos específicos por tipo */}

              {type === "strength" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Tipo de ejercicio
                  </Label>
                  <Popover open={exerciseOpen} onOpenChange={setExerciseOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={`w-full justify-between text-xs h-9 ${exerciseType ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {exerciseType
                          ? exercises.find((ex) => ex.value === exerciseType)
                              ?.label
                          : "Seleccionar ejercicio"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <div className="px-2">
                          <div className="relative">
                            <CommandInput
                              placeholder="Buscar ejercicio..."
                              className="text-xs"
                              value={exerciseSearch}
                              onValueChange={setExerciseSearch}
                            />
                          </div>
                        </div>
                        <CommandList className="max-h-[300px] overflow-auto">
                          {exercises.filter((ex) =>
                            ex.label
                              .toLowerCase()
                              .includes(exerciseSearch?.toLowerCase() || ""),
                          ).length > 0 ? (
                            exercises
                              .filter((ex) =>
                                ex.label
                                  .toLowerCase()
                                  .includes(
                                    exerciseSearch?.toLowerCase() || "",
                                  ),
                              )
                              .map((exercise) => (
                                <CommandItem
                                  key={exercise.value}
                                  value={exercise.value}
                                  onSelect={() => {
                                    setExerciseType(
                                      exercise.value === exerciseType
                                        ? ""
                                        : exercise.value,
                                    );
                                    setExerciseOpen(false);
                                    setExerciseSearch("");
                                  }}
                                  className="text-xs"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      exerciseType === exercise.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {exercise.label}
                                </CommandItem>
                              ))
                          ) : (
                            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                              No se encontraron ejercicios.
                            </CommandEmpty>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {type === "measurement" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="measurementType"
                    className="text-xs font-medium"
                  >
                    Parte del cuerpo
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={`w-full justify-between text-xs font-normal text-muted-foreground ${selectedMeasurement ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        <span className="truncate">{selectedMeasurement}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <div className="flex items-center border-b px-3">
                          <CommandInput
                            placeholder="Buscar medida..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                          />
                        </div>
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron resultados.
                          </CommandEmpty>
                          {filteredOptions.map((group) => (
                            <CommandGroup
                              key={group.category}
                              heading={group.category}
                            >
                              {group.items.map((item) => (
                                <CommandItem
                                  key={item.value}
                                  value={item.value}
                                  onSelect={() => {
                                    setMeasurementType(item.value);
                                    setOpen(false);
                                    setSearchValue("");
                                  }}
                                  className="text-xs"
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      measurementType === item.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {item.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-medium">
                  Fecha de inicio <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-xs",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <HugeiconsIcon
                        icon={Calendar02Icon}
                        className="mr-2 h-4 w-4"
                      />
                      {startDate ? (
                        format(startDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate" className="text-xs font-medium">
                  Fecha objetivo (opcional)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-xs",
                        !targetDate && "text-muted-foreground",
                      )}
                    >
                      <HugeiconsIcon
                        icon={Calendar02Icon}
                        className="mr-2 h-4 w-4"
                      />
                      {targetDate ? (
                        format(targetDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      initialFocus
                      locale={es}
                      disabled={(date) =>
                        date < new Date() ||
                        (startDate ? date < startDate : false)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creando objetivo...
                  </>
                ) : (
                  "Crear objetivo"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
