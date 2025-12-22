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
      <div className="fixed inset-0 z-[-1] min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-zinc-200/40 to-zinc-300/20 dark:from-zinc-800/40 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-tl from-zinc-300/30 to-zinc-200/20 dark:from-zinc-700/30 dark:to-zinc-800/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-zinc-200/30 to-zinc-300/20 dark:from-zinc-800/30 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        {/* Glass Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      {children}
    </AnimatedLayout>
  );
}
