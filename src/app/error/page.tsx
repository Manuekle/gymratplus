"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Elements */}
      {mounted && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-zinc-200/40 to-zinc-300/20 dark:from-zinc-800/40 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-tl from-zinc-300/30 to-zinc-200/20 dark:from-zinc-700/30 dark:to-zinc-800/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-zinc-200/30 to-zinc-300/20 dark:from-zinc-800/30 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>

          {/* Glass Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </>
      )}

      <div className="relative z-10 max-w-md bg-white/80 dark:bg-black/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/50">
        <h1 className="text-4xl font-semibold  tracking-heading text-black dark:text-white">
          ¡Oops!
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300 text-xs">
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
