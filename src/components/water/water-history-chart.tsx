/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { format, subDays, parseISO, startOfDay, addDays } from "date-fns";
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
  // Generate dates for the last 7 days
  const generateDates = () => {
    const dates = [];
    const now = new Date();
    const today = startOfDay(now);

    // Obtener el lunes más reciente
    const daysToMonday = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const lastMonday = subDays(today, daysToMonday);

    // Generar los 7 días de la semana
    for (let i = 0; i < 7; i++) {
      const date = addDays(lastMonday, i);
      const formattedDate = format(date, "yyyy-MM-dd");
      dates.push({
        date: formattedDate,
        formattedDate: format(date, "dd MMM", { locale: es }),
        dayLabel: format(date, "EEEE", { locale: es }),
        liters: 0,
      });
    }

    // Mapear los datos del historial a las fechas
    return dates.map((item) => {
      const dayEntries = history.filter((h) => {
        try {
          // Ajustar la fecha del historial considerando que viene con hora 19:00
          const historyDate = new Date(h.date);
          // Restar 5 horas para compensar la zona horaria
          historyDate.setHours(historyDate.getHours() - 5);
          const adjustedHistoryDate = format(historyDate, "yyyy-MM-dd");

          return adjustedHistoryDate === item.date;
        } catch (e) {
          console.error("Invalid date in history:", h.date);
          return false;
        }
      });

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

  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const chartData =
    generateDates()?.map((day) => ({
      ...day,
      dayLabel: format(parseISO(day.date), "EEE", { locale: es }), // Días abreviados en español
    })) ?? [];

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
              value: "Objetivo",
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
