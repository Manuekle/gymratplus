"use client";

import { CustomSonner } from "@/components/custom-sonner";
import StepOnboarding1 from "@/components/onboarding/step-1";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
    image?: string | null;
    profile?: any; // Define the type of profile if known
  };
}
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession() as { data: CustomSession | null };

  if (session && session.user?.profile) {
    router.push("/dashboard/profile");
    return null;
  }

  return (
    <main className="flex justify-center items-center min-h-screen p-4 md:p-8">
      <CustomSonner position="top-center" />
      <StepOnboarding1 onComplete={() => console.log("Form completed")} />
    </main>
  );
}
