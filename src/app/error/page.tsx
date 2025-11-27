"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  useEffect(() => {}, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-6">
      <div className="max-w-md bg-white dark:bg-black p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-semibold  tracking-heading text-black dark:text-white">
          ¡Oops!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-xs">
          Algo salió mal. Por favor, intenta nuevamente más tarde.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <Button
            size="default"
            variant="default"
            className="w-full text-xs"
            onClick={() => router.push("/")}
          >
            Volver al inicio
          </Button>
          <Button
            size="default"
            variant="outline"
            className="w-full text-xs"
            onClick={() => router.refresh()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  );
}
