"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
    trendDirection?: "up" | "down" | "neutral";
    description?: string;
    className?: string;
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    trendDirection = "neutral",
    description,
    className,
}: StatCardProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = typeof value === "number" ? value : 0;

    // Animated counter effect
    useEffect(() => {
        if (typeof value !== "number") return;

        const duration = 1000; // 1 second
        const steps = 60;
        const stepValue = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += stepValue;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    const gradients = {
        up: "from-emerald-500/20 via-green-500/20 to-teal-500/20",
        down: "from-red-500/20 via-rose-500/20 to-pink-500/20",
        neutral: "from-primary/20 via-primary/10 to-primary/5",
    };

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border-border/50 bg-gradient-to-br from-background/95 via-background/80 to-background/95 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10",
                className
            )}
        >
            {/* Gradient overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    gradients[trendDirection]
                )}
            />

            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20" />

            <CardContent className="relative p-6">
                <div className="flex items-center justify-between space-y-0 pb-3">
                    <p className="text-sm font-medium tracking-wide text-muted-foreground">
                        {title}
                    </p>
                    <div
                        className={cn(
                            "relative p-3 rounded-xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                            trendDirection === "up" &&
                            "from-emerald-500/20 to-green-500/20 group-hover:from-emerald-500/30 group-hover:to-green-500/30",
                            trendDirection === "down" &&
                            "from-red-500/20 to-rose-500/20 group-hover:from-red-500/30 group-hover:to-rose-500/30",
                            trendDirection === "neutral" &&
                            "from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20"
                        )}
                    >
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />
                        <HugeiconsIcon
                            icon={icon}
                            className={cn(
                                "relative h-5 w-5 transition-colors",
                                trendDirection === "up" && "text-emerald-500",
                                trendDirection === "down" && "text-red-500",
                                trendDirection === "neutral" && "text-primary"
                            )}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-3xl font-bold tracking-tight">
                        {typeof value === "number" ? displayValue.toLocaleString() : value}
                    </div>

                    {(trend || description) && (
                        <div className="flex items-center gap-2 text-xs">
                            {trend && (
                                <span
                                    className={cn(
                                        "flex items-center gap-1 rounded-full px-2 py-1 font-semibold backdrop-blur-sm",
                                        trendDirection === "up" &&
                                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                        trendDirection === "down" &&
                                        "bg-red-500/10 text-red-600 dark:text-red-400",
                                        trendDirection === "neutral" &&
                                        "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {trendDirection === "up" && (
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                            />
                                        </svg>
                                    )}
                                    {trendDirection === "down" && (
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                                            />
                                        </svg>
                                    )}
                                    {trend}
                                </span>
                            )}
                            {description && (
                                <span className="text-muted-foreground">{description}</span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
