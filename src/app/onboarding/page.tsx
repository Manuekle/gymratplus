"use client";

import StepOnboarding from "@/components/onboarding/step-onboarding";
import { ThemeToggle } from "@/components/layout/theme/theme-toggle";
import { useSession } from "next-auth/react";
import { DefaultSession } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CustomSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    profile?: unknown;
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
    <main className="flex justify-center items-center min-h-screen p-4 md:p-8 relative">
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
        <ThemeToggle />
      </div>
      <StepOnboarding />
    </main>
  );
}
