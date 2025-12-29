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

    // Animated counter effect
    useEffect(() => {
        if (typeof value !== "number") return;

        const duration = 1000;
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

    return (
        <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-3">
                    <p className="text-xs font-medium text-muted-foreground">
                        {title}
                    </p>
                    <div className="p-2 rounded-lg bg-primary/10">
                        <HugeiconsIcon
                            icon={icon}
                            className="h-5 w-5 text-primary"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-3xl font-bold">
                        {typeof value === "number" ? displayValue.toLocaleString() : value}
                    </div>

                    {(trend || description) && (
                        <div className="flex items-center gap-2 text-xs">
                            {trend && (
                                <span
                                    className={cn(
                                        "flex items-center gap-1 font-medium",
                                        trendDirection === "up" && "text-emerald-600 dark:text-emerald-400",
                                        trendDirection === "down" && "text-red-600 dark:text-red-400",
                                        trendDirection === "neutral" && "text-muted-foreground"
                                    )}
                                >
                                    {trendDirection === "up" && "↗"}
                                    {trendDirection === "down" && "↘"}
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
