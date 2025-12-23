"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon, TradeUpIcon } from "@hugeicons/core-free-icons";

interface WeightData {
  date: string;
  weight: number;
}

export default function EvolutionCharts() {
  const [data, setData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/progress/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json.weightHistory);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <HugeiconsIcon
          icon={Loading02Icon}
          className="h-8 w-8 animate-spin text-muted-foreground"
        />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <HugeiconsIcon
            icon={TradeUpIcon}
            className="h-10 w-10 mb-2 opacity-50"
          />
          <p>No hay suficientes datos para mostrar la gráfica.</p>
          <p className="text-sm">
            Registra tu peso en las fotos de progreso o en tu perfil.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon
            icon={TradeUpIcon}
            className="h-5 w-5 text-indigo-500"
          />
          Evolución de Peso
        </CardTitle>
        <CardDescription>
          Tu cambio de peso a lo largo del tiempo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-200 dark:stroke-zinc-800"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 5", "dataMax + 5"]}
                unit="kg"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#4f46e5" }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
