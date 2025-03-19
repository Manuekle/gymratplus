"use client";

import { useEffect } from "react";
import { CustomSonner } from "@/components/custom-sonner";
import Recommendations from "@/components/recommendations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon } from "hugeicons-react";

export default function RecommendationsPage() {
  const router = useRouter();

  useEffect(() => {
    const profileFormData = localStorage.getItem("profileFormData");

    if (!profileFormData) {
      router.push("/onboarding"); // Si no hay datos, redirigir a onboarding
    }
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <CustomSonner position="top-center" />
      <div className="mb-6">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/dashboard/profile")}
          className="flex items-center text-muted-foreground text-xs"
        >
          <ArrowLeft01Icon className="mr-2 h-4 w-4" />
          Volver al Perfil
        </Button>
      </div>
      <Recommendations />
    </main>
  );
}
