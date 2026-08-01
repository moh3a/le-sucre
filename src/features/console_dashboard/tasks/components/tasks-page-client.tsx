"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Button } from "@/components/ui/button";
import { ROLE_NAMES } from "@/features/authentication_and_authorization/authorization/constants/roles";
import { NotificationBell } from "@/features/console_dashboard/components/notification-bell";
import { TasksTable } from "./tasks-table";
import { CreateTaskDialog } from "./create-task-dialog";
import { TeamWorkload } from "./team-workload";

export function TasksPageClient() {
  const t = useTranslations("tasks");
  const { data: session } = authClient.useSession();
  const is_admin = session?.userRole === ROLE_NAMES.admin;
  const is_moderator = session?.userRole === ROLE_NAMES.moderator;

  const [view, setView] = useState<"mine" | "all">("mine");

  const dashboardQuery = trpc.operations.adminTaskDashboard.useQuery(undefined, {
    enabled: !is_admin,
  });
  const teamQuery = trpc.operations.adminTaskTeamDashboard.useQuery(undefined, {
    enabled: is_admin,
  });

  const team_totals = (teamQuery.data ?? []).reduce(
    (acc, row) => {
      acc.pending += row.pending;
      acc.in_progress += row.in_progress;
      acc.overdue += row.overdue;
      acc.completed += row.completed;
      return acc;
    },
    { pending: 0, in_progress: 0, overdue: 0, completed: 0 },
  );

  const stats = is_admin
    ? team_totals
    : {
        pending: dashboardQuery.data?.pending ?? 0,
        in_progress: dashboardQuery.data?.in_progress ?? 0,
        overdue: dashboardQuery.data?.overdue ?? 0,
        completed: dashboardQuery.data?.completed ?? 0,
      };

  const loading = is_admin ? teamQuery.isLoading : dashboardQuery.isLoading;
  const error = is_admin ? teamQuery.error : dashboardQuery.error;

  return (
    <QueryGuard query={{ isLoading: loading, error }}>
      <ConsolePageShell
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <NotificationBell />
            <CreateTaskDialog />
          </div>
        }
        stats={
          <StatsGrid
            loading={loading}
            items={[
              {
                label: t("pending"),
                value: stats.pending,
                icon: Clock,
                color: "warning",
              },
              {
                label: t("in_progress"),
                value: stats.in_progress,
                icon: ListTodo,
                color: "info",
              },
              {
                label: t("overdue"),
                value: stats.overdue,
                icon: AlertTriangle,
                color: "error",
              },
              {
                label: t("completed"),
                value: stats.completed,
                icon: CheckCircle2,
                color: "success",
              },
            ]}
          />
        }
      >
        <div className="space-y-6">
          {is_admin && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium">{t("team_workload")}</h2>
              <TeamWorkload />
            </section>
          )}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">
                {is_admin ? t("all_tasks") : view === "mine" ? t("my_tasks") : t("all_tasks")}
              </h2>
              {!is_admin && (
                <div className="flex items-center gap-1 rounded-lg border p-0.5">
                  <Button
                    variant={view === "mine" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7"
                    onClick={() => setView("mine")}
                  >
                    {t("my_tasks")}
                  </Button>
                  <Button
                    variant={view === "all" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7"
                    onClick={() => setView("all")}
                  >
                    {t("all_tasks")}
                  </Button>
                </div>
              )}
            </div>
            <TasksTable
              mode={is_admin ? "all" : view}
              showAssigneeFilter={is_admin || (is_moderator && view === "all")}
            />
          </section>
        </div>
      </ConsolePageShell>
    </QueryGuard>
  );
}
