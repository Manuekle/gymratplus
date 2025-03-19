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
  Legend,
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
import { useProgress } from "@/hooks/use-progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "./icons";
import { CardTitle } from "./ui/card";
import ChartSkeleton from "./skeleton/charts-skeleton";

// Tipos para los períodos de tiempo
type TimePeriod = "all" | "week" | "month" | "year";

export function WeightChart() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [chartData, setChartData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchProgressData } = useProgress();

  // Función para filtrar datos según el período de tiempo seleccionado
  const filterDataByTimePeriod = useCallback(
    (data: any[], period: TimePeriod) => {
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
      // Obtener todos los registros de peso
      const data = await fetchProgressData("weight");

      if (data && data.length > 0) {
        // Transformar datos para el gráfico
        const formattedData = data.map((record) => ({
          date: format(new Date(record.date), "d MMM", { locale: es }),
          weight: record.weight,
          // Guardar la fecha original para ordenar y filtrar correctamente
          originalDate: new Date(record.date),
        }));

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
      console.error("Error al cargar datos de peso:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar datos"
      );
    } finally {
      setIsLoading(false);
    }
  }, [timePeriod, fetchProgressData, filterDataByTimePeriod]);

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

  // Calcular la diferencia entre el primer y último valor
  const calculateWeightChange = () => {
    if (filteredData.length < 2) return null;

    const firstWeight = filteredData[0].weight;
    const lastWeight = filteredData[filteredData.length - 1].weight;

    return {
      change: lastWeight - firstWeight,
      firstWeight,
      lastWeight,
    };
  };

  const weightChange = calculateWeightChange();

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Select
          value={timePeriod}
          onValueChange={(value) => setTimePeriod(value as TimePeriod)}
        >
          <SelectTrigger className="w-[250px] text-xs">
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
      </div>

      <div className="w-full h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full py-8">
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
            <p className="text-gray-500">No hay datos de peso disponibles</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">
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
                domain={["dataMin - 2", "dataMax + 2"]}
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
                formatter={(value) => [`${value} kg`, "Peso"]}
              />
              {/* <Legend /> */}
              <Line
                name="Peso (kg)"
                type="monotone"
                dataKey="weight"
                stroke={isDark ? "#578FCA" : "#578FCA"}
                strokeWidth={2}
                dot={{ fill: isDark ? "#578FCA" : "#578FCA", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {filteredData.length > 0 && weightChange && (
        <div className="text-center">
          <p className="text-sm font-medium">{getTimePeriodLabel()}</p>
          <p className="text-xs text-gray-500 mt-1">
            {weightChange.change < 0
              ? `Has perdido ${Math.abs(weightChange.change).toFixed(
                  1
                )} kg (de ${weightChange.firstWeight} kg a ${
                  weightChange.lastWeight
                } kg)`
              : weightChange.change > 0
              ? `Has ganado ${weightChange.change.toFixed(1)} kg (de ${
                  weightChange.firstWeight
                } kg a ${weightChange.lastWeight} kg)`
              : "Tu peso se ha mantenido estable"}
          </p>
        </div>
      )}
    </div>
  );
}
