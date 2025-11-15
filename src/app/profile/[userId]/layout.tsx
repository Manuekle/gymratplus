import { customSEO } from "@/lib/seo/seo";

export const metadata = customSEO({
  title: "Perfil Público",
  description: "Ver el perfil público de un usuario",
  keywords: ["perfil", "usuario", "instructor", "estudiante"],
  noindex: true,
});

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
