import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function WorkoutSkeleton() {
  return (
    <>
      <div className="mb-4 flex justify-between w-full items-center">
        <Button variant="outline" className="w-32">
          <Skeleton className="h-4 w-full" />
        </Button>
        <span className="flex flex-row gap-4">
          <Button variant="outline" className="w-32">
            <Skeleton className="h-4 w-full" />
          </Button>
        </span>
      </div>
      <div className="border rounded-lg p-4">
        <div className="flex flex-col gap-4 pb-4">
          <Skeleton className="h-4 w-xs" />
          <Skeleton className="h-2 w-3xl" />
          <Skeleton className="h-9 w-72 " />
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="border rounded-lg shadow-sm">
                <div className="flex items-center p-4 border-b ">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-2 w-40" />
                  </div>
                </div>
                <div className="p-4 gap-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
