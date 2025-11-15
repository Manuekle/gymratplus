"use client";

import type React from "react";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { ErrorMessage } from "@/app/auth/signin/error-message";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setErrorMessage("Correo o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.push("/onboarding"); // Redirige al perfil después del login
    }
  };

  return (
    <>
      <div className="relative flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-heading text-center">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs text-center">
              Ingresa a tu cuenta para acceder a tu perfil de fitness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs md:text-xs" htmlFor="email">
                  Correo electrónico
                </Label>
                <Input
                  className="text-xs md:text-xs"
                  id="email"
                  name="email"
                  type="email"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs md:text-xs" htmlFor="password">
                  Contraseña
                </Label>
                <Input
                  className="text-xs md:text-xs"
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <Button
                size="sm"
                type="submit"
                className="text-xs w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
              {/* Suspense boundary for useSearchParams */}
              <Suspense fallback={null}>
                <ErrorMessage />
              </Suspense>

              {errorMessage && (
                <p className="text-[#E52020] text-xs text-center">
                  {errorMessage}
                </p>
              )}
            </form>
            <div className="border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={async () => {
                  setLoadingGoogle(true);
                  await signIn("google", { callbackUrl: "/" });
                  setLoadingGoogle(false);
                }}
                disabled={loadingGoogle}
              >
                {loadingGoogle ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión con Google
                  </>
                ) : (
                  <>
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Iniciar sesión con Google
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-xs">
              No tienes una cuenta?{" "}
              <Link href="/auth/signup" className="text-primary">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
