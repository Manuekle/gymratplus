"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/utils";

interface WaterBottleProps {
  fillPercentage: number;
  className?: string;
}

export function WaterBottle({ fillPercentage, className }: WaterBottleProps) {
  const bottleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fillRef.current) {
      // Animate the fill level
      fillRef.current.style.transition = "height 0.5s ease-in-out";
      fillRef.current.style.height = `${Math.min(
        100,
        Math.max(0, fillPercentage),
      )}%`;
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
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-10 bg-blue-50 rounded-t-lg z-10" />

      {/* Bottle body */}
      <div className="absolute top-8 left-0 w-full h-56 bg-blue-50 rounded-b-3xl rounded-t-lg overflow-hidden">
        {/* Water fill */}
        <div
          ref={fillRef}
          className="absolute bottom-0 left-0 w-full bg-blue-400 transition-height duration-500"
          style={{ height: `${fillPercentage}%` }}
        >
          {/* Water surface effect */}
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-300 opacity-50" />
        </div>

        {/* Measurement lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
          {[0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map((level, index) => (
            <div key={index} className="flex items-center">
              <div className="w-4 h-px bg-gray-300" />
              <span className="text-[8px] text-gray-300 ml-1">
                {level.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
