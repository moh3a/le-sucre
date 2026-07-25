"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUndoAction } from "@/hooks/use-undo-action";

type DeleteOrderDialogProps = {
  order_id: string;
  order_number: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  on_deleted?: () => void;
};

type RelatedDataCounts = {
  order_items: number;
  order_adjustments: number;
  order_status_events: number;
  invoices: number;
  shipments: number;
  payment_transactions: number;
};

type DataKey = keyof RelatedDataCounts;

type DataEntry = {
  key: DataKey;
  label_key: string;
  count: number;
};

const DATA_ENTRIES: Omit<DataEntry, "count">[] = [
  { key: "order_items", label_key: "related_order_items" },
  { key: "order_adjustments", label_key: "related_adjustments" },
  { key: "order_status_events", label_key: "related_status_events" },
  { key: "invoices", label_key: "related_invoices" },
  { key: "shipments", label_key: "related_shipments" },
  { key: "payment_transactions", label_key: "related_payments" },
];

export function DeleteOrderDialog({
  order_id,
  order_number,
  open,
  onOpenChange,
  on_deleted,
}: DeleteOrderDialogProps) {
  const t = useTranslations("orders");
  const tc = useTranslations("common");
  const utils = trpc.useUtils();
  const { execute_with_undo } = useUndoAction();

  const [selected, setSelected] = React.useState<Set<DataKey>>(new Set());
  const [step, setStep] = React.useState<"confirm" | "review">("confirm");

  const { data: relatedData, isLoading } = trpc.orders.adminCheckDependencies.useQuery(
    { order_id },
    { enabled: open },
  );

  const delete_mutation = trpc.orders.adminDelete.useMutation({
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  const has_related_data = relatedData
    ? Object.values(relatedData).some((v) => v > 0)
    : false;

  const total_related = relatedData
    ? Object.values(relatedData).reduce((sum, v) => sum + v, 0)
    : 0;

  const data_entries: DataEntry[] = DATA_ENTRIES.map((entry) => ({
    ...entry,
    count: relatedData?.[entry.key] ?? 0,
  })).filter((entry) => entry.count > 0);

  const all_selected = data_entries.length > 0 && data_entries.every((e) => selected.has(e.key));
  const some_selected = data_entries.some((e) => selected.has(e.key));

  React.useEffect(() => {
    if (open) {
      setStep("confirm");
      setSelected(new Set());
    }
  }, [open]);

  function toggle_all() {
    if (all_selected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data_entries.map((e) => e.key)));
    }
  }

  function toggle_key(key: DataKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handle_confirm() {
    if (has_related_data && step === "confirm") {
      setStep("review");
      return;
    }

    onOpenChange(false);

    execute_with_undo({
      description: order_number,
      execute: async () => {
        await delete_mutation.mutateAsync({ order_id });
        await utils.orders.adminListEnriched.invalidate();
        await utils.orders.adminStats.invalidate();
        on_deleted?.();
      },
      rollback: () => {
        utils.orders.adminListEnriched.invalidate();
        utils.orders.adminStats.invalidate();
      },
      undoTimeoutMs: 8_000,
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          {step === "confirm" ? (
            <>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="text-destructive size-5" />
                {t("delete_order_title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("delete_order_description", { order_number })}
              </AlertDialogDescription>
            </>
          ) : (
            <>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-500" />
                {t("delete_order_review_title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("delete_order_review_description", { order_number })}
              </AlertDialogDescription>
            </>
          )}
        </AlertDialogHeader>

        <QueryGuard
          query={{ isLoading }}
          loadingFallback={
            <div className="space-y-4 py-4">
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
              <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
            </div>
          }
        >
          {step === "confirm" ? (
            <>
              {has_related_data && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-300">
                        {t("delete_order_related_warning", { count: total_related })}
                      </p>
                      <p className="mt-1 text-amber-700 dark:text-amber-400/80">
                        {t("delete_order_related_description")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={all_selected || (some_selected ? "indeterminate" : false)}
                  onCheckedChange={toggle_all}
                />
                <Label htmlFor="select-all" className="cursor-pointer font-medium">
                  {t("select_all_related")}
                </Label>
              </div>

              <Separator />

              <div className="space-y-2">
                {data_entries.map((entry) => (
                  <div key={entry.key} className="flex items-center gap-2">
                    <Checkbox
                      id={entry.key}
                      checked={selected.has(entry.key)}
                      onCheckedChange={() => toggle_key(entry.key)}
                    />
                    <Label htmlFor={entry.key} className="flex-1 cursor-pointer text-sm">
                      {t(entry.label_key)}
                    </Label>
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {entry.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </QueryGuard>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={delete_mutation.isPending}>
            {tc("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={delete_mutation.isPending || (step === "review" && !some_selected)}
            onClick={handle_confirm}
          >
            {delete_mutation.isPending
              ? tc("deleting")
              : step === "confirm"
                ? has_related_data
                  ? t("continue")
                  : tc("confirm")
                : t("delete_selected", { count: selected.size })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
