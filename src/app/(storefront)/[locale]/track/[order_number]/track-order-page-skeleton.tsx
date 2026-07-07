import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TrackOrderPageSkeleton() {
  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <Skeleton className="mx-auto mb-4 h-9 w-64" />
        <div className="flex items-center justify-center gap-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </section>

      <Separator />

      <section className="mx-auto max-w-2xl">
        <Skeleton className="mb-6 h-7 w-40" />
        <div className="space-y-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative flex gap-4 pb-8 last:pb-0">
              <Skeleton className="relative z-10 size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 pt-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="mx-auto max-w-2xl">
        <Skeleton className="mb-6 h-7 w-44" />
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center border-b p-4 last:border-0">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="mx-4 h-4 w-8" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
            <div className="flex items-center border-t p-4">
              <div className="flex-1" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="ml-4 h-5 w-24" />
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
