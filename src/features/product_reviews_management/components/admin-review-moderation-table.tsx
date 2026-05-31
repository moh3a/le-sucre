"use client";

import * as React from "react";
import { Check, X, ShieldAlert, Star } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export function AdminReviewModerationTable() {
  const [page, setPage] = React.useState(1);
  const [note, setNote] = React.useState<Record<string, string>>({});

  const utils = trpc.useUtils();
  const { data: reviewsData, isLoading } = trpc.reviews.adminList.useQuery({
    page,
    limit: 20,
  });

  const moderateMutation = trpc.reviews.moderate.useMutation({
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "approved" ? "Avis approuvé avec succès !" : "Avis rejeté.",
      );
      utils.reviews.adminList.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Action de modération impossible.");
    },
  });

  const handleModerate = (review_id: string, status: "approved" | "rejected", comment?: string) => {
    moderateMutation.mutate({
      review_id,
      status,
      moderation_note: comment || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-muted h-10 w-full rounded" />
        <div className="bg-muted h-64 w-full rounded" />
      </div>
    );
  }

  const items = reviewsData?.items ?? [];
  const meta = reviewsData?.meta;

  return (
    <div className="font-moya space-y-6">
      <div className="border-secondary/20 overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/5 text-secondary">
            <TableRow>
              <TableHead className="py-3.5 text-xs font-semibold">Produit</TableHead>
              <TableHead className="py-3.5 text-xs font-semibold">Note</TableHead>
              <TableHead className="py-3.5 text-xs font-semibold">Avis</TableHead>
              <TableHead className="py-3.5 text-xs font-semibold">Date</TableHead>
              <TableHead className="py-3.5 text-xs font-semibold">Statut</TableHead>
              <TableHead className="py-3.5 text-xs font-semibold">Signalements</TableHead>
              <TableHead className="py-3.5 text-xs font-semibold">Note Interne</TableHead>
              <TableHead className="py-3.5 text-right text-xs font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-secondary/60 py-10 text-center">
                  Aucun avis à modérer.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-secondary/5 transition-colors">
                  <TableCell className="max-w-[150px] truncate text-xs font-medium">
                    {item.product?.slug || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${i < item.rating ? "fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px] space-y-1">
                    {item.title && (
                      <div className="text-secondary text-xs font-bold">{item.title}</div>
                    )}
                    <div className="text-secondary/80 line-clamp-2 text-xs">{item.body}</div>
                  </TableCell>
                  <TableCell className="text-secondary/60 text-xs whitespace-nowrap">
                    {formatDate(item.created_at, { month: "short" })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`px-2 py-0.5 text-[10px] font-semibold ${
                        item.status === "approved"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : item.status === "rejected"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-yellow-200 bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {item.status === "approved"
                        ? "Approuvé"
                        : item.status === "rejected"
                          ? "Rejeté"
                          : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.report_count > 0 ? (
                      <Badge
                        variant="destructive"
                        className="flex w-fit items-center gap-1 px-2 py-0.5 text-[10px]"
                      >
                        <ShieldAlert className="size-3" /> {item.report_count}
                      </Badge>
                    ) : (
                      <span className="text-secondary/40 text-xs font-semibold">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Commentaire interne..."
                      size={10}
                      value={note[item.id] ?? ""}
                      onChange={(e) => setNote({ ...note, [item.id]: e.target.value })}
                      className="border-secondary/30 h-8 max-w-[150px] text-xs focus-visible:ring-[#700145]"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleModerate(item.id, "approved", note[item.id])}
                        disabled={item.status === "approved" || moderateMutation.isPending}
                        className="size-8 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                      >
                        <Check className="size-4" />
                        <span className="sr-only">Approuver</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleModerate(item.id, "rejected", note[item.id])}
                        disabled={item.status === "rejected" || moderateMutation.isPending}
                        className="size-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="size-4" />
                        <span className="sr-only">Rejeter</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-secondary/20 rounded-xl"
          >
            Précédent
          </Button>
          <span className="text-secondary/60 self-center text-sm font-medium">
            Page {page} sur {meta.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
            disabled={page === meta.total_pages}
            className="border-secondary/20 rounded-xl"
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
export default AdminReviewModerationTable;
