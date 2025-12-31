"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { QrCodeIcon, Share01Icon, Search01Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import AnimatedLayout from "@/components/layout/animated-layout";

export default function FriendsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement logic to search friends
        console.log("Searching for:", searchQuery);
    };

    return (
        <AnimatedLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-heading">Amigos</h1>
                    <p className="text-xs text-muted-foreground">
                        Conecta y comparte tu progreso con otros entrenadores.
                    </p>
                </div>

                {/* Search Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium tracking-[-0.02em] flex items-center gap-2">
                            <HugeiconsIcon icon={UserMultipleIcon} className="w-5 h-5" />
                            Buscar Amigos
                        </CardTitle>
                        <CardDescription>
                            Encuentra a otros usuarios por su nombre de usuario o correo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <HugeiconsIcon
                                    icon={Search01Icon}
                                    className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                                />
                                <Input
                                    placeholder="Buscar usuario..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit">Buscar</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Share Card */}
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                    <HugeiconsIcon icon={Share01Icon} className="w-5 h-5" />
                                </div>
                                Compartir Rutina
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground">
                                Genera un código QR desde el detalle de tus rutinas para compartir tu entrenamiento con amigos.
                            </p>
                            <Button asChild className="w-full sm:w-auto" variant="outline">
                                <Link href="/dashboard/workout">Ir a mis rutinas</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Scan Card */}
                    <Card className="bg-gradient-to-br from-zinc-50 to-gray-50 dark:from-zinc-900/20 dark:to-gray-900/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                    <HugeiconsIcon icon={QrCodeIcon} className="w-5 h-5" />
                                </div>
                                Escanear Código
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground">
                                Usa la cámara de tu móvil para escanear el código QR de un amigo e importar su rutina al instante.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedLayout>
    );
}
