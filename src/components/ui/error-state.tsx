import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
  className?: string;
}

export function ErrorState({
  title,
  description,
  action,
  icon,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center w-full py-12 px-4 ${className}`}
    >
      {icon ? (
        <div className="mb-3">{icon}</div>
      ) : (
        <div className="mb-3">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="h-12 w-12 text-destructive"
          />
        </div>
      )}
      <h3 className="text-xs font-medium mb-2">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mb-3">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="default"
          size="default"
          className="text-xs"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
