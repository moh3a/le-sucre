"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleDataTable } from "@/components/console/simple-data-table";
import { HeadphonesIcon } from "lucide-react";

const status_labels: Record<string, string> = {
  open: "Ouvert",
  assigned: "Assigné",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
  reopened: "Réouvert",
};

const status_badges: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  open: "destructive",
  assigned: "secondary",
  in_progress: "secondary",
  resolved: "default",
  closed: "outline",
  reopened: "destructive",
};

const priority_labels: Record<string, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

export function SupportCasesPageClient() {
  const { data, isLoading } = trpc.operations.customerListCases.useQuery({ page: 1, limit: 20 });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cas de support</h1>
          <p className="text-muted-foreground">Gestion des cas de support client</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <SimpleDataTable
            columns={[
              { accessorKey: "subject", header: "Sujet" },
              { accessorKey: "category", header: "Catégorie" },
              {
                accessorKey: "priority",
                header: "Priorité",
                cell: ({ row }) => priority_labels[row.original.priority as string] ?? row.original.priority,
              },
              {
                accessorKey: "status",
                header: "Statut",
                cell: ({ row }) => (
                  <Badge variant={status_badges[row.original.status as string]}>
                    {status_labels[row.original.status as string] ?? row.original.status}
                  </Badge>
                ),
              },
              { accessorKey: "assigned_to_user_id", header: "Assigné à" },
              { accessorKey: "created_at", header: "Date" },
            ]}
            data={data?.items ?? []}
            pageCount={data?.meta?.total_pages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
