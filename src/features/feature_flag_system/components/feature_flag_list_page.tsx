"use client";

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
  Layers,
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
  DialogTrigger,
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

const LANGUAGE_LABELS: Record<string, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

function CreateFlagDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
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
      toast.success("Feature flag créé");
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
      toast.error("Veuillez remplir tous les champs obligatoires");
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
          <DialogTitle>Nouveau feature flag</DialogTitle>
          <DialogDescription>
            Créez un nouveau feature flag pour contrôler les fonctionnalités de la plateforme.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Clé technique</Label>
            <Input
              id="key"
              placeholder="ex: new_checkout_flow"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
            <p className="text-muted-foreground text-xs">
              Identifiant unique utilisé dans le code. Ex: ai_recommendations, express_shipping
            </p>
          </div>
          <Separator />
          <p className="text-sm font-medium">Nom (multilingue)</p>
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
          <p className="text-sm font-medium">Description (optionnelle)</p>
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
              {create.isPending ? "Création..." : "Créer"}
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
  const utils = trpc.useUtils();
  const [fr_name, setFrName] = React.useState("");
  const [en_name, setEnName] = React.useState("");
  const [ar_name, setArName] = React.useState("");
  const [fr_desc, setFrDesc] = React.useState("");
  const [en_desc, setEnDesc] = React.useState("");
  const [ar_desc, setArDesc] = React.useState("");

  React.useEffect(() => {
    if (flag) {
      setFrName(flag.name.fr);
      setEnName(flag.name.en);
      setArName(flag.name.ar);
      setFrDesc(flag.description?.fr ?? "");
      setEnDesc(flag.description?.en ?? "");
      setArDesc(flag.description?.ar ?? "");
    }
  }, [flag]);

  const update = trpc.featureFlags.update.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate();
      utils.featureFlags.stats.invalidate();
      toast.success("Feature flag mis à jour");
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
          <DialogTitle>Modifier le feature flag</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du feature flag <strong>{flag?.key}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-medium">Nom (multilingue)</p>
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
          <p className="text-sm font-medium">Description (optionnelle)</p>
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
              {update.isPending ? "Mise à jour..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FeatureFlagListPage() {
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
      toast.success("Statut mis à jour");
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.featureFlags.delete.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate();
      utils.featureFlags.stats.invalidate();
      toast.success("Feature flag supprimé");
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Clé" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Statut" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.enabled}
              onCheckedChange={(checked) => toggle.mutate({ id: row.original.id, enabled: checked })}
            />
            <Badge variant={row.original.enabled ? "default" : "secondary"} className="text-xs">
              {row.original.enabled ? "Activé" : "Désactivé"}
            </Badge>
          </div>
        ),
      },
      {
        id: "description",
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Description" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-1 max-w-xs text-sm">
            {row.original.description?.fr || "—"}
          </span>
        ),
      },
      {
        id: "updated_at",
        accessorKey: "updated_at",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Mis à jour" />,
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
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toggle.mutate({ id: row.original.id, enabled: !row.original.enabled })}
              >
                {row.original.enabled ? (
                  <>
                    <PowerOff className="mr-2 size-4 text-amber-500" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <Power className="mr-2 size-4 text-emerald-500" />
                    Activer
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteFlag(row.original)}
              >
                <Trash2 className="mr-2 size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [toggle],
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
        title="Feature Flags"
        subtitle="Gérez les fonctionnalités activées ou désactivées de la plateforme"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau flag
          </Button>
        }
      >
        <DataTableSkeleton columnCount={5} rowCount={10} filterCount={1} />
      </ConsolePageShell>
    }>
    <>
      <ConsolePageShell
        title="Feature Flags"
        subtitle="Gérez les fonctionnalités activées ou désactivées de la plateforme"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau flag
          </Button>
        }
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: "Total", value: stats?.total ?? 0, icon: Flag, color: "info" },
              { label: "Activés", value: stats?.enabled ?? 0, icon: CheckCircle2, color: "success" },
              { label: "Désactivés", value: stats?.disabled ?? 0, icon: XCircle, color: "default" },
            ]}
          />
        }
      >
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}>
            <Input
              placeholder="Rechercher un feature flag…"
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
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le feature flag{" "}
              <strong>{delete_flag?.key}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFlag(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => delete_flag && remove.mutate(delete_flag.id)}
              disabled={remove.isPending}
            >
              {remove.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
    </QueryGuard>
  );
}
