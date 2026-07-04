import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CircleAlert, PackageOpen } from "lucide-react";

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
  emptyTitle = "Aucune donnée",
  emptyDescription = "Aucun élément à afficher pour le moment.",
  errorTitle = "Erreur",
  emptyIcon,
  children,
}: DataStateProps) {
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
    return (
      errorState ?? (
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-1">
              <AlertTitle>{errorTitle}</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "Une erreur inattendue est survenue"}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )
    );
  }

  if (isEmpty) {
    return (
      emptyState ?? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {emptyIcon ?? <PackageOpen className="text-muted-foreground/40 mb-3 h-12 w-12" />}
          <p className="text-lg font-medium">{emptyTitle}</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">{emptyDescription}</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
