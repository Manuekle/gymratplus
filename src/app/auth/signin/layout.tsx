import AnimatedLayout from "@/components/layout/animated-layout";
import { authSEO } from "@/lib/seo/seo";

export const metadata = authSEO.signin();
export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
