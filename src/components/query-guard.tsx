"use client";

import { useCallback } from "react";
import { CircleAlert, RefreshCw, WifiOff, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  extract_error_message,
  is_unauthorized,
  is_timeout_error,
  is_backend_unavailable,
} from "@/lib/error-detection";

interface QueryGuardProps {
  children: React.ReactNode;
  /** tRPC useQuery result (provides isLoading, isFetching, error, refetch) */
  query?: {
    isLoading?: boolean;
    isFetching?: boolean;
    error?: unknown;
    refetch?: () => void;
  };
  /** tRPC useMutation result (provides isPending, error) */
  mutation?: {
    isPending?: boolean;
    error?: unknown;
  };
  /** Result from authClient.useSession() (provides isPending, error) */
  session?: {
    isPending?: boolean;
    error?: unknown;
  };
  /** When true, overrides all loading states */
  isLoading?: boolean;
  /** Custom message for UNAUTHORIZED errors */
  unauthorizedMessage?: string;
  /** Custom loading fallback instead of the default centered spinner */
  loadingFallback?: React.ReactNode;
  /** When true also shows loading indicator during background refetches (default: false) */
  showRefetchLoader?: boolean;
  /** Additional class names for the wrapper */
  className?: string;
}

function QueryGuard({
  children,
  query,
  mutation,
  session,
  isLoading: isLoadingOverride,
  unauthorizedMessage,
  loadingFallback,
  showRefetchLoader = false,
  className,
}: QueryGuardProps) {
  const t = useTranslations("common");
  const isLoading =
    isLoadingOverride ?? query?.isLoading ?? mutation?.isPending ?? session?.isPending ?? false;

  const isFetching = query?.isFetching ?? false;
  const error = query?.error ?? mutation?.error ?? session?.error ?? null;
  const isUnauthorized = is_unauthorized(error);
  const isTimeout = is_timeout_error(error);
  const isBackendDown = is_backend_unavailable(error);

  const handleRetry = useCallback(() => {
    if (query?.refetch) {
      query.refetch();
    }
  }, [query?.refetch]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  if (isUnauthorized) {
    return (
      <div className={cn("p-6", className)}>
        <Alert variant="destructive" className="w-full">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <AlertTitle>{t("session_expired")}</AlertTitle>
            <AlertDescription>
              {unauthorizedMessage ?? t("session_expired_description")}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  if (isTimeout) {
    return (
      <div className={cn("p-6", className)}>
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-2">
            <div>
              <AlertTitle>{t("request_timed_out")}</AlertTitle>
              <AlertDescription>{extract_error_message(error)}</AlertDescription>
            </div>
            <div className="flex gap-2">
              {query?.refetch && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleRetry}
                >
                  <RefreshCw className="size-3.5" />
                  {t("retry")}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleRefresh}
              >
                {t("refresh")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleRetry}
              >
                {t("continue_editing")}
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  if (isBackendDown) {
    return (
      <div className={cn("p-6", className)}>
        <Alert variant="destructive" className="w-full">
          <WifiOff className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-2">
            <div>
              <AlertTitle>{t("server_unavailable")}</AlertTitle>
              <AlertDescription>{extract_error_message(error)}</AlertDescription>
            </div>
            <div className="flex gap-2">
              {query?.refetch && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleRetry}
                >
                  <RefreshCw className="size-3.5" />
                  {t("retry")}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleRefresh}
              >
                {t("refresh")}
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <Alert variant="destructive" className="w-full">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-2">
            <div>
              <AlertTitle>{t("error")}</AlertTitle>
              <AlertDescription>
                {extract_error_message(error) || t("error_description")}
              </AlertDescription>
            </div>
            {query?.refetch && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 self-start"
                onClick={handleRetry}
              >
                <RefreshCw className="size-3.5" />
                {t("retry")}
              </Button>
            )}
          </div>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-12", className)}>
        {loadingFallback ?? <Spinner className="text-muted-foreground size-6" />}
      </div>
    );
  }

  if (isFetching && showRefetchLoader) {
    return (
      <>
        {children}
        <div className="bg-background fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm">
          <Spinner className="text-muted-foreground size-3.5" />
          <span className="text-muted-foreground text-xs">{t("updating")}</span>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

export { QueryGuard };
export type { QueryGuardProps };
