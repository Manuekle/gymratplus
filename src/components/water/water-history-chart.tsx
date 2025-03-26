/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { format, subDays, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface WaterHistoryChartProps {
  history: Array<{ date: string; liters: number }>;
  targetIntake: number;
  isLoading?: boolean;
}

export function WaterHistoryChart({
  history,
  targetIntake,
  isLoading = false,
}: WaterHistoryChartProps) {
  // Generate dates for the last 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    // Obtener el lunes más reciente o el actual si hoy es lunes
    const lastMonday = subDays(
      today,
      today.getDay() === 0 ? 6 : today.getDay() - 1
    );

    for (let i = 0; i < 7; i++) {
      const date = subDays(lastMonday, -i);
      dates.push({
        date: format(date, "yyyy-MM-dd"),
        formattedDate: format(date, "dd MMM", { locale: es }),
        dayLabel: format(date, "EEEE", { locale: es }),
        liters: 0,
      });
    }

    return dates.map((item) => {
      // Encontrar todas las entradas para este día
      const dayEntries = history.filter((h) => {
        try {
          return isSameDay(parseISO(h.date), parseISO(item.date));
        } catch (e) {
          console.error("Invalid date in history:", h.date);
          return false;
        }
      });

      // Tomar el último valor de litros del día (el más alto)
      const lastEntry = dayEntries.reduce(
        (last, current) => (current.liters > last.liters ? current : last),
        { date: item.date, liters: 0 }
      );

      return {
        ...item,
        liters: lastEntry.liters,
      };
    });
  };

  console.log(history);

  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const chartData =
    generateDates()?.map((day) => ({
      ...day,
      dayLabel: format(parseISO(day.date), "EEE", { locale: es }), // Días abreviados en español
    })) ?? [];

  console.log(chartData);

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="mt-8">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
          }}
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
            formatter={(value) => `${value} L`}
            labelFormatter={(label) => {
              const day = chartData.find((d) => d.dayLabel === label);
              return day
                ? format(parseISO(day.date), "EEEE, d 'de' MMMM", {
                    locale: es,
                  })
                : label;
            }}
          />
          <ReferenceLine
            y={targetIntake}
            stroke="red"
            strokeDasharray="3 3"
            label={{
              value: "Target",
              position: "insideTopRight",
              fontSize: 10,
            }}
          />
          <Bar
            dataKey="liters"
            fill="oklch(0.707 0.165 254.624)"
            radius={[4, 4, 0, 0]}
            name="Litros"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
