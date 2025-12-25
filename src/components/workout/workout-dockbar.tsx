"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Clock01Icon,
    PauseIcon,
    PlayIcon,
    Cancel01Icon,
    ArrowUp01Icon,
    ArrowDown01Icon,
    Dumbbell02Icon,
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
    const [isCompleting, setIsCompleting] = useState(false);

    // Don't show on active workout page
    if (pathname === "/dashboard/workout/active") {
        return null;
    }

    // Timer logic
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                setElapsedTime(elapsed);
            }, 1000);

            return () => clearInterval(interval);
        }
        return undefined;
    }, [startTime, isPaused]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const completeWorkout = async () => {
        setIsCompleting(true);
        try {
            const duration = Math.round(elapsedTime / 60);
            const response = await fetch("/api/workout-session/complete", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workoutSessionId, duration }),
            });

            if (response.ok) {
                onComplete();
                router.push("/dashboard/workout/history");
            }
        } catch (error) {
            console.error("Error completing workout:", error);
        } finally {
            setIsCompleting(false);
        }
    };

    const goToActive = () => {
        router.push("/dashboard/workout/active");
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 px-4"
            >
                <motion.div
                    animate={{ height: isExpanded ? "auto" : "64px" }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-2xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-2xl overflow-hidden"
                >
                    {/* Minimized Dockbar */}
                    <div
                        className="h-16 px-6 flex items-center justify-between cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-4">
                            <HugeiconsIcon
                                icon={Dumbbell02Icon}
                                className="text-zinc-700 dark:text-zinc-300"
                                size={20}
                            />
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={Clock01Icon}
                                    className="text-zinc-600 dark:text-zinc-400"
                                    size={16}
                                />
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {formatTime(elapsedTime)}
                                </span>
                            </div>
                            {nextExercise && (
                                <>
                                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Siguiente
                                        </span>
                                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {nextExercise.name}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <HugeiconsIcon
                            icon={isExpanded ? ArrowDown01Icon : ArrowUp01Icon}
                            className="text-zinc-600 dark:text-zinc-400"
                            size={20}
                        />
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-6 pb-6 space-y-4 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4"
                        >
                            {/* Timer Display */}
                            <div className="text-center">
                                <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {formatTime(elapsedTime)}
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    Tiempo de entrenamiento
                                </p>
                            </div>

                            {/* Next Exercise */}
                            {nextExercise && (
                                <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-xl p-4">
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                                        Próximo ejercicio
                                    </p>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                        {nextExercise.name}
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                        {nextExercise.sets} sets × {nextExercise.reps} reps
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    className="flex-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                                    onClick={togglePause}
                                >
                                    <HugeiconsIcon
                                        icon={isPaused ? PlayIcon : PauseIcon}
                                        size={16}
                                        className="mr-2"
                                    />
                                    {isPaused ? "Reanudar" : "Pausar"}
                                </Button>
                                <Button
                                    variant="default"
                                    className="flex-1"
                                    onClick={goToActive}
                                >
                                    Ver entrenamiento
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
                                    onClick={completeWorkout}
                                    disabled={isCompleting}
                                >
                                    {isCompleting ? (
                                        <Icons.spinner className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <HugeiconsIcon icon={Cancel01Icon} size={16} />
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
