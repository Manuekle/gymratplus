import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Alumnos - GymRat+",
  description:
    "Gestiona a tus alumnos en tu cuenta para acceder a todas las funcionalidades de nuestra aplicación",
  keywords: "alumnos, gestión, acceso, cuenta",
  openGraph: {
    title: "Alumnos - GymRat+",
    description:
      "Gestiona a tus alumnos en tu cuenta para acceder a todas las funcionalidades",
  },
};
export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
