"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { format_currency } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────

type ReconciliationEntry = {
  id: string;
  order_id: string;
  amount: string | number;
  fee?: string | number | null;
  status: string;
  transaction_reference?: string | null;
  bank_reference?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at?: string | Date | null;
};

// ─── Reconciliation Client ────────────────────────────────────────────────

export function ReconciliationClient() {
  const t = useTranslations("procurement");
  const {
    data: entries,
    isLoading,
    error,
  } = trpc.operationsWorkflows.reconciliationList.useQuery();
  const {
    data: stats,
  } = trpc.operationsWorkflows.reconciliationStats.useQuery();
  const utils = trpc.useUtils();

  const match = trpc.operationsWorkflows.reconciliationMatch.useMutation({
    onSuccess: () => {
      utils.operationsWorkflows.reconciliationList.invalidate();
      utils.operationsWorkflows.reconciliationStats.invalidate();
    },
  });

  const flag =
    trpc.operationsWorkflows.reconciliationFlagDiscrepancy.useMutation({
      onSuccess: () => {
        utils.operationsWorkflows.reconciliationList.invalidate();
        utils.operationsWorkflows.reconciliationStats.invalidate();
      },
    });

  const [flag_target, setFlagTarget] = useState<ReconciliationEntry | null>(
    null,
  );

  const data: ReconciliationEntry[] = useMemo(
    () => (entries as ReconciliationEntry[]) ?? [],
    [entries],
  );

  const columns = useMemo<ColumnDef<ReconciliationEntry>[]>(
    () => [
      {
        accessorKey: "order_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("po_number")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {t("reconciliation_order", {
              id: row.original.order_id.slice(0, 8),
            })}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("po_total")} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {format_currency(Number(row.original.amount))}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("status")} />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const variants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
          > = {
            matched: "default",
            unmatched: "secondary",
            discrepancy: "destructive",
          };
          return (
            <Badge variant={variants[status] ?? "outline"}>
              {t(`reconciliation_${status}`)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "transaction_reference",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("notes")} />
        ),
        cell: ({ row }) => {
          const ref = row.original.transaction_reference;
          if (!ref) return "—";
          return t("reconciliation_ref", { reference: ref });
        },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("actions")} />
        ),
        cell: ({ row }) => {
          const entry = row.original;
          if (entry.status !== "unmatched") return null;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={match.isPending}
                onClick={() => match.mutate({ id: entry.id })}
              >
                {t("action_match")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setFlagTarget(entry)}
              >
                {t("action_flag")}
              </Button>
            </div>
          );
        },
      },
    ],
    [t, match],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    queryKeys: {
      page: "recPage",
      perPage: "recPerPage",
      sort: "recSort",
    },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t("reconciliation_matched")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {stats?.matched?.count ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {format_currency(Number(stats?.matched?.total ?? 0))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t("reconciliation_unmatched")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.unmatched?.count ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {format_currency(Number(stats?.unmatched?.total ?? 0))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {t("reconciliation_discrepancies")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {stats?.discrepancies ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </div>

      {flag_target && (
        <Dialog
          open={!!flag_target}
          onOpenChange={(v) => {
            if (!v) setFlagTarget(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("action_flag")}</DialogTitle>
            </DialogHeader>
            <FlagDiscrepancyForm
              entry={flag_target}
              onOpenChange={(v) => {
                if (!v) setFlagTarget(null);
              }}
              mutation={flag}
              promptText={t("reconciliation_flag_prompt")}
            />
          </DialogContent>
        </Dialog>
      )}
    </QueryGuard>
  );
}

// ─── Flag Discrepancy Form ────────────────────────────────────────────────

function FlagDiscrepancyForm({
  entry,
  onOpenChange,
  mutation,
  promptText,
}: {
  entry: ReconciliationEntry;
  onOpenChange: (v: boolean) => void;
  mutation: ReturnType<
    typeof trpc.operationsWorkflows.reconciliationFlagDiscrepancy.useMutation
  >;
  promptText: string;
}) {
  const [notes, setNotes] = useState("");

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) return;
    mutation.mutate(
      { id: entry.id, notes },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <form onSubmit={handle_submit} className="space-y-4">
      <div className="space-y-2">
        <Label>{promptText}</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={promptText}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {promptText}
      </Button>
    </form>
  );
}
