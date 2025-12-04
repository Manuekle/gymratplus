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
import { Loader2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  PaypalIcon,
  SparklesIcon,
  SquareLock01Icon,
} from "@hugeicons/core-free-icons";

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
  isRemote: z.boolean().default(false),
  curriculum: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

type InstructorFormValues = z.infer<typeof instructorFormSchema>;

export default function InstructorRegistrationPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(10);
  const [isAnnual, setIsAnnual] = useState(true);

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

  // Function to format date as DD/MM/YYYY
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Countdown effect for auto-redirect
  useEffect(() => {
    if (step === 3) {
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
  }, [step]);

  // Navigate when countdown reaches 0
  useEffect(() => {
    if (step === 3 && countdown === 0) {
      router.push("/dashboard/profile");
    }
  }, [step, countdown, router]);

  // Handle PayPal return (success or cancel)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const canceled = urlParams.get("canceled");

    if (success === "true") {
      // Usuario completó el pago en PayPal
      const instructorData = sessionStorage.getItem(
        "instructorRegistrationData",
      );
      if (instructorData) {
        const payload = JSON.parse(instructorData);

        // Registrar instructor después del pago exitoso
        fetch("/api/instructors/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            if (res.ok) {
              sessionStorage.removeItem("instructorRegistrationData");
              await update();
              setStep(3);
              setCountdown(10);
              toast.success("¡Pago completado exitosamente!");
              // Limpiar la URL
              window.history.replaceState({}, "", "/dashboard/profile/payment");
            } else {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(
                errorData.error || "Error al registrar el instructor",
              );
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error(
              error instanceof Error
                ? error.message
                : "Error al procesar el registro",
            );
          });
      }
    } else if (canceled === "true") {
      // Usuario canceló el pago
      toast.error("Pago cancelado");
      sessionStorage.removeItem("instructorRegistrationData");
      // Limpiar la URL
      window.history.replaceState({}, "", "/dashboard/profile/payment");
    }
  }, [update]);

  // Check if user is already an instructor or has an active subscription
  useEffect(() => {
    const checkInstructorStatus = async () => {
      try {
        if (!session?.user) return;

        const isInstructor = session.user.isInstructor || false;
        const instructorProfile = session.user.instructorProfile || null;
        const hasActiveSubscription = instructorProfile?.isPaid || false;

        setHasSubscription(hasActiveSubscription);

        if (isInstructor && hasActiveSubscription) {
          // If user is an active instructor, redirect to profile
          router.push("/dashboard/profile");
          return;
        } else if (instructorProfile) {
          // If user has an instructor profile but no active subscription, pre-fill the form
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
          const specialtyIds = specialtyNames.map((name) => {
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
        }
      } catch (error) {
        console.error("Error checking instructor status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkInstructorStatus();
  }, [session, form, router]);

  // Calculate next payment date (today + 1 month for monthly, +1 year for annual)
  const getNextPaymentDate = (isAnnualPlan: boolean): string => {
    const today = new Date();
    const nextDate = new Date(today);

    if (isAnnualPlan) {
      nextDate.setFullYear(today.getFullYear() + 1);
    } else {
      nextDate.setMonth(today.getMonth() + 1);
    }

    return formatDate(nextDate);
  };

  const planDetails = {
    monthly: {
      price: 5.99,
      get nextPayment() {
        return getNextPaymentDate(false);
      },
      savings: "",
    },
    annual: {
      price: 50.0,
      get nextPayment() {
        return getNextPaymentDate(true);
      },
      savings: "Ahorra $21.88",
    },
  };

  useEffect(() => {
    if (session?.user) {
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

  const handlePaymentConfirm = async () => {
    setIsLoading(true);
    try {
      const values = form.getValues();
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
        planType: isAnnual ? "annual" : "monthly",
        trialEndDate: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 14 days from now
      };

      // Process payment with PayPal
      const paymentResponse = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.details ||
          "Error al procesar el pago. Por favor, verifica tus datos.";

        console.error("Error del servidor:", errorData);

        throw new Error(errorMessage);
      }

      const paymentData = await paymentResponse.json();

      // Si hay una URL de aprobación de PayPal, redirigir al usuario
      if (paymentData.approvalUrl) {
        // Guardar los datos del instructor en sessionStorage para recuperarlos después
        sessionStorage.setItem(
          "instructorRegistrationData",
          JSON.stringify(payload),
        );
        // Redirigir a PayPal
        window.location.href = paymentData.approvalUrl;
        return;
      }

      // Si no hay URL de aprobación, continuar con el registro normal
      // Register instructor after successful payment
      const registrationResponse = await fetch("/api/instructors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!registrationResponse.ok) {
        const errorData = await registrationResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al registrar el instructor");
      }

      // Actualizar la sesión usando el trigger "update" de NextAuth
      // Esto hará que el callback jwt recargue los datos desde la base de datos
      await update();

      // Show success step and reset countdown
      setStep(3);
      setCountdown(10);

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el pago",
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is already an instructor with active subscription
  if (session?.user?.isInstructor) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md w-full">
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
          <h2 className="text-2xl font-bold tracking-heading mb-2">
            ¡Ya eres instructor!
          </h2>
          <p className="text-muted-foreground text-xs mb-6">
            Disfruta de todos los beneficios de tu suscripción activa.
          </p>
          <Button onClick={() => router.push("/dashboard/profile")}>
            Ir a mi perfil
          </Button>
        </div>
      </div>
    );
  }

  if (hasSubscription || step === 3) {
    return (
      <div>
        <div className="mb-4">
          <Button
            variant="outline"
            className="text-xs"
            size="default"
            onClick={() => router.push("/dashboard/profile")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Volver al perfil
          </Button>
        </div>
        <Card className="w-full overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl font-semibold tracking-heading">
              {hasSubscription
                ? "¡Suscripción Activa!"
                : "¡Ya eres instructor!"}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              {hasSubscription
                ? "Ya cuentas con una suscripción activa."
                : "Ya estás registrado como instructor en nuestra plataforma."}
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
              {hasSubscription ? "Suscripción activa" : "Registro completo"}
            </h3>
            <p className="text-muted-foreground text-xs mb-6">
              {hasSubscription
                ? "Disfruta de todos los beneficios de tu plan de entrenador."
                : "Puedes comenzar a ofrecer tus servicios como entrenador."}
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
          className="text-xs"
          size="default"
          onClick={() => router.push("/dashboard/profile")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver al perfil
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-semibold tracking-heading">
            Configuración de Pago
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Completa la información para configurar tu método de pago
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          {step === 1 && (
            <Form {...form}>
              <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  disabled={isLoading || !isFormValid}
                  className="gap-2 px-6"
                  onClick={() => setStep(2)}
                >
                  Continuar
                </Button>
              </div>
            </Form>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
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
              <h3 className="mt-4 text-lg font-semibold">¡Pago exitoso!</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Tu suscripción ha sido activada correctamente.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Redirigiendo a tu perfil en {countdown} segundos...
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => router.push("/dashboard/profile")}
                  className="px-6"
                >
                  Ir a mi perfil ahora
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handlePaymentConfirm();
              }}
              className="space-y-6"
            >
              {/* Plan Selection */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xs font-medium">
                    Elige tu Plan de Suscripción
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Selecciona el plan que mejor se adapte a tus necesidades
                  </p>
                </div>

                {/* Plan Toggle */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center bg-muted/50 p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => setIsAnnual(false)}
                      className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${!isAnnual
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Mensual
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnnual(true)}
                      className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${isAnnual
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Anual
                    </button>
                  </div>
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Monthly Plan */}
                  <div
                    className={`relative p-6 rounded-xl border transition-all cursor-pointer ${!isAnnual
                      ? "border-zinc-200 bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/70 dark:border-zinc-800"
                      : "border-zinc-200 bg-card hover:border-zinc-300 dark:bg-zinc-900/30 dark:border-zinc-800"
                      }`}
                    onClick={() => setIsAnnual(false)}
                  >
                    {!isAnnual && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                          Seleccionado
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold">Plan Mensual</h4>
                        <p className="text-xs text-muted-foreground">
                          Facturación mensual
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl tracking-heading font-semibold">
                          ${planDetails.monthly.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /mes
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <HugeiconsIcon
                          icon={SparklesIcon}
                          className="h-4 w-4"
                        />
                        <span className="font-medium">
                          14 días de prueba gratis
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Próximo pago: {planDetails.monthly.nextPayment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Annual Plan */}
                  <div
                    className={`relative p-6 rounded-xl border transition-all cursor-pointer ${isAnnual
                      ? "border-zinc-200 bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/70 dark:border-zinc-800"
                      : "border-zinc-200 bg-card hover:border-zinc-300 dark:bg-zinc-900/30 dark:border-zinc-800"
                      }`}
                    onClick={() => setIsAnnual(true)}
                  >
                    {isAnnual && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                          Seleccionado
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold">Plan Anual</h4>
                        <p className="text-xs text-muted-foreground">
                          Facturación anual
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl tracking-heading font-semibold">
                          ${planDetails.annual.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /año
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <HugeiconsIcon
                          icon={SparklesIcon}
                          className="h-4 w-4"
                        />
                        <span className="font-medium">
                          Ahorra $21.88 al año
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Próximo pago: {planDetails.annual.nextPayment}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4 pt-4 border-t">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                      <HugeiconsIcon
                        icon={PaypalIcon}
                        className="h-10 w-10 text-blue-600 dark:text-blue-400"
                      />
                    </div>

                    <div className="text-center space-y-2">
                      <p className="text-xs font-medium">
                        Serás redirigido a PayPal para completar el pago
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <HugeiconsIcon
                          icon={SquareLock01Icon}
                          className="h-4 w-4 text-green-600 dark:text-green-400"
                        />
                        <span>Pago 100% seguro y encriptado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Al continuar, aceptas nuestros{" "}
                    <a
                      href="#"
                      className="text-primary hover:underline font-medium"
                    >
                      Términos de Servicio
                    </a>{" "}
                    y{" "}
                    <a
                      href="#"
                      className="text-primary hover:underline font-medium"
                    >
                      Política de Privacidad
                    </a>
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  size="lg"
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gap-2"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={PaypalIcon}
                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
                      />
                      Pagar con PayPal
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
