"use client";

import { useEffect, useState } from "react";
import { CancelPlanDialog } from "./cancel-plan-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redis } from "@/lib/database/redis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountrySelector } from "@/components/country-selector";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Icons } from "../icons";
import { TagSelector } from "@/components/ui/tag-selector";
import { SPECIALTIES } from "@/data/specialties";

const instructorProfileSchema = z.object({
  bio: z.string().optional(),
  specialties: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos una especialidad"),
  curriculum: z.string().optional(),
  pricePerMonth: z.coerce.number().optional().nullable(),
  contactEmail: z
    .string()
    .email("Debe ser un email válido.")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  isRemote: z.boolean().optional(),
});

type InstructorProfileValues = z.infer<typeof instructorProfileSchema>;

interface InstructorProfileFormProps {
  onSuccess?: () => void;
}

export function InstructorProfileForm({
  onSuccess,
}: InstructorProfileFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // In-memory cache for user data
  const userDataCache = new Map<
    string,
    {
      data: Record<string, string | undefined>;
      timestamp: number;
    }
  >();

  const form = useForm<InstructorProfileValues>({
    resolver: zodResolver(instructorProfileSchema),
    defaultValues: {
      bio: "",
      curriculum: "",
      pricePerMonth: undefined,
      contactEmail: "",
      contactPhone: "",
      country: "",
      city: "",
      isRemote: false,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/instructors/profile");
        if (!response.ok) {
          if (response.status === 404) {
            toast.info("No tienes un perfil de instructor creado", {
              description: "Por favor, regístrate como instructor primero.",
            });
          } else {
            throw new Error("Error al cargar el perfil del instructor.");
          }
          return;
        }
        const data = await response.json();
        const specialties = data.curriculum
          ? data.curriculum.split(/\s*,\s*/).filter(Boolean)
          : [];

        form.reset({
          bio: data.bio || "",
          curriculum: data.curriculum || "",
          specialties: specialties,
          pricePerMonth: data.pricePerMonth ?? undefined,
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || "",
          country: data.country || "",
          city: data.city || "",
          isRemote: data.isRemote ?? false,
        });
      } catch (error: unknown) {
        let errorMessage = "Hubo un error al cargar el perfil.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        toast.error(errorMessage);
        console.error("Error fetching instructor profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [form]);

  const handleCancelSuccess = async () => {
    try {
      // 1. Delete the instructor profile
      const deleteProfileResponse = await fetch("/api/instructors/profile", {
        method: "DELETE",
      });

      if (!deleteProfileResponse.ok) {
        throw new Error("Error al eliminar el perfil de instructor");
      }

      // 2. Update the user's plan status
      await fetch("/api/instructors/cancel-plan", {
        method: "POST",
      });

      // 3. Clear all caches
      if (session?.user?.email) {
        await redis.del(`user:${session.user.email}:data`);
        userDataCache.delete(session.user.email);
      }

      // 4. Force session refresh
      await fetch("/api/auth/session?update=true");

      // 5. Redirect to profile and refresh
      router.push("/dashboard/profile");
      router.refresh();

      toast.success("Plan cancelado exitosamente");
      setIsCancelDialogOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al cancelar el plan:", error);
      toast.error("Error al cancelar el plan");
    }
  };

  async function onSubmit(values: InstructorProfileValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/instructors/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el perfil.");
      }

      toast.success("Perfil de instructor actualizado con éxito!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      let errorMessage = "Hubo un error al procesar tu solicitud.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre tu experiencia y filosofía como instructor."
                      className="resize-none text-xs"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Una breve descripción de tu perfil profesional.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidades</FormLabel>
                  <FormControl>
                    <TagSelector
                      selectedTags={field.value || []}
                      onTagSelect={(tags) => {
                        field.onChange(tags);
                        form.setValue("curriculum", tags.join(", "), {
                          shouldValidate: true,
                        });
                      }}
                      availableTags={SPECIALTIES}
                      placeholder="Buscar especialidades..."
                      className="min-h-[40px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Selecciona al menos una especialidad
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="pricePerMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio por mes (USD)</FormLabel>
                  <FormControl>
                    <Input
                      className="text-xs"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ej: 50.00"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Tu tarifa mensual sugerida para los alumnos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contacto</FormLabel>
                  <FormControl>
                    <Input
                      className="text-xs"
                      placeholder="tu@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email donde los alumnos pueden contactarte directamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono de Contacto</FormLabel>
                  <FormControl>
                    <Input
                      className="text-xs"
                      placeholder="+1234567890"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de teléfono donde los alumnos pueden contactarte.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <CountrySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        className="text-xs"
                        placeholder="Selecciona un país"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input
                        className="text-xs"
                        placeholder="Ej: Madrid"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isRemote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>¿Ofreces clases remotas?</FormLabel>
                    <FormDescription>
                      Permite a alumnos de cualquier lugar contactarte.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end">
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              size="lg"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              Cancelar Plan
            </Button>
            <CancelPlanDialog
              open={isCancelDialogOpen}
              onOpenChange={setIsCancelDialogOpen}
              onSuccess={handleCancelSuccess}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
