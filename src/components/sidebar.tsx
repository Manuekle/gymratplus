import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Dumbbell,
  Home,
  Settings,
  Utensils,
  User,
  Bell,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Calendario",
    icon: Calendar,
    href: "/calendar",
    color: "text-violet-500",
  },
  {
    label: "Entrenamientos",
    icon: Dumbbell,
    href: "/workouts",
    color: "text-pink-700",
  },
  {
    label: "Nutrición",
    icon: Utensils,
    href: "/nutrition",
    color: "text-orange-500",
  },
  {
    label: "Estadísticas",
    icon: BarChart3,
    href: "/statistics",
    color: "text-emerald-500",
  },
  {
    label: "Notificaciones",
    icon: Bell,
    href: "/notifications",
    color: "text-red-500",
  },
  {
    label: "Perfil",
    icon: User,
    href: "/profile",
    color: "text-blue-500",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Fitness<span className="text-indigo-500">App</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
