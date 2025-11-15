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
import { CountrySelector } from "@/components/shared/country-selector";
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
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState<InstructorProfileValues>({
    bio: "",
    specialties: [],
    curriculum: "",
    pricePerMonth: undefined,
    contactEmail: "",
    contactPhone: "",
    country: "",
    city: "",
    isRemote: false,
  });

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

        const formData = {
          bio: data.bio || "",
          curriculum: data.curriculum || "",
          specialties: specialties,
          pricePerMonth: data.pricePerMonth ?? undefined,
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || "",
          country: data.country || "",
          city: data.city || "",
          isRemote: data.isRemote ?? false,
        };

        setProfileData(formData);
        form.reset(formData);
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

      // Update profile data with new values
      setProfileData(values);
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
      console.error("Error updating instructor profile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isEditing && profileData ? (
        <div className="space-y-6">
          {profileData.bio && (
            <div className="w-full p-4 rounded-lg border bg-muted/30">
              <h4 className="text-sm font-semibold mb-2 tracking-heading">
                Biografía
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {profileData.bio}
              </p>
            </div>
          )}

          {profileData.specialties?.length > 0 && (
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="text-sm font-semibold mb-3 tracking-heading">
                Especialidades
              </h4>
              <div className="flex flex-wrap gap-2">
                {profileData.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium border border-primary/20"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(profileData.country || profileData.city) && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <h4 className="text-sm font-semibold mb-2 tracking-heading">
                  Ubicación
                </h4>
                <p className="text-xs text-muted-foreground">
                  {[profileData.city, profileData.country]
                    .filter(Boolean)
                    .join(", ")}
                  {profileData.isRemote && (
                    <span className="block mt-1 text-primary">
                      ✓ También atiendo de forma remota
                    </span>
                  )}
                </p>
              </div>
            )}

            {profileData.pricePerMonth && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <h4 className="text-sm font-semibold mb-2 tracking-heading">
                  Precio por mes
                </h4>
                <p className="text-lg font-semibold text-foreground">
                  ${profileData.pricePerMonth.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {(profileData.contactEmail || profileData.contactPhone) && (
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="text-sm font-semibold mb-2 tracking-heading">
                Información de contacto
              </h4>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {profileData.contactEmail && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>{profileData.contactEmail}</span>
                  </div>
                )}
                {profileData.contactPhone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Teléfono:</span>
                    <span>{profileData.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              onClick={toggleEditMode}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Editar perfil
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              Cancelar plan de instructor
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit(data);
              setIsEditing(false);
            })}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Biografía</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cuéntales a los estudiantes sobre ti y tu experiencia..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comparte tu experiencia, formación y enfoque de enseñanza.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Especialidades</FormLabel>
                    <FormControl>
                      <TagSelector
                        availableTags={SPECIALTIES}
                        selectedTags={field.value || []}
                        onTagSelect={field.onChange}
                        placeholder="Selecciona tus especialidades..."
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Selecciona al menos una especialidad en la que te
                      desempeñas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por mes (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 5000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Precio mensual en tu moneda local. Déjalo en blanco si
                      prefieres no mostrarlo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRemote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-xs">
                        Ofreces clases remotas?
                      </FormLabel>
                      <FormDescription>
                        Los estudiantes podrán contactarte para clases en línea.
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

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contacto (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@ejemplo.com"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Correo electrónico donde los estudiantes pueden
                      contactarte.
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
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Número de teléfono donde los estudiantes pueden
                      contactarte.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <CountrySelector
                        value={field.value || ""}
                        onValueChange={field.onChange}
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
                        placeholder="Tu ciudad"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar cambios
              </Button>
            </div>
          </form>
        </Form>
      )}
      <CancelPlanDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}
