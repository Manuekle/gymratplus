import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StreakRiskAlertProps {
  streak: number;
  allowedRestDays: number;
  show: boolean;
  onClose: () => void;
}

export function StreakRiskAlert({
  streak,
  allowedRestDays,
  show,
  onClose,
}: StreakRiskAlertProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-sm w-full p-8 relative"
            >
              <div className="text-center space-y-6">
                {/* Fire Icon with red tint */}
                <div className="relative flex justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <Image
                      src="/svg/streak.svg"
                      alt="Racha"
                      width={120}
                      height={120}
                      className="w-30 h-30"
                      style={{
                        filter:
                          "hue-rotate(0deg) saturate(1.6) brightness(1.3) drop-shadow(0 0 20px rgba(220, 38, 38, 0.9)) drop-shadow(0 0 40px rgba(239, 68, 68, 0.7))",
                      }}
                    />
                  </motion.div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-heading text-zinc-900 dark:text-white">
                    Racha en Riesgo
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 ">
                    Has usado tus {allowedRestDays} días de descanso permitidos.
                    Tu racha de{" "}
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {streak} días
                    </span>{" "}
                    está en peligro. Si no entrenas antes de las 12:00 AM,
                    perderás tu progreso. ¡Aún estás a tiempo!
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Link href="/dashboard/workout" onClick={handleClose}>
                    <Button
                      size="default"
                      className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
                    >
                      Entrenar Ahora
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
