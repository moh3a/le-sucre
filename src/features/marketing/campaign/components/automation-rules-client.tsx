"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  History,
  Layers,
  MoreHorizontal,
  PauseCircle,
  Play,
  Plus,
  Square,
  Trash2,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid, type StatItem } from "@/components/console/stats-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { useUndoAction } from "@/hooks/use-undo-action";
import { formatDate } from "@/lib/format";
import * as React from "react";

const TRIGGER_OPTIONS = [
  "campaign.activated",
  "campaign.ended",
  "campaign.paused",
  "campaign.flash_sale_starting",
  "campaign.flash_sale_ending",
  "campaign.analytics_threshold_met",
  "campaign.scheduled",
  "campaign.status_changed",
];

const ACTION_OPTIONS = [
  "send_email",
  "send_push",
  "create_order_promotion",
  "update_product_prices",
  "invalidate_cache",
  "dispatch_webhook",
  "trigger_sms",
];

interface Option {
  label: string;
  value: string;
}

const STATUS_OPTIONS: Option[] = [
  { value: "active", label: "status_active_label" },
  { value: "inactive", label: "status_inactive_label" },
];

type AutomationRuleRow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  campaign_type_filter: string | null;
  status_filter: string | null;
  config: Record<string, unknown>;
  is_active: boolean;
  priority: number;
  created_at: string;
};

type AutomationLogRow = {
  id: string;
  rule_id: string;
  campaign_id: string;
  trigger: string;
  action: string;
  status: string;
  result: Record<string, unknown> | null;
  created_at: string;
};

function FacetedFilter({
  title,
  options,
  icon: Icon,
  value,
  onChange,
  labels,
}: {
  title: string;
  options: Option[];
  icon?: React.ComponentType<{ className?: string }>;
  value?: string;
  onChange: (value: string | null) => void;
  labels?: (value: string) => string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {value ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              <XCircle className="size-4" />
            </div>
          ) : (
            Icon && <Icon className="size-4" />
          )}
          <span className="ml-2">{title}</span>
          {value && (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              <span className="ml-1">
                {labels ? labels(value) : options.find((o) => o.value === value)?.label}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <div className="p-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={value === option.value ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onChange(value === option.value ? null : option.value);
                setOpen(false);
              }}
            >
              {labels ? labels(option.value) : option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function logStatusVariant(status: string): "success" | "warning" | "destructive" | "outline" {
  if (status === "completed") return "success";
  if (status === "failed") return "destructive";
  if (status === "pending") return "warning";
  return "outline";
}

const rule_form_schema = z.object({
  name: z.string().min(1).max(255),
  trigger: z.string().min(1).max(64),
  action: z.string().min(1).max(64),
  priority: z.number().int().min(1).max(9999),
});

type RuleFormValues = z.infer<typeof rule_form_schema>;

function AutomationRuleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");
  const utils = trpc.useUtils();

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(rule_form_schema),
    defaultValues: {
      name: "",
      trigger: TRIGGER_OPTIONS[0],
      action: ACTION_OPTIONS[0],
      priority: 100,
    },
  });

  const create = trpc.campaigns.createAutomationRule.useMutation({
    onSuccess: () => {
      toast.success(t("rule_created"));
      utils.campaigns.automationRules.invalidate();
      utils.campaigns.automationLogs.invalidate();
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || t("rule_create_error"));
    },
  });

  const onSubmit = (values: RuleFormValues) => {
    create.mutate({
      name: values.name,
      trigger: values.trigger,
      action: values.action,
      config: {},
      priority: values.priority,
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("add_rule")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("automation_rules_subtitle")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{t("rule_name")}</FieldLabel>
                <Input placeholder={t("rule_name_placeholder")} {...field} />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="trigger"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{t("trigger")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="action"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{t("action")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="priority"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{t("priority_label")}</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={9999}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <ResponsiveDialogFooter>
            <ResponsiveDialogClose asChild>
              <Button variant="outline" type="button">
                {tc("cancel")}
              </Button>
            </ResponsiveDialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? tc("saving") : t("create_rule")}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ─── Logs tab content ─────────────────────────────────────────────────────────

function AutomationLogsTabContent() {
  const t = useTranslations("campaigns");
  const logsQuery = trpc.campaigns.automationLogs.useQuery({ limit: 20 });

  const completed = useMemo(
    () => logsQuery.data?.filter((log) => log.status === "completed").length ?? 0,
    [logsQuery.data],
  );
  const failed = useMemo(
    () => logsQuery.data?.filter((log) => log.status === "failed").length ?? 0,
    [logsQuery.data],
  );

  const stats: StatItem[] = [
    {
      label: t("automation_rules_recent_logs"),
      value: logsQuery.data?.length ?? 0,
      icon: History,
      color: "default",
    },
    {
      label: t("automation_logs_completed"),
      value: completed,
      icon: CheckCircle2,
      color: "success",
    },
    {
      label: t("automation_logs_failed"),
      value: failed,
      icon: XCircle,
      color: "error",
    },
  ];

  return (
    <QueryGuard
      query={{
        isLoading: logsQuery.isLoading,
        error: logsQuery.error,
        refetch: logsQuery.refetch,
      }}
      loadingFallback={
        <div className="space-y-4">
          <DataTableSkeleton columnCount={3} rowCount={2} />
          <DataTableSkeleton columnCount={5} rowCount={6} />
        </div>
      }
    >
      <StatsGrid items={stats} loading={logsQuery.isLoading} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="text-muted-foreground size-4" />
              {t("automation_logs")}
            </CardTitle>
            <CardDescription>{t("automation_logs_description")}</CardDescription>
          </div>
          <Badge variant="outline">{logsQuery.data?.length ?? 0}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {logsQuery.data?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("rule_column")}</TableHead>
                  <TableHead>{t("trigger")}</TableHead>
                  <TableHead>{t("action")}</TableHead>
                  <TableHead>{t("status_column")}</TableHead>
                  <TableHead className="text-right">{t("created_column")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsQuery.data.map((log: AutomationLogRow) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {log.rule_id}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.trigger}</TableCell>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant={logStatusVariant(log.status)}>
                        {log.status === "completed"
                          ? t("log_status_completed")
                          : log.status === "failed"
                            ? t("log_status_failed")
                            : log.status === "pending"
                              ? t("log_status_pending")
                              : log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(log.created_at, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground p-6 text-sm">{t("no_logs_yet")}</p>
          )}
        </CardContent>
      </Card>
    </QueryGuard>
  );
}

// ─── Rules tab content ────────────────────────────────────────────────────────

function AutomationRulesTabContent({
  dialogOpen,
  onDialogOpenChange,
}: {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");
  const { execute_with_undo } = useUndoAction();

  const rulesQuery = trpc.campaigns.automationRules.useQuery();
  const utils = trpc.useUtils();

  const [search, setSearch] = useQueryState("arSearch", parseAsString);
  const [status, setStatus] = useQueryState("arStatus", parseAsString);
  const [page, setPage] = useQueryState("arPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("arPerPage", parseAsInteger.withDefault(10));

  const toggle = trpc.campaigns.automationRuleToggle.useMutation({
    onSuccess: () => utils.campaigns.automationRules.invalidate(),
  });

  const del = trpc.campaigns.automationRuleDelete.useMutation();

  const rules = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data]);

  const filtered = useMemo(() => {
    let list = rules;
    const q = search?.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.trigger.toLowerCase().includes(q) ||
          r.action.toLowerCase().includes(q),
      );
    }
    if (status === "active") list = list.filter((r) => r.is_active);
    if (status === "inactive") list = list.filter((r) => !r.is_active);
    return list;
  }, [rules, search, status]);

  const active_count = rules.filter((r) => r.is_active).length;
  const inactive_count = rules.length - active_count;

  const stats: StatItem[] = [
    {
      label: t("automation_rules_total"),
      value: rules.length,
      icon: Layers,
      color: "info",
    },
    {
      label: t("automation_rules_active"),
      value: active_count,
      icon: Zap,
      color: "success",
    },
    {
      label: t("automation_rules_inactive"),
      value: inactive_count,
      icon: PauseCircle,
      color: "warning",
    },
  ];

  const columns = React.useMemo<ColumnDef<AutomationRuleRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("rule_column")} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-muted-foreground font-mono text-xs">
              {row.original.trigger} → {row.original.action}
            </span>
          </div>
        ),
      },
      {
        id: "trigger",
        accessorKey: "trigger",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("trigger")} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.trigger}
          </Badge>
        ),
      },
      {
        id: "action",
        accessorKey: "action",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("action")} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.original.action}
          </Badge>
        ),
      },
      {
        id: "priority",
        accessorKey: "priority",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("priority_label")} />
        ),
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.priority}</span>,
      },
      {
        id: "status",
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("status_column")} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "success" : "secondary"}>
            {row.original.is_active ? t("status_active_label") : t("status_inactive_label")}
          </Badge>
        ),
      },
      {
        id: "created_at",
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={t("created_column")} />
        ),
        cell: ({ row }) => formatDate(row.original.created_at, { day: "numeric", month: "short" }),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  toggle.mutate({ id: row.original.id, is_active: !row.original.is_active })
                }
              >
                {row.original.is_active ? (
                  <Square className="mr-2 size-4 text-amber-600" />
                ) : (
                  <Play className="mr-2 size-4 text-emerald-600" />
                )}
                {row.original.is_active ? t("rule_deactivate") : t("rule_activate")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  execute_with_undo({
                    description: row.original.name ?? row.original.id,
                    execute: async () => {
                      await del.mutateAsync({ id: row.original.id });
                      utils.campaigns.automationRules.invalidate();
                      utils.campaigns.automationLogs.invalidate();
                    },
                    rollback: async () => {
                      utils.campaigns.automationRules.invalidate();
                    },
                    undoTimeoutMs: 8_000,
                  });
                }}
              >
                <Trash2 className="mr-2 size-4" />
                {tc("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, tc, toggle, del, execute_with_undo, utils],
  );

  const page_count = Math.max(1, Math.ceil(filtered.length / per_page));
  const items = filtered.slice((page - 1) * per_page, (page - 1) * per_page + per_page);

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "arPage", perPage: "arPerPage", sort: "arSort" },
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  function bulkSetActive(is_active: boolean) {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    ids.forEach((id) => toggle.mutate({ id, is_active }));
  }

  function bulkDelete() {
    const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
    ids.forEach((id) => {
      execute_with_undo({
        description: id,
        execute: async () => {
          await del.mutateAsync({ id });
          utils.campaigns.automationRules.invalidate();
        },
        rollback: async () => {
          utils.campaigns.automationRules.invalidate();
        },
        undoTimeoutMs: 8_000,
      });
    });
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <QueryGuard
      query={{
        isLoading: rulesQuery.isLoading,
        error: rulesQuery.error,
        refetch: rulesQuery.refetch,
      }}
      loadingFallback={<DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />}
    >
      <StatsGrid items={stats} loading={rulesQuery.isLoading} />

      <DataTable table={table}>
        <DataTableAdvancedToolbar table={table}>
          <Input
            placeholder={t("search_campaigns")}
            value={search || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <FacetedFilter
            title={t("status_column")}
            options={STATUS_OPTIONS}
            icon={Workflow}
            value={status ?? undefined}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            labels={(value) =>
              value === "active" ? t("status_active_label") : t("status_inactive_label")
            }
          />
          <DataTableSortList table={table} />
        </DataTableAdvancedToolbar>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Badge variant="outline">{selectedCount}</Badge>
            <Button variant="secondary" size="sm" onClick={() => bulkSetActive(true)}>
              <Play className="mr-1 size-4" />
              {t("bulk_activate")}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => bulkSetActive(false)}>
              <Square className="mr-1 size-4" />
              {t("bulk_deactivate")}
            </Button>
            <Button variant="ghost" size="sm" onClick={bulkDelete}>
              <Trash2 className="mr-1 size-4" />
              {t("bulk_delete")}
            </Button>
          </div>
        )}
      </DataTable>

      <AutomationRuleDialog open={dialogOpen} onOpenChange={onDialogOpenChange} />
    </QueryGuard>
  );
}

// ─── Tabbed shell ─────────────────────────────────────────────────────────────

export function AutomationRulesClient() {
  const t = useTranslations("campaigns");
  const [tab, setTab] = useState("rules");
  const [dialogOpen, setDialogOpen] = useState(false);

  const actions: Record<string, React.ReactNode> = {
    rules: (
      <Button onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 size-4" />
        {t("add_rule")}
      </Button>
    ),
    logs: null,
  };

  return (
    <ConsolePageShell
      title={t("automation_rules")}
      subtitle={t("automation_rules_subtitle")}
      actions={actions[tab]}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="rules" className="gap-2">
            <Workflow className="size-4" />
            {t("rules")}
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="size-4" />
            {t("automation_logs")}
          </TabsTrigger>
        </TabsList>

        <Separator className="my-4" />

        <div className="mt-4">
          <TabsContent value="rules" className="mt-0 space-y-4">
            <AutomationRulesTabContent
              dialogOpen={dialogOpen}
              onDialogOpenChange={setDialogOpen}
            />
          </TabsContent>

          <TabsContent value="logs" className="mt-0 space-y-4">
            <AutomationLogsTabContent />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
