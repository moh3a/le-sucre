"use client";

import * as React from "react";
import { Check, Star, ThumbsUp, AlertTriangle } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { ReviewStatus } from "../constants/review-status";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProductReviewsListProps {
  product_id: string;
}

export function ProductReviewsList({ product_id }: ProductReviewsListProps) {
  const [sort, setSort] = React.useState<ReviewStatus>("newest");
  const [page, setPage] = React.useState(1);

  const { data: reviewsData, isLoading } = trpc.reviews.listByProduct.useQuery({
    product_id,
    page,
    limit: 10,
    sort,
  });

  const utils = trpc.useUtils();

  const voteHelpfulMutation = trpc.reviews.voteHelpful.useMutation({
    onSuccess: () => {
      toast.success("Vote pris en compte !");
      utils.reviews.listByProduct.invalidate({ product_id });
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de voter.");
    },
  });

  const reportMutation = trpc.reviews.report.useMutation({
    onSuccess: () => {
      toast.success("Signalement envoyé. Merci de nous aider à maintenir la qualité des avis.");
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de signaler.");
    },
  });

  const reviews = reviewsData?.items ?? [];
  const meta = reviewsData?.meta;

  return (
    <QueryGuard query={{ isLoading }}>
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>
          Avis des gourmets <Badge>{meta?.total_records ?? 0}</Badge>
        </CardTitle>
        <Select
          value={sort}
          onValueChange={(v: string) => {
            setSort(v as ReviewStatus);
            setPage(1);
          }}
        >
          <SelectTrigger className="text-secondary w-[200px] rounded-xl border-[#4d4c20]/30 focus:ring-[#700145]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="newest">Plus récent</SelectItem>
            <SelectItem value="most_helpful">Plus utile</SelectItem>
            <SelectItem value="highest_rating">Note la plus haute</SelectItem>
            <SelectItem value="lowest_rating">Note la plus basse</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-secondary/60 py-10 text-center">
            Aucun avis publié pour le moment. Soyez le premier à donner votre avis !
          </p>
        ) : (
          <div className="space-y-6 divide-y divide-[#4d4c20]/10">
            {reviews.map((review, idx) => (
              <div key={review.id} className={`space-y-3 ${idx > 0 ? "pt-6" : ""}`}>
                {/* Star Rating and Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating ? "fill-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {review.is_verified_purchase && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 border-green-200 bg-green-50 px-2 py-0 text-xs font-semibold text-green-700 hover:bg-green-50"
                      >
                        <Check className="size-3" /> Achat vérifié
                      </Badge>
                    )}
                  </div>
                  <span className="text-secondary/40 text-xs font-medium">
                    {formatDate(review.created_at, { month: "short" })}
                  </span>
                </div>

                {/* Title & Review Content */}
                <div className="space-y-1">
                  {review.title && (
                    <h4 className="text-secondary text-base font-semibold">{review.title}</h4>
                  )}
                  <p className="text-secondary/80 text-sm leading-relaxed whitespace-pre-line">
                    {review.body}
                  </p>
                </div>

                {/* Author and Action buttons */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-secondary/60 font-semibold">
                    Par {review.author_name || "Client anonyme"}
                  </span>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => voteHelpfulMutation.mutate({ review_id: review.id })}
                      disabled={voteHelpfulMutation.isPending}
                      className="text-secondary/50 flex items-center gap-1 transition-colors hover:text-[#700145] focus:outline-none"
                    >
                      <ThumbsUp className="size-3.5" />
                      <span>Utile ({review.helpful_count})</span>
                    </button>

                    <button
                      onClick={() =>
                        reportMutation.mutate({ review_id: review.id, reason: "spam" })
                      }
                      disabled={reportMutation.isPending}
                      className="text-secondary/35 flex items-center gap-1 transition-colors hover:text-red-600 focus:outline-none"
                    >
                      <AlertTriangle className="size-3.5" />
                      <span>Signaler</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex justify-center gap-2 border-t border-[#4d4c20]/10 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border-[#4d4c20]/20"
            >
              Précédent
            </Button>
            <span className="text-secondary/60 self-center text-sm">
              Page {page} sur {meta.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
              disabled={page === meta.total_pages}
              className="rounded-xl border-[#4d4c20]/20"
            >
              Suivant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </QueryGuard>
  );
}
export default ProductReviewsList;
