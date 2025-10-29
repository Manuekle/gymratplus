import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

// Puedes cambiar este ícono por uno más específico si lo encuentras en tu librería
import { Cancel01Icon } from "@hugeicons/core-free-icons";

export default function AddExerciseButton() {
  // Estado de loading individual para cada acción
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  // Estado para feedback visual
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  // Estado para controlar el diálogo de confirmación
  const [openDialog, setOpenDialog] = useState(false);

  // Función para manejar la petición al endpoint
  const handleRequest = async (method: "POST" | "DELETE") => {
    if (method === "POST") setLoadingAdd(true);
    if (method === "DELETE") setLoadingDelete(true);
    setMessage("");
    setMessageType("");
    try {
      const response = await fetch("/api/config/exercise", {
        method,
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(
          method === "POST"
            ? "¡Ejercicios agregados correctamente!"
            : "¡Ejercicios duplicados eliminados!",
        );
        setMessageType("success");
      } else {
        setMessage(data.error || "Error en la operación");
        setMessageType("error");
      }
    } catch {
      setMessage("Error de conexión");
      setMessageType("error");
    } finally {
      setLoadingAdd(false);
      setLoadingDelete(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-xs mx-auto">
      {/* Botón para agregar ejercicios */}
      <Button
        onClick={() => handleRequest("POST")}
        disabled={loadingAdd || loadingDelete}
        className="w-full"
      >
        {loadingAdd ? (
          <span className="flex items-center gap-2">Procesando...</span>
        ) : (
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={Tick02Icon} className="text-green-600" />
            Agregar Ejercicios
          </span>
        )}
      </Button>

      {/* Botón con diálogo de confirmación para eliminar duplicados */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={loadingAdd || loadingDelete}
            className="w-full"
          >
            {loadingDelete ? (
              <span className="flex items-center gap-2">Procesando...</span>
            ) : (
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={Cancel01Icon} className="text-red-600" />
                Eliminar Duplicados
              </span>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar ejercicios duplicados?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los ejercicios duplicados de la base
              de datos. <br />
              <span className="text-destructive font-semibold">
                Esta acción no se puede deshacer.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpenDialog(false);
                handleRequest("DELETE");
              }}
              disabled={loadingDelete}
            >
              Sí, eliminar duplicados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feedback visual con Alert */}
      {message && (
        <Alert
          variant={messageType === "error" ? "destructive" : "default"}
          className="w-full mt-2"
        >
          {messageType === "success" && (
            <HugeiconsIcon icon={Tick02Icon} className="text-green-600" />
          )}
          {messageType === "error" && (
            <HugeiconsIcon icon={Cancel01Icon} className="text-red-600" />
          )}
          <div>
            <AlertTitle>
              {messageType === "success" ? "Éxito" : "Error"}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}
