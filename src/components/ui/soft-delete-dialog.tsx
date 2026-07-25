"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface SoftDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  loadingText?: string;
  confirmText?: string;
  cancelText?: string;
}

export function SoftDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loadingText,
  confirmText,
  cancelText,
}: SoftDeleteDialogProps) {
  const tc = useTranslations("common");
  const [isPending, setIsPending] = React.useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      toast.error(tc("action_failed"), {
        description: tc("action_failed_description"),
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive size-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelText ?? tc("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 size-4" />
            )}
            {isPending ? (loadingText ?? tc("deleting")) : (confirmText ?? tc("delete"))}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface SoftDeleteWithUndoOptions {
  /** Function that calls the soft-delete API */
  execute: () => Promise<unknown>;
  /** Function that calls the restore API */
  restore: () => Promise<unknown>;
  /** Invalidate query caches after delete/restore */
  invalidate: () => Promise<void>;
  /** Entity label shown in toast */
  entityLabel: string;
  /** Entity type for i18n */
  entityType: string;
  /** Undo timeout in ms (default: 8000) */
  undoTimeoutMs?: number;
}

/**
 * Execute a soft delete with undo toast.
 * Immediately removes entity from UI, shows toast with Undo button.
 * On undo: calls restore endpoint and re-invalidates.
 * On timeout: toast disappears, entity remains soft-deleted.
 */
export function useSoftDeleteWithUndo() {
  const t = useTranslations("common");
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const executeWithUndo = React.useCallback(
    (options: SoftDeleteWithUndoOptions) => {
      const {
        execute,
        restore,
        invalidate,
        entityLabel,
        entityType,
        undoTimeoutMs = 8_000,
      } = options;

      const toastId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      const timer = setTimeout(async () => {
        timersRef.current.delete(toastId);
        try {
          await execute();
          await invalidate();
        } catch {
          toast.error(t("action_failed"), {
            description: t("action_failed_description"),
          });
        }
      }, undoTimeoutMs);

      timersRef.current.set(toastId, timer);

      toast(entityLabel, {
        description: t("item_deleted"),
        action: {
          label: t("undo"),
          onClick: async () => {
            const existing = timersRef.current.get(toastId);
            if (existing) {
              clearTimeout(existing);
              timersRef.current.delete(toastId);
            }
            try {
              await restore();
              await invalidate();
              toast.success(t("action_reverted"), {
                description: entityLabel,
              });
            } catch {
              toast.error(t("action_failed"), {
                description: t("action_failed_description"),
              });
            }
          },
        },
        duration: Math.ceil(undoTimeoutMs / 1000),
      });

      return toastId;
    },
    [t],
  );

  React.useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  return { executeWithUndo };
}
