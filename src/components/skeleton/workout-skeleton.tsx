import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function WorkoutSkeleton() {
  return (
    <div className="p-4">
      <Button variant="outline" className="mb-4 w-32">
        <Skeleton className="h-4 w-full" />
      </Button>
      <Card className="px-4">
        <div className="px-8 py-4 flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 " />
        </div>
        <CardContent>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex flex-row gap-4 items-center">
              <Skeleton className="h-4 w-8" />
              <div className="flex-grow bg-background p-4 rounded-lg py-8 shadow-md border justify-between items-center flex mb-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
