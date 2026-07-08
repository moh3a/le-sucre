"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  Flag,
  Plus,
  Power,
  PowerOff,
  Trash2,
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/features/data-table/components/data-table";
import { DataTableColumnHeader } from "@/features/data-table/components/data-table-column-header";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { DataTableAdvancedToolbar } from "@/features/data-table/components/data-table-advanced-toolbar";
import { DataTableSortList } from "@/features/data-table/components/data-table-sort-list";
import { useDataTable } from "@/features/data-table/use-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { formatDate } from "@/lib/format";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";

type FeatureFlagRow = {
  id: string;
  key: string;
  name: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

function CreateFlagDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const t = useTranslations("feature_flags");
  const utils = trpc.useUtils();
  const [key, setKey] = React.useState("");
  const [fr_name, setFrName] = React.useState("");
  const [en_name, setEnName] = React.useState("");
  const [ar_name, setArName] = React.useState("");
  const [fr_desc, setFrDesc] = React.useState("");
  const [en_desc, setEnDesc] = React.useState("");
  const [ar_desc, setArDesc] = React.useState("");

  const create = trpc.featureFlags.create.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate();
      utils.featureFlags.stats.invalidate();
      toast.success(t("flag_created"));
      onOpenChange(false);
      reset();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setKey("");
    setFrName("");
    setEnName("");
    setArName("");
    setFrDesc("");
    setEnDesc("");
    setArDesc("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key || !fr_name || !en_name || !ar_name) {
      toast.error(t("fill_required"));
      return;
    }
    create.mutate({
      key,
      name: { fr: fr_name, en: en_name, ar: ar_name },
      description: { fr: fr_desc, en: en_desc, ar: ar_desc },
      enabled: false,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("new_flag_title")}</DialogTitle>
          <DialogDescription>
            {t("new_flag_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">{t("key_label")}</Label>
            <Input
              id="key"
              placeholder={t("key_placeholder")}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
            <p className="text-muted-foreground text-xs">
              {t("key_description")}
            </p>
          </div>
          <Separator />
          <p className="text-sm font-medium">{t("name_multilingual")}</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="fr_name">Français *</Label>
              <Input id="fr_name" value={fr_name} onChange={(e) => setFrName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="en_name">English *</Label>
              <Input id="en_name" value={en_name} onChange={(e) => setEnName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ar_name">العربية *</Label>
              <Input id="ar_name" value={ar_name} onChange={(e) => setArName(e.target.value)} required />
            </div>
          </div>
          <Separator />
          <p className="text-sm font-medium">{t("description_optional")}</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="fr_desc">Français</Label>
              <Input id="fr_desc" value={fr_desc} onChange={(e) => setFrDesc(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="en_desc">English</Label>
              <Input id="en_desc" value={en_desc} onChange={(e) => setEnDesc(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ar_desc">العربية</Label>
              <Input id="ar_desc" value={ar_desc} onChange={(e) => setArDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditFlagDialog({
  open,
  onOpenChange,
  flag,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  flag: FeatureFlagRow | null;
}) {
  const t = useTranslations("feature_flags");
  const utils = trpc.useUtils();
  const [fr_name, setFrName] = React.useState("");
  const [en_name, setEnName] = React.useState("");
  const [ar_name, setArName] = React.useState("");
  const [fr_desc, setFrDesc] = React.useState("");
  const [en_desc, setEnDesc] = React.useState("");
  const [ar_desc, setArDesc] = React.useState("");

  React.useEffect(() => {
    if (!flag) return;
    const raf = requestAnimationFrame(() => {
      setFrName(flag.name.fr);
      setEnName(flag.name.en);
      setArName(flag.name.ar);
      setFrDesc(flag.description?.fr ?? "");
      setEnDesc(flag.description?.en ?? "");
      setArDesc(flag.description?.ar ?? "");
    });
    return () => cancelAnimationFrame(raf);
  }, [flag]);

  const update = trpc.featureFlags.update.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate();
      utils.featureFlags.stats.invalidate();
      toast.success(t("flag_updated"));
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!flag) return;
    update.mutate({
      id: flag.id,
      name: { fr: fr_name, en: en_name, ar: ar_name },
      description: { fr: fr_desc, en: en_desc, ar: ar_desc },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("edit_flag_title")}</DialogTitle>
          <DialogDescription>
            {t("edit_flag_description", { key: flag?.key ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-medium">{t("name_multilingual")}</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit_fr_name">Français *</Label>
              <Input id="edit_fr_name" value={fr_name} onChange={(e) => setFrName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit_en_name">English *</Label>
              <Input id="edit_en_name" value={en_name} onChange={(e) => setEnName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit_ar_name">العربية *</Label>
              <Input id="edit_ar_name" value={ar_name} onChange={(e) => setArName(e.target.value)} required />
            </div>
          </div>
          <Separator />
          <p className="text-sm font-medium">{t("description_optional")}</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit_fr_desc">Français</Label>
              <Input id="edit_fr_desc" value={fr_desc} onChange={(e) => setFrDesc(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit_en_desc">English</Label>
              <Input id="edit_en_desc" value={en_desc} onChange={(e) => setEnDesc(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit_ar_desc">العربية</Label>
              <Input id="edit_ar_desc" value={ar_desc} onChange={(e) => setArDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? t("updating") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FeatureFlagListPage() {
  const t = useTranslations("feature_flags");
  const [page, setPage] = useQueryState("ffPage", parseAsInteger.withDefault(1));
  const [per_page] = useQueryState("ffPerPage", parseAsInteger.withDefault(20));
  const [search, setSearch] = useQueryState("ffSearch", parseAsString);

  const [create_open, setCreateOpen] = React.useState(false);
  const [edit_flag, setEditFlag] = React.useState<FeatureFlagRow | null>(null);
  const [delete_flag, setDeleteFlag] = React.useState<FeatureFlagRow | null>(null);

  const { data, isLoading } = trpc.featureFlags.list.useQuery({
    page,
    limit: per_page,
    search: search || undefined,
  });

  const { data: stats, isLoading: statsLoading } = trpc.featureFlags.stats.useQuery();

  const utils = trpc.useUtils();

  const toggle = trpc.featureFlags.toggle.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate();
      utils.featureFlags.stats.invalidate();
      toast.success(t("flag_status_updated"));
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.featureFlags.delete.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate();
      utils.featureFlags.stats.invalidate();
      toast.success(t("flag_deleted"));
      setDeleteFlag(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = React.useMemo<ColumnDef<FeatureFlagRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "key",
        accessorKey: "key",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("key_column")} />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-mono text-sm font-medium">{row.original.key}</span>
            <span className="text-muted-foreground text-xs">{row.original.name.fr}</span>
          </div>
        ),
      },
      {
        id: "enabled",
        accessorKey: "enabled",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("status_column")} />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.enabled}
              onCheckedChange={(checked) => toggle.mutate({ id: row.original.id, enabled: checked })}
            />
            <Badge variant={row.original.enabled ? "default" : "secondary"} className="text-xs">
              {row.original.enabled ? t("enabled_badge") : t("disabled_badge")}
            </Badge>
          </div>
        ),
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("description_column")} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-1 max-w-xs text-sm">
            {row.original.description?.fr || "—"}
          </span>
        ),
      },
      {
        id: "updated_at",
        accessorKey: "updated_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label={t("updated_column")} />,
        cell: ({ row }) =>
          row.original.updated_at
            ? formatDate(row.original.updated_at, { month: "short" })
            : "—",
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
              <DropdownMenuItem onClick={() => setEditFlag(row.original)}>
                <Pencil className="mr-2 size-4" />
                {t("edit_button")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toggle.mutate({ id: row.original.id, enabled: !row.original.enabled })}
              >
                {row.original.enabled ? (
                  <>
                    <PowerOff className="mr-2 size-4 text-amber-500" />
                    {t("deactivate_button")}
                  </>
                ) : (
                  <>
                    <Power className="mr-2 size-4 text-emerald-500" />
                    {t("activate_button")}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteFlag(row.original)}
              >
                <Trash2 className="mr-2 size-4" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [toggle, t],
  );

  const items = (data?.items ?? []) as FeatureFlagRow[];
  const page_count = data?.meta.totalPages ?? 0;

  const { table } = useDataTable({
    data: items,
    columns: columns as ColumnDef<(typeof items)[number]>[],
    pageCount: page_count,
    queryKeys: { page: "ffPage", perPage: "ffPerPage", sort: "ffSort" },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={
      <ConsolePageShell
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("create")}
          </Button>
        }
      >
        <DataTableSkeleton columnCount={5} rowCount={10} filterCount={1} />
      </ConsolePageShell>
    }>
    <>
      <ConsolePageShell
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("create")}
          </Button>
        }
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: t("total_label"), value: stats?.total ?? 0, icon: Flag, color: "info" },
              { label: t("enabled_label"), value: stats?.enabled ?? 0, icon: CheckCircle2, color: "success" },
              { label: t("disabled_label"), value: stats?.disabled ?? 0, icon: XCircle, color: "default" },
            ]}
          />
        }
      >
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <Input
              placeholder={t("search_placeholder")}
              value={search || ""}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />
            <DataTableSortList table={table} />
          </DataTableAdvancedToolbar>
        </DataTable>
      </ConsolePageShell>

      <CreateFlagDialog open={create_open} onOpenChange={setCreateOpen} />
      <EditFlagDialog open={!!edit_flag} onOpenChange={(v) => { if (!v) setEditFlag(null); }} flag={edit_flag} />

      <Dialog open={!!delete_flag} onOpenChange={(v) => { if (!v) setDeleteFlag(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_delete_title")}</DialogTitle>
            <DialogDescription>
              {t("confirm_delete_description", { key: delete_flag?.key ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFlag(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => delete_flag && remove.mutate({ id: delete_flag.id })}
              disabled={remove.isPending}
            >
              {remove.isPending ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
    </QueryGuard>
  );
}
