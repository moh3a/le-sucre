"use client";

import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { TasksTable } from "./tasks-table";

export function TasksPageClient() {
  const { data: dashboard, isLoading } = trpc.operations.adminTaskDashboard.useQuery();

  return (
    <ConsolePageShell
      title="Tâches"
      subtitle="Gestion des tâches internes"
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "En attente", value: dashboard?.pending ?? 0, icon: Clock, color: "warning" },
            { label: "En cours", value: dashboard?.in_progress ?? 0, icon: ListTodo, color: "info" },
            { label: "En retard", value: dashboard?.overdue ?? 0, icon: AlertTriangle, color: "error" },
            { label: "Terminées", value: dashboard?.completed ?? 0, icon: CheckCircle2, color: "success" },
          ]}
        />
      }
    >
      <TasksTable />
    </ConsolePageShell>
  );
}
