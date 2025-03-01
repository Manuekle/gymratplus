"use client";

import { useState } from "react";
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

export default function ProgressChart() {
  const [timeframe, setTimeframe] = useState("month");
  const { theme, systemTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Datos de ejemplo para el gráfico
  const weightData = [
    { date: "1 Feb", weight: 82 },
    { date: "8 Feb", weight: 81.5 },
    { date: "15 Feb", weight: 80.8 },
    { date: "22 Feb", weight: 79.9 },
    { date: "1 Mar", weight: 79.2 },
  ];

  const bodyFatData = [
    { date: "1 Feb", percentage: 24 },
    { date: "8 Feb", percentage: 23.5 },
    { date: "15 Feb", percentage: 23.1 },
    { date: "22 Feb", percentage: 22.6 },
    { date: "1 Mar", percentage: 22 },
  ];

  const muscleData = [
    { date: "1 Feb", percentage: 35 },
    { date: "8 Feb", percentage: 35.2 },
    { date: "15 Feb", percentage: 35.5 },
    { date: "22 Feb", percentage: 35.8 },
    { date: "1 Mar", percentage: 36.2 },
  ];

  const [dataType, setDataType] = useState("weight");

  const getChartData = () => {
    switch (dataType) {
      case "weight":
        return weightData;
      case "bodyFat":
        return bodyFatData;
      case "muscle":
        return muscleData;
      default:
        return weightData;
    }
  };

  const getChartConfig = () => {
    switch (dataType) {
      case "weight":
        return {
          dataKey: "weight",
          color: "#3b82f6",
          unit: "kg",
          title: "Peso",
        };
      case "bodyFat":
        return {
          dataKey: "percentage",
          color: "#ef4444",
          unit: "%",
          title: "Grasa Corporal",
        };
      case "muscle":
        return {
          dataKey: "percentage",
          color: "#22c55e",
          unit: "%",
          title: "Masa Muscular",
        };
      default:
        return {
          dataKey: "weight",
          color: "#3b82f6",
          unit: "kg",
          title: "Peso",
        };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <div className="bg-black p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Seguimiento de Progreso</h2>

        <div className="flex space-x-1">
          <button
            onClick={() => setTimeframe("week")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === "week"
                ? "bg-white border text-black"
                : "text-gray-500 border"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setTimeframe("month")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === "month"
                ? "bg-white border text-black"
                : "text-gray-500 border"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setTimeframe("year")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === "year"
                ? "bg-white border text-black"
                : "text-gray-500 border"
            }`}
          >
            Año
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setDataType("weight")}
          className={`px-3 py-1 text-sm rounded-md ${
            dataType === "weight"
              ? "bg-blue-500 text-white"
              : "text-gray-500 border"
          }`}
        >
          Peso
        </button>
        <button
          onClick={() => setDataType("bodyFat")}
          className={`px-3 py-1 text-sm rounded-md ${
            dataType === "bodyFat"
              ? "bg-red-500 text-white"
              : "text-gray-500 border"
          }`}
        >
          Grasa Corporal
        </button>
        <button
          onClick={() => setDataType("muscle")}
          className={`px-3 py-1 text-sm rounded-md ${
            dataType === "muscle"
              ? "bg-green-500 text-white"
              : "text-gray-500 border"
          }`}
        >
          Masa Muscular
        </button>
      </div>

      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={getChartData()}
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
              formatter={(value) => [
                `${value} ${chartConfig.unit}`,
                chartConfig.title,
              ]}
            />
            <Line
              type="monotone"
              dataKey={chartConfig.dataKey}
              stroke={chartConfig.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          {dataType === "weight"
            ? "Has perdido 2.8kg desde el inicio de tu plan"
            : dataType === "bodyFat"
            ? "Has reducido un 2% de grasa corporal este mes"
            : "Has ganado 1.2% de masa muscular en el último mes"}
        </p>
      </div>
    </div>
  );
}
