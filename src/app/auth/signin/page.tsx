"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useSession } from "next-auth/react";
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

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      console.log(session);
      window.location.href = "/dashboard/profile";
    }
  }, [session]);

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
    <div className="flex h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-xs">
              Ingresa a tu cuenta para acceder a tu perfil de fitness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
              {error && (
                <p className="text-[#E52020] text-xs text-center">
                  Error al iniciar sesión. Intenta de nuevo.
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
                    Iniciando sesión con Google...
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
      </motion.div>
    </div>
  );
}
