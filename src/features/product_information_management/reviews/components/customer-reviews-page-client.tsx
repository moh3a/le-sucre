"use client";

import { useTranslations } from "next-intl";
import { Star, Clock, CheckCircle2, FileText } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewsPageSkeleton } from "./reviews-page-skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

export function CustomerReviewsPageClient() {
  const t = useTranslations("reviews");
  const { data, isLoading, error } = trpc.reviews.myReviews.useQuery({ page: 1, limit: 20 });

  const reviews = data?.items ?? [];

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<ReviewsPageSkeleton />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("page_title")}</h2>
          <Badge variant="outline">{t("page_review_count", { count: reviews.length })}</Badge>
        </div>

        {reviews.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("no_reviews_customer")}</EmptyTitle>
              <EmptyDescription>{t("share_experience")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.title && <CardTitle className="text-lg">{review.title}</CardTitle>}
                    </div>
                    <Badge
                      variant={
                        review.status === "approved"
                          ? "default"
                          : review.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {review.status === "approved"
                        ? t("approved_badge")
                        : review.status === "pending"
                          ? t("pending_badge")
                          : t("rejected_badge")}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(review.created_at, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("verified_purchase_badge")}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{review.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </QueryGuard>
  );
}
