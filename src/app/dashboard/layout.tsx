"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CustomSonner } from "@/components/custom-sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // const { data: session, status } = useSession();
  // console.log(session);

  return (
    <div className="min-h-screen bg-background">
      <CustomSonner position="top-center" />
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6 ">
          {!pathname.split("/")[2] && "Dashboard"}
          {pathname.split("/")[2] === "profile" && "Perfil"}
          {pathname.split("/")[2] === "health" && "Salud"}
          {pathname.split("/")[2] === "workout" && "Entrenamiento"}
          {pathname.split("/")[2] === "nutrition" && "Nutrición"}
        </h1>
        <Tabs
          defaultValue="dashboard"
          value={pathname.split("/")[2]}
          className="space-y-4"
        >
          {/* Contenedor con scroll solo en móviles */}
          <div className="w-full overflow-x-auto md:overflow-visible">
            <TabsList className="flex flex-wrap h-auto gap-4 tracking-wider">
              <TabsTrigger
                value="dashboard"
                asChild
                className="min-w-[100px] md:min-w-1 whitespace-nowrap"
              >
                <Link href="/dashboard">Dashboard</Link>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                asChild
                className="min-w-[100px] md:min-w-1 whitespace-nowrap"
              >
                <Link href="/dashboard/profile">Perfil</Link>
              </TabsTrigger>
              <TabsTrigger
                value="health"
                asChild
                className="min-w-[100px] md:min-w-0 whitespace-nowrap"
              >
                <Link href="/dashboard/health">Salud</Link>
              </TabsTrigger>
              <TabsTrigger
                value="workout"
                asChild
                className="md:min-w-1 whitespace-nowrap"
              >
                <Link href="/dashboard/workout">Entrenamiento</Link>
              </TabsTrigger>
              <TabsTrigger
                value="nutrition"
                asChild
                className="min-w-[100px] md:min-w-0 whitespace-nowrap"
              >
                <Link href="/dashboard/nutrition">Nutrición</Link>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
