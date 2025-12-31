"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { QrCodeIcon, Share01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function FriendsPage() {
    return (
        <div className="container mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Amigos</h1>
                <p className="text-muted-foreground">
                    Comparte tus rutinas y conecta con tus compañeros de entrenamiento via QR.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Share Card */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                <HugeiconsIcon icon={Share01Icon} className="w-6 h-6" />
                            </div>
                            Compartir Rutina
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Entra a cualquier rutina creada por ti y busca el botón de compartir
                            para generar un código QR único.
                        </p>
                        <Button asChild className="w-full sm:w-auto" variant="outline">
                            <Link href="/dashboard/workout">Ir a mis rutinas</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Scan Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                <HugeiconsIcon icon={QrCodeIcon} className="w-6 h-6" />
                            </div>
                            Escanear Código
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Usa la cámara de tu móvil para escanear el código QR de un amigo e
                            importar su rutina instantáneamente.
                        </p>
                        {/* Future: Add in-app scanner button here if needed */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
