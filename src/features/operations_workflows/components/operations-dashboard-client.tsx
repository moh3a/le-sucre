"use client";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AlertCircle, Ban, Wrench, Banknote, RefreshCw, ListTodo, Phone, HeadphonesIcon, Warehouse } from "lucide-react";

export function OperationsDashboardClient() {
  const escalations = trpc.operations.orderListEscalations.useQuery({ page: 1, limit: 1, status: "open" });
  const cancellations = trpc.operations.orderListCancellationRequests.useQuery({ page: 1, limit: 1, status: "pending" });
  const tasks = trpc.operations.adminTaskDashboard.useQuery();
  const pendingPayments = trpc.operations.paymentCountPendingVerifications.useQuery();
  const overdueFollowups = trpc.operations.customerGetOverdueFollowUps.useQuery();

  if (escalations.isLoading && cancellations.isLoading && tasks.isLoading)
    return <Skeleton className="h-96 w-full" />;

  const widgets = [
    {
      title: "Escalades ouvertes",
      count: escalations.data?.meta?.total_records ?? 0,
      icon: AlertCircle,
      href: "/console/operations/escalations",
      color: "text-destructive",
    },
    {
      title: "Annulations en attente",
      count: cancellations.data?.meta?.total_records ?? 0,
      icon: Ban,
      href: "/console/operations/cancellations",
      color: "text-destructive",
    },
    {
      title: "Tâches en attente",
      count: tasks.data?.pending ?? 0,
      icon: ListTodo,
      href: "/console/operations/tasks",
      color: "text-secondary",
    },
    {
      title: "Tâches en retard",
      count: tasks.data?.overdue ?? 0,
      icon: AlertCircle,
      href: "/console/operations/tasks",
      color: "text-destructive",
    },
    {
      title: "Paiements en attente",
      count: pendingPayments.data ?? 0,
      icon: Banknote,
      href: "/console/operations/payment-verifications",
      color: "text-secondary",
    },
    {
      title: "Relances en retard",
      count: overdueFollowups.data?.length ?? 0,
      icon: Phone,
      href: "/console/operations/follow-ups",
      color: "text-destructive",
    },
    {
      title: "Garanties",
      icon: Wrench,
      href: "/console/operations/warranty",
      color: "text-secondary",
    },
    {
      title: "Remboursements",
      icon: RefreshCw,
      href: "/console/operations/refunds",
      color: "text-secondary",
    },
    {
      title: "Cas de support",
      icon: HeadphonesIcon,
      href: "/console/operations/support-cases",
      color: "text-secondary",
    },
    {
      title: "Ajustements stock",
      icon: Warehouse,
      href: "/console/operations/inventory-adjustments",
      color: "text-secondary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opérations</h1>
        <p className="text-muted-foreground">Tableau de bord des opérations quotidiennes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {widgets.map((w) => (
          <Link key={w.href} href={w.href}>
            <Card className="transition-colors hover:bg-accent/5 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{w.title}</CardTitle>
                <w.icon className={`h-4 w-4 ${w.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${w.color}`}>
                  {"count" in w ? w.count : "—"}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
