"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  BadgeDollarSign,
  Banknote,
  CreditCard,
  MoreHorizontal,
  RefreshCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { trpc } from "@/components/providers/app-providers";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  captured: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  partially_refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  on_hold: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={STATUS_COLORS[status] ?? ""} variant="outline">
      {status}
    </Badge>
  );
}

export function PaymentsPageClient() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;

  const utils = trpc.useUtils();
  const retryMutation = trpc.payments.adminRetry.useMutation({
    onSuccess: () => { toast.success("Paiement réessayé"); utils.payments.adminList.invalidate(); utils.payments.adminStats.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const cancelMutation = trpc.payments.adminCancel.useMutation({
    onSuccess: () => { toast.success("Paiement annulé"); utils.payments.adminList.invalidate(); utils.payments.adminStats.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const { data: stats, isFetching: statsLoading } = trpc.payments.adminStats.useQuery();
  const { data: list, isFetching: listLoading } = trpc.payments.adminList.useQuery({
    page,
    limit,
  });

  return (
    <ConsolePageShell
      title="Paiements"
      subtitle="Gestion des transactions de paiement"
      actions={
        <Button variant="outline" onClick={() => router.refresh()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      }
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            {
              label: "Revenu total",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_revenue ?? 0),
              icon: Banknote,
              color: "success",
            },
            {
              label: "Transactions",
              value: stats?.total_transactions ?? 0,
              icon: CreditCard,
              color: "info",
            },
            {
              label: "Réussi",
              value: stats?.successful_transactions ?? 0,
              icon: BadgeDollarSign,
              color: "success",
            },
            {
              label: "Échoué",
              value: stats?.failed_transactions ?? 0,
              icon: Wallet,
              color: "error",
            },
            {
              label: "Revenu net",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.net_revenue ?? 0),
              icon: TrendingUp,
              color: "info",
            },
            {
              label: "Frais totaux",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_fees ?? 0),
              icon: ArrowUpDown,
              color: "warning",
            },
            {
              label: "En attente",
              value: stats?.pending_transactions ?? 0,
              icon: CreditCard,
              color: "warning",
            },
            {
              label: "Remboursé",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.refund_amount ?? 0),
              icon: Wallet,
              color: "error",
            },
          ]}
        />
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Liste de toutes les transactions de paiement</CardDescription>
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
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Commande</th>
                    <th className="pb-3 font-medium">Fournisseur</th>
                    <th className="pb-3 font-medium">Montant</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {list?.items.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/console/payments/${tx.id}`)}
                    >
                      <td className="py-3 font-mono text-xs">{tx.id.slice(0, 12)}...</td>
                      <td className="py-3">{tx.order_number ?? tx.order_id.slice(0, 8)}</td>
                      <td className="py-3 capitalize">{tx.provider}</td>
                      <td className="py-3 font-medium">
                        {new Intl.NumberFormat("fr-DZ", {
                          style: "currency",
                          currency: tx.currency,
                        }).format(Number(tx.amount))}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-3 capitalize">{tx.type}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("fr-FR")}
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
                            <DropdownMenuItem
                              onClick={() => router.push(`/console/payments/${tx.id}`)}
                            >
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {tx.status === "failed" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  retryMutation.mutate({ transaction_id: tx.id })
                                }
                              >
                                Réessayer
                              </DropdownMenuItem>
                            )}
                            {(tx.status === "pending" || tx.status === "on_hold") && (
                              <DropdownMenuItem
                                onClick={() =>
                                  cancelMutation.mutate({
                                    transaction_id: tx.id,
                                  })
                                }
                              >
                                Annuler
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
