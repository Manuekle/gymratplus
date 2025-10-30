import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Perfil - GymRat+",
  description: "Gestiona tu información personal y preferencias de cuenta",
  keywords: "perfil, cuenta, usuario, información personal, preferencias",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
