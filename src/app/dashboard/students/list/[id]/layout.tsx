import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Alumno - GymRat+",
  description:
    "Gestiona a tus alumno para acceder a todas las funcionalidades de nuestra aplicación",
  keywords: "alumnos, gestión, acceso, cuenta",
  openGraph: {
    title: "Alumno - GymRat+",
    description:
      "Gestiona a tus alumno para acceder a todas las funcionalidades",
  },
};
export default function StudentsItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
