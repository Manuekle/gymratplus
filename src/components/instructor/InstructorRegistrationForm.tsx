"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, X, Plus } from "lucide-react"
import { PaymentSimulationModal } from "./payment-simulation-modal"
import { CountrySelector } from "@/components/country-selector"
import { signIn } from "next-auth/react"

const instructorFormSchema = z.object({
  bio: z.string().min(50, "Mínimo 50 caracteres").max(500, "Máximo 500 caracteres"),
  specialties: z.array(z.string()).min(1, "Se requiere al menos una especialidad"),
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
})

type InstructorFormValues = z.infer<typeof instructorFormSchema>

interface InstructorRegistrationFormProps {
  onSuccess?: () => void
}

export function InstructorRegistrationForm({ onSuccess }: InstructorRegistrationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [pendingValues, setPendingValues] = useState<InstructorFormValues | null>(null)

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
  })

  const bioValue = form.watch("bio") as string
  const curriculumValue = form.watch("curriculum") as string
  const isFormValid = form.formState.isValid && (form.getValues("specialties")?.length || 0) > 0

  const addSpecialty = () => {
    const newSpecialty = form.getValues("newSpecialty")
    if (newSpecialty && newSpecialty.trim() !== "") {
      const currentSpecialties = form.getValues("specialties") || []
      if (!currentSpecialties.includes(newSpecialty)) {
        form.setValue("specialties", [...currentSpecialties, newSpecialty.trim()])
        form.setValue("newSpecialty", "")
      }
    }
  }

  const removeSpecialty = (specialtyToRemove: string) => {
    const currentSpecialties = form.getValues("specialties") || []
    form.setValue(
      "specialties",
      currentSpecialties.filter((s) => s !== specialtyToRemove),
    )
  }

  const onSubmit = (values: InstructorFormValues) => {
    const filteredValues = {
      ...values,
      specialties: (values.specialties || []).filter((s): s is string => Boolean(s)),
    }
    setPendingValues(filteredValues)
    setShowPayment(true)
  }

  const handlePaymentConfirm = async () => {
    if (!pendingValues) return
    setIsLoading(true)
    setShowPayment(false)

    try {
      const submissionData = Object.fromEntries(Object.entries(pendingValues).filter(([key]) => key !== "newSpecialty"))

      const response = await fetch("/api/instructors/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        throw new Error("Error al registrar como instructor")
      }

      await response.json()
      toast.success("¡Registro exitoso!")

      await signIn(undefined, { redirect: false })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard/instructors/search")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al procesar el registro")
    } finally {
      setIsLoading(false)
      setPendingValues(null)
    }
  }

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
                <h3 className="text-lg font-semibold tracking-heading">Información Profesional</h3>
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
                            {field.value?.length > 0 ? (
                              field.value.map((specialty: string) => (
                                <div
                                  key={specialty}
                                  className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm flex items-center gap-1"
                                >
                                  {specialty}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      removeSpecialty(specialty)
                                    }}
                                    className="text-muted-foreground hover:text-foreground ml-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No hay especialidades añadidas</span>
                            )}
                          </div>
                          <div className="flex gap-2 items-center justify-center">
                            <Input
                              placeholder="Ej: Yoga, Pilates, Crossfit..."
                              value={form.watch("newSpecialty") || ""}
                              onChange={(e) => form.setValue("newSpecialty", e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addSpecialty}
                              className="px-3 bg-transparent"
                            >
                              <Plus className="w-4 h-4" />
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
                          <span className={bioValue.length > 450 ? "text-destructive" : ""}>{bioValue.length}/500</span>
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
                      <FormItem>
                        <FormLabel>Currículum y Certificaciones</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Certificaciones, especialidades, años de experiencia..."
                            className="min-h-[120px] resize-none"
                            {...field}
                            value={typeof field.value === "string" ? field.value : ""}
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between">
                          <span>Certificaciones y experiencia relevante</span>
                          <span className={curriculumValue?.length > 900 ? "text-destructive" : ""}>
                            {typeof field.value === "string" ? field.value.length : 0}/1000
                          </span>
                        </FormDescription>
                        <FormMessage />
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
                <h3 className="text-lg font-semibold tracking-heading">Información de Contacto y Ubicación</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Contacto</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
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
                        <Input type="tel" placeholder="+1234567890" {...field} />
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
                <h3 className="text-lg font-semibold tracking-heading">Configuración de Servicios</h3>
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
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Entre $10 y $1000 por mes</FormDescription>
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
                        <FormLabel className="text-base">Clases Remotas</FormLabel>
                        <FormDescription>Permite estudiantes de cualquier ubicación</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Botón de envío */}
            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={isLoading || !isFormValid} size="sm" className="px-8">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
  )
}
