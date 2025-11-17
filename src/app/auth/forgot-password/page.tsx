"use client";

import { useState } from "react";
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
import Link from "next/link";
import { Icons } from "@/components/icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un email válido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      // Si el código se envió exitosamente, pasar al paso de código
      setStep("code");
      setError("");
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

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCodeError("");
    setVerifyingCode(true);

    // Validar formato del código
    if (!/^\d{6}$/.test(code.trim())) {
      setCodeError("El código debe tener 6 dígitos");
      setVerifyingCode(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Código inválido");
      }

      // Si el código es correcto, redirigir a reset-password con el token
      if (data.token) {
        router.push(`/auth/reset-password?token=${data.token}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setCodeError(error.message || "Código inválido");
      } else {
        setCodeError("Código inválido");
      }
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setCode("");
    setCodeError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al reenviar el código");
      }

      // Mostrar mensaje de éxito
      setError("");
      setSuccessMessage("Código reenviado. Revisa tu email.");
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Error al reenviar el código");
      } else {
        setError("Error al reenviar el código");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-heading text-center">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs text-center">
            {step === "email"
              ? "Ingresa tu email y te enviaremos un código de verificación"
              : "Ingresa el código de 6 dígitos que enviamos a tu email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 space-y-4">
          {step === "code" ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
                  Hemos enviado un código de 6 dígitos a{" "}
                  <strong>{email}</strong>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs md:text-xs" htmlFor="code">
                  Código de verificación
                </Label>
                <Input
                  className="text-xs md:text-xs text-center text-2xl tracking-widest font-mono"
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/\D/g, "");
                    setCode(value);
                    if (codeError) setCodeError("");
                  }}
                  placeholder="000000"
                  aria-invalid={!!codeError}
                  aria-describedby={codeError ? "code-error" : undefined}
                  autoComplete="one-time-code"
                  autoFocus
                />
                {codeError && (
                  <p id="code-error" className="text-[#E52020] text-xs">
                    {codeError}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                type="submit"
                className="w-full text-xs"
                disabled={verifyingCode || code.length !== 6}
              >
                {verifyingCode ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar código"
                )}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  {loading
                    ? "Reenviando..."
                    : "¿No recibiste el código? Reenviar"}
                </button>
              </div>
              {successMessage && (
                <p className="text-green-600 dark:text-green-400 text-xs text-center">
                  {successMessage}
                </p>
              )}
              {error && (
                <p className="text-[#E52020] text-xs text-center">{error}</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setCodeError("");
                }}
              >
                Cambiar email
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="tu@email.com"
                />
                {emailError && (
                  <p id="email-error" className="text-[#E52020] text-xs">
                    {emailError}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                type="submit"
                className="w-full text-xs"
                disabled={loading || !!emailError}
              >
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar código de verificación"
                )}
              </Button>
              {error && (
                <p className="text-[#E52020] text-xs text-center">{error}</p>
              )}
            </form>
          )}
          <div className="mt-4 text-center text-xs">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
