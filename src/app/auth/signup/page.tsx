"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("repeatPassword") as string;

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
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

      console.log("Logging in with:", { email, password });

      // Iniciar sesión automáticamente
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log(result);

      if (result?.error) {
        setError(result.error);
        // router.push("/auth/error");
      } else {
        // Redireccionar a onboarding o dashboard
        router.push("/onboarding");
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

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-semibold tracking-heading">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-center text-xs">
            Regístrate para acceder a todos los beneficios de la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              />
            </div>
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
            <div className="flex flex-col gap-2">
              <Label className="text-xs md:text-xs" htmlFor="repeatPassword">
                Repetir Contraseña
              </Label>
              <Input
                className="text-xs md:text-xs"
                id="repeatPassword"
                name="repeatPassword"
                type="password"
                required
              />
            </div>
            <Button
              size="sm"
              type="submit"
              className="w-full text-xs"
              disabled={loading}
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
              <p className="text-[#E52020] text-xs text-center">
                Error al Registrarse Intenta de nuevo.
              </p>
            )}
            {error && (
              <p className="text-[#E52020] text-xs text-center">{error}</p>
            )}
          </form>
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full text-xs"
              size="sm"
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
            <Link href="/auth/signin" className="text-primary">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
