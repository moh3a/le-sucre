"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, Clock, FileCheck, Settings, XCircle } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsGrid } from "@/components/console/stats-grid";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { useDataTable } from "@/features/data-table/use-data-table";

// ─── Types ────────────────────────────────────────────────────────────────

type ApprovalWorkflowRow = {
  id: string;
  name: string;
  entity_type: string;
  steps: Array<{ order: number; role: string; label: string }>;
  is_active: boolean;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
};

type ApprovalRequestRow = {
  id: string;
  workflow_id: string;
  entity_type: string;
  entity_id: string;
  requested_by_user_id: string;
  current_step: number;
  status: string;
  notes?: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
};

// ─── Constants ────────────────────────────────────────────────────────────

const ENTITY_TYPES = ["order", "product", "promotion", "return", "refund", "supplier"] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
};

// ─── Create Workflow Dialog ───────────────────────────────────────────────

function CreateWorkflowDialogContent({ onOpenChange }: { onOpenChange: (v: boolean) => void }) {
  const t = useTranslations("approval_workflows");
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [entity_type, setEntityType] = useState("order");
  const [step_count, setStepCount] = useState(2);
  const [steps, setSteps] = useState<Array<{ role: string; label: string }>>([
    { role: "reviewer", label: "Review" },
    { role: "admin", label: "Final Approval" },
  ]);

  const create = trpc.operationsWorkflows.approvalWorkflowCreate.useMutation({
    onSuccess: () => {
      toast.success(t("create_success"));
      utils.operationsWorkflows.approvalWorkflowsList.invalidate();
      onOpenChange(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setName("");
    setEntityType("order");
    setStepCount(2);
    setSteps([
      { role: "reviewer", label: "Review" },
      { role: "admin", label: "Final Approval" },
    ]);
  }

  function updateStepCount(count: number) {
    setStepCount(count);
    setSteps((prev) => {
      const next = [...prev];
      while (next.length < count) {
        next.push({ role: "", label: "" });
      }
      return next.slice(0, count);
    });
  }

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !entity_type) {
      toast.error(t("fill_required"));
      return;
    }
    create.mutate({
      name,
      entity_type,
      steps: steps.map((s, i) => ({ order: i, ...s })),
    });
  }

  return (
    <form onSubmit={handle_submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("name_label")}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("workflow_name_placeholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("entity_type_label")}</Label>
          <Input
            value={entity_type}
            onChange={(e) => setEntityType(e.target.value)}
            placeholder={t("entity_type_placeholder")}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("steps_count_label")}</Label>
        <Input
          type="number"
          min={1}
          max={10}
          value={step_count}
          onChange={(e) => updateStepCount(Number(e.target.value))}
        />
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              {i === 0 && <Label className="text-xs">{t("step_role_label")}</Label>}
              <Input
                value={step.role}
                onChange={(e) => {
                  const next = [...steps];
                  next[i] = { ...next[i], role: e.target.value };
                  setSteps(next);
                }}
                placeholder={t("step_role_placeholder")}
              />
            </div>
            <div className="space-y-1">
              {i === 0 && <Label className="text-xs">{t("step_label_label")}</Label>}
              <Input
                value={step.label}
                onChange={(e) => {
                  const next = [...steps];
                  next[i] = { ...next[i], label: e.target.value };
                  setSteps(next);
                }}
                placeholder={t("step_label_placeholder")}
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={create.isPending}>
        {t("create")}
      </Button>
    </form>
  );
}

export function CreateWorkflowDialog() {
  const t = useTranslations("approval_workflows");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Settings className="mr-1 size-4" />
          {t("new_workflow")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("create_title")}</DialogTitle>
        </DialogHeader>
        <CreateWorkflowDialogContent onOpenChange={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

// ─── Approve / Reject Dialogs ─────────────────────────────────────────────

function ApproveDialog({
  request,
  onOpenChange,
}: {
  request: ApprovalRequestRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("approval_workflows");
  const utils = trpc.useUtils();
  const [comment, setComment] = useState("");

  const approve = trpc.operationsWorkflows.approvalApproveStep.useMutation({
    onSuccess: () => {
      toast.success(t("approve_success"));
      utils.operationsWorkflows.approvalRequestsList.invalidate();
      onOpenChange(false);
      setComment("");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("approve_title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("approve_description")}</p>
          <div className="space-y-2">
            <Label>{t("comment_label")}</Label>
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("comment_placeholder")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              disabled={approve.isPending}
              onClick={() => {
                if (request) approve.mutate({ request_id: request.id, comment: comment || undefined });
              }}
            >
              {t("approve")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({
  request,
  onOpenChange,
}: {
  request: ApprovalRequestRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useTranslations("approval_workflows");
  const utils = trpc.useUtils();
  const [comment, setComment] = useState("");

  const reject = trpc.operationsWorkflows.approvalReject.useMutation({
    onSuccess: () => {
      toast.success(t("reject_success"));
      utils.operationsWorkflows.approvalRequestsList.invalidate();
      onOpenChange(false);
      setComment("");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("reject_title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("reject_description")}</p>
          <div className="space-y-2">
            <Label>{t("comment_label")}</Label>
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("comment_placeholder")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={reject.isPending}
              onClick={() => {
                if (request) reject.mutate({ request_id: request.id, comment: comment || undefined });
              }}
            >
              {t("reject")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────

export function ApprovalWorkflowsClient() {
  const t = useTranslations("approval_workflows");
  const utils = trpc.useUtils();

  const { data: workflows, isLoading: wfLoading, error: wfError } =
    trpc.operationsWorkflows.approvalWorkflowsList.useQuery();

  const { data: requests, isLoading: reqLoading, error: reqError } =
    trpc.operationsWorkflows.approvalRequestsList.useQuery();

  const isLoading = wfLoading || reqLoading;
  const error = wfError || reqError;

  const [approveTarget, setApproveTarget] = useState<ApprovalRequestRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ApprovalRequestRow | null>(null);

  const workflowRows: ApprovalWorkflowRow[] = useMemo(
    () => (workflows as ApprovalWorkflowRow[]) ?? [],
    [workflows],
  );

  const requestRows: ApprovalRequestRow[] = useMemo(
    () => (requests as ApprovalRequestRow[]) ?? [],
    [requests],
  );

  const kpi = useMemo(() => {
    const total_wf = workflowRows.length;
    const active_wf = workflowRows.filter((w) => w.is_active).length;
    const pending = requestRows.filter((r) => r.status === "pending").length;
    const approved = requestRows.filter((r) => r.status === "approved").length;
    return { total_wf, active_wf, pending, approved };
  }, [workflowRows, requestRows]);

  const workflowColumns = useMemo<ColumnDef<ApprovalWorkflowRow>[]>(
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
        accessorKey: "entity_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("entity_type")} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.entity_type}</Badge>
        ),
        filterFn: "equals",
      },
      {
        id: "steps",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("steps")} />
        ),
        cell: ({ row }) => {
          const steps = row.original.steps;
          return (
            <span className="text-xs text-muted-foreground">
              {t("steps_label", { count: steps?.length ?? 0 })}
            </span>
          );
        },
        sortingFn: (a, b) =>
          (a.original.steps?.length ?? 0) - (b.original.steps?.length ?? 0),
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
    ],
    [t],
  );

  const requestColumns = useMemo<ColumnDef<ApprovalRequestRow>[]>(
    () => [
      {
        accessorKey: "entity_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("entity_type")} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.entity_type}</Badge>
        ),
        filterFn: "equals",
      },
      {
        accessorKey: "entity_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("entity_id")} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.entity_id.slice(0, 12)}</span>
        ),
      },
      {
        accessorKey: "current_step",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("current_step")} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.current_step + 1}</span>
        ),
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
          const req = row.original;
          if (req.status !== "pending") return "—";
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setApproveTarget(req)}
              >
                <CheckCircle2 className="size-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRejectTarget(req)}
              >
                <XCircle className="size-4 text-red-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [t],
  );

  const { table: workflowTable } = useDataTable({
    data: workflowRows,
    columns: workflowColumns,
    pageCount: 1,
    queryKeys: {
      page: "awfPage",
      perPage: "awfPerPage",
      sort: "awfSort",
    },
    getRowId: (row) => row.id,
  });

  const { table: requestTable } = useDataTable({
    data: requestRows,
    columns: requestColumns,
    pageCount: 1,
    queryKeys: {
      page: "awrPage",
      perPage: "awrPerPage",
      sort: "awrSort",
    },
    getRowId: (row) => row.id,
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
            { label: t("stats_total_workflows"), value: kpi.total_wf, icon: Settings, color: "info" },
            { label: t("stats_active_workflows"), value: kpi.active_wf, icon: FileCheck, color: "success" },
            { label: t("stats_pending_requests"), value: kpi.pending, icon: Clock, color: "warning" },
            { label: t("stats_approved_requests"), value: kpi.approved, icon: CheckCircle2, color: "success" },
          ]}
        />

        <Tabs defaultValue="workflows">
          <TabsList>
            <TabsTrigger value="workflows">{t("tab_workflows")}</TabsTrigger>
            <TabsTrigger value="requests">{t("tab_requests")}</TabsTrigger>
          </TabsList>
          <TabsContent value="workflows">
            <DataTable table={workflowTable}>
              <DataTableAdvancedToolbar table={workflowTable}>
                <DataTableSortList table={workflowTable} />
              </DataTableAdvancedToolbar>
            </DataTable>
          </TabsContent>
          <TabsContent value="requests">
            <DataTable table={requestTable}>
              <DataTableAdvancedToolbar table={requestTable}>
                <DataTableSortList table={requestTable} />
              </DataTableAdvancedToolbar>
            </DataTable>
          </TabsContent>
        </Tabs>
      </div>

      <ApproveDialog
        request={approveTarget}
        onOpenChange={(v) => {
          if (!v) setApproveTarget(null);
        }}
      />
      <RejectDialog
        request={rejectTarget}
        onOpenChange={(v) => {
          if (!v) setRejectTarget(null);
        }}
      />
    </QueryGuard>
  );
}
