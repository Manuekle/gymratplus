import AnimatedLayout from "@/components/layout/animated-layout";
import { dashboardSEO } from "@/lib/seo/seo";

export const metadata = dashboardSEO.nutrition();

export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
