import AnimatedLayout from "@/components/layout/animated-layout";
import { onboardingSEO } from "@/lib/seo/seo";

export const metadata = onboardingSEO.main();

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimatedLayout>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-50 dark:bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(0,0,0,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      {children}
    </AnimatedLayout>
  );
}
