"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon } from "@hugeicons/core-free-icons";
import { MasterCardIcon } from "@hugeicons/core-free-icons";

interface CreditCardProps {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export function CreditCard({
  cardNumber,
  cardHolder,
  expiryDate,
  cvv,
}: CreditCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || "";
    return formatted.padEnd(19, "•");
  };

  const getCardType = (
    number: string
  ): {
    type: "visa" | "mastercard" | "unknown";
    icon: typeof CreditCardIcon | typeof MasterCardIcon;
  } => {
    const firstDigit = number.replace(/\s/g, "").charAt(0);
    if (firstDigit === "4") {
      return { type: "visa", icon: CreditCardIcon };
    } else if (["2", "5"].includes(firstDigit)) {
      return { type: "mastercard", icon: MasterCardIcon };
    }
    return { type: "unknown", icon: CreditCardIcon };
  };

  const cardType = getCardType(cardNumber);
  const cardLabel = cardType.type === "mastercard" ? "MASTERCARD" : "VISA";

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto mb-6">
      <div
        className={`relative w-full h-52 transition-transform duration-700 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onMouseEnter={() => cvv && setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 p-6 shadow-xl border border-slate-200/50 dark:border-neutral-700/50">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <HugeiconsIcon
                icon={cardType.icon}
                className={`h-12 w-12 ${
                  cardType.type === "mastercard"
                    ? "text-slate-800 dark:text-neutral-100"
                    : "text-slate-800 dark:text-neutral-300"
                }`}
              />
              <div className="text-xs font-bold text-slate-700 dark:text-neutral-300 tracking-wider">
                {cardLabel}
              </div>
            </div>

            <div className="space-y-5">
              <div className="text-slate-800 dark:text-neutral-100 text-xl font-mono tracking-widest">
                {formatCardNumber(cardNumber || "")}
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-medium">
                    Titular
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200 uppercase tracking-wide truncate max-w-[180px]">
                    {cardHolder || "NOMBRE APELLIDO"}
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-[9px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-medium">
                    Vence
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200 tracking-wide">
                    {expiryDate || "MM/YY"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 shadow-xl border border-slate-200/50 dark:border-neutral-700/50 overflow-hidden">
          <div className="w-full h-12 bg-slate-300 dark:bg-neutral-950 mt-6" />
          <div className="p-6 space-y-4">
            <div className="bg-slate-300 dark:bg-neutral-700 h-10 rounded flex items-center justify-end px-4">
              <span className="text-slate-900 dark:text-neutral-200 font-mono font-bold text-xs tracking-wider">
                {cvv || "•••"}
              </span>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-neutral-400 text-right uppercase tracking-wider font-medium">
              CVV
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
