import AnimatedLayout from "@/components/layout/animated-layout";
import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
    title: "Registro de Instructor",
    description: "Completa tu perfil para convertirte en instructor de GymRat+",
    keywords: ["instructor", "registro", "gymrat+", "coach", "entrenador"],
});

export default function InstructorRegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AnimatedLayout>{children}</AnimatedLayout>;
}
