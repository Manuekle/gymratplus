"use client";

import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface CalorieChartProps {
  chartData: { dayLabel: string; calories: number }[];
}

export function CalorieChart({ chartData }: CalorieChartProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  console.log(chartData);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <div className="w-full h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
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
            stroke={isDark ? "#374151" : "#e5e7eb"}
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
            formatter={(value: number) => [`${value} kcal`, "Calorías"]}
            labelFormatter={(label) => {
              const day = chartData.find((d) => d.dayLabel === label);
              return day
                ? format(parseISO(day.date), "EEEE, d 'de' MMMM", {
                    locale: es,
                  })
                : label;
            }}
          />
          {/* <Legend /> */}
          <Bar
            dataKey="calories"
            fill={isDark ? "#eee" : "#000"}
            radius={[4, 4, 0, 0]}
            name="Calorías"
          ></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
