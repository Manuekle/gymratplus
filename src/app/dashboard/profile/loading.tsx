import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfileLoading() {
  return (
    <div className="container mx-auto p-4 md:p-8 pt-6 space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="space-y-4 flex-1 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex gap-4 pt-2">
            <div className="text-center space-y-1">
              <Skeleton className="h-6 w-8 mx-auto" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center space-y-1">
              <Skeleton className="h-6 w-8 mx-auto" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Skeleton className="h-32 w-32 rounded-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
