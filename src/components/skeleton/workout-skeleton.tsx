import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function WorkoutSkeleton() {
  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-4 md:gap-2">
        <Button
          variant="outline"
          className="text-xs w-full md:w-auto"
          size="sm"
          disabled
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
        <span className="flex flex-row gap-2 text-xs w-full md:w-auto">
          <Skeleton className="h-9 w-full md:w-32" />
        </span>
      </div>

      <div className="border rounded-lg p-6 shadow-sm bg-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-2 items-center">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        <div className="pt-6 border-t">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="border rounded-lg shadow-sm">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-12 mx-auto" />
                      <Skeleton className="h-5 w-8 mx-auto" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-12 mx-auto" />
                      <Skeleton className="h-5 w-8 mx-auto" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-12 mx-auto" />
                      <Skeleton className="h-5 w-8 mx-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
