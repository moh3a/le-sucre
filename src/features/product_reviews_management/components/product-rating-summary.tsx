"use client";

import { Star } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProductRatingSummaryProps {
  product_id: string;
}

export function ProductRatingSummary({ product_id }: ProductRatingSummaryProps) {
  const { data: summary, isLoading } = trpc.reviews.summaryByProduct.useQuery({ product_id });

  if (isLoading) {
    return (
      <div className="border-secondary/15 animate-pulse space-y-4 rounded-2xl border bg-muted/20 p-6">
        <div className="bg-muted h-6 w-1/3 rounded" />
        <div className="bg-muted h-10 w-1/4 rounded" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-4 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const totalReviews = summary.review_count;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avis des clients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Big Number */}
          <div className="text-center">
            <div className="font-orla text-4xl font-bold text-[#700145]">
              {summary.average_rating.toFixed(1)}
            </div>
            <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < Math.round(summary.average_rating) ? "fill-yellow-500" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-secondary/60 mt-1 text-xs">{summary.review_count} avis</p>
          </div>

          <Separator orientation="vertical" />

          {/* Star breakdown progress bars */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.breakdown.find((b) => b.stars === stars)?.count ?? 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="text-secondary w-3 text-right font-semibold">{stars}</span>
                  <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                  <Progress value={percentage} className="bg-secondary/10 h-2 flex-1" />
                  <span className="text-secondary/60 w-8 text-right font-medium">
                    {Math.round(percentage)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default ProductRatingSummary;
