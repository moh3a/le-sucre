"use client";

import { CircleAlert } from "lucide-react";

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

function get_error_message(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    if (typeof err.message === "string") return err.message;
  }
  return "Une erreur inattendue est survenue";
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
  const isLoading =
    isLoadingOverride ??
    query?.isLoading ??
    mutation?.isPending ??
    session?.isPending ??
    false;

  const isFetching = query?.isFetching ?? false;
  const error = query?.error ?? mutation?.error ?? session?.error ?? null;
  const isUnauthorized = is_unauthorized(error);

  if (isUnauthorized) {
    return (
      <div className={cn("flex items-start justify-center p-6", className)}>
        <Alert variant="destructive" className="max-w-md">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <AlertTitle>Session expirée</AlertTitle>
            <AlertDescription>
              {unauthorizedMessage ??
                "Votre session a expiré ou vous n'êtes pas connecté. Veuillez vous reconnecter."}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-start justify-center p-6", className)}>
        <Alert variant="destructive" className="max-w-md">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{get_error_message(error)}</AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-12",
          className,
        )}
      >
        {loadingFallback ?? (
          <Spinner className="text-muted-foreground size-6" />
        )}
      </div>
    );
  }

  if (isFetching && showRefetchLoader) {
    return (
      <>
        {children}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 shadow-sm">
          <Spinner className="text-muted-foreground size-3.5" />
          <span className="text-muted-foreground text-xs">
            Mise à jour…
          </span>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

export { QueryGuard };
export type { QueryGuardProps };
