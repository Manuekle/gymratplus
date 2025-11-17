import AnimatedLayout from "@/components/layout/animated-layout";
import { authSEO } from "@/lib/seo/seo";

export const metadata = authSEO.resetPassword();

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
