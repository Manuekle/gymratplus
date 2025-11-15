import AnimatedLayout from "@/components/layout/animated-layout";
import { dashboardSEO } from "@/lib/seo/seo";

export const metadata = dashboardSEO.instructors();
export default function InstructorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
