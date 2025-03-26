import AnimatedLayout from "@/components/layouts/animated-layout";

// app/onboarding/layout.js
export const metadata = {
  title: "Primeros pasos - GymRat+",
  description:
    "Completa tu perfil y configura tu cuenta para una experiencia personalizada",
  keywords:
    "onboarding, configuración inicial, bienvenida, primeros pasos, introducción",
  robots: "noindex", // Opcional: si no quieres que estas páginas sean indexadas por buscadores
  openGraph: {
    title: "Primeros pasos | GymRat+",
    description:
      "Configura tu cuenta en pocos minutos para comenzar a usar todas las funcionalidades",
    images: [{ url: "/og-onboarding.webp" }],
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimatedLayout>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-50 dark:bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(0,0,0,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      {children}
    </AnimatedLayout>
  );
}
