import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface StreakAlertProps {
  streak: number;
  show: boolean;
  onClose: () => void;
}

// Obtener los días de la semana en español
const getWeekDays = () => {
  return ["L", "M", "M", "J", "V", "S", "D"];
};

// Calcular qué días están activos (últimos N días desde hoy)
const getActiveDays = (streak: number) => {
  const today = new Date();
  const activeDays = [];

  for (let i = streak - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    // Convertir a formato L, M, M, J, V, S, D (Lunes = 1)
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    activeDays.push(dayIndex);
  }

  return activeDays;
};

// Obtener mensaje motivador según el nivel de la racha
const getMotivationalMessage = (streak: number) => {
  if (streak >= 365) {
    return "¡Eres una leyenda! Un año completo de dedicación. ¡Sigue así, campeón! 🔥";
  }
  if (streak >= 300) {
    return "¡Increíble! Estás cerca de un año completo. ¡No te detengas ahora! 💪";
  }
  if (streak >= 200) {
    return "¡Wow! Más de 200 días de constancia. Eres una máquina. ¡Sigue adelante! ⚡";
  }
  if (streak >= 150) {
    return "¡Impresionante! Tu disciplina es admirable. ¡Sigue construyendo tu mejor versión! 🌟";
  }
  if (streak >= 100) {
    return "¡Centenario! Has alcanzado los 100 días. ¡Eres un verdadero guerrero! 🏆";
  }
  if (streak >= 75) {
    return "¡Excelente trabajo! Tu consistencia está dando frutos. ¡Sigue así! 💎";
  }
  if (streak >= 50) {
    return "¡50 días! Estás construyendo un hábito sólido. ¡No pares ahora! 🔥";
  }
  if (streak >= 25) {
    return "¡Genial! Cada día te acerca más a tus metas. ¡Mantén el ritmo! ⚡";
  }
  if (streak >= 10) {
    return "¡Bien hecho! Estás formando un hábito poderoso. ¡Sigue adelante! 💪";
  }
  if (streak >= 3) {
    return "¡Vas por buen camino! La constancia es la clave del éxito. ¡Continúa! 🌱";
  }
  if (streak >= 1) {
    return "¡Excelente inicio! Cada día cuenta. ¡Sigue construyendo tu racha! 🚀";
  }
  return "¡Comienza tu racha hoy! El primer paso es el más importante. ¡Tú puedes! 💫";
};

// Obtener el color según el nivel de la racha (progresión de llama real)
const getStreakColor = (streak: number) => {
  // 🔥 365+: Blanco brillante / Dorado (temperatura máxima)
  if (streak >= 365) {
    return {
      dayColor: "bg-yellow-400", // Color sólido para días de la semana
      svgFilter:
        "saturate(2.0) brightness(1.8) contrast(1.2) drop-shadow(0 0 25px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 50px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 75px rgba(255, 200, 0, 0.6))",
      filter: "saturate(2.0) brightness(1.8)",
    };
  }

  // 291-364: Rojo anaranjado / Rojo intenso (fuego muy caliente)
  if (streak >= 291)
    return {
      dayColor: "bg-red-600",
      svgFilter:
        "hue-rotate(0deg) saturate(1.6) brightness(1.3) drop-shadow(0 0 20px rgba(220, 38, 38, 0.9)) drop-shadow(0 0 40px rgba(239, 68, 68, 0.7))",
      filter: "saturate(1.6) brightness(1.3)",
    };

  // 221-290: Naranja (fuego establecido)
  if (streak >= 221)
    return {
      dayColor: "bg-orange-500",
      svgFilter:
        "hue-rotate(5deg) saturate(1.5) brightness(1.25) drop-shadow(0 0 18px rgba(249, 115, 22, 0.8)) drop-shadow(0 0 35px rgba(251, 146, 60, 0.6))",
      filter: "saturate(1.5) brightness(1.25)",
    };

  // 151-220: Amarillo pálido / Amarillo brillante (llama intensificándose)
  if (streak >= 151)
    return {
      dayColor: "bg-yellow-400",
      svgFilter:
        "hue-rotate(30deg) saturate(1.4) brightness(1.2) drop-shadow(0 0 15px rgba(250, 204, 21, 0.7)) drop-shadow(0 0 30px rgba(255, 237, 74, 0.5))",
      filter: "saturate(1.4) brightness(1.2)",
    };

  // 101-150: Verde claro / Lima (crecimiento constante)
  if (streak >= 101)
    return {
      dayColor: "bg-lime-400",
      svgFilter:
        "hue-rotate(80deg) saturate(1.3) brightness(1.15) drop-shadow(0 0 15px rgba(163, 230, 53, 0.7)) drop-shadow(0 0 30px rgba(190, 242, 100, 0.5))",
      filter: "saturate(1.3) brightness(1.15)",
    };

  // 51-100: Cian / Turquesa (llama creciendo)
  if (streak >= 51)
    return {
      dayColor: "bg-cyan-400",
      svgFilter:
        "hue-rotate(175deg) saturate(1.2) brightness(1.1) drop-shadow(0 0 12px rgba(34, 211, 238, 0.6)) drop-shadow(0 0 25px rgba(103, 232, 249, 0.4))",
      filter: "saturate(1.2) brightness(1.1)",
    };

  // 1-50: Azul profundo / Índigo (inicio, llama pequeña)
  if (streak >= 1)
    return {
      dayColor: "bg-indigo-600",
      svgFilter:
        "hue-rotate(220deg) saturate(1.1) brightness(1.05) drop-shadow(0 0 10px rgba(79, 70, 229, 0.5)) drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))",
      filter: "saturate(1.1) brightness(1.05)",
    };

  // 0: Gris sin racha
  return {
    dayColor: "bg-gray-400",
    svgFilter: "saturate(0.8) brightness(0.9) grayscale(0.5)",
    filter: "saturate(0.8) brightness(0.9)",
  };
};

export function StreakAlert({ streak, show, onClose }: StreakAlertProps) {
  const [isVisible, setIsVisible] = useState(show);
  const weekDays = getWeekDays();
  const activeDays = getActiveDays(streak);
  const streakColor = getStreakColor(streak);

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
              {/* Close button */}

              <div className="text-center space-y-6">
                {/* Large Fire Icon */}
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
                        filter: streakColor.svgFilter,
                      }}
                    />
                  </motion.div>
                </div>

                {/* Week Days */}
                <div className="flex justify-center gap-1.5">
                  {weekDays.map((day, index) => {
                    const isActive = activeDays.includes(index);
                    return (
                      <div
                        key={index}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                          isActive
                            ? `${streakColor.dayColor} text-white shadow-md`
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {/* Streak Message */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-heading text-zinc-900 dark:text-white">
                    ¡Racha de {streak} {streak === 1 ? "día" : "días"}!
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {getMotivationalMessage(streak)}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
