"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pencil, Clock, AlertTriangle, ShieldCheck, Settings } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatsGrid } from "@/components/console/stats-grid";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";

// ─── Types ────────────────────────────────────────────────────────────────

type SLADefinitionRow = {
  id: string;
  entity_type: string;
  priority: string;
  response_hours: number;
  resolution_hours: number;
  escalation_minutes: number;
  escalate_to_role?: string | null;
  is_active: boolean;
  created_at?: string | Date | null;
};

// ─── Constants ────────────────────────────────────────────────────────────

const ENTITY_TYPES = ["order", "support_case", "return", "refund", "task"] as const;
const PRIORITIES = ["critical", "high", "medium", "low"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────

function entity_type_key(v: string): string {
  const map: Record<string, string> = {
    order: "entity_order",
    support_case: "entity_support_case",
    return: "entity_return",
    refund: "entity_refund",
    task: "entity_task",
  };
  return map[v] ?? v;
}

function priority_variant(
  p: string,
): "destructive" | "default" | "secondary" | "outline" {
  const map: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
    critical: "destructive",
    high: "default",
    medium: "secondary",
    low: "outline",
  };
  return map[p] ?? "outline";
}

function priority_key(v: string): string {
  const map: Record<string, string> = {
    critical: "priority_critical",
    high: "priority_high",
    medium: "priority_medium",
    low: "priority_low",
  };
  return map[v] ?? v;
}

// ─── Create / Edit SLA Dialog ─────────────────────────────────────────────

function SLADialogContent({
  definition,
  onOpenChange,
}: {
  definition?: SLADefinitionRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("sla");
  const is_edit = !!definition;
  const utils = trpc.useUtils();

  const [entity_type, setEntityType] = useState(definition?.entity_type ?? "order");
  const [priority, setPriority] = useState(definition?.priority ?? "medium");
  const [response_hours, setResponseHours] = useState(definition?.response_hours ?? 1);
  const [resolution_hours, setResolutionHours] = useState(definition?.resolution_hours ?? 24);
  const [escalation_minutes, setEscalationMinutes] = useState(definition?.escalation_minutes ?? 30);
  const [escalate_to_role, setEscalateToRole] = useState(definition?.escalate_to_role ?? "");

  const create = trpc.operationsWorkflows.slaCreateDefinition.useMutation({
    onSuccess: () => {
      toast.success(t("create_success"));
      utils.operationsWorkflows.slaDefinitionsList.invalidate();
      utils.operationsWorkflows.slaStats.invalidate();
      onOpenChange(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setEntityType("order");
    setPriority("medium");
    setResponseHours(1);
    setResolutionHours(24);
    setEscalationMinutes(30);
    setEscalateToRole("");
  }

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!entity_type || !priority) {
      toast.error(t("fill_required"));
      return;
    }
    create.mutate({
      entity_type,
      priority,
      response_hours: Number(response_hours),
      resolution_hours: Number(resolution_hours),
      escalation_minutes: Number(escalation_minutes),
      escalate_to_role: escalate_to_role || undefined,
    });
  }

  return (
    <form onSubmit={handle_submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("entity_type_label")}</Label>
          <Select value={entity_type} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue placeholder={t("entity_type_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((et) => (
                <SelectItem key={et} value={et}>
                  {t(entity_type_key(et))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("priority_label")}</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder={t("priority_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {t(priority_key(p))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("response_hours_label")}</Label>
          <Input
            type="number"
            min={0}
            step={0.5}
            value={response_hours}
            onChange={(e) => setResponseHours(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("resolution_hours_label")}</Label>
          <Input
            type="number"
            min={0}
            step={0.5}
            value={resolution_hours}
            onChange={(e) => setResolutionHours(Number(e.target.value))}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("escalation_minutes_label")}</Label>
          <Input
            type="number"
            min={0}
            value={escalation_minutes}
            onChange={(e) => setEscalationMinutes(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("escalate_to_role_label")}</Label>
          <Input
            value={escalate_to_role}
            onChange={(e) => setEscalateToRole(e.target.value)}
            placeholder={t("escalate_to_role_placeholder")}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {is_edit ? t("save_button") : t("create_button")}
      </Button>
    </form>
  );
}

// ─── Self-Contained Create Dialog ─────────────────────────────────────────

export function CreateSLADialog() {
  const t = useTranslations("sla");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Settings className="mr-1 size-4" />
          {t("create_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create_title")}</DialogTitle>
        </DialogHeader>
        <SLADialogContent onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────

function EditSLADialog({
  definition,
  onOpenChange,
}: {
  definition: SLADefinitionRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("sla");

  return (
    <Dialog open={!!definition} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("edit_title")}</DialogTitle>
        </DialogHeader>
        {definition && (
          <SLADialogContent
            key={definition.id}
            definition={definition}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────

export function SLAClient() {
  const t = useTranslations("sla");

  const { data: definitions, isLoading, error } =
    trpc.operationsWorkflows.slaDefinitionsList.useQuery();

  const [edit_def, setEditDef] = useState<SLADefinitionRow | null>(null);

  const rows: SLADefinitionRow[] = useMemo(
    () => (definitions as SLADefinitionRow[]) ?? [],
    [definitions],
  );

  const kpi = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.is_active).length;
    const avg_response = total > 0
      ? rows.reduce((s, r) => s + r.response_hours, 0) / total
      : 0;
    const avg_resolution = total > 0
      ? rows.reduce((s, r) => s + r.resolution_hours, 0) / total
      : 0;
    return { total, active, avg_response, avg_resolution };
  }, [rows]);

  const columns = useMemo<ColumnDef<SLADefinitionRow>[]>(
    () => [
      {
        accessorKey: "entity_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("entity_type")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {t(entity_type_key(row.original.entity_type))}
          </span>
        ),
        filterFn: "equals",
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("priority")} />
        ),
        cell: ({ row }) => (
          <Badge variant={priority_variant(row.original.priority)}>
            {t(priority_key(row.original.priority))}
          </Badge>
        ),
        filterFn: "equals",
      },
      {
        accessorKey: "response_hours",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("response_hours")} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.response_hours}h</span>
        ),
      },
      {
        accessorKey: "resolution_hours",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("resolution_hours")} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.resolution_hours}h</span>
        ),
      },
      {
        accessorKey: "escalation_minutes",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("escalation_minutes")} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.escalation_minutes}min</span>
        ),
      },
      {
        accessorKey: "escalate_to_role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("escalate_to_role")} />
        ),
        cell: ({ row }) => row.original.escalate_to_role ?? "—",
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("is_active")} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? t("active") : t("inactive")}
          </Badge>
        ),
        filterFn: "equals",
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("actions")} />
        ),
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditDef(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
        ),
      },
    ],
    [t],
  );

  const { table } = useDataTable({
    data: rows,
    columns,
    pageCount: 1,
    queryKeys: {
      page: "slaPage",
      perPage: "slaPerPage",
      sort: "slaSort",
    },
    getRowId: (row) => row.id,
  });

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<DataTableSkeleton columnCount={8} rowCount={10} />}
    >
      <div className="space-y-4">
        <StatsGrid
          loading={isLoading}
          items={[
            { label: t("stats_total"), value: kpi.total, icon: Settings, color: "info" },
            { label: t("stats_active"), value: kpi.active, icon: ShieldCheck, color: "success" },
            { label: t("stats_avg_response"), value: `${kpi.avg_response.toFixed(1)}h`, icon: Clock, color: "warning" },
            { label: t("stats_avg_resolution"), value: `${kpi.avg_resolution.toFixed(1)}h`, icon: AlertTriangle, color: "warning" },
          ]}
        />

        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </div>

      <EditSLADialog
        definition={edit_def}
        onOpenChange={(v) => {
          if (!v) setEditDef(null);
        }}
      />
    </QueryGuard>
  );
}
