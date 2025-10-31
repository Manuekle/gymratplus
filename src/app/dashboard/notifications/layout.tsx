import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Notificaciones - GymRat+",
  description: "Revisa tus alertas, mensajes y actualizaciones importantes",
  keywords: "notificaciones, alertas, mensajes, actualizaciones, avisos",
  openGraph: {
    title: "Notificaciones | Mi Aplicación",
    description: "Mantente al día con todas tus alertas y mensajes importantes",
  },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
