"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
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
import { useUndoAction } from "@/hooks/use-undo-action";

type DeleteOrderDialogProps = {
  order_id: string;
  order_number: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  on_deleted?: () => void;
};

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

  const delete_mutation = trpc.orders.adminDelete.useMutation({
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  const restore_mutation = trpc.orders.adminRestore.useMutation({
    onError: (err) => toast.error(t("error_prefix", { message: err.message })),
  });

  const handle_confirm = async () => {
    if (delete_mutation.isPending) return;
    onOpenChange(false);

    try {
      await delete_mutation.mutateAsync({ order_id });
    } catch {
      return;
    }

    await utils.orders.adminListEnriched.invalidate();
    await utils.orders.adminStats.invalidate();
    on_deleted?.();

    execute_with_undo({
      description: order_number,
      toastLabel: t("delete_order_undo_toast"),
      execute: async () => {
        await utils.orders.adminListEnriched.invalidate();
        await utils.orders.adminStats.invalidate();
      },
      rollback: async () => {
        await restore_mutation.mutateAsync({ order_id });
        await utils.orders.adminListEnriched.invalidate();
        await utils.orders.adminStats.invalidate();
      },
      undoTimeoutMs: 8_000,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive size-5" />
            {t("delete_order_title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete_order_description", { order_number })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={delete_mutation.isPending}>
            {tc("cancel")}
          </AlertDialogCancel>
          <Button variant="destructive" asChild>
            <AlertDialogAction
              disabled={delete_mutation.isPending}
              onClick={() => void handle_confirm()}
            >
              {delete_mutation.isPending ? tc("deleting") : tc("confirm")}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
