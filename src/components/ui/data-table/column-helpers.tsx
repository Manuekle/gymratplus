import type React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Función para crear una columna de texto simple con ordenación
export function createSortableColumn<T>(
  accessorKey: keyof T,
  header: string
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-xs md:text-sm tracking-headinger font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {header}
          <ArrowUpDownIcon className="ml-2 h-4 w-4 " />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue(accessorKey as string)}</div>,
  };
}

// Función para crear una columna numérica con formato
export function createNumberColumn<T>(
  accessorKey: keyof T,
  header: string,
  options: Intl.NumberFormatOptions = {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  locale = "es-ES"
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-end"
        >
          {header}
          <ArrowUpDownIcon className="ml-2 h-4 w-4 " />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue(accessorKey as string);
      const amount =
        typeof value === "string" ? Number.parseFloat(value) : Number(value);
      const formatted = new Intl.NumberFormat(locale, options).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  };
}

// Función para crear una columna con badge
export function createBadgeColumn<T>(
  accessorKey: keyof T,
  header: string,
  variantFn: (
    value: string
  ) => "default" | "secondary" | "destructive" | "outline" = () => "default"
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {header}
          <ArrowUpDownIcon className="ml-2 h-4 w-4 " />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue(accessorKey as string) as string;
      return <Badge variant={variantFn(value)}>{value}</Badge>;
    },
  };
}

// Función para crear una columna con estado (punto de color)
export function createStatusColumn<T>(
  accessorKey: keyof T,
  header: string,
  statusColorFn: (value: string) => string
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {header}
          <ArrowUpDownIcon className="ml-2 h-4 w-4 " />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue(accessorKey as string) as string;
      return (
        <div className="flex items-center">
          <div
            className={`mr-2 h-2 w-2 rounded-full ${statusColorFn(value)}`}
          />
          <span>{value}</span>
        </div>
      );
    },
  };
}

// Añadir estas nuevas importaciones
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowUpDownIcon,
  Calendar01Icon,
  EyeIcon,
  MoreHorizontalIcon,
} from "hugeicons-react";

// Añadir después de las funciones existentes:

// Función para crear una columna de fecha
export function createDateColumn<T>(
  accessorKey: keyof T,
  header: string,
  formatString = "dd/MM/yyyy", // Cambio de formato a "28/03/2025"
  locale = es
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-xs md:text-sm tracking-headinger font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {header}
          <ArrowUpDownIcon className="ml-2 h-4 w-4 " />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue(accessorKey as string);

      if (!value) return <div>-</div>;

      const date =
        typeof value === "string"
          ? parseISO(value)
          : value instanceof Date
          ? value
          : new Date(value as string | number | Date);

      const formatted = format(date, formatString, { locale });

      return (
        <div className="flex items-center">
          <Calendar01Icon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{formatted}</span>
        </div>
      );
    },
  };
}

// Función para crear una columna de acciones con menú desplegable
export function createActionsColumn<T>(
  header = "Acciones",
  actions: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: T) => void;
    className?: string;
  }>
): ColumnDef<T> {
  return {
    id: "actions",
    header: header,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action, index) => {
              const Icon = action.icon || EyeIcon;
              return (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(item)}
                  className={action.className}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <h1 className="text-xs font-medium">{action.label}</h1>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}

// Función para crear una columna con botones directos (sin menú desplegable)
export function createButtonsColumn<T>(
  header = "Acciones",
  buttons: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: T) => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    className?: string;
    showLabel?: boolean;
  }>
): ColumnDef<T> {
  return {
    id: "buttons",
    header: header,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center gap-2">
          {buttons.map((button, index) => {
            const Icon = button.icon || EyeIcon;
            const showLabel = button.showLabel !== false;

            return (
              <Button
                key={index}
                variant={button.variant || "outline"}
                size="sm"
                onClick={() => button.onClick(item)}
                className={button.className}
              >
                <Icon className={showLabel ? "mr-2 h-4 w-4" : "h-4 w-4"} />
                {showLabel && button.label}
                {!showLabel && <span className="sr-only">{button.label}</span>}
              </Button>
            );
          })}
        </div>
      );
    },
  };
}
