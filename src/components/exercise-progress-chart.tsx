"use client";

import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

const data = [
  { month: "Ene", squat: 85, bench: 70, deadlift: 100 },
  { month: "Feb", squat: 90, bench: 72.5, deadlift: 105 },
  { month: "Mar", squat: 92.5, bench: 75, deadlift: 110 },
  { month: "Abr", squat: 95, bench: 77.5, deadlift: 115 },
  { month: "May", squat: 97.5, bench: 80, deadlift: 120 },
];

export function ExerciseProgressChart() {
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
    <div className="w-full h-[250px]">
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
            dataKey="month"
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
            itemStyle={{ fontSize: 12, color: isDark ? "#e5e7eb" : "#1f2937" }}
          />
          <Legend
            wrapperStyle={{
              fontSize: 12,
              color: isDark ? "#e5e7eb" : "#1f2000937",
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
            dataKey="bench"
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
    </div>
  );
}
