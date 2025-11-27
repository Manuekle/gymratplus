import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center w-full ${className}`}
    >
      {icon && <div className="mb-3">{icon}</div>}
      <h3 className="text-xs font-medium mb-2">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mb-3">
          {description}
        </p>
      )}
      {action &&
        (action.href ? (
          <Link href={action.href}>
            <Button variant="outline" size="default" className="text-xs h-7">
              {action.label}
            </Button>
          </Link>
        ) : action.onClick ? (
          <Button
            variant="outline"
            size="default"
            className="text-xs h-7"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ) : null)}
    </div>
  );
}
