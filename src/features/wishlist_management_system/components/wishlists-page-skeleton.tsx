import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WishlistsPageSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-2 bg-muted rounded space-y-1">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded">
                    <div className="flex items-center gap-2 min-w-0">
                      <Skeleton className="size-4 shrink-0 rounded" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Skeleton className="h-3 w-6" />
                      <Skeleton className="size-3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-1">
                  <Skeleton className="size-8 rounded-md" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-5 w-40" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Skeleton className="size-14 rounded shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center gap-2 mt-1">
                      <Skeleton className="h-4 w-14 rounded-full" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="size-8 rounded-md shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
