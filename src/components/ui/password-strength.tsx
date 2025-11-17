"use client";

import { cn } from "@/lib/utils/utils";
import { calculatePasswordStrength } from "./password-input";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  const getStrengthLabel = () => {
    if (strength <= 2) return { text: "Débil", color: "bg-red-500" };
    if (strength <= 3) return { text: "Regular", color: "bg-yellow-500" };
    if (strength <= 4) return { text: "Buena", color: "bg-blue-500" };
    return { text: "Fuerte", color: "bg-green-500" };
  };

  const { text, color } = getStrengthLabel();

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Fortaleza de contraseña:</span>
        <span
          className={cn(
            "font-medium",
            strength <= 2 && "text-red-500",
            strength === 3 && "text-yellow-500",
            strength === 4 && "text-blue-500",
            strength >= 5 && "text-green-500",
          )}
        >
          {text}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              level <= strength ? color : "bg-muted",
            )}
          />
        ))}
      </div>
      {strength < 3 && (
        <p className="text-xs text-muted-foreground">
          Usa mayúsculas, números y caracteres especiales para mayor seguridad
        </p>
      )}
    </div>
  );
}
