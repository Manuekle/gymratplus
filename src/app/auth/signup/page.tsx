"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { VerificationForm } from "@/components/auth/verification-form";

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

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState("");

  // Validación de email en tiempo real
  useEffect(() => {
    if (!email) {
      setEmailError("");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email inválido");
      return;
    }

    setEmailError("");
    // Verificar si el email ya existe
    const checkEmail = async () => {
      setIsCheckingEmail(true);
      try {
        const response = await fetch(
          `/api/auth/check-email?email=${encodeURIComponent(email)}`,
        );
        const data = await response.json();
        if (data.exists) {
          setEmailError("Este email ya está registrado");
        } else {
          setEmailError("");
        }
      } catch {
        // Ignorar errores de verificación
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // Validación de nombre
  useEffect(() => {
    if (!name) {
      setNameError("");
      return;
    }

    if (name.trim().length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres");
    } else if (name.trim().length > 50) {
      setNameError("El nombre no puede exceder 50 caracteres");
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name.trim())) {
      setNameError("El nombre solo puede contener letras y espacios");
    } else {
      setNameError("");
    }
  }, [name]);

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

  // Validación de confirmación de contraseña
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
    setLoading(true);
    setError("");

    // Validaciones finales
    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones");
      setLoading(false);
      return;
    }

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setError("Por favor, corrige los errores en el formulario");
      setLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError("La contraseña es muy débil. Mejórala para mayor seguridad");
      setLoading(false);
      return;
    }

    try {
      // Registrar usuario
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario");
      }

      // Iniciar sesión automáticamente o mostrar verificación
      if (data.verificationRequired && data.user?.id) {
        setRegisteredUserId(data.user.id);
        setShowVerification(true);
      } else {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          router.push("/onboarding");
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Ocurrió un error durante el registro");
      } else {
        setError("Ocurrió un error durante el registro");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
    // Iniciar sesión después de verificar
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/onboarding");
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden flex items-center justify-center p-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-zinc-200/40 to-zinc-300/20 dark:from-zinc-800/40 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-tl from-zinc-300/30 to-zinc-200/20 dark:from-zinc-700/30 dark:to-zinc-800/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-zinc-200/30 to-zinc-300/20 dark:from-zinc-800/30 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Glass Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative z-10 w-full max-w-md">
          <Card className="w-full shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-heading text-center">
                Verifica tu Correo
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs text-center">
                Ingresa el código que hemos enviado a {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <VerificationForm
                type="email"
                destination={email}
                userId={registeredUserId}
                onVerified={handleVerificationSuccess}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-zinc-200/40 to-zinc-300/20 dark:from-zinc-800/40 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-tl from-zinc-300/30 to-zinc-200/20 dark:from-zinc-700/30 dark:to-zinc-800/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-zinc-200/30 to-zinc-300/20 dark:from-zinc-800/30 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Glass Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-heading text-center">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs text-center">
              Regístrate para acceder a todos los beneficios de la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs md:text-xs" htmlFor="name">
                  Nombre
                </Label>
                <Input
                  className="text-xs md:text-xs"
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <p id="name-error" className="text-[#E52020] text-xs">
                    {nameError}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs md:text-xs" htmlFor="email">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Input
                    className="text-xs md:text-xs"
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                  {isCheckingEmail && (
                    <Icons.spinner className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {emailError && (
                  <p id="email-error" className="text-[#E52020] text-xs">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs md:text-xs" htmlFor="password">
                  Contraseña
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
                  aria-describedby={
                    passwordError ? "password-error" : undefined
                  }
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
                <Label className="text-xs md:text-xs" htmlFor="repeatPassword">
                  Repetir Contraseña
                </Label>
                <PasswordInput
                  className="text-xs md:text-xs"
                  id="repeatPassword"
                  name="repeatPassword"
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
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms(checked === true)
                  }
                  aria-invalid={!acceptedTerms && error.includes("términos")}
                />
                <Label
                  htmlFor="terms"
                  className="text-xs leading-tight cursor-pointer"
                >
                  Acepto los términos y condiciones y la política de privacidad
                </Label>
              </div>
              <Button
                size="default"
                type="submit"
                className="w-full text-xs"
                disabled={
                  loading ||
                  !!nameError ||
                  !!emailError ||
                  !!passwordError ||
                  !!confirmPasswordError ||
                  !acceptedTerms ||
                  passwordStrength < 3
                }
              >
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Registrando
                  </>
                ) : (
                  "Registrarse"
                )}
              </Button>
              {error && (
                <p className="text-[#E52020] text-xs text-center">{error}</p>
              )}
            </form>
            <div className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full text-xs"
                size="default"
                onClick={async () => {
                  setLoadingGoogle(true);
                  await signIn("google", { callbackUrl: "/onboarding" });
                  setLoadingGoogle(false);
                }}
                disabled={loadingGoogle}
              >
                {loadingGoogle ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Registrando
                  </>
                ) : (
                  <>
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Registrarse con Google
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-xs">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/auth/signin"
                className="text-primary hover:underline"
              >
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
