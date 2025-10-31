import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Lista de Alumnos - GymRat+",
  description:
    "Gestiona a tus alumnos para acceder a todas las funcionalidades de nuestra aplicación",
  keywords: "alumnos, gestión, acceso, cuenta",
  openGraph: {
    title: "Lista de Alumnos - GymRat+",
    description:
      "Gestiona a tus alumnos para acceder a todas las funcionalidades",
  },
};
export default function StudentsListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
