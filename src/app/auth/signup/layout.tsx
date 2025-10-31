import AnimatedLayout from "@/components/layout/animated-layout";

export const metadata = {
  title: "Registrarse - GymRat+",
  description:
    "Crea una cuenta nueva para disfrutar de todas las ventajas de nuestra aplicación",
  keywords: "registro, crear cuenta, signup, nueva cuenta",
  openGraph: {
    title: "Crear una cuenta - GymRat+",
    description:
      "Únete a nuestra comunidad y disfruta de todas las funcionalidades",
    images: [{ url: "/images/signup-og.jpg" }],
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
