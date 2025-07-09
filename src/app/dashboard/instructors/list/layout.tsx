import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Lista de Instructores - GymRat+",
  description:
    "Lista de instructores para acceder a todas las funcionalidades de nuestra aplicación",
  keywords: "instructores, gestión, acceso, cuenta",
  openGraph: {
    title: "Lista de Instructores - GymRat+",
    description:
      "Lista de instructores para acceder a todas las funcionalidades",
  },
};
export default function InstructorsListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
