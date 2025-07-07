"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DashboardHeader = () => {
  const pathname = usePathname();

  const titles: Record<string, string> = {
    profile: "Perfil",
    health: "Salud",
    workout: "Entrenamiento",
    nutrition: "Nutrición",
  };

  const pageTitle = titles[pathname.split("/")[2]] || "Dashboard";

  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-semibold tracking-heading sm:text-3xl xl:text-3xl mb-6">{pageTitle}</h1>
      <Tabs
        defaultValue="dashboard"
        value={pathname.split("/")[2]}
        className="space-y-4"
      >
        {/* Contenedor con scroll solo en móviles */}
        <div className="w-full overflow-x-auto md:overflow-visible">
          <TabsList className="flex flex-wrap h-auto gap-4 px-2">
            <TabsTrigger value="dashboard" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </TabsTrigger>
            <TabsTrigger value="profile" asChild>
              <Link href="/dashboard/profile">Perfil</Link>
            </TabsTrigger>
            <TabsTrigger value="health" asChild>
              <Link href="/dashboard/health">Salud</Link>
            </TabsTrigger>
            <TabsTrigger value="workout" asChild>
              <Link href="/dashboard/workout">Entrenamiento</Link>
            </TabsTrigger>
            <TabsTrigger value="nutrition" asChild>
              <Link href="/dashboard/nutrition">Nutrición</Link>
            </TabsTrigger>           
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};
