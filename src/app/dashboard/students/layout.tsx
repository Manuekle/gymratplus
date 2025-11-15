import AnimatedLayout from "@/components/layout/animated-layout";
import { dashboardSEO } from "@/lib/seo/seo";

export const metadata = dashboardSEO.students();
export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
