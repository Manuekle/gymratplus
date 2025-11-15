import AnimatedLayout from "@/components/layout/animated-layout";
import { dashboardSEO } from "@/lib/seo/seo";

export const metadata = dashboardSEO.notifications();

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatedLayout>{children}</AnimatedLayout>;
}
