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
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const repeatPassword = formData.get("repeatPassword") as string;

    if (password !== repeatPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      name,
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
            <form onSubmit={handleLogin} className="space-y-4 gap-4">
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
              {errorMessage && (
                <p className="text-[#E52020] text-xs text-center">
                  {errorMessage}
                </p>
              )}
            </form>
            <div className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full"
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
