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
  return (
    <>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-50 dark:bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(0,0,0,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      {children}
    </>
  );
}
