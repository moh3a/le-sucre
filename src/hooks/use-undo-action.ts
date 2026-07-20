"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Undo2 } from "lucide-react";

interface UndoActionOptions {
  /** Label shown in the toast describing what was undone */
  description: string;
  /** The action to execute permanently after the undo window expires */
  execute: () => Promise<unknown> | unknown;
  /** The compensating action to reverse the optimistic update */
  rollback: () => void;
  /** Undo window in milliseconds (default: 8000) */
  undoTimeoutMs?: number;
  /** The i18n namespace for toast messages (default: "common") */
  namespace?: string;
  /** Called after permanent execution succeeds */
  onExecuted?: () => void;
  /** Called after permanent execution fails */
  onExecuteError?: (error: unknown) => void;
}

interface UndoActionReturn {
  /** Execute with undo support: shows toast, delays permanent execution, allows rollback */
  execute_with_undo: (options: UndoActionOptions) => string;
}

export function useUndoAction(): UndoActionReturn {
  const t = useTranslations("common");
  const timers_ref = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const execute_with_undo = useCallback(
    (options: UndoActionOptions): string => {
      const {
        description,
        execute,
        rollback,
        undoTimeoutMs = 8_000,
        onExecuted,
        onExecuteError,
      } = options;

      const toast_id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      const timer = setTimeout(async () => {
        timers_ref.current.delete(toast_id);
        try {
          await execute();
          onExecuted?.();
        } catch (error) {
          onExecuteError?.(error);
          toast.error(t("action_failed"), {
            description: t("action_failed_description"),
          });
        }
      }, undoTimeoutMs);

      timers_ref.current.set(toast_id, timer);

      toast(t("action_completed"), {
        description,
        icon: undefined,
        action: {
          label: t("undo"),
          onClick: () => {
            const existing_timer = timers_ref.current.get(toast_id);
            if (existing_timer) {
              clearTimeout(existing_timer);
              timers_ref.current.delete(toast_id);
            }
            rollback();
            toast.info(t("action_reverted"), {
              description,
            });
          },
        },
        duration: Math.ceil(undoTimeoutMs / 1000),
      });

      return toast_id;
    },
    [t],
  );

  return { execute_with_undo };
}
