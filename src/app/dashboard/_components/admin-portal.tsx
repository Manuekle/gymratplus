"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Settings01Icon,
  Activity01Icon,
  Exchange01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AdminPortal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:scale-105 transition-all duration-300"
          size="icon"
          variant="outline"
        >
          <HugeiconsIcon icon={Exchange01Icon} className="h-6 w-6 text-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-background/80 backdrop-blur-xl border-white/10">
        <DialogHeader className="text-center space-y-4 pt-8">
          <DialogTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent pb-2">
            Portal de Navegación
          </DialogTitle>
          <DialogDescription className="text-lg">
            Selecciona tu destino para continuar
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <Link href="/admin" onClick={() => setOpen(false)} className="group">
            <Card className="h-full bg-background/50 border-white/5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <HugeiconsIcon
                    icon={Settings01Icon}
                    className="h-6 w-6 text-primary"
                  />
                </div>
                <CardTitle className="text-xl">Panel Administrativo</CardTitle>
                <CardDescription>
                  Gestiona usuarios, contenido, finanzas y configuraciones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs font-medium text-primary group-hover:underline">
                  Ir al Admin &rarr;
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard" onClick={() => setOpen(false)} className="group">
            <Card className="h-full bg-background/50 border-white/5 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <HugeiconsIcon
                    icon={Activity01Icon}
                    className="h-6 w-6 text-emerald-600"
                  />
                </div>
                <CardTitle className="text-xl">App Dashboard</CardTitle>
                <CardDescription>
                  Rastrea tus entrenamientos, nutrición y objetivos personales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs font-medium text-emerald-600 group-hover:underline">
                  Ir al Dashboard &rarr;
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center pb-4 text-xs text-muted-foreground">
          Acceso restringido para administradores.
        </div>
      </DialogContent>
    </Dialog>
  );
}
