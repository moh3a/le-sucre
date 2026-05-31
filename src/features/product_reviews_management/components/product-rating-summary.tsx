"use client";

import { Star } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { Progress } from "@/components/ui/progress";

interface ProductRatingSummaryProps {
  product_id: string;
}

export function ProductRatingSummary({ product_id }: ProductRatingSummaryProps) {
  const { data: summary, isLoading } = trpc.reviews.summaryByProduct.useQuery({ product_id });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse bg-[#fff3e3]/20 p-6 rounded-2xl border border-secondary/15">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-10 bg-muted rounded w-1/4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const totalReviews = summary.review_count;

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#4d4c20]/15 shadow-sm font-moya space-y-6">
      <h3 className="font-orla text-lg text-[#4d4c20]">Avis des clients</h3>

      <div className="flex items-center gap-6">
        {/* Big Number */}
        <div className="text-center">
          <div className="font-orla text-4xl text-[#700145] font-bold">
            {summary.average_rating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-0.5 mt-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${
                  i < Math.round(summary.average_rating) ? "fill-yellow-500" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-secondary/60 mt-1">{totalReviews} avis</p>
        </div>

        {/* Separator */}
        <div className="h-16 w-px bg-[#4d4c20]/10" />

        {/* Star breakdown progress bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.breakdown.find((b) => b.stars === stars)?.count ?? 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="text-secondary font-semibold w-3 text-right">{stars}</span>
                <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                <Progress
                  value={percentage}
                  className="h-2 flex-1 bg-secondary/10"
                />
                <span className="text-secondary/60 w-8 text-right font-medium">
                  {Math.round(percentage)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default ProductRatingSummary;
