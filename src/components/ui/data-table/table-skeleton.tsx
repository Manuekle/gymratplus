import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columns: number;
  rows: number;
  showFilter?: boolean;
  showColumnToggle?: boolean;
}

export function TableSkeleton({ columns = 6, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* <div className="flex items-center py-4">
        {showFilter && <Skeleton className="h-10 w-[250px]" />}
        {showColumnToggle && <Skeleton className="ml-auto h-10 w-[120px]" />}
      </div> */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-6 w-full max-w-[120px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        {/* <Skeleton className="h-10 w-[180px]" /> */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[100px]" />
          <div className="flex space-x-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
