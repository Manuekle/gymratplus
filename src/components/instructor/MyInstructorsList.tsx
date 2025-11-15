import React from "react";
import { useMyInstructors } from "@/hooks/use-my-instructors";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyInstructorsList() {
  const { instructors, isLoading } = useMyInstructors();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="flex items-center p-4 gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!instructors.length) {
    return (
      <p className="text-center text-muted-foreground">
        No tienes instructores asignados actualmente.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {instructors.map((inst) => (
        <Card key={inst.id} className="flex items-center p-4 gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={inst.image || undefined} alt={inst.name} />
            <AvatarFallback>{inst.name?.[0] ?? "I"}</AvatarFallback>
          </Avatar>
          <CardContent className="flex-1 px-4">
            <h3 className="font-semibold text-lg">{inst.name}</h3>
            {inst.bio && (
              <p className="text-xs text-muted-foreground mb-1">{inst.bio}</p>
            )}
            <div className="text-xs text-muted-foreground space-y-1">
              {inst.contactEmail && (
                <div>
                  Email:{" "}
                  <span className="font-medium">{inst.contactEmail}</span>
                </div>
              )}
              {inst.contactPhone && (
                <div>
                  Teléfono:{" "}
                  <span className="font-medium">{inst.contactPhone}</span>
                </div>
              )}
              {inst.pricePerMonth && (
                <div>
                  Precio mensual:{" "}
                  <span className="font-medium">${inst.pricePerMonth}</span>
                </div>
              )}
              {(inst.country || inst.city) && (
                <div>
                  Ubicación:{" "}
                  <span className="font-medium">
                    {[inst.city, inst.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <div>
                Modalidad:{" "}
                <span className="font-medium">
                  {inst.isRemote ? "Remoto" : "Presencial"}
                </span>
              </div>
              {inst.startDate && (
                <div>
                  Desde:{" "}
                  <span className="font-medium">
                    {new Date(inst.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div>
                Estado:{" "}
                <span className="font-medium capitalize">{inst.status}</span>
              </div>
            </div>
            {inst.curriculum && (
              <div className="mt-2 text-xs">
                CV:{" "}
                <span className="underline text-blue-600">
                  {inst.curriculum}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
