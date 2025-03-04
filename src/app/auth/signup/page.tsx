"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

import { motion } from "framer-motion";
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

      // Iniciar sesión automáticamente
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Redireccionar a onboarding o dashboard
        router.push("/onboarding");
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || "Ocurrió un error durante el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Crear Cuenta</CardTitle>
            <CardDescription className="text-center text-xs">
              Regístrate para acceder a todos los beneficios de la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" type="text" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="repeatPassword">Repetir Contraseña</Label>
                <Input
                  id="repeatPassword"
                  name="repeatPassword"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
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
                className="w-full"
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
                    Registrando...
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
      </motion.div>
    </div>
  );
}
