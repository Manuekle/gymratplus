"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import GoalProgress from "@/components/dashboard/goal-progress";
import NutritionSummary from "@/components/dashboard/nutrition-summary";
import ProgressChart from "@/components/dashboard/progress-chart";
import WorkoutSummary from "@/components/dashboard/workout-summary";
import AnimatedLayout from "@/components/layout/animated-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRecordAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (status === "loading" || !session) {
    return (
      <AnimatedLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedLayout>
    );
  }

  return (
    <AnimatedLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressChart
            refreshKey={refreshKey}
            onRecordAdded={handleRecordAdded}
          />
          <GoalProgress />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkoutSummary />
          <NutritionSummary />
        </div>
      </div>
    </AnimatedLayout>
  );
}
