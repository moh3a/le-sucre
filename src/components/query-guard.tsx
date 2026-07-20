"use client";

import { useCallback } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

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

function extract_error_message(error: unknown): string {
  if (!error) return "";
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    if (typeof err.message === "string") return err.message;

    const data = err.data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.message === "string") return d.message;
      if (d.messages && typeof d.messages === "object") {
        const msgs = d.messages as Record<string, string>;
        const first = Object.values(msgs)[0];
        if (typeof first === "string") return first;
      }
    }
  }

  return "";
}

function is_unauthorized(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as Record<string, unknown>;
  const data = err.data;

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (d.code === "UNAUTHORIZED") return true;
    if (d.httpStatus === 401) return true;
  }

  return false;
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

  const handleRetry = useCallback(() => {
    if (query?.refetch) {
      query.refetch();
    }
  }, [query?.refetch]);

  const errorMessage = extract_error_message(error) || t("unexpected_error");

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

  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <Alert variant="destructive" className="w-full">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-2">
            <div>
              <AlertTitle>{t("error")}</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
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
