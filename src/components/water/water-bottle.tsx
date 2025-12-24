"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/utils";

interface WaterBottleProps {
  fillPercentage: number;
  className?: string;
}

export function WaterBottle({ fillPercentage, className }: WaterBottleProps) {
  const bottleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousPercentage = useRef(fillPercentage);

  useEffect(() => {
    if (fillRef.current) {
      // Animate the fill level
      fillRef.current.style.transition = "height 0.5s ease-in-out";
      fillRef.current.style.height = `${Math.min(
        100,
        Math.max(0, fillPercentage),
      )}%`;

      // Trigger wave animation if percentage changed
      if (previousPercentage.current !== fillPercentage && fillPercentage > 0) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }
      previousPercentage.current = fillPercentage;
    }
  }, [fillPercentage]);

  return (
    <div
      ref={bottleRef}
      className={cn("relative w-32 h-64 mx-auto", className)}
      aria-label={`Botella de agua, ${fillPercentage.toFixed(0)}% llena`}
      role="img"
    >
      {/* Bottle neck */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-10 bg-background/80 backdrop-blur-sm rounded-t-lg z-10 border border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent rounded-t-lg" />
      </div>

      {/* Bottle body */}
      <div className="absolute top-8 left-0 w-full h-56 bg-background/60 backdrop-blur-sm rounded-b-3xl rounded-t-lg overflow-hidden border border-border">
        {/* Glass highlight - subtle */}
        <div className="absolute top-0 left-2 w-8 h-full bg-gradient-to-r from-muted/10 to-transparent pointer-events-none" />

        {/* Water fill - simple gradient */}
        <div
          ref={fillRef}
          className="absolute bottom-0 left-0 w-full transition-height duration-500"
          style={{ height: `${fillPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 to-cyan-500 dark:from-cyan-500 dark:to-cyan-600" />

          {/* Water surface - simple */}
          <div
            className={`absolute top-0 left-0 w-full h-1 bg-cyan-300/40 dark:bg-cyan-400/30 ${isAnimating ? "animate-water-wave" : ""}`}
          />
        </div>

        {/* Measurement lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
          {[0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map((level, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-px bg-zinc-200 dark:bg-white/50" />
              <span className="text-[10px] text-zinc-200 dark:text-white/80 ml-1 font-medium">
                {level.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
