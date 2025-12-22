import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target02Icon,
  WeightScaleIcon,
  VegetarianFoodIcon,
  WaterPumpIcon,
  Activity01Icon,
  File01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div
        className="flex items-center justify-between p-4 md:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-heading">
            Accesos Rápidos
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isOpen ? "Ocultar funciones" : "Mostrar funciones"}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HugeiconsIcon
            icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
            className="h-5 w-5 text-muted-foreground"
          />
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 md:px-6 md:pb-6 grid grid-cols-3 md:grid-cols-6 gap-2">
              {quickActions.map((action, index) => (
                <Link
                  key={`${action.href}-${index}`}
                  href={action.href}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    className="w-full h-auto py-2.5 px-2 flex flex-col gap-1.5 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all border border-black/5 dark:border-white/5 shadow-sm rounded-xl"
                  >
                    <HugeiconsIcon
                      icon={action.icon}
                      className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-xs font-medium text-center leading-none tracking-tight">
                      {action.title}
                    </span>
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
