"use client";

import * as React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading02Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Mail01Icon,
  // SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { maskPhoneNumber } from "@/lib/utils/phone";
import { useSession } from "next-auth/react";

interface VerificationFormProps {
  type: "email" | "sms";
  destination: string; // Email o teléfono
  userId: string;
  onVerified?: () => void;
  className?: string;
}

export function VerificationForm({
  type,
  destination,
  userId,
  onVerified,
  className,
}: VerificationFormProps) {
  const { update } = useSession();
  const [code, setCode] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  // Enmascarar destino para privacidad
  const maskedDestination = React.useMemo(() => {
    if (type === "email") {
      const parts = destination.split("@");
      if (parts.length !== 2) return destination;
      const local = parts[0] || "";
      const domain = parts[1] || "";
      return `${local.substring(0, 2)}***@${domain}`;
    }
    return maskPhoneNumber(destination);
  }, [type, destination]);

  // Countdown para reenvío
  React.useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-submit cuando se completan 6 dígitos
  React.useEffect(() => {
    if (code.length === 6 && !isVerifying) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          code,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.debug
            ? `${data.error} (${data.debug})`
            : data.error || "Código inválido",
        );
        setCode("");
        return;
      }

      setSuccess(true);

      // Force session update to refresh JWT with new emailVerified status
      await update();

      setTimeout(() => {
        onVerified?.();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Error al verificar el código. Intenta de nuevo.");
      setCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    setCode("");

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type,
          destination,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Error al reenviar el código");
        return;
      }

      setCountdown(60); // 60 segundos de espera
    } catch (err) {
      console.error(err);
      setError("Error al reenviar el código. Intenta de nuevo.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        {/* {type === "email" ? ( */}
        <HugeiconsIcon
          icon={Mail01Icon}
          className="h-5 w-5 text-muted-foreground"
        />
        {/* ) : (
          <HugeiconsIcon
            icon={SmartPhone01Icon}
            className="h-5 w-5 text-muted-foreground"
          />
        )} */}
        <div>
          <p className="text-xs font-medium">
            {/* {type === "email" ? "Verificación de Email" : "Verificación de SMS"} */}
            Verificación de Email
          </p>
          <p className="text-xs text-muted-foreground">
            Código enviado a {maskedDestination}
          </p>
        </div>
      </div>

      {success ? (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            className="h-4 w-4 text-green-600"
          />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ¡Verificado exitosamente!
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={isVerifying || success}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {isVerifying && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HugeiconsIcon
                  icon={Loading02Icon}
                  className="h-4 w-4 animate-spin"
                />
                Verificando...
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="w-full">
                <HugeiconsIcon icon={CancelCircleIcon} className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              variant="default"
              size="default"
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className="text-xs"
            >
              {isResending ? (
                <>
                  <HugeiconsIcon
                    icon={Loading02Icon}
                    className="mr-2 h-3 w-3 animate-spin"
                  />
                  Reenviando...
                </>
              ) : countdown > 0 ? (
                `Reenviar código en ${countdown}s`
              ) : (
                "Reenviar código"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
