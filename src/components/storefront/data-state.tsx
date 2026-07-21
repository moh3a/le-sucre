"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CircleAlert, PackageOpen, RefreshCw, WifiOff, AlertTriangle } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  extract_error_message,
  is_timeout_error,
  is_backend_unavailable,
} from "@/lib/error-detection";

interface DataStateProps {
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Error object/message */
  error?: unknown;
  /** Data is empty (falsy or empty array) */
  isEmpty?: boolean;
  /** Rendered when data is empty */
  emptyState?: ReactNode;
  /** Rendered when loading */
  loadingState?: ReactNode;
  /** Rendered on error */
  errorState?: ReactNode;
  /** Title for default empty UI */
  emptyTitle?: string;
  /** Description for default empty UI */
  emptyDescription?: string;
  /** Title for default error UI */
  errorTitle?: string;
  /** Icon for empty state */
  emptyIcon?: ReactNode;
  /** Called when retry button is clicked */
  onRetry?: () => void;
  /** Children rendered on success (not loading, no error, not empty) */
  children: ReactNode;
}

export function DataState({
  isLoading,
  error,
  isEmpty,
  emptyState,
  loadingState,
  errorState,
  emptyTitle,
  emptyDescription,
  errorTitle,
  emptyIcon,
  onRetry,
  children,
}: DataStateProps) {
  const t = useTranslations("common");

  if (isLoading) {
    return (
      loadingState ?? (
        <div className="flex items-center justify-center p-12">
          <Spinner className="text-muted-foreground size-6" />
        </div>
      )
    );
  }

  if (error) {
    const isTimeout = is_timeout_error(error);
    const isBackendDown = is_backend_unavailable(error);

    const title = isTimeout
      ? t("request_timed_out")
      : isBackendDown
        ? t("server_unavailable")
        : errorTitle ?? t("error");

    const icon = isTimeout ? (
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
    ) : isBackendDown ? (
      <WifiOff className="mt-0.5 size-4 shrink-0" />
    ) : (
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
    );

    return (
      errorState ?? (
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            {icon}
            <div className="flex flex-col gap-2">
              <div>
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>
                  {extract_error_message(error) || t("error_description")}
                </AlertDescription>
              </div>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 self-start"
                  onClick={onRetry}
                >
                  <RefreshCw className="size-3.5" />
                  {t("retry")}
                </Button>
              )}
            </div>
          </Alert>
        </div>
      )
    );
  }

  if (isEmpty) {
    return (
      emptyState ?? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {emptyIcon ?? <PackageOpen className="size-6" />}
            </EmptyMedia>
            <EmptyTitle>{emptyTitle ?? t("no_results")}</EmptyTitle>
            {emptyDescription && <EmptyDescription>{emptyDescription}</EmptyDescription>}
          </EmptyHeader>
        </Empty>
      )
    );
  }

  return <>{children}</>;
}
