"use client";

import { useState } from "react";
import { Banknote, CheckCircle2, Clock, MoreHorizontal, RefreshCcw, XCircle } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/components/providers/app-providers";
import { formatDate } from "@/lib/utils";

export function PayoutsPageClient() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: stats, isFetching: statsLoading } = trpc.payments.adminPayoutStats.useQuery();
  const { data: list, isFetching: listLoading } = trpc.payments.adminListPayouts.useQuery({
    page,
    limit,
  });

  const processMutation = trpc.payments.adminProcessPayout.useMutation();
  const completeMutation = trpc.payments.adminCompletePayout.useMutation();
  const utils = trpc.useUtils();

  return (
    <ConsolePageShell
      title="Paiements fournisseurs"
      subtitle="Gestion des paiements aux vendeurs et fournisseurs"
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            {
              label: "Total paiements",
              value: stats?.total_payouts ?? 0,
              icon: Banknote,
              color: "info",
            },
            {
              label: "En attente",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.pending_net ?? 0),
              icon: Clock,
              color: "warning",
            },
            {
              label: "Complétés",
              value: stats?.completed_payouts ?? 0,
              icon: CheckCircle2,
              color: "success",
            },
            {
              label: "Échoués",
              value: stats?.failed_payouts ?? 0,
              icon: XCircle,
              color: "error",
            },
            {
              label: "Montant brut",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_gross ?? 0),
              icon: Banknote,
              color: "info",
            },
            {
              label: "Commission totale",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_commission ?? 0),
              icon: RefreshCcw,
              color: "info",
            },
          ]}
        />
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Paiements</CardTitle>
          <CardDescription>Liste des paiements aux fournisseurs</CardDescription>
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
                    <th className="pb-3 font-medium">Vendeur</th>
                    <th className="pb-3 font-medium">Brut</th>
                    <th className="pb-3 font-medium">Commission</th>
                    <th className="pb-3 font-medium">Net</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {list?.items.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">
                        {payout.vendor_id ? payout.vendor_id.slice(0, 12) : "N/A"}
                      </td>
                      <td className="py-3 font-medium">
                        {new Intl.NumberFormat("fr-DZ", {
                          style: "currency",
                          currency: payout.currency,
                        }).format(Number(payout.gross_amount))}
                      </td>
                      <td className="py-3">
                        {new Intl.NumberFormat("fr-DZ", {
                          style: "currency",
                          currency: payout.currency,
                        }).format(Number(payout.commission_amount))}
                      </td>
                      <td className="py-3 font-medium text-green-600">
                        {new Intl.NumberFormat("fr-DZ", {
                          style: "currency",
                          currency: payout.currency,
                        }).format(Number(payout.net_amount))}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={
                            payout.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payout.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : payout.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(payout.created_at)}
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
                            {payout.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  processMutation.mutate(
                                    { payout_id: payout.id },
                                    { onSuccess: () => utils.payments.adminListPayouts.invalidate() },
                                  );
                                }}
                              >
                                Traiter
                              </DropdownMenuItem>
                            )}
                            {(payout.status === "pending" || payout.status === "processing") && (
                              <DropdownMenuItem
                                onClick={() => {
                                  completeMutation.mutate(
                                    { payout_id: payout.id },
                                    { onSuccess: () => utils.payments.adminListPayouts.invalidate() },
                                  );
                                }}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                Marquer comme payé
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
