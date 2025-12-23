"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
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
import { TagSelector } from "@/components/ui/tag-selector";
import { SPECIALTIES } from "@/data/specialties";
import { Loader } from "@/components/ai-elements/loader";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CountrySelector } from "@/components/shared/country-selector";

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
  isRemote: z.boolean(),
  curriculum: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

type InstructorFormValues = z.infer<typeof instructorFormSchema>;

export default function InstructorRegistrationPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

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

  // Countdown effect for auto-redirect
  useEffect(() => {
    if (showSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [showSuccess]);

  // Navigate when countdown reaches 0
  useEffect(() => {
    if (showSuccess && countdown === 0) {
      router.push("/dashboard/profile");
    }
  }, [showSuccess, countdown, router]);

  // Check if user has INSTRUCTOR subscription
  useEffect(() => {
    const checkInstructorStatus = async () => {
      try {
        if (!session?.user) {
          router.push("/dashboard/profile/billing");
          return;
        }

        const user = session.user as any;
        const subscriptionTier = user.subscriptionTier || "FREE";
        const isInstructor = user.isInstructor || false;
        const instructorProfile = user.instructorProfile || null;

        // Check if user has INSTRUCTOR subscription
        if (subscriptionTier !== "INSTRUCTOR") {
          toast.error(
            "Necesitas una suscripción de Instructor para acceder a esta página",
          );
          router.push("/dashboard/profile/billing");
          return;
        }

        // If user is already an instructor with complete profile, redirect to profile
        if (isInstructor && instructorProfile?.bio) {
          router.push("/dashboard/profile");
          return;
        }

        // Pre-fill form if instructor profile exists
        if (instructorProfile) {
          const curriculumStr =
            typeof instructorProfile.curriculum === "string"
              ? instructorProfile.curriculum
              : "";
          const bioStr =
            typeof instructorProfile.bio === "string"
              ? instructorProfile.bio
              : "";
          const contactEmailStr =
            typeof instructorProfile.contactEmail === "string"
              ? instructorProfile.contactEmail
              : typeof session.user.email === "string"
                ? session.user.email
                : "";
          const contactPhoneStr =
            typeof instructorProfile.contactPhone === "string"
              ? instructorProfile.contactPhone
              : "";
          const countryStr =
            typeof instructorProfile.country === "string"
              ? instructorProfile.country
              : "";
          const cityStr =
            typeof instructorProfile.city === "string"
              ? instructorProfile.city
              : "";

          // Convert specialty names back to IDs for TagSelector
          const specialtyNames = curriculumStr ? curriculumStr.split(", ") : [];
          const specialtyIds = specialtyNames.map((name: string) => {
            const specialty = SPECIALTIES.find((s) => s.name === name.trim());
            return specialty ? specialty.id : name.trim();
          });

          form.reset({
            bio: bioStr,
            specialties: specialtyIds,
            pricePerMonth:
              typeof instructorProfile.pricePerMonth === "number"
                ? instructorProfile.pricePerMonth
                : 50,
            contactEmail: contactEmailStr,
            contactPhone: contactPhoneStr,
            country: countryStr,
            city: cityStr,
            isRemote:
              typeof instructorProfile.isRemote === "boolean"
                ? instructorProfile.isRemote
                : false,
            curriculum: curriculumStr,
          });
        } else if (session.user.email) {
          // Set default email if no profile exists
          form.setValue("contactEmail", session.user.email);
        }
      } catch (error) {
        console.error("Error checking instructor status:", error);
        toast.error("Error al verificar el estado de la suscripción");
        router.push("/dashboard/profile/billing");
      } finally {
        setIsLoading(false);
      }
    };

    checkInstructorStatus();
  }, [session, form, router]);

  // Pre-fill email and phone from session
  useEffect(() => {
    if (session?.user && !form.getValues("contactEmail")) {
      if (session.user.email && typeof session.user.email === "string") {
        form.setValue("contactEmail", session.user.email);
      }
      if (
        session.user.profile?.phone &&
        typeof session.user.profile.phone === "string"
      ) {
        form.setValue("contactPhone", session.user.profile.phone);
      }
    }
  }, [session, form]);

  const bioValue = form.watch("bio") as string;
  const specialties: string[] = Array.isArray(form.watch("specialties"))
    ? form.watch("specialties")
    : [];
  const isFormValid = form.formState.isValid && specialties.length > 0;

  const handleSubmit = async (values: InstructorFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert specialty IDs to their display names
      const specialtyNames =
        values.specialties?.map((id) => {
          const specialty = SPECIALTIES.find((s) => s.id === id);
          return specialty ? specialty.name : id;
        }) || [];
      const curriculum = specialtyNames.join(", ");

      const payload = {
        bio: values.bio,
        curriculum,
        pricePerMonth: values.pricePerMonth,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        country: values.country,
        city: values.city,
        isRemote: values.isRemote,
      };

      // Register instructor
      const registrationResponse = await fetch("/api/instructors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!registrationResponse.ok) {
        const errorData = await registrationResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al registrar el instructor");
      }

      // Update session
      await update();

      // Show success
      setShowSuccess(true);
      setCountdown(10);
      toast.success("¡Registro completado exitosamente!");
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar el registro",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="w-full">
        <Button
          variant="outline"
          className="text-xs w-full md:w-auto mb-4"
          size="default"
          onClick={() => router.push("/dashboard/profile")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver al perfil
        </Button>

        <Card className="w-full overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              ¡Ya eres instructor!
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Ya estás registrado como instructor en nuestra plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold tracking-heading mb-2">
              Registro completo
            </h3>
            <p className="text-muted-foreground text-xs mb-6">
              Puedes comenzar a ofrecer tus servicios como entrenador.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Serás redirigido a tu perfil en {countdown} segundos...
            </p>
            <Button onClick={() => router.push("/dashboard/profile")}>
              Ir a mi perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-2">
        <Button
          variant="outline"
          className="text-xs w-full md:w-auto"
          size="default"
          onClick={() => router.push("/dashboard/profile/billing")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver a planes
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold tracking-heading">
            Registro de Instructor
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Completa tu información profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Sección 1: Información Profesional */}
              <div className="space-y-6 bg-card p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-heading">
                      Información Profesional
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Cuéntanos sobre tu experiencia
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Especialidades *
                        </FormLabel>
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
                        <FormDescription className="text-xs">
                          Selecciona al menos una especialidad
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-xs font-medium">
                            Biografía *
                          </FormLabel>
                          <span
                            className={`text-xs ${bioValue.length >= 50 ? "text-emerald-600" : "text-muted-foreground"}`}
                          >
                            {bioValue.length}/500
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Entrenador personal certificado con 5+ años de experiencia en entrenamiento funcional y pérdida de peso..."
                            className={`min-h-[120px] resize-none ${form.formState.errors.bio ? "border-destructive" : ""}`}
                            {...field}
                            value={bioValue}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sección 2: Información de Contacto */}
              <div className="space-y-6 bg-card p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-heading">
                      Información de Contacto
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Cómo pueden contactarte
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Correo Electrónico *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ejemplo@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Teléfono *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="tel"
                              placeholder="1234567890"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            País *
                          </FormLabel>
                          <FormControl>
                            <CountrySelector
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecciona un país"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">
                            Ciudad *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Madrid" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Servicios */}
              <div className="space-y-6 bg-card p-6 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-heading">
                      Servicios
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configura tus tarifas y disponibilidad
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pricePerMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Tarifa por hora (USD) *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                              $
                            </span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min="10"
                              max="1000"
                              step="5"
                              className="pl-7"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Tarifa recomendada: $30 - $100 USD/hora
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRemote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidad</FormLabel>
                        <div className="flex items-center justify-between h-9 px-4 border rounded-lg bg-secondary/50">
                          <span className="text-xs font-medium">
                            Clases remotas
                          </span>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <FormDescription className="text-xs">
                          Acepta estudiantes en línea
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="curriculum"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
            <div className="flex justify-end pt-4 w-full">
              <Button
                type="button"
                disabled={isSubmitting || !isFormValid}
                className="gap-2 px-6"
                onClick={form.handleSubmit(handleSubmit)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Completar Registro"
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
