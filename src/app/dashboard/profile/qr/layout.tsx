import AnimatedLayout from "@/components/layout/animated-layout";
import { dashboardSEO } from "@/lib/seo/seo";

export const metadata = dashboardSEO.profile();

export default function QRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
