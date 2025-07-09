"use client";

import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useExerciseProgress } from "@/hooks/use-exercise-progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tick02Icon, UnfoldMoreIcon } from "hugeicons-react";

const COLORS = [
  "#A0C4E7", // Soft Sky Blue
  "#B0D0F0", // Pale Blue
  "#C8DCF2", // Light Periwinkle Blue
  "#7FBDDE", // Soft Cornflower Blue
  "#90CAE4", // Soft Azure
  "#A5D4EB", // Soft Aqua
  "#B3E0F2", // Soft Powder Blue
  "#96B9D3", // Muted Slate Blue
  "#AECDE0", // Soft Denim Blue
  "#B7D1E5", // Soft Steel Blue

  // Soft Greens
  "#A5D6B1", // Sage Green
  "#B0E0C2", // Mint Green
  "#C5E6D0", // Pale Seafoam
  "#9BC3A7", // Soft Sage
  "#AED6BC", // Light Moss Green
  "#B8E3C6", // Soft Pistachio
  "#A3D1A4", // Soft Celadon
  "#C0E2CC", // Pale Mint
  "#B5DBC0", // Soft Eucalyptus
  "#A7CEB3", // Soft Jade

  // Soft Pinks
  "#F1B5B5", // Soft Blush
  "#F5C4C4", // Pale Rose
  "#F8D0D0", // Light Salmon
  "#E7ABAB", // Soft Coral
  "#F2BEBE", // Dusty Pink
  "#F6CCCC", // Soft Peach
  "#E9B7B7", // Muted Rose
  "#F4C1C1", // Soft Coral Pink
  "#EDB3B3", // Light Raspberry
  "#F0BCBC", // Soft Berry

  // Soft Purples
  "#D1B0E1", // Lavender Soft
  "#D8C0E7", // Pale Lilac
  "#DEC8EC", // Light Wisteria
  "#C6A0D4", // Soft Orchid
  "#D3B5E3", // Soft Mauve
  "#DFCAED", // Pale Periwinkle
  "#C8A6DC", // Soft Plum
  "#D5BCE6", // Light Lavender
  "#CAB0DD", // Soft Amethyst
  "#D6C3E9", // Pale Violet

  // Soft Oranges
  "#F7C697", // Soft Peach
  "#F9D0A9", // Light Apricot
  "#FADAB8", // Pale Tangerine
  "#F5BD8A", // Soft Amber
  "#F8C9A2", // Light Coral
  "#F9D3B0", // Soft Melon
  "#F6C18F", // Muted Orange
  "#F9CFAA", // Soft Apricot
  "#F5BA93", // Pale Terracotta
  "#F8D1B5", // Light Caramel

  // Soft Yellows
  "#F5E6A0", // Soft Butter
  "#F7EBB3", // Pale Vanilla
  "#F9F0C2", // Light Cream
  "#F3E197", // Soft Mustard
  "#F6E8AB", // Pale Lemon
  "#F8EDC0", // Soft Banana
  "#F4E3A0", // Light Corn
  "#F7E9B5", // Soft Canary
  "#F2DE96", // Pale Gold
  "#F5EAC2", // Soft Buttercup

  // Soft Neutrals
  "#E0E0E0", // Soft Gray
  "#E5E5E5", // Light Ash
  "#EBEBEB", // Pale Silver
  "#D9D9D9", // Soft Stone
  "#E2E2E2", // Light Slate
  "#EFEFEF", // Pale Gray
  "#DBDBDB", // Soft Cloud
  "#E7E7E7", // Light Fog
  "#D5D5D5", // Soft Pewter
  "#EAEAEA", // Pale Ash
];

interface FormattedRecord {
  date: string;
  exercises: Record<string, { weight: number; reps: number }>;
  originalDate: Date;
}

export function ExerciseProgressChart() {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState("30");
  const [open, setOpen] = useState(false);
  const { progressData, fetchExerciseProgressData } = useExerciseProgress();

  useEffect(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    fetchExerciseProgressData("all", startDate.toISOString());
  }, [timeRange, fetchExerciseProgressData]);

  // Obtener la lista de ejercicios disponibles
  const availableExercises = progressData
    .reduce((acc, record) => {
      Object.keys(record.exercises).forEach((exercise) => {
        if (!acc.includes(exercise)) {
          acc.push(exercise);
        }
      });
      return acc;
    }, [] as string[])
    .sort();

  // Formatear los datos para el gráfico
  const formattedData: FormattedRecord[] = progressData
    .map((record) => ({
      date: format(new Date(record.date), "dd 'de' MMM 'del' yy", {
        locale: es,
      }),
      exercises: record.exercises,
      originalDate: new Date(record.date),
    }))
    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

  // Filtrar los datos según los ejercicios seleccionados
  const filteredData = formattedData.filter((record) =>
    selectedExercises.some(
      (exercise) => record.exercises[exercise] !== undefined,
    ),
  );

  // Calcular el progreso para cada ejercicio seleccionado
  const calculateProgressChange = () => {
    if (filteredData.length < 2) return null;

    const firstRecord = filteredData[0];
    const lastRecord = filteredData[filteredData.length - 1];

    return selectedExercises.reduce(
      (acc, exercise) => {
        const first = firstRecord.exercises[exercise]?.weight || 0;
        const last = lastRecord.exercises[exercise]?.weight || 0;
        const reps = lastRecord.exercises[exercise]?.reps || 0;

        acc[exercise] = {
          change: last - first,
          first,
          last,
          reps,
        };
        return acc;
      },
      {} as Record<
        string,
        { change: number; first: number; last: number; reps: number }
      >,
    );
  };

  // const progressChange = calculateProgressChange();
  // console.log(progressChange);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Rango de tiempo</Label>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px] text-xs md:text-sm">
              <SelectValue placeholder="Selecciona el rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="text-xs md:text-sm" value="7">
                Última semana
              </SelectItem>
              <SelectItem className="text-xs md:text-sm" value="30">
                Último mes
              </SelectItem>
              <SelectItem className="text-xs md:text-sm" value="90">
                Últimos 3 meses
              </SelectItem>
              <SelectItem className="text-xs md:text-sm" value="180">
                Últimos 6 meses
              </SelectItem>
              <SelectItem className="text-xs md:text-sm" value="365">
                Último año
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm">Selecciona los ejercicios a mostrar:</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-xs md:text-sm"
            >
              {selectedExercises.length === 0
                ? "Seleccionar ejercicios..."
                : `${selectedExercises.length} ejercicio${
                    selectedExercises.length === 1 ? "" : "s"
                  } seleccionado${selectedExercises.length === 1 ? "" : "s"}`}
              <UnfoldMoreIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {availableExercises.map((exercise) => (
                  <CommandItem
                    className="text-xs md:text-sm"
                    key={exercise}
                    onSelect={() => {
                      setSelectedExercises((prev) =>
                        prev.includes(exercise)
                          ? prev.filter((item) => item !== exercise)
                          : [...prev, exercise],
                      );
                    }}
                  >
                    <Tick02Icon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedExercises.includes(exercise)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {exercise}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedExercises.length > 0 && filteredData.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#3D3D3E" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#121212" : "#ffffff",
                      border: `1px solid ${isDark ? "#3D3D3E" : "#e5e7eb"}`,
                      borderRadius: "0.375rem",
                    }}
                    formatter={(value: number, name: string) => {
                      const record = filteredData.find(
                        (d) =>
                          d.exercises[name] &&
                          d.exercises[name].weight === value,
                      );

                      const reps = record?.exercises[name]?.reps;
                      return [`${value}kg (${reps || 0} reps)`, name];
                    }}
                    labelStyle={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: isDark ? "#e5e7eb" : "#121212",
                    }}
                    itemStyle={{
                      fontSize: 12,
                      color: isDark ? "#e5e7eb" : "#121212",
                    }}
                  />
                  {/* <Legend /> */}
                  {selectedExercises.map((exercise, index) => (
                    <Line
                      key={exercise}
                      type="monotone"
                      dataKey={`exercises.${exercise}.weight`}
                      name={exercise}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                      dot={{ fill: isDark ? "#000" : "#eee", r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {calculateProgressChange() && (
              <div className="flex flex-wrap gap-3 mt-4">
                {Object.entries(calculateProgressChange() ?? {}).map(
                  ([exercise, data]) => (
                    <div
                      key={exercise}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card text-card-foreground"
                    >
                      <span className="text-xs font-medium">{exercise}:</span>
                      <span
                        className={cn(
                          "text-xs",
                          data.change > 0
                            ? "text-green-500"
                            : data.change < 0
                              ? "text-red-500"
                              : "text-muted-foreground",
                        )}
                      >
                        {data.change > 0 ? "+" : ""}
                        {data.change.toFixed(1)}kg
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({data.reps} reps)
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="">
            {selectedExercises.length === 0 ? (
              <p className="text-center text-xs font-medium">
                Selecciona al menos un ejercicio para mostrar su progreso
              </p>
            ) : (
              <p className="ext-center text-xs font-medium">
                No hay datos disponibles para el período seleccionado
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
