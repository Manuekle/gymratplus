"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

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
      router.push("/profile"); // Redirige al perfil después del login
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-red-500 text-center">
              Error al iniciar sesión. Intenta de nuevo.
            </p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cargando..." : "Iniciar sesión"}
            </Button>
          </form>
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              disabled={loading}
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              {"Iniciar sesión con Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
