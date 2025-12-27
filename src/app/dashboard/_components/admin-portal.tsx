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
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <HugeiconsIcon icon={Exchange01Icon} className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl sm:max-w-4xl">
        <DialogHeader className="text-center space-y-2 pt-4">
          <DialogTitle className="text-3xl font-bold tracking-tight">
            Portal de Navegación
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Selecciona tu destino para continuar
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <Link href="/admin" onClick={() => setOpen(false)} className="group">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-primary/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <HugeiconsIcon
                    icon={Settings01Icon}
                    className="h-6 w-6"
                  />
                </div>
                <CardTitle className="text-xl">Panel Administrativo</CardTitle>
                <CardDescription>
                  Gestiona usuarios, contenido, finanzas y configuraciones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="p-0 h-auto font-semibold text-primary group-hover:underline">
                  Ir al Admin &rarr;
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard" onClick={() => setOpen(false)} className="group">
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-emerald-500/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-600">
                  <HugeiconsIcon
                    icon={Activity01Icon}
                    className="h-6 w-6"
                  />
                </div>
                <CardTitle className="text-xl">App Dashboard</CardTitle>
                <CardDescription>
                  Rastrea tus entrenamientos, nutrición y objetivos personales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="p-0 h-auto font-semibold text-emerald-600 group-hover:underline">
                  Ir al Dashboard &rarr;
                </Button>
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
