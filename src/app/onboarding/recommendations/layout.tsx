import AnimatedLayout from "@/components/layout/animated-layout";
import { onboardingSEO } from "@/lib/seo/seo";

export const metadata = onboardingSEO.recommendations();

export default function RecommendationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
