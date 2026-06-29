"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { History, Edit, Tag, Eye, EyeOff, FileText, Info } from "lucide-react";

type ProductChangeLogProps = {
  product_id: string;
};

const CHANGE_TYPE_STYLES: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  field_update: {
    icon: Edit,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900",
    label: "Mise à jour",
  },
  status_change: {
    icon: Tag,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900",
    label: "Changement de statut",
  },
  publish: {
    icon: Eye,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900",
    label: "Publication",
  },
  unpublish: {
    icon: EyeOff,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900",
    label: "Dépublication",
  },
  note: {
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900",
    label: "Note",
  },
};

type ChangeLogEntry = {
  id: string;
  product_id: string;
  change_type: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by_user_id: string | null;
  notes: string | null;
  created_at: string;
};

export function ProductChangeLog({ product_id }: ProductChangeLogProps) {
  const { data, isLoading } = trpc.operations.productGetChangeLog.useQuery({ product_id });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      }
    >
      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <History className="text-muted-foreground mb-2 size-8" />
          <p className="text-muted-foreground text-sm">Aucun changement enregistré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data as ChangeLogEntry[]).map((entry, idx) => {
            const style = CHANGE_TYPE_STYLES[entry.change_type] ?? {
              icon: Info,
              color: "text-gray-500",
              bg: "bg-gray-100 dark:bg-gray-800",
              label: entry.change_type,
            };
            const Icon = style.icon;

            return (
              <div key={entry.id} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${style.bg}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${style.color}`} />
                  </div>
                  {idx < data.length - 1 && <div className="bg-border mt-1 w-px flex-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {style.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {entry.field_name}
                    </Badge>
                  </div>

                  {(entry.old_value || entry.new_value) && (
                    <div className="mt-1 flex items-start gap-2 text-sm">
                      {entry.old_value && (
                        <span className="text-muted-foreground line-through">
                          {entry.old_value}
                        </span>
                      )}
                      {entry.old_value && entry.new_value && (
                        <span className="text-muted-foreground">→</span>
                      )}
                      {entry.new_value && <span className="font-medium">{entry.new_value}</span>}
                    </div>
                  )}

                  {entry.notes && (
                    <p className="text-muted-foreground mt-0.5 text-sm italic">
                      &quot;{entry.notes}&quot;
                    </p>
                  )}

                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                    {entry.changed_by_user_id && <span>Par: {entry.changed_by_user_id}</span>}
                    <span>
                      {formatDate(entry.created_at, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </QueryGuard>
  );
}
