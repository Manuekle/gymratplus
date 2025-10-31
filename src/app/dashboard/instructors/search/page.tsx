import { Suspense } from "react";
import InstructorSearchContent from "@/components/instructor-search-content"; // Asegúrate de la ruta correcta

// Componente que se utiliza como fallback (carga)
const SearchPageLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-4"
      >
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="space-y-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse"></div>
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
