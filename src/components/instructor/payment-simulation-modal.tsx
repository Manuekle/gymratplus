"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { CreditCard, Loader2, Ticket } from "lucide-react"

interface PaymentSimulationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading: boolean
}

export function PaymentSimulationModal({ open, onOpenChange, onConfirm, isLoading }: PaymentSimulationModalProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const planDetails = {
    monthly: {
      price: '5.99',
      nextPayment: 'el 22 de cada mes',
      savings: ''
    },
    annual: {
      price: '50.00',
      nextPayment: '22 de junio, 2025',
      savings: 'Ahorra 2 meses'
    }
  };

  const currentPlan = isAnnual ? planDetails.annual : planDetails.monthly;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onConfirm()
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl tracking-heading font-semibold text-center">
              Elige tu plan
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Plan Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
                Mensual
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
                  Anual
                </span>
                {isAnnual && (
                  <span className="text-xs text-emerald-600 font-medium">{planDetails.annual.savings}</span>
                )}
              </div>
            </div>

            {/* Plan Details */}
            <div className="space-y-3 text-center">
              <div className="space-y-1">
                <div className="text-3xl font-semibold tracking-heading">
                  ${currentPlan.price}
                  <span className="text-xl font-semibold tracking-heading text-muted-foreground">
                    {isAnnual ? '/año' : '/mes'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Próximo pago {currentPlan.nextPayment}
                </p>
              </div>
            </div>

            <Separator />

            {/* Payment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number" className="text-sm font-medium">
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
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-sm font-medium">
                    Vencimiento
                  </Label>
                  <Input id="expiry" type="text" placeholder="MM / YY" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc" className="text-sm font-medium">
                    CVC
                  </Label>
                  <Input id="cvc" type="text" placeholder="123" disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">País</Label>
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
                className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                <Ticket className="mr-1 h-3 w-3" />
                Agregar código de descuento
              </Button>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Al proporcionar tu información de tarjeta, permites a Vertex cobrar tu tarjeta por pagos futuros en
                acuerdo con sus términos.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 px-6 py-4 bg-muted/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className=""
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar pago"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
