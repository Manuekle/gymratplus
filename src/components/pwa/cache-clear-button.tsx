"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  fullCacheClear,
  forceServiceWorkerUpdate,
  getCacheInfo,
} from "@/lib/pwa/cache-management";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading02Icon,
  RefreshIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

export function CacheClearButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{
    caches: string[];
    serviceWorkers: number;
    hasController: boolean;
  } | null>(null);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      toast.info("Limpiando caché...", {
        description: "Esto puede tardar unos segundos",
      });

      await fullCacheClear();
      // Page will reload automatically
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Error al limpiar caché", {
        description: "Intenta de nuevo",
      });
      setIsClearing(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      const result = await forceServiceWorkerUpdate();

      if (result.success) {
        toast.success("Actualización iniciada", {
          description: "Recarga la página para aplicar cambios",
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error forcing update:", error);
      toast.error("Error al forzar actualización");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGetInfo = async () => {
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
      toast.info("Información de caché", {
        description: `${info.caches.length} cachés, ${info.serviceWorkers} service workers`,
      });
    } catch (error) {
      console.error("Error getting cache info:", error);
      toast.error("Error al obtener información");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gestión de Caché PWA</CardTitle>
        <CardDescription>
          Limpia el caché y fuerza actualizaciones del service worker
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleGetInfo}
            className="w-full justify-start"
          >
            <HugeiconsIcon icon={RefreshIcon} className="mr-2 h-4 w-4" />
            Ver información de caché
          </Button>

          {cacheInfo && (
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
              <p>Cachés: {cacheInfo.caches.length}</p>
              <p>Service Workers: {cacheInfo.serviceWorkers}</p>
              <p>Controlador activo: {cacheInfo.hasController ? "Sí" : "No"}</p>
              {cacheInfo.caches.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">
                    Ver cachés ({cacheInfo.caches.length})
                  </summary>
                  <ul className="mt-1 ml-4 list-disc">
                    {cacheInfo.caches.map((cache) => (
                      <li key={cache}>{cache}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleForceUpdate}
            disabled={isUpdating}
            className="w-full justify-start"
          >
            {isUpdating ? (
              <HugeiconsIcon
                icon={Loading02Icon}
                className="mr-2 h-4 w-4 animate-spin"
              />
            ) : (
              <HugeiconsIcon icon={RefreshIcon} className="mr-2 h-4 w-4" />
            )}
            Forzar actualización de service worker
          </Button>

          <Button
            variant="destructive"
            onClick={handleClearCache}
            disabled={isClearing}
            className="w-full justify-start"
          >
            {isClearing ? (
              <HugeiconsIcon
                icon={Loading02Icon}
                className="mr-2 h-4 w-4 animate-spin"
              />
            ) : (
              <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
            )}
            Limpiar todo el caché y recargar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          <strong>Nota:</strong> Limpiar el caché eliminará todos los datos en
          caché y recargará la página. Esto puede ayudar a resolver problemas
          con el service worker o la PWA.
        </p>
      </CardContent>
    </Card>
  );
}
