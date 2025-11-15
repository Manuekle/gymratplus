"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target02Icon,
  WeightScaleIcon,
  VegetarianFoodIcon,
  WaterPumpIcon,
  Activity01Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
const quickActions = [
  {
    title: "Nuevo Entrenamiento",
    href: "/dashboard/workout",
    icon: Activity01Icon,
  },
  {
    title: "Registrar Comida",
    href: "/dashboard/nutrition/register-food",
    icon: VegetarianFoodIcon,
  },
  {
    title: "Registrar Peso",
    href: "/dashboard/health",
    icon: WeightScaleIcon,
  },
  {
    title: "Nuevo Objetivo",
    href: "/dashboard/health/goal",
    icon: Target02Icon,
  },
  {
    title: "Registrar Agua",
    href: "/dashboard/health",
    icon: WaterPumpIcon,
  },
  {
    title: "Historial",
    href: "/dashboard/workout/history",
    icon: File01Icon,
  },
];

export function QuickActions() {
  return (
    <div className="p-4 md:p-6 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-heading">
            Accesos Rápidos
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Accede rápidamente a las funciones más usadas
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
          >
            <Link href={action.href}>
              <div className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-muted/50 transition-colors">
                <HugeiconsIcon
                  icon={action.icon}
                  className="h-4 w-4 text-foreground"
                />
                <span className="text-xs font-medium">{action.title}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
