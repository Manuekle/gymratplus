"use client";

import { CustomSonner } from "@/components/custom-sonner";
import StepOnboarding1 from "@/components/onboarding/step-1";
import { useSession } from "next-auth/react";
import { DefaultSession } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CustomSession {
  user: {
    id: string; // ✅ Ahora es obligatorio
    name?: string | null;
    email?: string | null;
    image?: string | null;
    profile?: unknown; // Define mejor este tipo si lo conoces
  } & DefaultSession["user"];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession() as { data: CustomSession | null };

  useEffect(() => {
    if (session?.user?.profile) {
      router.push("/dashboard/profile");
    }
  }, [session, router]);

  if (session?.user?.profile) {
    return null;
  }

  return (
    <main className="flex justify-center items-center min-h-screen p-4 md:p-8">
      <CustomSonner position="top-center" />
      <StepOnboarding1 />
    </main>
  );
}
