import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Instructor - GymRat+",
  description:
    "Gestiona a tu instructor en tu cuenta para acceder a todas las funcionalidades de nuestra aplicación",
  keywords: "instructor, gestión, acceso, cuenta",
  openGraph: {
    title: "Instructor - GymRat+",
    description:
      "Gestiona a tu instructor en tu cuenta para acceder a todas las funcionalidades",
  },
};
export default function InstructorsIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
