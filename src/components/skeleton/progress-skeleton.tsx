import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-6 w-16 ml-auto rounded-md" />
      </CardHeader>
      <CardContent className="px-4">
        <Skeleton className="h-4 w-1/4 mb-2" />
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-1/2 ml-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-1/2 ml-auto" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 mt-4 rounded-md" />
      </CardContent>
    </Card>
  );
}
