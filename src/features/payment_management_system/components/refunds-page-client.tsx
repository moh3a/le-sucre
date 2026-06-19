"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Banknote,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/components/providers/app-providers";
import { formatDate } from "@/lib/utils";

export function RefundsPageClient() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: stats, isFetching: statsLoading } = trpc.payments.adminRefundStats.useQuery();
  const { data: list, isFetching: listLoading } = trpc.payments.adminListRefunds.useQuery({
    page,
    limit,
  });

  const approveMutation = trpc.payments.adminApproveRefund.useMutation();
  const rejectMutation = trpc.payments.adminRejectRefund.useMutation();
  const processMutation = trpc.payments.adminProcessRefund.useMutation();

  const utils = trpc.useUtils();

  return (
    <ConsolePageShell
      title="Remboursements"
      subtitle="Gestion des remboursements"
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            {
              label: "Total remboursements",
              value: stats?.total_refunds ?? 0,
              icon: Banknote,
              color: "info",
            },
            {
              label: "Complétés",
              value: stats?.completed_refunds ?? 0,
              icon: CheckCircle2,
              color: "success",
            },
            {
              label: "En attente",
              value: stats?.pending_refunds ?? 0,
              icon: Clock,
              color: "warning",
            },
            {
              label: "Échoués",
              value: stats?.failed_refunds ?? 0,
              icon: XCircle,
              color: "error",
            },
            {
              label: "Montant total remboursé",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_refunded_amount ?? 0),
              icon: Banknote,
              color: "info",
            },
            {
              label: "En attente d'approbation",
              value: stats?.pending_approval_count ?? 0,
              icon: Clock,
              color: "warning",
            },
          ]}
        />
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Remboursements</CardTitle>
          <CardDescription>Liste de tous les remboursements</CardDescription>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Commande</th>
                    <th className="pb-3 font-medium">Montant</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {list?.items.map((refund) => (
                    <tr key={refund.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">{refund.order_number ?? refund.order_id.slice(0, 8)}</td>
                      <td className="py-3 font-medium">
                        {new Intl.NumberFormat("fr-DZ", {
                          style: "currency",
                          currency: refund.currency,
                        }).format(Number(refund.amount))}
                      </td>
                      <td className="py-3 capitalize">{refund.type}</td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            refund.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : refund.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : refund.status === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : refund.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : refund.status === "rejected"
                                      ? "bg-gray-100 text-gray-800"
                                      : ""
                          }
                        >
                          {refund.status}
                        </Badge>
                      </td>
                      <td className="py-3">{refund.user_name ?? "N/A"}</td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(refund.created_at)}
                      </td>
                      <td className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {refund.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    approveMutation.mutate(
                                      { refund_id: refund.id },
                                      { onSuccess: () => utils.payments.adminListRefunds.invalidate() },
                                    );
                                  }}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                  Approuver
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    rejectMutation.mutate(
                                      { refund_id: refund.id, reason: "Rejeté manuellement" },
                                      { onSuccess: () => utils.payments.adminListRefunds.invalidate() },
                                    );
                                  }}
                                >
                                  <Ban className="mr-2 h-4 w-4 text-red-600" />
                                  Rejeter
                                </DropdownMenuItem>
                              </>
                            )}
                            {refund.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  processMutation.mutate(
                                    { refund_id: refund.id },
                                    { onSuccess: () => utils.payments.adminListRefunds.invalidate() },
                                  );
                                }}
                              >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Traiter
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {list?.meta && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {list.meta.total_records} résultat(s) — Page {list.meta.page} sur{" "}
                {list.meta.total_pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!list.meta.has_more}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ConsolePageShell>
  );
}
