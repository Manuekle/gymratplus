"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Error desconocido";

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-semibold text-red-500">
        Error de autenticación
      </h1>
      <p className="text-gray-500">{error}</p>
      <Link href="/auth/signin">
        <Button>Volver a intentar</Button>
      </Link>
    </div>
  );
}
