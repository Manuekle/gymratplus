"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useProgress, ProgressRecord } from "@/hooks/use-progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";

export default function HealthHistoryPage() {
  const { fetchProgressData } = useProgress();
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();
  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchProgressData("all");
      // Sort by date in descending order (newest first)
      const sortedData = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setRecords(sortedData);
    } catch {
      toast.error("Error al cargar el historial");
    } finally {
      setIsLoading(false);
    }
  }, [fetchProgressData]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const response = await fetch(`/api/progress/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el registro");
      }

      // Update local state immediately
      setRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== id),
      );
      toast.success("Registro eliminado correctamente");
    } catch {
      toast.error("Error al eliminar el registro");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), "PPP", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-8 w-48 rounded-md bg-muted animate-pulse mb-2" />
            <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
          </CardHeader>
          <CardContent className="px-4 pt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Fecha", "Peso", "Grasa", "Músculo", "Acciones"].map(
                      (header) => (
                        <TableHead key={header}>
                          <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(10)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(5)].map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-16 rounded-md bg-muted animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 w-full md:w-auto flex md:flex-row flex-col justify-between  items-center gap-2">
        <Button
          variant="outline"
          className="text-xs w-full md:w-auto"
          size="sm"
          onClick={() => router.push("/dashboard/health")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver al Salud
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
        {/* <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registros de salud</CardTitle>
              <CardDescription>
                {records.length} registros en total
              </CardDescription>
            </div>
          </div>
        </CardHeader> */}
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold tracking-heading">
            Historial de mediciones
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            {records.length} mediciones en total
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Peso (kg)</TableHead>
                  <TableHead className="text-right">
                    Grasa Corporal (%)
                  </TableHead>
                  <TableHead className="text-right">
                    Masa Muscular (%)
                  </TableHead>
                  <TableHead className="w-[100px] text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center py-4 gap-2">
                        <h3 className="text-xs font-medium">
                          No hay registros aún
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Añade tu primer registro para comenzar a hacer
                          seguimiento de tu progreso.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.weight?.toFixed(1) || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.bodyFatPercentage?.toFixed(1) || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.muscleMassPercentage?.toFixed(1) || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => record.id && handleDelete(record.id)}
                          disabled={!record.id || isDeleting === record.id}
                          className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:text-red-400"
                        >
                          {isDeleting === record.id ? (
                            <Icons.spinner className="h-4 w-4 animate-spin" />
                          ) : (
                            "Eliminar"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
