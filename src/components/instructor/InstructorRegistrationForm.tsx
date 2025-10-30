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
import { HugeiconsIcon } from "@hugeicons/react";
import { CountrySelector } from "@/components/country-selector";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCardIcon, Ticket02Icon } from "@hugeicons/core-free-icons";
import { TagSelector } from "@/components/ui/tag-selector";
import { SPECIALTIES } from "@/data/specialties";
import { Icons } from "../icons";

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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InstructorRegistrationForm({
  open,
  onOpenChange,
  onSuccess,
}: InstructorRegistrationFormProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Estado para el paso de pago
  const [isAnnual, setIsAnnual] = useState(true);
  const planDetails = {
    monthly: {
      price: "5.99",
      nextPayment: "el 22 de cada mes",
      savings: "",
    },
    annual: {
      price: "50.00",
      nextPayment: "22 de junio, 2025",
      savings: "Ahorra 2 meses",
    },
  };
  const currentPlan = isAnnual ? planDetails.annual : planDetails.monthly;

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

  const onSubmit = () => {
    setStep(2);
  };

  const handlePaymentConfirm = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      // Preparamos los datos para la API
      const values = form.getValues();
      // Unimos specialties en curriculum (string) si aplica
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
      };
      const response = await fetch("/api/instructors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Error al registrar como instructor"
        );
      }
      // Update the session with the new instructor status
      await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isInstructor: true }),
        credentials: "include",
      });

      // Update the local session
      await update();

      toast.success("¡Registro exitoso!", {
        description: "Ahora eres un instructor en nuestra plataforma.",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar el registro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full h-screen rounded-none shadow-xl flex flex-col p-0">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-semibold tracking-heading">
            {step === 1 ? "Registro de Instructor" : "Simulación de Pago"}
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground">
            {step === 1
              ? "Completa el formulario para convertirte en instructor en nuestra plataforma."
              : "Simula el pago para finalizar tu registro como instructor."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="mb-8 px-6 md:px-16 pt-2">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium">
              Paso {step} de {totalSteps}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round((step / totalSteps) * 100)}% completado
            </span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <div className="px-6 md:px-16 pb-8 flex-1 overflow-y-auto">
          {step === 1 && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                            <TagSelector
                              selectedTags={field.value || []}
                              onTagSelect={(tags) => {
                                field.onChange(tags);
                                form.setValue("curriculum", tags.join(", "), {
                                  shouldValidate: true,
                                });
                              }}
                              availableTags={SPECIALTIES}
                              placeholder="Selecciona tus especialidades..."
                            />
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
                                className="min-h-[120px] resize-none text-xs"
                                {...field}
                                value={bioValue}
                              />
                            </FormControl>
                            <FormDescription className="flex justify-between">
                              <span>Describe tu experiencia y enfoque</span>
                              <span
                                className={
                                  bioValue.length > 450
                                    ? "text-destructive"
                                    : ""
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
                              <Input
                                type="hidden"
                                {...field}
                                className="text-xs"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

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
                              className="text-xs"
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
                              className="text-xs"
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
                            className="w-full text-xs"
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
                            <Input
                              className="text-xs"
                              placeholder="Madrid"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-8" />

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
                                className="pl-8 text-xs"
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
                            <FormLabel className="text-xs">
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

                <Separator className="my-8" />

                {/* Botón de envío */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="button"
                    disabled={isLoading || !isFormValid}
                    size="default"
                    className="px-8"
                    onClick={() => setStep(2)}
                  >
                    Continuar al Pago
                  </Button>
                </div>
              </form>
            </Form>
          )}
          {step === 2 && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handlePaymentConfirm();
              }}
            >
              {/* --- INICIO: contenido de payment-simulation-modal.tsx --- */}
              <DrawerHeader className="px-0 pt-0 pb-4">
                <DrawerTitle className="text-2xl tracking-heading font-semibold text-center">
                  Elige tu plan
                </DrawerTitle>
              </DrawerHeader>
              <div className="pb-6 space-y-6">
                {/* Plan Toggle */}
                <div className="flex items-center justify-center gap-4">
                  <span
                    className={`text-xs font-medium ${!isAnnual ? "text-primary" : "text-muted-foreground"}`}
                  >
                    Mensual
                  </span>
                  <Switch
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-medium ${isAnnual ? "text-primary" : "text-muted-foreground"}`}
                    >
                      Anual
                    </span>
                    {isAnnual && (
                      <span className="text-xs text-emerald-600 font-medium">
                        {planDetails.annual.savings}
                      </span>
                    )}
                  </div>
                </div>
                {/* Plan Details */}
                <div className="space-y-3 text-center">
                  <div className="space-y-1">
                    <div className="text-3xl font-semibold tracking-heading">
                      ${currentPlan.price}
                      <span className="text-xl font-semibold tracking-heading text-muted-foreground">
                        {isAnnual ? "/año" : "/mes"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Próximo pago {currentPlan.nextPayment}
                    </p>
                  </div>
                </div>
                <Separator />
                {/* Payment Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="card-number"
                      className="text-xs font-medium"
                    >
                      Tarjeta de crédito o débito
                    </Label>
                    <div className="relative">
                      <Input
                        id="card-number"
                        type="text"
                        placeholder="1234 1234 1234 1234"
                        disabled={isLoading}
                        className="pr-16"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <HugeiconsIcon
                          icon={CreditCardIcon}
                          className="h-4 w-4 text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Vencimiento</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM / YY"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">País</Label>
                    <Select defaultValue="us" disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">Estados Unidos</SelectItem>
                        <SelectItem value="mx">Mexico</SelectItem>
                        <SelectItem value="es">España</SelectItem>
                        <SelectItem value="ar">Argentina</SelectItem>
                        <SelectItem value="co">Colombia</SelectItem>
                        <SelectItem value="cl">Chile</SelectItem>
                        <SelectItem value="pe">Peru</SelectItem>
                        <SelectItem value="other">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-4 text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-transparent"
                    disabled={isLoading}
                  >
                    <HugeiconsIcon
                      icon={Ticket02Icon}
                      className="mr-1 h-3 w-3"
                    />
                    Agregar código de descuento
                  </Button>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    Al proporcionar tu información de tarjeta, permites a Vertex
                    cobrar tu tarjeta por pagos futuros en acuerdo con sus
                    términos.
                  </p>
                </div>
              </div>
              {/* --- FIN: contenido de payment-simulation-modal.tsx --- */}
              <DrawerFooter className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Anterior
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="sm"
                  className="px-8"
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Finalizar Registro"
                  )}
                </Button>
              </DrawerFooter>
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
