import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BedDoubleIcon } from "hugeicons-react";

export function RestDayButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRestDay = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/workout-streak/rest-day", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al registrar el día de descanso");
      }

      toast.success("Día de descanso registrado", {
        description: "¡Buen trabajo cuidando tu recuperación!",
      });
    } catch (error) {
      console.error("Error al registrar día de descanso:", error);
      toast.error("Error", {
        description: "No se pudo registrar el día de descanso",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleRestDay}
      disabled={isLoading}
      className="w-full"
    >
      <BedDoubleIcon className="w-4 h-4 mr-2" />
      Registrar día de descanso
    </Button>
  );
}
