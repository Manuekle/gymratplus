"use client";

import { useSession } from "next-auth/react";
import { VerificationForm } from "@/components/auth/verification-form";
// import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/layout/theme/theme-toggle";

export default function VerifyEmailPage() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !session?.user) {
        return null; // or loading spinner
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Card className="w-full shadow-lg backdrop-blur-sm bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-semibold tracking-heading text-center">
                            Verifica tu Correo
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-xs text-center">
                            Para continuar, necesitas verificar tu dirección de correo electrónico: <br />
                            <span className="font-medium text-foreground">{(session.user as any).email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 space-y-6">
                        <VerificationForm
                            type="email"
                            destination={(session.user as any).email || ""}
                            userId={session.user.id}
                            onVerified={async () => {
                                // Forced reload ensures the session cookie is updated and seen by middleware
                                window.location.href = "/onboarding";
                            }}
                            className="w-full"
                        />

                        <div className="border-t pt-4">
                            <Button
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                            >
                                Cerrar Sesión / Cambiar Cuenta
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
