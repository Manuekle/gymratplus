import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Mensajes",
  description: "Comunícate con tus instructores o estudiantes",
});

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
