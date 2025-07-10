"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PaymentSimulationModal } from "./payment-simulation-modal";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, PlusSignIcon, CircleIcon } from "@hugeicons/core-free-icons";
import { CountrySelector } from "@/components/country-selector";

const instructorFormSchema = z.object({
  bio: z
    .string()
    .min(50, "Mínimo 50 caracteres")
    .max(500, "Máximo 500 caracteres"),
  specialties: z
    .array(z.string())
    .min(1, "Se requiere al menos una especialidad"),
  newSpecialty: z.string().optional(),
  pricePerMonth: z.number().min(10, "Mínimo $10").max(1000, "Máximo $1000"),
  contactEmail: z.string().email("Email inválido").min(1, "Requerido"),
  contactPhone: z
    .string()
    .min(10, "Mínimo 10 dígitos")
    .regex(/^[+]?[1-9][\d]{0,15}$/, "Formato inválido"),
  country: z.string().min(2, "Requerido"),
  city: z.string().min(2, "Requerido"),
  isRemote: z.boolean().default(false),
  curriculum: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

type InstructorFormValues = z.infer<typeof instructorFormSchema>;

interface InstructorRegistrationFormProps {
  onSuccess?: () => void;
}

export function InstructorRegistrationForm({
  onSuccess,
}: InstructorRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingValues, setPendingValues] = useState<InstructorFormValues | null>(null);
  const { data: session, update } = useSession();

  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      bio: "",
      specialties: [],
      newSpecialty: "",
      pricePerMonth: 50,
      contactEmail: "",
      contactPhone: "",
      country: "",
      city: "",
      isRemote: false,
      curriculum: "",
    },
    mode: "onChange",
  });

  const bioValue = form.watch("bio") as string;
  const specialties: string[] = Array.isArray(form.watch("specialties")) 
    ? form.watch("specialties") 
    : [];
  const isFormValid = form.formState.isValid && specialties.length > 0;

  const addSpecialty = () => {
    const currentSpecialties = Array.isArray(form.getValues("specialties")) 
      ? form.getValues("specialties") 
      : [];
    const newSpecialty = (form.getValues("newSpecialty") as string)?.trim();

    if (newSpecialty && !currentSpecialties.includes(newSpecialty)) {
      const updatedSpecialties = [...currentSpecialties, newSpecialty];
      form.setValue("specialties", updatedSpecialties);
      form.setValue("curriculum", updatedSpecialties.join(", "), { shouldValidate: true });
      form.setValue("newSpecialty", "", { shouldValidate: true });
    }
  };

  const removeSpecialty = (specialtyToRemove: string) => {
    const currentSpecialties = Array.isArray(form.getValues("specialties")) 
      ? form.getValues("specialties") 
      : [];
    const updatedSpecialties = currentSpecialties.filter((s: string) => s !== specialtyToRemove);
    
    form.setValue("specialties", updatedSpecialties, { shouldValidate: true });
    form.setValue("curriculum", updatedSpecialties.join(", "), { shouldValidate: true });
  };

  const onSubmit = (values: InstructorFormValues) => {
    const processedValues = {
      ...values,
      specialties: Array.isArray(values.specialties) 
        ? values.specialties 
        : values.specialties 
          ? [values.specialties] 
          : []
    };
    setPendingValues(processedValues);
    setShowPayment(true);
  };

  const handlePaymentConfirm = async () => {
    if (!pendingValues) return;
    
    setIsLoading(true);
    setShowPayment(false);

    try {
      const submissionData = Object.fromEntries(
        Object.entries(pendingValues).filter(([key]) => key !== "newSpecialty"),
      );
      // 1. Register the instructor
      const response = await fetch("/api/instructors/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al registrar como instructor");
      }

      const result = await response.json();

      // 2. Actualizar la sesión con los nuevos datos
      if (session?.user) {
        // 2.1 Forzar una recarga de la sesión desde el servidor
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ update: true })
        });
        
        if (!sessionResponse.ok) {
          throw new Error("Error al actualizar la sesión");
        }

        // 2.3 Actualizar la sesión local
        await update({
          ...session,
          user: {
            ...session.user,
            isInstructor: true,
            instructorProfile: result,
            _localStorage: {
              ...(session.user._localStorage || {}),
              isInstructor: true,
              instructorProfile: result,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              experienceLevel: session.user.experienceLevel
            }
          }
        });

        // 2.4 Mostrar mensaje de éxito
        toast.success("¡Registro exitoso!", {
          description: "Ahora eres un instructor en nuestra plataforma.",
        });

        // 2.5 Llamar al callback de éxito si existe
        onSuccess?.();
        
        // 2.6 Forzar una recarga completa de la página
        /* setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500); */
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar el registro");
    } finally {
      setIsLoading(false);
      setPendingValues(null);
    }
  };

  return (
    <>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Sección 1: Información Profesional */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center tracking-heading text-primary font-semibold">
                  1
                </div>
                <h3 className="text-lg font-semibold tracking-heading">
                  Información Profesional
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Especialidades */}
                <div className="lg:col-span-1">
                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidades</FormLabel>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-lg bg-muted/30">
                            {(Array.isArray(field.value) ? field.value : [field.value].filter(Boolean)).length > 0 ? (
                              (Array.isArray(field.value) ? field.value : [field.value].filter(Boolean)).map((specialty: string) => (
                                <div
                                  key={specialty}
                                  className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm flex items-center gap-1"
                                >
                                  {specialty}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      removeSpecialty(specialty);
                                    }}
                                    className="text-muted-foreground hover:text-foreground ml-1"
                                  >
                                    <HugeiconsIcon icon={Cancel01Icon} size={12} className="text-current" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No hay especialidades añadidas
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 items-center justify-center">
                            <Input
                              placeholder="Ej: Yoga, Pilates, Crossfit..."
                              value={form.watch("newSpecialty") || ""}
                              onChange={(e) =>
                                form.setValue("newSpecialty", e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addSpecialty())
                              }
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addSpecialty}
                              className="px-3 bg-transparent"
                            >
                              <HugeiconsIcon icon={PlusSignIcon} size={16} className="text-current" />
                            </Button>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Biografía */}
                <div className="lg:col-span-1">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Cuéntanos sobre tu experiencia y filosofía como instructor..."
                            className="min-h-[120px] resize-none"
                            {...field}
                            value={bioValue}
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between">
                          <span>Describe tu experiencia y enfoque</span>
                          <span
                            className={
                              bioValue.length > 450 ? "text-destructive" : ""
                            }
                          >
                            {bioValue.length}/500
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Currículum */}
                <div className="lg:col-span-1">
                  <FormField
                    control={form.control}
                    name="curriculum"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <input type="hidden" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Sección 2: Información de Contacto y Ubicación */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center tracking-heading text-primary font-semibold">
                  2
                </div>
                <h3 className="text-lg font-semibold tracking-heading">
                  Información de Contacto y Ubicación
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Contacto</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <CountrySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        label="País"
                        placeholder="Selecciona un país"
                        className="w-full"
                      />
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
                        <Input placeholder="Madrid" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Sección 3: Configuración de Servicios */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center tracking-heading text-primary font-semibold">
                  3
                </div>
                <h3 className="text-lg font-semibold tracking-heading">
                  Configuración de Servicios
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <FormField
                  control={form.control}
                  name="pricePerMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarifa Mensual (USD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            min="10"
                            max="1000"
                            step="5"
                            className="pl-8"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Entre $10 y $1000 por mes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRemote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Clases Remotas
                        </FormLabel>
                        <FormDescription>
                          Permite estudiantes de cualquier ubicación
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

            {/* Botón de envío */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                size="sm"
                className="px-8"
              >
                {isLoading ? (
                  <>
                    <HugeiconsIcon icon={CircleIcon} size={16} className="text-current" />
                    Procesando...
                  </>
                ) : (
                  "Continuar al Pago"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <PaymentSimulationModal
        open={showPayment}
        onOpenChange={setShowPayment}
        onConfirm={handlePaymentConfirm}
        isLoading={isLoading}
      />
    </>
  );
}
