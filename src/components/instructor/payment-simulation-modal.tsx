"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PaymentSimulationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function PaymentSimulationModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: PaymentSimulationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        <form
          onSubmit={e => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <div className="px-8 pt-8 pb-2">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg font-semibold">Findex Plus</DialogTitle>
            </DialogHeader>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Yearly plan</span>
                <span className="text-xs text-gray-400">due today</span>
              </div>
              <div className="text-4xl font-bold mb-1">$49.00</div>
              <div className="text-xs text-gray-500 mb-2">Next payment on June 22, 2025</div>
              <div className="border-b border-gray-200 my-4" />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Credit or Debit Cards*</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="1234 1234 1234 1234"
                  disabled={isLoading}
                />
                <div className="absolute right-3 flex gap-1">
                  {/* Puedes reemplazar estos SVG por imágenes locales si tienes los íconos */}
                  <img src="/icons/visa.svg" alt="Visa" className="h-5" />
                  <img src="/icons/mastercard.svg" alt="Mastercard" className="h-5" />
                  <img src="/icons/discover.svg" alt="Discover" className="h-5" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expiry*</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="MM / YY"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">CVC*</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="123"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country*</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={isLoading}
                  defaultValue="United States"
                >
                  <option>United States</option>
                  <option>Mexico</option>
                  <option>Spain</option>
                  <option>Argentina</option>
                  <option>Colombia</option>
                  <option>Chile</option>
                  <option>Peru</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="mt-1 mb-2">
                <button
                  type="button"
                  className="text-xs text-primary underline flex items-center gap-1 hover:text-black"
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  <span className="i-lucide-ticket w-4 h-4" />
                  Coupon code
                </button>
              </div>
              <div className="text-[11px] text-gray-400 mb-2">
                By providing your card information, you allow Vertex to charge your card for future payments in accordance with their terms.
              </div>
            </div>
          </div>
          <DialogFooter className="bg-gray-50 px-8 py-4 flex flex-col gap-2 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-900" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
