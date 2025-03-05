"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  useEffect(() => {
    console.error("Se ha producido un error en la aplicación.");
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-6">
      <div className="max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          ¡Oops!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Algo salió mal. Por favor, intenta nuevamente más tarde.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <Button
            variant="default"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Volver al inicio
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.refresh()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  );
}
