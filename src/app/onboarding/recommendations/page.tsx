"use client";

import { useEffect } from "react";
import { CustomSonner } from "@/components/custom-sonner";
import Recommendations from "@/components/recommendations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

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
      <div className="mb-6">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/dashboard/profile")}
          className="flex items-center text-xs"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver al Perfil
        </Button>
      </div>
      <Recommendations />
    </main>
  );
}
