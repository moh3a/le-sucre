"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2, Route, ToggleLeft, ToggleRight, Plus } from "lucide-react";
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
  DialogFooter,
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
import { Separator } from "@/components/ui/separator";
import { StatsGrid } from "@/components/console/stats-grid";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";
import { useUndoAction } from "@/hooks/use-undo-action";

// ─── Types ────────────────────────────────────────────────────────────────

type Condition = { field: string; operator: string; value: string };

type RoutingRuleRow = {
  id: string;
  name: string;
  priority: number;
  conditions: Condition[];
  assign_to_user_id?: string | null;
  assign_to_role?: string | null;
  is_active: boolean;
  created_at?: string | Date | null;
};

// ─── Constants ────────────────────────────────────────────────────────────

const CONDITION_FIELDS = [
  "total",
  "status",
  "customer_id",
  "shipping_address",
  "payment_method",
] as const;

const OPERATORS = [
  "equals",
  "not_equals",
  "contains",
  "greater_than",
  "less_than",
  "in",
  "not_in",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────

function field_key(v: string): string {
  const map: Record<string, string> = {
    total: "field_total",
    status: "field_status",
    customer_id: "field_customer_id",
    shipping_address: "field_shipping_address",
    payment_method: "field_payment_method",
  };
  return map[v] ?? v;
}

function operator_key(v: string): string {
  const map: Record<string, string> = {
    equals: "operator_equals",
    not_equals: "operator_not_equals",
    contains: "operator_contains",
    greater_than: "operator_greater_than",
    less_than: "operator_less_than",
    in: "operator_in",
    not_in: "operator_not_in",
  };
  return map[v] ?? v;
}

// ─── Conditions Builder ───────────────────────────────────────────────────

function ConditionsBuilder({
  conditions,
  onChange,
}: {
  conditions: Condition[];
  onChange: (c: Condition[]) => void;
}) {
  const t = useTranslations("routing_rules");

  function add() {
    onChange([...conditions, { field: "total", operator: "equals", value: "" }]);
  }

  function remove(index: number) {
    onChange(conditions.filter((_, i) => i !== index));
  }

  function update(index: number, patch: Partial<Condition>) {
    onChange(conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  return (
    <div className="space-y-3">
      {conditions.map((cond, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
          <div className="space-y-1">
            {i === 0 && <Label className="text-xs">{t("condition_field")}</Label>}
            <Select value={cond.field} onValueChange={(v) => update(i, { field: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_FIELDS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {t(field_key(f))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            {i === 0 && <Label className="text-xs">{t("condition_operator")}</Label>}
            <Select value={cond.operator} onValueChange={(v) => update(i, { operator: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map((op) => (
                  <SelectItem key={op} value={op}>
                    {t(operator_key(op))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            {i === 0 && <Label className="text-xs">{t("condition_value")}</Label>}
            <Input
              value={cond.value}
              onChange={(e) => update(i, { value: e.target.value })}
              placeholder={t("condition_value")}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-auto"
            onClick={() => remove(i)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 size-4" />
        {t("add_condition")}
      </Button>
    </div>
  );
}

// ─── Rule Form Content ────────────────────────────────────────────────────

function RuleDialogContent({
  rule,
  onOpenChange,
}: {
  rule?: RoutingRuleRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("routing_rules");
  const is_edit = !!rule;
  const utils = trpc.useUtils();

  const [name, setName] = useState(rule?.name ?? "");
  const [priority, setPriority] = useState(rule?.priority ?? 100);
  const [conditions, setConditions] = useState<Condition[]>(rule?.conditions ?? []);
  const [assign_to_role, setAssignToRole] = useState(rule?.assign_to_role ?? "");
  const [assign_to_user_id, setAssignToUserId] = useState(rule?.assign_to_user_id ?? "");

  const create = trpc.operationsWorkflows.routingRuleCreate.useMutation({
    onSuccess: () => {
      toast.success(t("create_success"));
      utils.operationsWorkflows.routingRulesList.invalidate();
      onOpenChange(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setName("");
    setPriority(100);
    setConditions([]);
    setAssignToRole("");
    setAssignToUserId("");
  }

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error(t("fill_required"));
      return;
    }
    create.mutate({
      name,
      priority: Number(priority),
      conditions,
      assign_to_role: assign_to_role || undefined,
      assign_to_user_id: assign_to_user_id || undefined,
    });
  }

  return (
    <form onSubmit={handle_submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("rule_name_label")}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("rule_name_placeholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("priority_label")}</Label>
          <Input
            type="number"
            min={1}
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            placeholder={t("priority_placeholder")}
            required
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>{t("conditions_label")}</Label>
        <ConditionsBuilder conditions={conditions} onChange={setConditions} />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("assign_to_role_label")}</Label>
          <Input
            value={assign_to_role}
            onChange={(e) => setAssignToRole(e.target.value)}
            placeholder={t("assign_to_role_placeholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("assign_to_user_label")}</Label>
          <Input
            value={assign_to_user_id}
            onChange={(e) => setAssignToUserId(e.target.value)}
            placeholder={t("assign_to_user_placeholder")}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={create.isPending}>
        {is_edit ? t("save_button") : t("create_rule")}
      </Button>
    </form>
  );
}

// ─── Self-Contained Create Dialog ─────────────────────────────────────────

export function CreateRoutingRuleDialog() {
  const t = useTranslations("routing_rules");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Route className="mr-1 size-4" />
          {t("add_rule")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("create_title")}</DialogTitle>
        </DialogHeader>
        <RuleDialogContent onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────

function DeleteRuleDialog({
  rule,
  onOpenChange,
}: {
  rule: RoutingRuleRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("routing_rules");
  const utils = trpc.useUtils();
  const { execute_with_undo } = useUndoAction();

  const del = trpc.operationsWorkflows.routingRuleDelete.useMutation({
    onSuccess: () => {
      execute_with_undo({
        description: rule?.name ?? rule?.id ?? "",
        execute: async () => {
          await utils.operationsWorkflows.routingRulesList.invalidate();
        },
        rollback: async () => {
          await utils.operationsWorkflows.routingRulesList.invalidate();
        },
        undoTimeoutMs: 8_000,
      });
      toast.success(t("delete_success"));
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={!!rule} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("delete_confirm_title")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t("delete_confirm")}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={del.isPending}
            onClick={() => {
              if (rule) del.mutate({ id: rule.id });
            }}
          >
            {t("delete_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────

export function RoutingRulesClient() {
  const t = useTranslations("routing_rules");
  const utils = trpc.useUtils();

  const { data: rules, isLoading, error } =
    trpc.operationsWorkflows.routingRulesList.useQuery();

  const toggle = trpc.operationsWorkflows.routingRuleToggle.useMutation({
    onSuccess: () => {
      toast.success(t("toggle_success"));
      utils.operationsWorkflows.routingRulesList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const [delete_target, setDeleteTarget] = useState<RoutingRuleRow | null>(null);

  const rows: RoutingRuleRow[] = useMemo(
    () => (rules as RoutingRuleRow[]) ?? [],
    [rules],
  );

  const kpi = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.is_active).length;
    return { total, active, inactive: total - active };
  }, [rows]);

  const columns = useMemo<ColumnDef<RoutingRuleRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("name")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("priority")} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.priority}</Badge>
        ),
      },
      {
        accessorKey: "conditions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("conditions")} />
        ),
        cell: ({ row }) => {
          const conds = row.original.conditions;
          if (!conds || conds.length === 0) return "—";
          return (
            <span className="text-xs text-muted-foreground">
              {conds.length} condition(s)
            </span>
          );
        },
        sortingFn: (a, b) => a.original.conditions.length - b.original.conditions.length,
      },
      {
        id: "assign_to",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("assign_to")} />
        ),
        cell: ({ row }) => {
          const role = row.original.assign_to_role;
          const user = row.original.assign_to_user_id;
          if (role) return <Badge variant="secondary">{role}</Badge>;
          if (user) return <Badge variant="outline">{user.slice(0, 8)}</Badge>;
          return "—";
        },
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
          const rule = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  toggle.mutate({ id: rule.id, is_active: !rule.is_active })
                }
                disabled={toggle.isPending}
              >
                {rule.is_active ? (
                  <ToggleRight className="size-4" />
                ) : (
                  <ToggleLeft className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTarget(rule)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [t, toggle],
  );

  const { table } = useDataTable({
    data: rows,
    columns,
    pageCount: 1,
    queryKeys: {
      page: "rrPage",
      perPage: "rrPerPage",
      sort: "rrSort",
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
            { label: t("stats_total"), value: kpi.total, icon: Route, color: "info" },
            { label: t("stats_active"), value: kpi.active, icon: ToggleRight, color: "success" },
            { label: t("stats_inactive"), value: kpi.inactive, icon: ToggleLeft, color: "warning" },
          ]}
        />

        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </div>

      <DeleteRuleDialog
        rule={delete_target}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      />
    </QueryGuard>
  );
}
