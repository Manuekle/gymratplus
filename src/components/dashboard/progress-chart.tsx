"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useProgress } from "@/hooks/use-progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewProgress } from "../progress/new-progress";
import ChartSkeleton from "../skeleton/charts-skeleton";
import { ProgressRecord } from "@/types/progress"; // Import the type definition for progress records

// Tipos para los períodos de tiempo
type TimePeriod = "all" | "week" | "month" | "year";

export default function ProgressChart() {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const [dataType, setDataType] = useState("weight");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ProgressRecord[]>([]);
  const [filteredData, setFilteredData] = useState<ProgressRecord[]>([]);
  const [progressStats, setProgressStats] = useState({
    change: 0,
    percentChange: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Usar una referencia para evitar que fetchProgressData y getProgressStats
  // se recreen en cada renderizado
  const { fetchProgressData, getProgressStats } = useProgress();

  // Función para filtrar datos según el período de tiempo seleccionado
  const filterDataByTimePeriod = useCallback(
    (data: ProgressRecord[], period: TimePeriod) => {
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
    [],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener todos los registros sin filtrar por fecha
      const data = await fetchProgressData("all");

      if (data && data.length > 0) {
        // Transformar datos para el gráfico
        const formattedData = data.map((record: ProgressRecord) => ({
          date: format(new Date(record.date), "d MMM", { locale: es }),
          weight: record.weight,
          bodyFatPercentage: record.bodyFatPercentage,
          muscleMassPercentage: record.muscleMassPercentage,
          // Guardar la fecha original para ordenar y filtrar correctamente
          originalDate: new Date(record.date),
        }));

        // Ordenar por fecha
        const sortedData: ProgressRecord[] = formattedData.sort(
          (a: ProgressRecord, b: ProgressRecord) =>
            a.originalDate.getTime() - b.originalDate.getTime(),
        );

        setChartData(sortedData);

        // Aplicar filtro de tiempo
        const filtered = filterDataByTimePeriod(sortedData, timePeriod);
        setFilteredData(filtered);

        // Calcular estadísticas según el tipo seleccionado y los datos filtrados
        if (filtered.length > 0) {
          // Convertir los datos filtrados de nuevo al formato original para getProgressStats
          const statsData = filtered.map((item) => ({
            date: item.originalDate,
            weight: item.weight,
            bodyFatPercentage: item.bodyFatPercentage,
            muscleMassPercentage: item.muscleMassPercentage,
          }));

          const stats = getProgressStats(
            statsData,
            dataType === "weight"
              ? "weight"
              : dataType === "bodyFat"
                ? "bodyFat"
                : "muscle",
          );

          setProgressStats(stats);
        } else {
          setProgressStats({
            change: 0,
            percentChange: 0,
          });
        }
      } else {
        setChartData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar datos",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    dataType,
    timePeriod,
    fetchProgressData,
    getProgressStats,
    filterDataByTimePeriod,
  ]);

  // Usar useEffect con la función loadData como dependencia
  useEffect(() => {
    loadData();
  }, [dataType, timePeriod, loadData]);

  const getChartConfig = () => {
    switch (dataType) {
      case "weight":
        return {
          dataKey: "weight",
          color: "#578FCA",
          unit: "kg",
          title: "Peso",
        };
      case "bodyFat":
        return {
          dataKey: "bodyFatPercentage",
          color: "#FBA518",
          unit: "%",
          title: "Grasa Corporal",
        };
      case "muscle":
        return {
          dataKey: "muscleMassPercentage",
          color: "#DE3163",
          unit: "%",
          title: "Masa Muscular",
        };
      default:
        return {
          dataKey: "weight",
          color: "#578FCA",
          unit: "kg",
          title: "Peso",
        };
    }
  };

  const chartConfig = getChartConfig();

  const getProgressMessage = () => {
    const change = progressStats.change;
    let message = "";

    if (dataType === "weight") {
      message =
        change < 0
          ? `Has perdido ${Math.abs(change).toFixed(1)}kg en este período`
          : change > 0
            ? `Has ganado ${change.toFixed(1)}kg en este período`
            : "Tu peso se ha mantenido estable";
    } else if (dataType === "bodyFat") {
      message =
        change < 0
          ? `Has reducido un ${Math.abs(change).toFixed(1)}% de grasa corporal`
          : change > 0
            ? `Ha aumentado un ${change.toFixed(1)}% tu grasa corporal`
            : "Tu porcentaje de grasa corporal se ha mantenido estable";
    } else {
      message =
        change > 0
          ? `Has ganado ${change.toFixed(1)}% de masa muscular`
          : change < 0
            ? `Has perdido ${Math.abs(change).toFixed(1)}% de masa muscular`
            : "Tu masa muscular se ha mantenido estable";
    }

    return message;
  };

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

  return (
    <div className="p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold  tracking-heading">
          Seguimiento de Progreso
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-4 items-center">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDataType("weight")}
            className={`px-3 py-1 text-xs rounded-md ${
              dataType === "weight"
                ? "bg-[#578FCA] text-white dark:text-[#578FCA]"
                : "text-muted-foreground "
            }`}
          >
            Peso
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDataType("bodyFat")}
            className={`px-3 py-1 text-xs rounded-md ${
              dataType === "bodyFat"
                ? "bg-[#FBA518] text-white dark:text-[#FBA518]"
                : "text-muted-foreground"
            }`}
          >
            Grasa corporal
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDataType("muscle")}
            className={`px-3 py-1 text-xs rounded-md ${
              dataType === "muscle"
                ? "bg-[#DE3163] text-white dark:text-[#DE3163]"
                : "text-muted-foreground"
            }`}
          >
            Masa muscular
          </Button>
        </div>

        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <Select
            value={timePeriod}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
          >
            <SelectTrigger className="w-full sm:w-[180px] text-xs">
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
          <NewProgress
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
              className="px-3 py-1 bg-primary text-white rounded-md text-xs"
            >
              Reintentar
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <h3 className="text-xs font-medium">No hay datos disponibles</h3>
            <p className="text-muted-foreground text-center text-xs mb-4">
              Asegúrate de establecer un objetivo para hacer seguimiento de tu
              progreso
            </p>
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
                labelStyle={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: isDark ? "#e5e7eb" : "#121212",
                }}
                itemStyle={{
                  fontSize: 12,
                  color: isDark ? "#e5e7eb" : "#121212",
                }}
                formatter={(value) => [
                  `${value}${chartConfig.unit}`,
                  chartConfig.title,
                ]}
              />
              <Line
                type="monotone"
                dataKey={chartConfig.dataKey}
                stroke={chartConfig.color}
                strokeWidth={2}
                dot={{ fill: isDark ? "#000" : "#eee", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 text-center">
        {filteredData.length > 0 ? (
          <div>
            <p className="text-xs font-medium">{getTimePeriodLabel()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {getProgressMessage()}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {chartData.length > 0
              ? "Selecciona otro período para ver tu progreso"
              : ""}
          </p>
        )}
      </div>

      {/* {showAddForm && (
        <ProgressForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            loadData();
          }}
        />
      )} */}
    </div>
  );
}
