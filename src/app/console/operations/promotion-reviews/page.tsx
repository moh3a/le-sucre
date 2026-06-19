"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/components/providers/app-providers";
import { SimpleDataTable } from "@/components/console/simple-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

const STATUS_BADGES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

const FILTER_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Approuvé" },
  { value: "rejected", label: "Rejeté" },
];

export default function PromotionReviewsPageClient() {
  const [status_filter, set_status_filter] = useState("");

  const { data: stats, isLoading: stats_loading } = trpc.operations.promotionGetReviewStats.useQuery();
  const { data: reviews_data, isLoading: reviews_loading, refetch } = trpc.operations.promotionListReviews.useQuery({
    page: 1,
    limit: 100,
    status: status_filter || undefined,
  });

  const review_mutation = trpc.operations.promotionReview.useMutation({
    onSuccess: () => { refetch(); toast.success("Avis enregistré"); },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  if (stats_loading) return <Skeleton className="h-48 w-full" />;

  const items = reviews_data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Validations de promotions</h1>
        <p className="text-muted-foreground text-sm">Examiner et approuver ou rejeter les demandes de promotion</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approved ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rejected ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.pending ?? 0) + (stats?.approved ?? 0) + (stats?.rejected ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base font-medium">Demandes de validation</CardTitle>
          <div className="flex items-center gap-2">
            <select
              className="border-input bg-background ring-offset-background h-8 rounded-md border px-2 text-xs"
              value={status_filter}
              onChange={(e) => set_status_filter(e.target.value)}
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {reviews_loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SimpleDataTable
              columns={[
                { accessorKey: "promotion_id", header: "Promotion" },
                {
                  accessorKey: "review_type",
                  header: "Type",
                  cell: ({ row }) => {
                    const labels: Record<string, string> = {
                      approval: "Approbation",
                      modification: "Modification",
                      activation: "Activation",
                    };
                    return labels[row.original.review_type as string] ?? row.original.review_type;
                  },
                },
                {
                  accessorKey: "status",
                  header: "Statut",
                  cell: ({ row }) => (
                    <Badge variant={STATUS_BADGES[row.original.status as string]}>
                      {STATUS_LABELS[row.original.status as string] ?? row.original.status}
                    </Badge>
                  ),
                },
                { accessorKey: "requested_by_user_id", header: "Demandé par" },
                { accessorKey: "reviewer_user_id", header: "Validé par" },
                { accessorKey: "review_note", header: "Note" },
                {
                  accessorKey: "created_at",
                  header: "Date",
                  cell: ({ row }) => formatDate(row.original.created_at as string, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  }),
                },
                {
                  id: "actions",
                  header: "Actions",
                  cell: ({ row }) =>
                    row.original.status === "pending" ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-green-600"
                          onClick={() =>
                            review_mutation.mutate({ id: row.original.id as string, status: "approved", review_note: "Approuvé" })
                          }
                          disabled={review_mutation.isPending}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-red-500"
                          onClick={() =>
                            review_mutation.mutate({ id: row.original.id as string, status: "rejected", review_note: "Rejeté" })
                          }
                          disabled={review_mutation.isPending}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Rejeter
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    ),
                },
              ]}
              data={items}
              pageCount={reviews_data?.meta?.total_pages}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
