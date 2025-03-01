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

const data = [
  { day: "Lun", calories: 2350 },
  { day: "Mar", calories: 2450 },
  { day: "Mié", calories: 2200 },
  { day: "Jue", calories: 2300 },
  { day: "Vie", calories: 2500 },
  { day: "Sáb", calories: 2700 },
  { day: "Dom", calories: 2400 },
];

export function CalorieChart() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
            fill={isDark ? "#60a5fa" : "#3b82f6"}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
