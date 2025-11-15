import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChartSkeleton() {
  return (
    <div className="w-full mx-auto my-12">
      <CardContent className="px-4">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
        </div>
      </CardContent>
    </div>
  );
}
