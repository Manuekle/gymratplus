"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Upload01Icon,
  Calendar01Icon,
  Camera01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EvolutionCharts from "@/components/dashboard/evolution-charts";

export default function ProgressPage() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewType, setViewType] = useState("front");
  const [weight, setWeight] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", viewType);
    if (weight) formData.append("weight", weight);

    try {
      const res = await fetch("/api/progress/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("¡Foto subida correctamente!");
      setIsOpen(false);
      setSelectedFile(null);
      setWeight("");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Evolución</h1>
          <p className="text-muted-foreground mt-1">
            Registra tu cambio físico visual y monitorea tu peso.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              <HugeiconsIcon icon={Camera01Icon} className="mr-2 h-4 w-4" />
              Registrar Progreso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Subir Foto de Progreso</DialogTitle>
              <DialogDescription>
                Sube una foto actual para compararla con tus registros
                anteriores.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de vista</Label>
                <Tabs
                  value={viewType}
                  onValueChange={setViewType}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="front">Frente</TabsTrigger>
                    <TabsTrigger value="side">Perfil</TabsTrigger>
                    <TabsTrigger value="back">Espalda</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso actual (opcional)</Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Ej: 75.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    kg
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Foto</Label>
                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors relative">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="relative h-32 w-32 rounded-lg overflow-hidden">
                      <Image
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={Upload01Icon}
                        className="h-8 w-8 text-muted-foreground mb-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Click para seleccionar o arrastra aquí
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-indigo-600 text-white"
              >
                {uploading ? "Subiendo..." : "Guardar Registro"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State / Content Placeholder */}
      {/* Logic to fetch photos would go here, for now showing a starter card */}
      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="photos">Fotos de Progreso</TabsTrigger>
          <TabsTrigger value="charts">Gráficas de Evolución</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="mb-4 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-8 w-8" />
                </div>
                <h3 className="font-medium text-lg mb-1">Tu Línea de Tiempo</h3>
                <p className="text-xs max-w-xs mx-auto mb-4">
                  Comienza a subir fotos para ver cómo tu cuerpo evoluciona
                  semana tras semana.
                </p>
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setIsOpen(true)}
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="h-3 w-3 mr-1" />{" "}
                  Primer Registro
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    className="h-4 w-4 text-indigo-500"
                  />
                  Consejos para tus fotos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <p>
                  📸 <strong>Iluminación:</strong> Usa luz natural frente a ti,
                  evita sombras fuertes.
                </p>
                <p>
                  👕 <strong>Ropa:</strong> Usa ropa similar en cada foto (ropa
                  deportiva ajustada o ropa interior).
                </p>
                <p>
                  📐 <strong>Ángulo:</strong> Coloca la cámara a la altura del
                  pecho, siempre a la misma distancia.
                </p>
                <p>
                  ⏰ <strong>Consistencia:</strong> Tómate las fotos a la misma
                  hora, preferiblemente en ayunas.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <EvolutionCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
