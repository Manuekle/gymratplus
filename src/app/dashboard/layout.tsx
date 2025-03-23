// "use client";
export const metadata = {
  title: "Entrenamiento - Dashboard - GymRat+",
  description:
    "Planifica y registra tus rutinas de ejercicio y progreso físico",
  keywords:
    "entrenamiento, ejercicio, rutinas, fitness, progreso físico, workout",
};
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CustomSonner } from "@/components/custom-sonner";
import ProfileCheck from "@/components/alerts/profile-check";
import { DashboardHeader } from "@/components/dashboard-header";

export default function WorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname();

  return (
    <>
      <div className="min-h-screen bg-background">
        <CustomSonner position="top-center" />
        <ProfileCheck />
        <Navbar />
        <div className="container mx-auto py-10 px-4">
          {/* <h1 className="text-3xl font-bold tracking-tight mb-6 ">
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
          </Tabs> */}
          <DashboardHeader />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </>
  );
}
