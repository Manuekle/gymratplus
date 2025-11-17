"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, SquareLock01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils/utils";

interface PasswordInputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "type"> {
  showStrengthIndicator?: boolean;
  onStrengthChange?: (strength: number) => void;
}

export function PasswordInput({
  className,
  showStrengthIndicator = false,
  onStrengthChange,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Calculate strength if callback provided
    if (onStrengthChange) {
      const strength = calculatePasswordStrength(newValue);
      onStrengthChange(strength);
    }

    // Call original onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  // Use controlled value if provided, otherwise uncontrolled
  const inputValue = value !== undefined ? value : undefined;

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        onChange={handlePasswordChange}
        value={inputValue}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        disabled={props.disabled}
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        <HugeiconsIcon
          icon={showPassword ? SquareLock01Icon : EyeIcon}
          className="h-4 w-4 text-muted-foreground transition-all"
        />
      </Button>
    </div>
  );
}

function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  // Longitud
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Mayúsculas
  if (/[A-Z]/.test(password)) strength += 1;

  // Minúsculas
  if (/[a-z]/.test(password)) strength += 1;

  // Números
  if (/[0-9]/.test(password)) strength += 1;

  // Caracteres especiales
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  return Math.min(strength, 5);
}

export { calculatePasswordStrength };
