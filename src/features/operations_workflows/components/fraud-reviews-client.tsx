"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatsGrid } from "@/components/console/stats-grid";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";

// ─── Types ────────────────────────────────────────────────────────────────

type FraudFlag = {
  rule: string;
  reason: string;
  severity: "low" | "medium" | "high";
};

type FraudReviewRow = {
  id: string;
  order_id: string;
  risk_score: number;
  flags: FraudFlag[];
  status: string;
  reviewed_by_user_id?: string | null;
  decision?: string | null;
  decision_reason?: string | null;
  reviewed_at?: string | Date | null;
  created_at?: string | Date | null;
};

// ─── Constants ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  cleared: "default",
  blocked: "destructive",
  manual_review: "secondary",
};

const SEVERITY_VARIANT: Record<string, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

// ─── Screen Order Dialog ──────────────────────────────────────────────────

function ScreenOrderDialogContent({ onOpenChange }: { onOpenChange: (v: boolean) => void }) {
  const t = useTranslations("fraud_reviews");
  const utils = trpc.useUtils();
  const [order_id, setOrderId] = useState("");

  const screen = trpc.operationsWorkflows.fraudScreenOrder.useMutation({
    onSuccess: (data) => {
      if (data) {
        toast.success(t("screen_success"));
      } else {
        toast.error(t("screen_not_found"));
      }
      utils.operationsWorkflows.fraudReviewsList.invalidate();
      utils.operationsWorkflows.fraudReviewStats.invalidate();
      onOpenChange(false);
      setOrderId("");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!order_id) {
          toast.error(t("fill_required"));
          return;
        }
        screen.mutate({ order_id });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>{t("order_id_label")}</Label>
        <Input
          value={order_id}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder={t("order_id_placeholder")}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={screen.isPending}>
        {t("screen_button")}
      </Button>
    </form>
  );
}

export function ScreenOrderDialog() {
  const t = useTranslations("fraud_reviews");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShieldAlert className="mr-1 size-4" />
          {t("screen_order")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("screen_title")}</DialogTitle>
        </DialogHeader>
        <ScreenOrderDialogContent onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

// ─── Review Decision Dialog ───────────────────────────────────────────────

function ReviewDecisionDialog({
  review,
  decision,
  onOpenChange,
}: {
  review: FraudReviewRow | null;
  decision: "approved" | "rejected" | "review";
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("fraud_reviews");
  const utils = trpc.useUtils();
  const [reason, setReason] = useState("");

  const reviewMutation = trpc.operationsWorkflows.fraudReview.useMutation({
    onSuccess: () => {
      toast.success(t("decision_success"));
      utils.operationsWorkflows.fraudReviewsList.invalidate();
      utils.operationsWorkflows.fraudReviewStats.invalidate();
      onOpenChange(false);
      setReason("");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={!!review} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t(`decision_${decision}_title`)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t(`decision_${decision}_description`)}
          </p>
          <div className="space-y-2">
            <Label>{t("reason_label")}</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reason_placeholder")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant={decision === "rejected" ? "destructive" : "default"}
              disabled={reviewMutation.isPending}
              onClick={() => {
                if (review) {
                  reviewMutation.mutate({
                    id: review.id,
                    decision,
                    decision_reason: reason || t(`decision_${decision}_default_reason`),
                  });
                }
              }}
            >
              {t(`decision_${decision}_button`)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────

export function FraudReviewsClient() {
  const t = useTranslations("fraud_reviews");
  const utils = trpc.useUtils();

  const { data: allReviews, isLoading, error } =
    trpc.operationsWorkflows.fraudReviewsList.useQuery({});

  const { data: stats } =
    trpc.operationsWorkflows.fraudReviewStats.useQuery();

  const [reviewTarget, setReviewTarget] = useState<FraudReviewRow | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"approved" | "rejected" | "review">("approved");

  const rows: FraudReviewRow[] = useMemo(
    () => (allReviews as FraudReviewRow[]) ?? [],
    [allReviews],
  );

  const kpi = useMemo(() => ({
    pending: stats?.pending ?? 0,
    cleared: stats?.cleared ?? 0,
    blocked: stats?.blocked ?? 0,
    manual_review: stats?.manual_review ?? 0,
  }), [stats]);

  function openDecision(review: FraudReviewRow, decision: "approved" | "rejected" | "review") {
    setReviewTarget(review);
    setReviewDecision(decision);
  }

  const columns = useMemo<ColumnDef<FraudReviewRow>[]>(
    () => [
      {
        accessorKey: "order_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("order_id")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.order_id.slice(0, 12)}</span>
        ),
      },
      {
        accessorKey: "risk_score",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("risk_score")} />
        ),
        cell: ({ row }) => {
          const score = row.original.risk_score;
          let color = "text-green-600";
          if (score >= 70) color = "text-red-600";
          else if (score >= 40) color = "text-yellow-600";
          return (
            <span className={`font-bold tabular-nums ${color}`}>
              {score}
            </span>
          );
        },
        sortingFn: (a, b) => a.original.risk_score - b.original.risk_score,
      },
      {
        id: "flags",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("flags")} />
        ),
        cell: ({ row }) => {
          const flags = row.original.flags;
          if (!flags || flags.length === 0) return "—";
          return (
            <div className="flex flex-wrap gap-1">
              {flags.map((flag, i) => (
                <Badge key={i} variant={SEVERITY_VARIANT[flag.severity] ?? "outline"} className="text-xs">
                  {flag.rule}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("status")} />
        ),
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
            {t(`status_${row.original.status}`)}
          </Badge>
        ),
        filterFn: "equals",
      },
      {
        accessorKey: "decision",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("decision")} />
        ),
        cell: ({ row }) => {
          const d = row.original.decision;
          if (!d) return "—";
          return (
            <Badge variant={d === "approved" ? "default" : d === "rejected" ? "destructive" : "secondary"}>
              {t(`decision_${d}`)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("created_at")} />
        ),
        cell: ({ row }) => {
          const d = row.original.created_at;
          if (!d) return "—";
          return new Date(d).toLocaleDateString("fr-FR");
        },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("actions")} />
        ),
        cell: ({ row }) => {
          const review = row.original;
          if (review.status !== "pending") return "—";
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDecision(review, "approved")}
                title={t("decision_approved")}
              >
                <CheckCircle2 className="size-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDecision(review, "rejected")}
                title={t("decision_rejected")}
              >
                <XCircle className="size-4 text-red-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDecision(review, "review")}
                title={t("decision_review")}
              >
                <Eye className="size-4 text-orange-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [t],
  );

  const { table } = useDataTable({
    data: rows,
    columns,
    pageCount: 1,
    queryKeys: {
      page: "frPage",
      perPage: "frPerPage",
      sort: "frSort",
    },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} />}
    >
      <div className="space-y-4">
        <StatsGrid
          loading={isLoading}
          items={[
            { label: t("stats_pending"), value: kpi.pending, icon: Clock, color: "warning" },
            { label: t("stats_cleared"), value: kpi.cleared, icon: ShieldCheck, color: "success" },
            { label: t("stats_blocked"), value: kpi.blocked, icon: XCircle, color: "error" },
            { label: t("stats_manual_review"), value: kpi.manual_review, icon: Eye, color: "info" },
          ]}
        />

        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </div>

      <ReviewDecisionDialog
        review={reviewTarget}
        decision={reviewDecision}
        onOpenChange={(v) => {
          if (!v) setReviewTarget(null);
        }}
      />
    </QueryGuard>
  );
}
