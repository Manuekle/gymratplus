import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FireIcon } from "hugeicons-react";

interface StreakAlertProps {
  streak: number;
  show: boolean;
  onClose: () => void;
}

const getStreakLevel = (streak: number) => {
  if (streak >= 50)
    return { color: "text-purple-500", scale: 1.4, label: "¡Legendario!" };
  if (streak >= 40)
    return { color: "text-red-600", scale: 1.3, label: "¡Imparable!" };
  if (streak >= 30)
    return { color: "text-orange-600", scale: 1.2, label: "¡En llamas!" };
  if (streak >= 20)
    return { color: "text-yellow-500", scale: 1.1, label: "¡Increíble!" };
  if (streak >= 10)
    return { color: "text-orange-500", scale: 1.0, label: "¡Excelente!" };
  return { color: "text-orange-400", scale: 0.9, label: "¡Sigue así!" };
};

export function StreakAlert({ streak, show, onClose }: StreakAlertProps) {
  const [isVisible, setIsVisible] = useState(show);
  const streakLevel = getStreakLevel(streak);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-background border shadow-lg rounded-lg p-4 flex items-center space-x-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <FireIcon
                className={`w-8 h-8 ${streakLevel.color}`}
                style={{ transform: `scale(${streakLevel.scale})` }}
              />
            </motion.div>
            <div>
              <p className="font-bold text-lg">{streakLevel.label}</p>
              <p className="text-sm text-muted-foreground">
                ¡{streak} días seguidos entrenando!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
