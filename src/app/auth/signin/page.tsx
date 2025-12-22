"use client";

import type React from "react";

import { signIn } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validación de email en tiempo real
  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError("");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError("Email inválido");
      return false;
    }

    setEmailError("");
    return true;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setEmailError("");

    // Validaciones
    if (!validateEmail(email)) {
      setErrorMessage("Por favor, ingresa un email válido");
      setLoading(false);
      return;
    }

    if (!password || password.length < 1) {
      setErrorMessage("Por favor, ingresa tu contraseña");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      password,
    });

    if (res?.error) {
      // Mensajes de error más específicos
      if (res.error.includes("CredentialsSignin")) {
        setErrorMessage("Correo o contraseña incorrectos");
      } else if (res.error.includes("Credentials")) {
        setErrorMessage(
          "Credenciales inválidas. Verifica tu email y contraseña",
        );
      } else {
        setErrorMessage("Error al iniciar sesión. Intenta de nuevo.");
      }
      setLoading(false);
    } else if (res?.ok) {
      router.push("/onboarding");
    } else {
      setErrorMessage("Error al iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Elements - Only render on client to avoid hydration mismatch */}
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

      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-heading text-center">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs text-center">
              Ingresa a tu cuenta para acceder a tu perfil de fitness
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 space-y-4">
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  autoComplete="email"
                />
                {emailError && (
                  <p id="email-error" className="text-[#E52020] text-xs">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs md:text-xs" htmlFor="password">
                    Contraseña
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <PasswordInput
                  className="text-xs md:text-xs"
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button
                size="default"
                type="submit"
                className="text-xs w-full"
                disabled={loading || !!emailError}
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
                size="default"
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
              <Link
                href="/auth/signup"
                className="text-primary hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
