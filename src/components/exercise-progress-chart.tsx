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
import { useEffect, useState, useCallback } from "react";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  isAfter,
} from "date-fns";
import { es } from "date-fns/locale";
import { useExerciseProgress } from "@/hooks/use-exercise-progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExerciseProgress } from "./progress/excercise-progress";
import ChartSkeleton from "./skeleton/charts-skeleton";

// Removed unused ChartDataItem interface
// Removed top-level state declarations; state is managed inside the ExerciseProgressChart component.
type TimePeriod = "all" | "week" | "month" | "year";

interface FormattedRecord {
  date: string;
  benchPress: number;
  squat: number;
  deadlift: number;
  originalDate: Date;
}

export function ExerciseProgressChart() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [chartData, setChartData] = useState<FormattedRecord[]>([]);
  const [filteredData, setFilteredData] = useState<FormattedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchExerciseProgressData } = useExerciseProgress();

  // Función para filtrar datos según el período de tiempo seleccionado
  const filterDataByTimePeriod = useCallback(
    (
      data: {
        date: string;
        benchPress: number;
        squat: number;
        deadlift: number;
        originalDate: Date;
      }[],
      period: TimePeriod
    ) => {
      if (period === "all" || !data.length) {
        return data;
      }

      const today = new Date();
      let startDate: Date;

      switch (period) {
        case "week":
          startDate = subDays(today, 7);
          break;
        case "month":
          startDate = subMonths(today, 1);
          break;
        case "year":
          startDate = subYears(today, 1);
          break;
        default:
          return data;
      }

      return data.filter((item) => {
        const itemDate = new Date(item.originalDate);
        return (
          isAfter(itemDate, startOfDay(startDate)) &&
          isAfter(endOfDay(today), itemDate)
        );
      });
    },
    []
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener todos los registros sin filtrar por fecha
      const data = await fetchExerciseProgressData("all");

      if (data && data.length > 0) {
        // Transformar datos para el gráfico
        interface RawRecord {
          date: string | number | Date;
          benchPress: number;
          squat: number;
          deadlift: number;
        }

        interface FormattedRecord {
          date: string;
          benchPress: number;
          squat: number;
          deadlift: number;
          originalDate: Date;
        }

        const formattedData: FormattedRecord[] = data.map(
          (record: RawRecord) => ({
            date: format(new Date(record.date), "d MMM", { locale: es }),
            benchPress: record.benchPress,
            squat: record.squat,
            deadlift: record.deadlift,
            // Guardar la fecha original para ordenar y filtrar correctamente
            originalDate: new Date(record.date),
          })
        );

        // Ordenar por fecha
        const sortedData = formattedData.sort(
          (a, b) => a.originalDate.getTime() - b.originalDate.getTime()
        );

        setChartData(sortedData);

        // Aplicar filtro de tiempo
        const filtered = filterDataByTimePeriod(sortedData, timePeriod);
        setFilteredData(filtered);
      } else {
        setChartData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error al cargar datos de ejercicios:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar datos"
      );
    } finally {
      setIsLoading(false);
    }
  }, [timePeriod, fetchExerciseProgressData, filterDataByTimePeriod]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, timePeriod, loadData]);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case "week":
        return "Última semana";
      case "month":
        return "Último mes";
      case "year":
        return "Último año";
      default:
        return "Todo el tiempo";
    }
  };

  // Calcular la diferencia entre el primer y último valor para cada ejercicio
  const calculateProgressChange = () => {
    if (filteredData.length < 2) return null;

    const firstRecord = filteredData[0];
    const lastRecord = filteredData[filteredData.length - 1];

    return {
      benchPress: {
        change: (lastRecord.benchPress || 0) - (firstRecord.benchPress || 0),
        first: firstRecord.benchPress || 0,
        last: lastRecord.benchPress || 0,
      },
      squat: {
        change: (lastRecord.squat || 0) - (firstRecord.squat || 0),
        first: firstRecord.squat || 0,
        last: lastRecord.squat || 0,
      },
      deadlift: {
        change: (lastRecord.deadlift || 0) - (firstRecord.deadlift || 0),
        first: firstRecord.deadlift || 0,
        last: lastRecord.deadlift || 0,
      },
    };
  };

  const progressChange = calculateProgressChange();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-start md:justify-end">
        {/* <h3 className="text-lg font-medium">Progreso en Ejercicios Básicos</h3> */}
        <div className="flex items-center gap-2">
          <Select
            value={timePeriod}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
          >
            <SelectTrigger className="w-[180px] text-xs">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="text-xs" value="all">
                Todo el tiempo
              </SelectItem>
              <SelectItem className="text-xs" value="week">
                Última semana
              </SelectItem>
              <SelectItem className="text-xs" value="month">
                Último mes
              </SelectItem>
              <SelectItem className="text-xs" value="year">
                Último año
              </SelectItem>
            </SelectContent>
          </Select>
          <ExerciseProgress
            onSuccess={() => {
              loadData();
            }}
          />
        </div>
      </div>

      <div className="w-full h-[250px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <ChartSkeleton />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500 mb-2">Error: {error}</p>
            <button
              onClick={() => loadData()}
              className="px-3 py-1 bg-primary text-white rounded-md text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground mb-4 text-sm">
              No hay datos de ejercicios disponibles
            </p>
            <ExerciseProgress
              onSuccess={() => {
                loadData();
              }}
            />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground mb-4">
              No hay datos para el período seleccionado
            </p>
          </div>
        ) : (
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
                stroke={isDark ? "#374151" : "#e5e7eb"}
              />
              <XAxis
                dataKey="date"
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "0.375rem",
                }}
                labelStyle={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: isDark ? "#e5e7eb" : "#1f2937",
                }}
                itemStyle={{
                  fontSize: 12,
                  color: isDark ? "#e5e7eb" : "#1f2937",
                }}
                formatter={(value, name, props) => {
                  // Mapear el dataKey al nombre correcto en español
                  const exerciseNames = {
                    benchPress: "Press banca",
                    squat: "Sentadilla",
                    deadlift: "Peso muerto",
                  };
                  const key = props.dataKey;
                  return [
                    `${value} kg`,
                    key && exerciseNames[key as keyof typeof exerciseNames]
                      ? exerciseNames[key as keyof typeof exerciseNames]
                      : key || "",
                  ];
                }}
              />
              <Line
                type="monotone"
                dataKey="squat"
                name="Sentadilla"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="benchPress"
                name="Press banca"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="deadlift"
                name="Peso muerto"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {filteredData.length > 0 && progressChange && (
        <div className="text-center">
          <p className="text-sm font-medium">{getTimePeriodLabel()}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-[#10b981]">Press banca: </span>
              {progressChange.benchPress.change > 0
                ? `+${progressChange.benchPress.change.toFixed(1)} kg`
                : progressChange.benchPress.change < 0
                ? `${progressChange.benchPress.change.toFixed(1)} kg`
                : "Sin cambios"}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-[#8b5cf6]">Sentadilla: </span>
              {progressChange.squat.change > 0
                ? `+${progressChange.squat.change.toFixed(1)} kg`
                : progressChange.squat.change < 0
                ? `${progressChange.squat.change.toFixed(1)} kg`
                : "Sin cambios"}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-[#f59e0b]">Peso muerto: </span>
              {progressChange.deadlift.change > 0
                ? `+${progressChange.deadlift.change.toFixed(1)} kg`
                : progressChange.deadlift.change < 0
                ? `${progressChange.deadlift.change.toFixed(1)} kg`
                : "Sin cambios"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
