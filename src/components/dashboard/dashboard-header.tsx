"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export const DashboardHeader = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const titles: Record<string, string> = {
    profile: "Perfil",
    health: "Salud",
    workout: "Entrenamiento",
    nutrition: "Nutrición",
    instructors: "Mis Instructores",
    students: "Mis Alumnos",
    chats: "Mensajes",
  };

  const pathSegment = pathname.split("/")[2];
  const pageTitle = pathSegment
    ? titles[pathSegment] || "Dashboard"
    : "Dashboard";
  const isInstructor = session?.user?.isInstructor;

  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-semibold tracking-heading sm:text-3xl xl:text-3xl mb-6">
        {pageTitle}
      </h1>
      <Tabs
        defaultValue="dashboard"
        value={pathname.split("/")[2] || "dashboard"}
        className="space-y-4"
      >
        {/* Contenedor con scroll solo en móviles */}
        <div className="w-full overflow-x-auto md:overflow-visible">
          <TabsList className="inline-flex flex-wrap h-auto gap-1.5 sm:gap-2 p-1.5 w-full md:w-fit">
            <TabsTrigger value="dashboard" asChild className="flex-shrink-0">
              <Link href="/dashboard">Dashboard</Link>
            </TabsTrigger>
            <TabsTrigger value="profile" asChild className="flex-shrink-0">
              <Link href="/dashboard/profile">Perfil</Link>
            </TabsTrigger>
            <TabsTrigger value="health" asChild className="flex-shrink-0">
              <Link href="/dashboard/health">Salud</Link>
            </TabsTrigger>
            <TabsTrigger value="workout" asChild className="flex-shrink-0">
              <Link href="/dashboard/workout">Entrenamiento</Link>
            </TabsTrigger>
            <TabsTrigger value="nutrition" asChild className="flex-shrink-0">
              <Link href="/dashboard/nutrition">Nutrición</Link>
            </TabsTrigger>
            {/* Mostrar Instructores solo si NO es instructor, y Alumnos solo si es instructor */}
            {!isInstructor && (
              <TabsTrigger
                value="instructors"
                asChild
                className="flex-shrink-0"
              >
                <Link href="/dashboard/instructors">Instructores</Link>
              </TabsTrigger>
            )}
            {isInstructor && (
              <TabsTrigger value="students" asChild className="flex-shrink-0">
                <Link href="/dashboard/students">Alumnos</Link>
              </TabsTrigger>
            )}
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};
