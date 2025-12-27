import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";
import { HugeiconsIcon } from "@hugeicons/react";

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
    return (
        <Card className={cn("hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <HugeiconsIcon icon={icon} className="h-4 w-4 text-primary" />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-2xl font-bold">{value}</div>
                    {(trend || description) && (
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                            {trend && (
                                <span
                                    className={cn(
                                        "flex items-center font-medium",
                                        trendDirection === "up" && "text-green-500",
                                        trendDirection === "down" && "text-red-500",
                                        trendDirection === "neutral" && "text-muted-foreground"
                                    )}
                                >
                                    {trendDirection === "up" && "+"}
                                    {trend}
                                </span>
                            )}
                            {description && <span>{description}</span>}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
