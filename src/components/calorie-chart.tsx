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

interface CalorieChartProps {
  data: { day: string; calories: number }[];
}

export function CalorieChart({ data }: CalorieChartProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  console.log(data);

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
          data={data}
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
            dataKey="day"
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
            itemStyle={{ fontSize: 12, color: isDark ? "#e5e7eb" : "#1f2937" }}
          />
          <Bar
            dataKey="calories"
            fill={isDark ? "#eee" : "#000"}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
