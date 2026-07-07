import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PromotionsPageSkeleton() {
  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section>
        <Skeleton className="mb-6 h-7 w-48" />
        <Skeleton className="mx-auto h-64 w-full max-w-5xl rounded-lg" />
      </section>

      <Separator />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 w-20 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <div className="mb-4 space-y-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="items-center text-center">
                <Skeleton className="mb-2 h-5 w-16 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="text-center">
                <Skeleton className="mx-auto h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <Card className="bg-cream">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="text-center">
        <Skeleton className="mb-2 mx-auto h-7 w-44" />
        <Skeleton className="text-muted-foreground mx-auto mb-4 h-4 w-72" />
        <Skeleton className="mx-auto h-10 w-36 rounded-md" />
      </section>
    </div>
  );
}
