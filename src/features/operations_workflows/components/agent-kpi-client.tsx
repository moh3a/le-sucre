"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Package,
  Search,
  ShieldCheck,
  User,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsGrid } from "@/components/console/stats-grid";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";

// ─── Types ────────────────────────────────────────────────────────────────

type LeaderboardRow = {
  user_id: string;
  orders_processed: number;
  cases_resolved: number;
  tasks_completed: number;
  sla_breaches: number;
};

type AgentKPITotals = {
  orders_processed: number;
  orders_assigned: number;
  cases_resolved: number;
  tasks_completed: number;
  calls_made: number;
  sla_breaches: number;
};

// ─── Search Agent Dialog ──────────────────────────────────────────────────

export function SearchAgentDialog() {
  const t = useTranslations("agent_kpi");
  const [open, setOpen] = useState(false);
  const [user_id, setUserId] = useState("");

  function handleOpen() {
    if (!user_id.trim()) {
      toast.error(t("fill_required"));
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t("agent_id_label")}</Label>
          <Input
            placeholder={t("agent_id_placeholder")}
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            className="w-64"
          />
        </div>
        <Button onClick={handleOpen} disabled={!user_id.trim()}>
          <Search className="mr-1 size-4" />
          {t("search_button")}
        </Button>
      </div>

      <AgentDetailDialog user_id={user_id} open={open} onOpenChange={setOpen} />
    </>
  );
}

function AgentDetailDialog({
  user_id,
  open,
  onOpenChange,
}: {
  user_id: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("agent_kpi");

  const { data: agentKpi, isLoading } = trpc.operationsWorkflows.agentKPI.useQuery(
    { user_id, days: 30 },
    { enabled: open && user_id.length > 0 },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("agent_detail_title", { id: user_id.slice(0, 12) })}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">{t("loading")}</div>
        ) : agentKpi ? (
          <div className="space-y-4">
            <StatsGrid
              items={[
                { label: t("stat_orders_processed"), value: agentKpi.totals.orders_processed, icon: Package, color: "info" },
                { label: t("stat_orders_assigned"), value: agentKpi.totals.orders_assigned, icon: ClipboardList, color: "info" },
                { label: t("stat_cases_resolved"), value: agentKpi.totals.cases_resolved, icon: CheckCircle2, color: "success" },
                { label: t("stat_tasks_completed"), value: agentKpi.totals.tasks_completed, icon: CheckCircle2, color: "success" },
              ]}
            />
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-2xl font-bold">{agentKpi.days_covered}</p>
                <p className="text-xs text-muted-foreground">{t("days_covered")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(agentKpi.avg_response_time_minutes)} min</p>
                <p className="text-xs text-muted-foreground">{t("avg_response_time")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{agentKpi.totals.sla_breaches}</p>
                <p className="text-xs text-muted-foreground">{t("sla_breaches")}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("no_data")}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────

export function AgentKPIClient() {
  const t = useTranslations("agent_kpi");

  const {
    data: dashboard,
    isLoading: dashLoading,
    error: dashError,
  } = trpc.operationsWorkflows.agentKPIDashboard.useQuery({ days: 7 });

  const {
    data: operators,
    isLoading: lbLoading,
    error: lbError,
  } = trpc.operationsWorkflows.agentLeaderboard.useQuery({ role: "operator", days: 7 });

  const isLoading = dashLoading || lbLoading;
  const error = dashError || lbError;

  const leaderboardRows: LeaderboardRow[] = useMemo(
    () => (operators as LeaderboardRow[]) ?? [],
    [operators],
  );

  const kpi = useMemo(() => ({
    orders: dashboard?.total_orders_processed ?? 0,
    cases: dashboard?.total_cases_resolved ?? 0,
    tasks: dashboard?.total_tasks_completed ?? 0,
    breaches: dashboard?.total_sla_breaches ?? 0,
  }), [dashboard]);

  const columns = useMemo<ColumnDef<LeaderboardRow>[]>(
    () => [
      {
        id: "rank",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("rank")} />
        ),
        cell: ({ row }) => {
          const rank = row.index + 1;
          let color = "text-muted-foreground";
          if (rank === 1) color = "text-yellow-500";
          else if (rank === 2) color = "text-gray-400";
          else if (rank === 3) color = "text-orange-500";
          return (
            <span className={`font-bold tabular-nums ${color}`}>
              #{rank}
            </span>
          );
        },
        sortingFn: (a, b) => a.index - b.index,
      },
      {
        accessorKey: "user_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("agent")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.user_id.slice(0, 12)}</span>
        ),
      },
      {
        accessorKey: "orders_processed",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("orders_processed")} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums font-medium">{row.original.orders_processed}</span>
        ),
      },
      {
        accessorKey: "cases_resolved",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("cases_resolved")} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.cases_resolved}</span>
        ),
      },
      {
        accessorKey: "tasks_completed",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("tasks_completed")} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.tasks_completed}</span>
        ),
      },
      {
        accessorKey: "sla_breaches",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("sla_breaches")} />
        ),
        cell: ({ row }) => {
          const breaches = row.original.sla_breaches;
          return (
            <span className={`tabular-nums ${breaches > 0 ? "font-bold text-red-600" : ""}`}>
              {breaches}
            </span>
          );
        },
      },
    ],
    [t],
  );

  const { table } = useDataTable({
    data: leaderboardRows,
    columns,
    pageCount: 1,
    queryKeys: {
      page: "akpiPage",
      perPage: "akpiPerPage",
      sort: "akpiSort",
    },
    getRowId: (row) => row.user_id,
  });

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<DataTableSkeleton columnCount={6} rowCount={10} />}
    >
      <div className="space-y-4">
        <StatsGrid
          loading={isLoading}
          items={[
            { label: t("stats_orders_processed"), value: kpi.orders, icon: Package, color: "info" },
            { label: t("stats_cases_resolved"), value: kpi.cases, icon: ShieldCheck, color: "success" },
            { label: t("stats_tasks_completed"), value: kpi.tasks, icon: CheckCircle2, color: "success" },
            { label: t("stats_sla_breaches"), value: kpi.breaches, icon: AlertTriangle, color: "error" },
          ]}
        />

        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </div>
    </QueryGuard>
  );
}
