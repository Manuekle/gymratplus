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

const data = [
  { date: "Ene", weight: 78 },
  { date: "Feb", weight: 77 },
  { date: "Mar", weight: 76 },
  { date: "Abr", weight: 75.5 },
  { date: "May", weight: 75 },
  { date: "Jun", weight: 74.5 },
  { date: "Jul", weight: 75 },
];

export function WeightChart() {
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
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
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
            itemStyle={{ fontSize: 12, color: isDark ? "#e5e7eb" : "#1f2937" }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={isDark ? "#60a5fa" : "#3b82f6"}
            strokeWidth={2}
            dot={{ fill: isDark ? "#60a5fa" : "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
