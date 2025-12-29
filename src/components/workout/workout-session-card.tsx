"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { formatRelativeDate } from "@/lib/utils/format-date";

interface Exercise {
  name: string;
}

interface WorkoutSessionCardProps {
  session: {
    id: string;
    notes?: string;
    date: string;
    duration?: number;
    exercises: Exercise[];
    completed: boolean;
  };
  className?: string;
}

export function WorkoutSessionCard({
  session,
  className = "",
}: WorkoutSessionCardProps) {
  const sessionContent = (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <h4 className="font-semibold tracking-heading text-lg">
          {session.notes?.replace("Día: ", "") || "Entrenamiento"}
        </h4>
        <span className="text-xs text-muted-foreground sm:text-right">
          {formatRelativeDate(session.date)}
        </span>
      </div>
      <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-4">
        <div className="flex items-center">
          <HugeiconsIcon
            icon={Clock01Icon}
            className="h-3 w-3 mr-1 text-foreground"
          />
          <span>{session.duration ? `${session.duration} min` : "N/A"}</span>
        </div>
        <div>
          <span>{session.exercises.length} ejercicios</span>
        </div>
      </div>
    </>
  );

  // Only make it a link if the workout is not completed
  if (!session.completed) {
    return (
      <Link
        href="/dashboard/workout/active"
        className={`block p-4 sm:p-5 border border-border/40 rounded-2xl shadow-sm hover:shadow-lg hover:border-border/60 hover:bg-accent/30 hover:ring-1 hover:ring-border/20 cursor-pointer transition-all duration-200 ${className}`}
      >
        {sessionContent}
      </Link>
    );
  }

  return (
    <div
      className={`p-4 sm:p-5 border border-border/30 rounded-2xl shadow-sm bg-muted/20 ${className}`}
    >
      {sessionContent}
    </div>
  );
}
