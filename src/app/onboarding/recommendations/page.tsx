"use client";

import { useEffect } from "react";
import { CustomSonner } from "@/components/custom-sonner";
import Recommendations from "@/components/recommendations";
import { useRouter } from "next/navigation";

export default function RecommendationsPage() {
  const router = useRouter();

  useEffect(() => {
    const profileFormData = localStorage.getItem("profileFormData");

    if (!profileFormData) {
      router.push("/onboarding"); // Si no hay datos, redirigir a onboarding
    }
  }, [router]);

  return (
    <main className="w-full max-w-4xl mx-auto mt-6 p-4">
      <CustomSonner position="top-center" />

      <Recommendations />
    </main>
  );
}
