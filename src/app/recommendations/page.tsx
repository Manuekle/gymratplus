"use client";

import { CustomSonner } from "@/components/custom-sonner";
import Recommendations from "@/components/recommendations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function RecommendationsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <CustomSonner position="top-center" />
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="flex items-center text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
      </div>
      <Recommendations />
    </main>
  );
}
