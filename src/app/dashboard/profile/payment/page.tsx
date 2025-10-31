"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { TagSelector } from "@/components/ui/tag-selector";
import { SPECIALTIES } from "@/data/specialties";
import { Loader2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  SparklesIcon,
  CreditCardIcon,
  AlertCircleIcon,
  SquareLock01Icon,
  CalendarIcon,
} from "@hugeicons/core-free-icons";

import { CreditCard } from "@/components/credit-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
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

export default function InstructorRegistrationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(10);
  const [isAnnual, setIsAnnual] = useState(true);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

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

  // Check if all payment form fields are filled
  const isPaymentFormValid = useMemo(() => {
    return (
      cardData.cardNumber.replace(/\s/g, "").length >= 16 &&
      cardData.cardHolder.trim().length > 0 &&
      cardData.expiryDate.length === 5 &&
      cardData.cvv.length >= 3
    );
  }, [cardData]);

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
            router.push("/dashboard/profile");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, router]);

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
          form.reset({
            bio: instructorProfile.bio || "",
            specialties: instructorProfile.curriculum?.split(", ") || [],
            pricePerMonth: instructorProfile.pricePerMonth || 50,
            contactEmail:
              instructorProfile.contactEmail || session.user.email || "",
            contactPhone: instructorProfile.contactPhone || "",
            country: instructorProfile.country || "",
            city: instructorProfile.city || "",
            isRemote: instructorProfile.isRemote || false,
            curriculum: instructorProfile.curriculum || "",
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
  const currentPlan = isAnnual ? planDetails.annual : planDetails.monthly;

  useEffect(() => {
    if (session?.user) {
      if (session.user.email) {
        form.setValue("contactEmail", session.user.email);
      }
      if (session.user.profile?.phone) {
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
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const values = form.getValues();
      const curriculum = values.specialties?.join(", ") || "";
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
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(), // 14 days from now
      };

      // Process payment
      const paymentResponse = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          cardData, // In a real app, make sure to handle card data securely (preferably with Stripe Elements or similar)
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            "Error al procesar el pago. Por favor, verifica tus datos."
        );
      }

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

      // Show success step and reset countdown
      setStep(3);
      setCountdown(10);

      // Start countdown for redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/dashboard/profile");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup interval on component unmount
      return () => clearInterval(timer);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el pago"
      );
    } finally {
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
            size="sm"
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
          <CardContent className="text-center py-8">
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
          size="sm"
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
        <CardContent>
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

                  <div className="grid grid-cols-1 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">
                              País *
                            </FormLabel>
                            <CountrySelector
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecciona un país"
                            />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Selection Card */}
                <div>
                  <div className="text-center mb-4">
                    <h3 className="text-xs font-semibold">Elige tu Plan</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Selecciona la mejor opción para ti
                    </p>
                  </div>

                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center bg-muted/30 p-0.5 rounded-full text-xs">
                      <button
                        type="button"
                        onClick={() => setIsAnnual(false)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${!isAnnual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                      >
                        Mensual
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAnnual(true)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${isAnnual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                      >
                        Anual
                      </button>
                    </div>
                  </div>

                  {/* Price Card */}
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[24rem] bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-semibold tracking-tight">
                            ${currentPlan.price}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {isAnnual ? "/año" : "/mes"}
                          </span>
                        </div>

                        {/* {isAnnual && (
                          <div className="mt-3 inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            <HugeiconsIcon
                              icon={SparklesIcon}
                              className="mr-1.5 h-3.5 w-3.5"
                            />
                            <span>Ahorra $21.88</span>
                          </div>
                        )} */}
                        {!isAnnual ? (
                          <div className="mt-3 inline-flex items-center px-3 py-1 dark:bg-primary/10 border border-zinc-300 dark:border-primary/10 bg-zinc-200 text-primary text-xs font-medium rounded-full">
                            <HugeiconsIcon
                              icon={SparklesIcon}
                              className="mr-1.5 h-3.5 w-3.5 text-green-500 dark:text-green-400"
                            />
                            <span className="text-xs font-medium text-green-500 dark:text-green-400">
                              14 días de prueba gratis
                            </span>
                          </div>
                        ) : (
                          <div className="mt-3 inline-flex items-center px-3 py-1 dark:bg-primary/10 border border-zinc-300 dark:border-primary/10 bg-zinc-200 text-primary text-xs font-medium rounded-full">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              Ahorra $21.88 con el plan anual
                            </span>
                          </div>
                        )}

                        <p className="mt-2 text-xs text-muted-foreground">
                          Próximo pago: {currentPlan.nextPayment}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xs font-semibold">Método de Pago</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Información segura y encriptada
                    </p>
                  </div>

                  {/* Credit Card Preview */}
                  <CreditCard
                    cardNumber={cardData.cardNumber}
                    cardHolder={cardData.cardHolder}
                    expiryDate={cardData.expiryDate}
                    cvv={cardData.cvv}
                  />

                  {/* Card Details Form */}
                </div>
                <div className="w-full col-span-1 md:col-span-2 space-y-4 bg-card p-4 rounded-lg border shadow-sm">
                  <div className="space-y-1">
                    <Label
                      htmlFor="card-holder"
                      className="text-xs font-medium"
                    >
                      Nombre del Titular
                    </Label>
                    <Input
                      id="card-holder"
                      type="text"
                      placeholder="Ej: MARIA GONZALEZ"
                      disabled={isLoading}
                      className="h-9 text-xs"
                      value={cardData.cardHolder}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          cardHolder: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="card-number"
                      className="text-xs font-medium"
                    >
                      Número de Tarjeta
                    </Label>
                    <div className="relative">
                      <Input
                        id="card-number"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        disabled={isLoading}
                        className="pl-9 text-xs font-mono tracking-wider"
                        maxLength={19}
                        value={cardData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          const formatted =
                            value.match(/.{1,4}/g)?.join(" ") || value;
                          setCardData({ ...cardData, cardNumber: formatted });
                        }}
                      />
                      <HugeiconsIcon
                        icon={CreditCardIcon}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="expiry" className="text-xs font-medium">
                        Vencimiento
                      </Label>
                      <div className="relative">
                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/AA"
                          disabled={isLoading}
                          className="font-mono"
                          maxLength={5}
                          value={cardData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length >= 2) {
                              value =
                                value.slice(0, 2) + "/" + value.slice(2, 4);
                            }
                            setCardData({ ...cardData, expiryDate: value });
                          }}
                        />
                        <HugeiconsIcon
                          icon={CalendarIcon}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="cvc"
                        className="text-xs font-medium flex items-center"
                      >
                        CVV
                        <HugeiconsIcon
                          icon={AlertCircleIcon}
                          className="ml-1 h-3.5 w-3.5 text-muted-foreground"
                        />
                      </Label>
                      <div className="relative">
                        <Input
                          id="cvc"
                          type="text"
                          placeholder="123"
                          disabled={isLoading}
                          className="font-mono"
                          maxLength={3}
                          value={cardData.cvv}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              cvv: e.target.value.replace(/\D/g, ""),
                            })
                          }
                        />
                        <HugeiconsIcon
                          icon={SquareLock01Icon}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] text-muted-foreground text-center leading-tight">
                      Al continuar, aceptas nuestros{" "}
                      <a href="#" className="text-primary hover:underline">
                        Términos de Servicio
                      </a>{" "}
                      y{" "}
                      <a href="#" className="text-primary hover:underline">
                        Política de Privacidad
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 h-24 md:h-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  size="default"
                  className="text-xs flex-1"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading || !isPaymentFormValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {isPaymentFormValid
                        ? "Comenzar prueba gratis"
                        : "Complete los datos de pago"}
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
