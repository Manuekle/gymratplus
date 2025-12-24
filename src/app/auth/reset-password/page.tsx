"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Icons } from "@/components/icons";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Validar token al cargar
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(
          `/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
        );
        const data = await response.json();
        setTokenValid(data.valid || false);
        if (!data.valid) {
          setError(data.error || "Token inválido o expirado");
        }
      } catch {
        setTokenValid(false);
        setError("Error al validar el token");
      }
    };

    validateToken();
  }, [token]);

  // Validación de contraseña
  useEffect(() => {
    if (!password) {
      setPasswordError("");
      return;
    }

    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Al menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Una mayúscula");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Una minúscula");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Un número");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("Un carácter especial");
    }

    if (errors.length > 0) {
      setPasswordError(`Falta: ${errors.join(", ")}`);
    } else {
      setPasswordError("");
    }
  }, [password]);

  // Validación de confirmación
  useEffect(() => {
    if (!confirmPassword) {
      setConfirmPasswordError("");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
    } else {
      setConfirmPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (passwordError || confirmPasswordError) {
      setError("Por favor, corrige los errores en el formulario");
      setLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError("La contraseña es muy débil. Mejórala para mayor seguridad");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Token no válido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer la contraseña");
      }

      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Ocurrió un error. Intenta de nuevo.");
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (tokenValid === null) {
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

        <Card className="relative z-10 w-full max-w-md shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
          <CardContent className="px-4 py-8">
            <div className="flex items-center justify-center">
              <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenValid === false) {
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

        <Card className="relative z-10 w-full max-w-md shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-heading text-center">
              Token Inválido
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs text-center">
              El enlace de recuperación no es válido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 space-y-4">
            {error && (
              <p className="text-[#E52020] text-xs text-center">{error}</p>
            )}
            <Button
              size="default"
              className="w-full text-xs"
              onClick={() => router.push("/auth/forgot-password")}
            >
              Solicitar nuevo enlace
            </Button>
            <div className="mt-4 text-center text-xs">
              <Link
                href="/auth/signin"
                className="text-primary hover:underline"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
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

        <Card className="relative z-10 w-full max-w-md shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-heading text-center">
              Contraseña Restablecida
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs text-center">
              Tu contraseña ha sido restablecida exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-xs text-green-800 dark:text-green-200 text-center">
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
            </div>
            <Button
              size="default"
              className="w-full text-xs"
              onClick={() => router.push("/auth/signin")}
            >
              Ir al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <Card className="relative z-10 w-full max-w-md shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-heading text-center">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs text-center">
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs md:text-xs" htmlFor="password">
                Nueva Contraseña *
              </Label>
              <PasswordInput
                className="text-xs md:text-xs"
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onStrengthChange={setPasswordStrength}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
              />
              {password && (
                <PasswordStrength password={password} className="mt-1" />
              )}
              {passwordError && (
                <p id="password-error" className="text-[#E52020] text-xs">
                  {passwordError}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs md:text-xs" htmlFor="confirmPassword">
                Confirmar Contraseña *
              </Label>
              <PasswordInput
                className="text-xs md:text-xs"
                id="confirmPassword"
                name="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!!confirmPasswordError}
                aria-describedby={
                  confirmPasswordError ? "confirm-password-error" : undefined
                }
              />
              {confirmPasswordError && (
                <p
                  id="confirm-password-error"
                  className="text-[#E52020] text-xs"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>
            <Button
              size="default"
              type="submit"
              className="w-full text-xs"
              disabled={
                loading ||
                !!passwordError ||
                !!confirmPasswordError ||
                passwordStrength < 3
              }
            >
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Restableciendo...
                </>
              ) : (
                "Restablecer Contraseña"
              )}
            </Button>
            {error && (
              <p className="text-[#E52020] text-xs text-center">{error}</p>
            )}
          </form>
          <div className="mt-4 text-center text-xs">
            <Link href="/auth/signin" className="text-primary hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-zinc-200/40 to-zinc-300/20 dark:from-zinc-800/40 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-tl from-zinc-300/30 to-zinc-200/20 dark:from-zinc-700/30 dark:to-zinc-800/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-zinc-200/30 to-zinc-300/20 dark:from-zinc-800/30 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <Card className="relative z-10 w-full max-w-md shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
            <CardContent className="px-4 py-8">
              <div className="flex items-center justify-center">
                <Icons.spinner className="h-6 w-6 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
