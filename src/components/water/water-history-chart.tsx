"use client";

import { format, startOfDay, subDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useTheme } from "next-themes";
import { memo, useMemo, ReactElement } from "react";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface WaterHistoryChartProps {
  history: Array<{ date: string; liters: number }>;
  targetIntake: number;
  // isLoading eliminado
}

// Memoize the chart data to prevent unnecessary recalculations
const useChartData = (history: Array<{ date: string; liters: number }>) => {
  return useMemo(() => {
    const dates = [];
    const today = startOfDay(new Date());

    // Get Monday of current week
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = subDays(today, daysToMonday);

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = addDays(monday, i);
      const formattedDate = format(date, "yyyy-MM-dd");

      // Find matching history entry
      const historyEntry = history.find((h) => h?.date === formattedDate);

      dates.push({
        date: formattedDate,
        formattedDate: format(date, "dd MMM", { locale: es }),
        dayLabel: format(date, "EEE", { locale: es }),
        liters: historyEntry?.liters || 0,
      });
    }

    return dates;
  }, [history]);
};

interface ChartDataItem {
  date: string;
  formattedDate: string;
  dayLabel: string;
  liters: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Payload<number, string>[];
  label?: string;
  isDark: boolean;
  chartData: ChartDataItem[];
}

// Custom tooltip component to avoid recreating on every render
const CustomTooltipComponent = ({
  active,
  payload,
  label,
  isDark,
  chartData,
}: TooltipProps): ReactElement | null => {
  if (!active || !payload || !payload.length) return null;

  const dayData = chartData.find((d) => d.dayLabel === label);
  const value = payload[0]?.value;

  return (
    <div
      style={{
        backgroundColor: isDark ? "#121212" : "#ffffff",
        border: `1px solid ${isDark ? "#3D3D3E" : "#e5e7eb"}`,
        borderRadius: "0.375rem",
        padding: "8px 12px",
        fontSize: "12px",
      }}
    >
      <p
        style={{
          fontWeight: "bold",
          margin: 0,
          marginBottom: "4px",
          color: isDark ? "#e5e7eb" : "#121212",
        }}
      >
        {dayData
          ? format(new Date(dayData.date), "EEEE, d 'de' MMMM", { locale: es })
          : label}
      </p>
      {value !== undefined && (
        <p style={{ margin: 0, color: isDark ? "#e5e7eb" : "#121212" }}>
          {`${value} L`}
        </p>
      )}
    </div>
  );
};

// Set display name for the tooltip
CustomTooltipComponent.displayName = "CustomTooltip";

// Memoize the tooltip
const CustomTooltip = memo(CustomTooltipComponent);

const WaterHistoryChartComponent = ({
  history,
  targetIntake,
}: WaterHistoryChartProps) => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Memoize chart data to prevent recalculation on every render
  const chartData = useChartData(history);
  console.log(targetIntake);
  // Memoize the chart component to prevent unnecessary re-renders
  const chart = useMemo((): ReactElement | null => {
    if (!chartData || !Array.isArray(chartData)) return null;

    return (
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={isDark ? "#3D3D3E" : "#e5e7eb"}
        />
        <XAxis
          dataKey="dayLabel"
          axisLine={false}
          tickLine={false}
          stroke={isDark ? "#9ca3af" : "#6b7280"}
          tick={{ fontSize: 12 }}
        />
        <YAxis hide={true} />
        <Tooltip
          cursor={false}
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <CustomTooltip
                active={active}
                payload={payload as Payload<number, string>[]}
                label={label as string}
                isDark={isDark}
                chartData={chartData}
              />
            );
          }}
        />
        <ReferenceLine
          y={targetIntake}
          stroke="red"
          strokeDasharray="3 3"
          label={{
            value: "Objetivo",
            position: "insideTopRight",
            fontSize: 10,
            fill: isDark ? "#fff" : "#000",
          }}
        />
        <Bar
          dataKey="liters"
          fill="oklch(0.707 0.165 254.624)"
          radius={[4, 4, 0, 0]}
          name="Litros"
          isAnimationActive={true}
          animationDuration={1000}
        />
      </BarChart>
    );
  }, [chartData, isDark, targetIntake]);

  // Siempre renderiza la gráfica, pero si está cargando, muestra un overlay encima
  return (
    <div className="h-[200px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        {chart || <div />}
      </ResponsiveContainer>
      {/* Eliminado overlay de loading/spinner */}
    </div>
  );
};

// Set display name for the component
WaterHistoryChartComponent.displayName = "WaterHistoryChart";

// Export the memoized component
export const WaterHistoryChart = memo(WaterHistoryChartComponent);
