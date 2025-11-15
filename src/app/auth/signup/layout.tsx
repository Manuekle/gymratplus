import AnimatedLayout from "@/components/layout/animated-layout";
import { authSEO } from "@/lib/seo/seo";

export const metadata = authSEO.signup();

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
