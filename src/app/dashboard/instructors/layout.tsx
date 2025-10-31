import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Instructores - GymRat+",
  description:
    "Gestiona a tus instructores en tu cuenta para acceder a todas las funcionalidades de nuestra aplicación",
  keywords: "instructores, gestión, acceso, cuenta",
  openGraph: {
    title: "Instructores - GymRat+",
    description:
      "Gestiona a tus instructores en tu cuenta para acceder a todas las funcionalidades",
  },
};
export default function InstructorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
