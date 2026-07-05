"use client";

import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface QueryGuardProps {
  children: React.ReactNode;
  /** tRPC useQuery result (provides isLoading, isFetching, error) */
  query?: {
    isLoading?: boolean;
    isFetching?: boolean;
    error?: unknown;
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
          <div className="flex flex-col gap-1">
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : error && typeof error === "object"
                  ? String((error as Record<string, unknown>).message ?? t("unexpected_error"))
                  : t("unexpected_error")}
            </AlertDescription>
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
