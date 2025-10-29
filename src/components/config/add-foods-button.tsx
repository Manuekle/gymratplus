import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

export default function AddFoodsButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleUploadFoods = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");
    try {
      const response = await fetch("/api/config/food", {
        method: "PUT",
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "¡Alimentos subidos correctamente!");
        setMessageType("success");
      } else {
        setMessage(data.error || "Error al subir alimentos");
        setMessageType("error");
      }
    } catch {
      setMessage("Error de conexión");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-xs mx-auto">
      <Button onClick={handleUploadFoods} disabled={loading} className="w-full">
        {loading ? (
          <span className="flex items-center gap-2">Procesando...</span>
        ) : (
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={Tick02Icon} className="text-green-600" />
            Subir alimentos base
          </span>
        )}
      </Button>
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
