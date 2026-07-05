import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CircleAlert, PackageOpen } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

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
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {emptyIcon ?? <PackageOpen className="size-6" />}
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            {emptyDescription && <EmptyDescription>{emptyDescription}</EmptyDescription>}
          </EmptyHeader>
        </Empty>
      )
    );
  }

  return <>{children}</>;
}
