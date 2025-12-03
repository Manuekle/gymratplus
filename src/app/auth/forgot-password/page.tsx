"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const hasVerifiedRef = useRef(false);

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

  // Función para verificar el código automáticamente
  const verifyCode = async (codeValue: string) => {
    if (codeValue.length !== 6 || !/^\d{6}$/.test(codeValue)) {
      return;
    }

    if (isVerifying || hasVerifiedRef.current) return;

    hasVerifiedRef.current = true;
    setIsVerifying(true);
    setError("");
    setCodeError("");

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: codeValue.trim(),
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
      hasVerifiedRef.current = false; // Permitir reintentar en caso de error
      if (error instanceof Error) {
        setCodeError(error.message || "Código inválido");
      } else {
        setCodeError("Código inválido");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Efecto para verificar automáticamente cuando el código esté completo
  useEffect(() => {
    if (
      code.length === 6 &&
      /^\d{6}$/.test(code) &&
      !isVerifying &&
      !hasVerifiedRef.current
    ) {
      verifyCode(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Resetear el ref cuando el código cambia (nuevo código ingresado)
  useEffect(() => {
    if (code.length < 6) {
      hasVerifiedRef.current = false;
    }
  }, [code]);

  const handleResendCode = async () => {
    setError("");
    setCode("");
    setCodeError("");
    hasVerifiedRef.current = false; // Resetear el ref al reenviar
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
              : `Ingresa el código de 6 dígitos que enviamos a ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 space-y-4">
          {step === "code" ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs md:text-xs text-center mb-4">
                  Código de verificación
                </Label>
                <div className="w-full">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => {
                      // Solo permitir números
                      const numericValue = value.replace(/\D/g, "");
                      setCode(numericValue);
                      if (codeError) setCodeError("");
                    }}
                    disabled={isVerifying}
                    pattern="[0-9]*"
                    containerClassName="w-full"
                  >
                    <InputOTPGroup className="w-full justify-between">
                      <InputOTPSlot
                        index={0}
                        className="h-14 flex-1 text-xl tracking-heading font-semibold"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-14 flex-1 text-xl tracking-heading font-semibold"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-14 flex-1 text-xl tracking-heading font-semibold"
                      />
                      <InputOTPSlot
                        index={3}
                        className="h-14 flex-1 text-xl tracking-heading font-semibold"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-14 flex-1 text-xl tracking-heading font-semibold"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-14 flex-1 text-xl tracking-heading font-semibold"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {codeError && (
                  <p
                    id="code-error"
                    className="text-[#E52020] text-xs text-center"
                  >
                    {codeError}
                  </p>
                )}
                {isVerifying && (
                  <p className="text-xs text-center text-muted-foreground">
                    <Icons.spinner className="mr-2 h-3 w-3 animate-spin inline" />
                    Verificando...
                  </p>
                )}
              </div>
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="default"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  {loading
                    ? "Reenviando..."
                    : "¿No recibiste el código? Reenviar"}
                </Button>
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
                variant="default"
                size="default"
                className="w-full text-xs"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setCodeError("");
                }}
              >
                Cambiar email
              </Button>
            </div>
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
                size="default"
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
