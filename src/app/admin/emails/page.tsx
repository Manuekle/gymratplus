"use client";

import { useFormStatus } from "react-dom";
import { sendAdminEmail } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function EmailsPage() {
  async function handleSubmit(formData: FormData) {
    const result = await sendAdminEmail(null, formData);
    if (result?.success) {
      toast.success("¡Email enviado correctamente!");
      // Reset form usually requires JS ref or State, simplified for Server Actions
    } else {
      toast.error(result.message || "Error al enviar el email");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Emails Administrativos</h2>
        <p className="text-muted-foreground">Envía notificaciones y anuncios a tus usuarios.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Redactar Correo</CardTitle>
            <CardDescription>
              Envía correos transaccionales o anuncios masivos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              {/* Audience Selector */}
              <div className="grid gap-2">
                <Label htmlFor="audience">Audiencia</Label>
                <select
                  id="audience"
                  name="audience"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="single"
                >
                  <option value="single">Usuario Individual (por email)</option>
                  <option value="all_free">Todos los Usuarios FREE</option>
                  <option value="all_pro">Todos los Usuarios PRO</option>
                  <option value="all_instructors">Todos los Instructores</option>
                  <option value="test_me">Enviarme prueba a mí</option>
                </select>
              </div>

              {/* Template Selector */}
              <div className="grid gap-2">
                <Label htmlFor="template">Plantilla</Label>
                <select
                  id="template"
                  name="template"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="standard"
                >
                  <option value="standard">Estándar (Texto simple)</option>
                  <option value="announcement">Anuncio Importante</option>
                  <option value="welcome">Bienvenida / Info</option>
                  <option value="alert">Alerta / Urgente</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="to">Destinatario (Solo para "Usuario Individual")</Label>
                <Input
                  id="to"
                  name="to"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                />
                <p className="text-[10px] text-muted-foreground">
                  Deja en blanco si seleccionaste una audiencia masiva.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Noticia Importante..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Mensaje (Soporta HTML básico)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Hola equipo..."
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div className="flex justify-end">
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-muted/50 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5 text-blue-500" />
                Consejos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                • <strong>Audiencias Masivas:</strong> Ten cuidado al enviar a "Todos". Asegúrate de que el contenido sea relevante para evitar reportes de spam.
              </p>
              <p>
                • <strong>Plantillas:</strong>
                <br />- <em>Estándar:</em> Texto limpio sobre fondo blanco.
                <br />- <em>Anuncio:</em> Encabezado destacado y botón de acción.
                <br />- <em>Alerta:</em> Bordes rojos/naranjas para urgencia.
              </p>
              <p>
                • El correo se enviará desde la dirección configurada de sistema (ej: no-reply@gymratplus.com).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      Enviar Email
    </Button>
  );
}
