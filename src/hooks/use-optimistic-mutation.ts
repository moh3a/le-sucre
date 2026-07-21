"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

interface OptimisticUpdateOptions<TData> {
  /** The tRPC query key to update optimistically */
  query_key: unknown[];
  /** The optimistic update function applied immediately */
  updater: (old: TData | undefined) => TData;
  /** The async mutation to execute */
  mutate: () => Promise<unknown>;
  /** The i18n key for success message (in "common" namespace) */
  success_key?: string;
  /** The i18n key for error message (in "common" namespace) */
  error_key?: string;
  /** Parameters for the success i18n key */
  success_params?: Record<string, string>;
  /** Parameters for the error i18n key */
  error_params?: Record<string, string>;
  /** Called after successful mutation (e.g., to refetch related queries) */
  onSuccess?: () => void;
  /** Custom success message (overrides i18n) */
  success_message?: string;
  /** Custom error message (overrides i18n) */
  error_message?: string;
}

export function useOptimisticToggle() {
  const t = useTranslations("common");
  const query_client = useQueryClient();

  const toggle = useCallback(
    async <TData,>(options: OptimisticUpdateOptions<TData>) => {
      const {
        query_key,
        updater,
        mutate,
        success_key,
        error_key,
        success_params,
        error_params,
        onSuccess,
        success_message,
        error_message,
      } = options;

      const previous = query_client.getQueryData<TData>(query_key);

      query_client.setQueryData<TData>(query_key, updater);

      try {
        await mutate();

        const message = success_message ?? (success_key ? t(success_key as never, success_params as never) : undefined);
        if (message) {
          toast.success(message);
        }

        onSuccess?.();
      } catch {
        query_client.setQueryData<TData>(query_key, previous);

        const message = error_message ?? (error_key ? t(error_key as never, error_params as never) : undefined);
        toast.error(message ?? t("action_failed"), {
          description: t("retry_or_refresh"),
        });
      }
    },
    [query_client, t],
  );

  return { toggle };
}

interface SuccessToastOptions {
  /** Success message - either a raw string or an i18n key */
  message?: string;
  /** i18n key in "common" namespace */
  i18n_key?: string;
  /** Parameters for i18n key */
  params?: Record<string, string>;
}

export function useSuccessToast() {
  const t = useTranslations("common");

  const show_success = useCallback(
    (options: SuccessToastOptions = {}) => {
      const { message, i18n_key, params } = options;
      const text = message ?? (i18n_key ? t(i18n_key as never, params as never) : t("action_completed"));
      toast.success(text);
    },
    [t],
  );

  const show_error = useCallback(
    (options: SuccessToastOptions = {}) => {
      const { message, i18n_key, params } = options;
      const text = message ?? (i18n_key ? t(i18n_key as never, params as never) : t("action_failed"));
      toast.error(text);
    },
    [t],
  );

  return { show_success, show_error };
}
