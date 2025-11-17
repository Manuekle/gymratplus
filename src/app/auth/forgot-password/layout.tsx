import AnimatedLayout from "@/components/layout/animated-layout";
import { authSEO } from "@/lib/seo/seo";

export const metadata = authSEO.forgotPassword();

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
