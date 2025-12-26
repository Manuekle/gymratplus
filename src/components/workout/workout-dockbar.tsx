"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PauseIcon,
  PlayIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  EquipmentGym03Icon,
} from "@hugeicons/core-free-icons";

interface WorkoutDockbarProps {
  workoutSessionId: string;
  startTime: Date;
  nextExercise?: {
    name: string;
    sets: number;
    reps: number;
  };
  onComplete: () => void;
}

export default function WorkoutDockbar({
  workoutSessionId,
  startTime,
  nextExercise,
  onComplete,
}: WorkoutDockbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000,
        );
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [startTime, isPaused]);

  // Don't show on active workout page (check AFTER all hooks)
  if (pathname === "/dashboard/workout/active") {
    return null;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(!isPaused);
  };

  const goToActive = () => {
    router.push("/dashboard/workout/active");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-4 right-4 z-40 flex justify-center"
      >
        <motion.div
          layout
          className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-[32px] overflow-hidden cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ borderRadius: 32 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {isExpanded ? (
              <motion.div
                layout
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-400 tracking-[-0.04em]">
                      Entrenamiento Activo
                    </span>
                    <div className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50 tracking-[-0.02em]">
                      {formatTime(elapsedTime)}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full -mr-2 -mt-2 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                  >
                    <HugeiconsIcon icon={ArrowDown01Icon} size={18} />
                  </Button>
                </div>

                {nextExercise && (
                  <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-sm">
                      <HugeiconsIcon
                        icon={EquipmentGym03Icon}
                        size={18}
                        className="text-zinc-700 dark:text-zinc-300"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {nextExercise.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {nextExercise.sets} sets × {nextExercise.reps} reps
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    onClick={togglePause}
                    className="rounded-xl text-zinc-900 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    variant="default"
                    size="sm"
                  >
                    {isPaused ? (
                      <HugeiconsIcon
                        icon={PlayIcon}
                        size={18}
                        className="mr-2"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={PauseIcon}
                        size={18}
                        className="mr-2"
                      />
                    )}
                    {isPaused ? "Reanudar" : "Pausar"}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToActive();
                    }}
                    className="rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
                    size="sm"
                  >
                    Ir al detalle
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                layout
                key="minimized"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-16 px-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${isPaused ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`}
                  />
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-none mb-1">
                      {isPaused ? "Pausado" : "En curso"}
                    </span>
                    <span className="text-xs font-semibold leading-none text-zinc-900 dark:text-zinc-100">
                      {formatTime(elapsedTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {nextExercise && (
                    <div className="hidden sm:flex flex-col items-end mr-2">
                      <span className="text-xs text-zinc-400 tracking-[-0.02em] font-semibold">
                        Siguiente
                      </span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate text-right">
                        {nextExercise.name}
                      </span>
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={ArrowUp01Icon}
                      size={16}
                      className="text-zinc-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
