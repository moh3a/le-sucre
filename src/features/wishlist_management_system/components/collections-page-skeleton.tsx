import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CollectionsPageSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="size-8 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-40 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
