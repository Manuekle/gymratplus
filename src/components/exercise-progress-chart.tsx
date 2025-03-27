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
  "#6B9DE3", // Soft blue
  "#E77A7A", // Soft red
  "#7BC9A1", // Soft green
  "#B480D4", // Soft purple
  "#F2A96D", // Soft orange
  "#5BC0CE", // Soft cyan
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
      (exercise) => record.exercises[exercise] !== undefined
    )
  );

  // Calcular el progreso para cada ejercicio seleccionado
  const calculateProgressChange = () => {
    if (filteredData.length < 2) return null;

    const firstRecord = filteredData[0];
    const lastRecord = filteredData[filteredData.length - 1];

    return selectedExercises.reduce((acc, exercise) => {
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
    }, {} as Record<string, { change: number; first: number; last: number; reps: number }>);
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
                          : [...prev, exercise]
                      );
                    }}
                  >
                    <Tick02Icon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedExercises.includes(exercise)
                          ? "opacity-100"
                          : "opacity-0"
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
                          d.exercises[name].weight === value
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
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card text-card-foreground"
                    >
                      <span className="text-sm font-medium">{exercise}:</span>
                      <span
                        className={cn(
                          "text-sm",
                          data.change > 0
                            ? "text-green-500"
                            : data.change < 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                        )}
                      >
                        {data.change > 0 ? "+" : ""}
                        {data.change.toFixed(1)}kg
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({data.reps} reps)
                      </span>
                    </div>
                  )
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
