import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata = {
  title: "Buscar Instructores - GymRat+",
  description:
    "Busca a instructores para acceder a todas las funcionalidades de nuestra aplicación",
  keywords: "instructores, gestión, acceso, cuenta",
  openGraph: {
    title: "Buscar Instructores - GymRat+",
    description:
      "Busca a instructores para acceder a todas las funcionalidades",
  },
};
export default function InstructorsSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
