export const metadata = {
  title: "Iniciar Sesión - GymRat+",
  description:
    "Inicia sesión en tu cuenta para acceder a todas las funcionalidades de nuestra aplicación",
  keywords: "login, iniciar sesión, acceso, cuenta",
  openGraph: {
    title: "Iniciar Sesión - GymRat+",
    description:
      "Accede a tu cuenta para disfrutar de todas las funcionalidades",
  },
};
export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
