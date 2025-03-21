"use client";

import { useSearchParams } from "next/navigation";

export function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  return (
    <p className="text-[#E52020] text-xs text-center">
      Error al iniciar sesión. Intenta de nuevo.
    </p>
  );
}
