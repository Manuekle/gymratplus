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
  // const pathname = usePathname();

  return (
    <>
      <div className="min-h-screen bg-background">
        <CustomSonner position="top-center" />
        <ProfileCheck />
        <Navbar />
        <div className="container mx-auto py-10 px-4 mt-16">
          <DashboardHeader />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </>
  );
}
