"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon } from "@hugeicons/core-free-icons";
import { QRCodeCanvas } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { toast } from "sonner";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export default function QRCodePage() {
  const { data: session, status } = useSession();
  const [qrUrl, setQrUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      // Generate the public profile URL
      const baseUrl = window.location.origin;
      const profileUrl = `${baseUrl}/profile/${session.user.id}`;
      setQrUrl(profileUrl);
    }
  }, [session]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const canvas = document.querySelector(
        "#qr-code-canvas",
      ) as HTMLCanvasElement;
      if (!canvas) {
        toast.error("No se pudo generar la imagen del código QR");
        return;
      }

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Error al generar la imagen");
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-code-${session?.user?.name || "perfil"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Código QR descargado exitosamente");
      });
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Error al descargar el código QR");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && qrUrl) {
        await navigator.share({
          title: "Mi código QR - GymRat+",
          text: `Escanea este código QR para ver mi perfil: ${qrUrl}`,
          url: qrUrl,
        });
        toast.success("Código QR compartido");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(qrUrl);
        toast.success("URL copiada al portapapeles");
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(qrUrl);
        toast.success("URL copiada al portapapeles");
      } catch {
        toast.error("Error al compartir el código QR");
      }
    }
  };

  if (status === "loading") {
    return (
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex flex-col items-center gap-6">
              <Skeleton className="h-64 w-64 rounded-lg" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>No autorizado</CardTitle>
            <CardDescription>
              Debes iniciar sesión para ver tu código QR
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isInstructor = session.user.isInstructor || false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Mi Código QR
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Comparte este código QR para que otros puedan ver tu perfil
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col items-center gap-6">
          {/* User Info */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || "Usuario"}
              />
              <AvatarFallback className="text-xl tracking-heading font-semibold">
                {session.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center flex flex-row items-center justify-center gap-2">
              <h3 className="text-2xl font-semibold tracking-heading">
                {session.user.name || "Usuario"}
              </h3>
              {/* Verification Icon */}

              {(session?.user?.subscriptionStatus === "active" ||
                session?.user?.subscriptionStatus === "trialing") && (
                <VerifiedBadge
                  variant={
                    session?.user?.subscriptionTier === "PRO"
                      ? "pro"
                      : isInstructor
                        ? "instructor"
                        : "default"
                  }
                />
              )}
            </div>
          </div>

          {/* QR Code */}
          {qrUrl && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg border border-zinc-200">
                <QRCodeCanvas
                  value={qrUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                  id="qr-code-canvas"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                Escanea este código QR con la cámara de tu celular para ver mi
                perfil
                {isInstructor
                  ? " y conocer mis servicios"
                  : " y entrenar conmigo"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Button
              onClick={handleDownload}
              disabled={!qrUrl || isDownloading}
              variant="outline"
              className="flex-1"
            >
              {isDownloading ? "Descargando..." : "Descargar QR"}
            </Button>
            <Button
              onClick={handleShare}
              disabled={!qrUrl}
              variant="default"
              className="flex-1"
            >
              Compartir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
