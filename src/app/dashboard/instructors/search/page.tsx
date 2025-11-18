import { Suspense } from "react";
import InstructorSearchContent from "@/components/instructor/instructor-search-content";
import { Skeleton } from "@/components/ui/skeleton";

// Componente que se utiliza como fallback (carga)
const SearchPageLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-lg border bg-card overflow-hidden flex flex-col h-full"
      >
        <div className="flex flex-row items-start space-x-3 p-4 pb-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <div className="px-4 py-2 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
        <div className="px-4 pb-3 pt-2 space-y-1">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export default function InstructorSearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <InstructorSearchContent />
    </Suspense>
  );
}
