"use client";

import { CustomSonner } from "@/components/custom-sonner";
import StepOnboarding1 from "@/components/onboarding/step-1";

export default function Home() {
  return (
    <main className="flex justify-center items-center min-h-screen p-4 md:p-8">
      <CustomSonner position="top-center" />
      <StepOnboarding1 onComplete={() => console.log("Form completed")} />
    </main>
  );
}
