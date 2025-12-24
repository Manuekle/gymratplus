import { Navbar } from "@/components/navbar";
import { CustomSonner } from "@/components/custom-sonner";
import ProfileCheck from "@/components/shared/alerts/profile-check";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export const metadata = {
  title: "GymRat+",
  description:
    "Planifica y registra tus rutinas de ejercicio y progreso físico",
  keywords:
    "entrenamiento, ejercicio, rutinas, fitness, progreso físico, workout",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <CustomSonner position="top-center" />
        <ProfileCheck />
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pb-10">
          <DashboardHeader />
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
