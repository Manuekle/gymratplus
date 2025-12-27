"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money03Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface OverviewChartsProps {
  data: {
    name: string;
    revenue: number;
    users: number;
  }[];
}

export function OverviewCharts({ data }: OverviewChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-background/40 backdrop-blur-md border border-border">
          <CardHeader>
            <CardTitle>Analítica de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay datos disponibles.</p>
          </CardContent>
        </Card>
        <Card className="bg-background/40 backdrop-blur-md border border-border">
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay datos disponibles.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-background/40 backdrop-blur-md border border-white/5 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">Ingresos</CardTitle>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <HugeiconsIcon
              icon={Money03Icon}
              className="h-5 w-5 text-primary"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground))"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  dx={-10}
                />
                <Tooltip
                  cursor={{
                    stroke: "hsl(var(--primary))",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  formatter={(value: any) => {
                    return [
                      new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(Number(value || 0)),
                      "Ingresos",
                    ] as [string, string];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/40 backdrop-blur-md border border-white/5 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">Usuarios</CardTitle>
            <p className="text-sm text-muted-foreground">Crecimiento mensual</p>
          </div>
          <div className="p-2 bg-chart-2/10 rounded-lg">
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="h-5 w-5 text-chart-2"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={0} barCategoryGap={0}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground))"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--chart-2))" }}
                />
                <Bar
                  dataKey="users"
                  fill="hsl(var(--chart-2))"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                  className="fill-chart-2/80 hover:fill-chart-2 transition-colors"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
