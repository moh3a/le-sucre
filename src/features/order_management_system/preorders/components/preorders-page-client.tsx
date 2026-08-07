"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { toast } from "sonner";
import { Hash, Hourglass, PackageCheck, PackageX, Search, Settings2, ShoppingCart, Timer, X, Clock } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ProductCombobox } from "@/features/product_information_management/products/components/product-combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreorderSettingsForm } from "./preorder-settings-form";
import { PreorderSettingsTable } from "./preorder-settings-table";
import { PreordersTable } from "./preorders-table";

const bulk_product_schema = z.object({
  is_preorder_enabled: z.boolean(),
  allow_backorder: z.boolean(),
  max_preorder_qty: z.string().optional(),
  deposit_percent: z.string().regex(/^\d{1,3}$/),
  lead_time_days: z.string().regex(/^\d{1,3}$/),
  is_active: z.boolean(),
});
type BulkProductFormValues = z.infer<typeof bulk_product_schema>;

export function PreordersPageClient() {
  const t = useTranslations("preorders");
  const [sku_dialog_open, setSkuDialogOpen] = useState(false);
  const [bulk_dialog_open, setBulkDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = trpc.preorders.preorderStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: statsLoading }}>
      <ConsolePageShell
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex gap-2">
            <ConfigureSkuDialog open={sku_dialog_open} onOpenChange={setSkuDialogOpen} />
            <ConfigureByProductDialog open={bulk_dialog_open} onOpenChange={setBulkDialogOpen} />
          </div>
        }
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: t("stats_total"), value: stats?.total ?? 0, icon: Hash, color: "default" },
              { label: t("stats_pending"), value: stats?.pending ?? 0, icon: Hourglass, color: "warning" },
              { label: t("stats_confirmed"), value: stats?.confirmed ?? 0, icon: ShoppingCart, color: "info" },
              { label: t("stats_fulfilled"), value: stats?.fulfilled ?? 0, icon: PackageCheck, color: "success" },
              { label: t("stats_cancelled"), value: stats?.cancelled ?? 0, icon: PackageX, color: "error" },
              { label: t("stats_expired"), value: stats?.expired ?? 0, icon: Clock, color: "warning" },
              { label: t("stats_active_qty"), value: stats?.total_qty_active ?? 0, icon: Timer, color: "default" },
            ]}
          />
        }
      >
        <Tabs defaultValue="configs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="configs">{t("tab_configs")}</TabsTrigger>
            <TabsTrigger value="allocations">{t("tab_allocations")}</TabsTrigger>
          </TabsList>
          <TabsContent value="configs">
            <PreorderSettingsTable />
          </TabsContent>
          <TabsContent value="allocations">
            <PreordersTable />
          </TabsContent>
        </Tabs>
      </ConsolePageShell>
    </QueryGuard>
  );
}

function ConfigureSkuDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("preorders");
  const [selected_sku, setSelectedSku] = useState<{
    id: string;
    sku_code: string;
    product_name: string | null;
  } | null>(null);
  const [search_query, setSearchQuery] = useState("");
  const [debounced_search, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search_query.trim()), 300);
    return () => clearTimeout(id);
  }, [search_query]);

  const search = debounced_search;
  const skus_query = trpc.variants.adminList.useQuery(
    { page: 1, limit: 10, search: search || undefined },
    { enabled: open && search.length > 0 },
  );

  const settings_query = trpc.preorders.getSettings.useQuery(
    { sku_id: selected_sku?.id ?? "" },
    { enabled: !!selected_sku },
  );

  const defaults = settings_query.data
    ? {
        is_preorder_enabled: settings_query.data.is_preorder_enabled,
        allow_backorder: settings_query.data.allow_backorder,
        max_preorder_qty: settings_query.data.max_preorder_qty,
        estimated_available_at: settings_query.data.estimated_available_at,
        deposit_percent: Number(settings_query.data.deposit_percent ?? 100),
        lead_time_days: settings_query.data.lead_time_days,
        is_active: settings_query.data.is_active,
      }
    : null;

  function close_dialog() {
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSelectedSku(null);
          setSearchQuery("");
          setDebouncedSearch("");
        }
        onOpenChange(next);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Settings2 className="h-4 w-4" />
          {t("configure_button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings_title")}</DialogTitle>
          <DialogDescription>{t("settings_desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selected_sku ? (
            <div className="space-y-2">
              <Label>{t("search_sku")}</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                <Input
                  autoFocus
                  className="pl-8"
                  placeholder={t("search_placeholder")}
                  value={search_query}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {search.length > 0 && (
                <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-1">
                  {skus_query.isFetching ? (
                    <p className="text-muted-foreground px-2 py-3 text-center text-sm">
                      {t("skus_loading")}
                    </p>
                  ) : (skus_query.data?.items.length ?? 0) === 0 ? (
                    <p className="text-muted-foreground px-2 py-3 text-center text-sm">
                      {t("sku_not_found")}
                    </p>
                  ) : (
                    skus_query.data?.items.map((sku) => (
                      <button
                        key={sku.id}
                        type="button"
                        onClick={() => {
                          setSelectedSku({
                            id: sku.id,
                            sku_code: sku.sku_code,
                            product_name: sku.product_name ?? null,
                          });
                          setSearchQuery("");
                          setDebouncedSearch("");
                        }}
                        className="hover:bg-muted/40 flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm outline-none"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {sku.product_name ?? t("storefront_product_default")}
                          </p>
                          <p className="text-muted-foreground truncate font-mono text-xs">
                            {sku.sku_code}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {selected_sku.product_name ?? t("storefront_product_default")}
                  </p>
                  <p className="text-muted-foreground truncate font-mono text-xs">
                    {selected_sku.sku_code}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setSelectedSku(null);
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  {t("change_sku")}
                </Button>
              </div>

              {settings_query.isLoading ? (
                <p className="text-muted-foreground text-sm">{t("loading")}</p>
              ) : settings_query.data ? (
                <PreorderSettingsForm
                  key={selected_sku.id}
                  sku_id={selected_sku.id}
                  defaults={defaults}
                  onSaved={close_dialog}
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">{t("configure_new")}</p>
                  <PreorderSettingsForm
                    key={selected_sku.id}
                    sku_id={selected_sku.id}
                    defaults={null}
                    onSaved={close_dialog}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfigureByProductDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("preorders");
  const utils = trpc.useUtils();
  const [product_id, setProductId] = useState<string | null>(null);

  const skus_query = trpc.variants.listSkus.useQuery(
    { product_id: product_id ?? "" },
    { enabled: !!product_id },
  );

  const bulk_form = useForm<BulkProductFormValues>({
    resolver: zodResolver(bulk_product_schema),
    defaultValues: {
      is_preorder_enabled: true,
      allow_backorder: false,
      max_preorder_qty: "",
      deposit_percent: "100",
      lead_time_days: "14",
      is_active: true,
    },
  });

  const bulk_preorder = trpc.preorders.bulkUpsertSettings.useMutation({
    onSuccess: async () => {
      toast.success(t("bulk_preorder_success"));
      onOpenChange(false);
      await utils.preorders.adminListSettings.invalidate();
      await utils.preorders.preorderStats.invalidate();
      await utils.preorders.adminListAllocations.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const is_preorder_enabled = useWatch({ control: bulk_form.control, name: "is_preorder_enabled" });
  const allow_backorder = useWatch({ control: bulk_form.control, name: "allow_backorder" });

  async function onApply() {
    if (!product_id) return;
    const values = bulk_form.getValues();
    const skus = skus_query.data?.items ?? [];
    if (!skus.length) return;
    await bulk_preorder.mutateAsync({
      entries: skus.map((sku) => ({
        sku_id: sku.sku_id,
        is_preorder_enabled: values.is_preorder_enabled,
        allow_backorder: values.allow_backorder,
        max_preorder_qty: values.max_preorder_qty ? Number(values.max_preorder_qty) : null,
        estimated_available_at: null,
        deposit_percent: Number(values.deposit_percent),
        lead_time_days: Number(values.lead_time_days),
        is_active: values.is_active,
      })),
    });
  }

  const sku_count = skus_query.data?.items.length ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setProductId(null);
          bulk_form.reset();
        }
        onOpenChange(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShoppingCart className="h-4 w-4" />
          {t("bulk_by_product_title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("bulk_by_product_title")}</DialogTitle>
          <DialogDescription>{t("bulk_by_product_description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("select_product")}</Label>
            <ProductCombobox value={product_id} onValueChange={setProductId} />
          </div>

          {product_id && (
            <p className="text-muted-foreground text-xs">
              {t("configured_skus", { count: sku_count })}
            </p>
          )}

          <div className="grid gap-4">
            <label className="flex items-center justify-between gap-2 text-sm">
              <span>{t("preorder_enabled")}</span>
              <Switch
                checked={is_preorder_enabled}
                onCheckedChange={(v) => bulk_form.setValue("is_preorder_enabled", v)}
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-sm">
              <span>{t("allow_backorder")}</span>
              <Switch
                checked={allow_backorder}
                onCheckedChange={(v) => bulk_form.setValue("allow_backorder", v)}
              />
            </label>

            <Field>
              <FieldLabel>{t("max_qty")}</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  min={1}
                  placeholder={t("max_qty_unlimited")}
                  {...bulk_form.register("max_preorder_qty")}
                />
                <FieldDescription>{t("max_qty_desc")}</FieldDescription>
              </FieldContent>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t("deposit_percent")}</FieldLabel>
                <Input type="number" min={0} max={100} {...bulk_form.register("deposit_percent")} />
              </Field>
              <Field>
                <FieldLabel>{t("lead_time_days")}</FieldLabel>
                <Input type="number" min={1} max={365} {...bulk_form.register("lead_time_days")} />
              </Field>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!product_id || sku_count === 0 || bulk_preorder.isPending}
            onClick={onApply}
          >
            {bulk_preorder.isPending ? t("updating") : t("apply_bulk")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
