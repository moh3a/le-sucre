"use client";

import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { UserRound } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type WorkloadRow = {
  user_id: string;
  name: string;
  email: string | null;
  pending: number;
  in_progress: number;
  overdue: number;
  completed: number;
  cancelled: number;
  active: number;
};

export function TeamWorkload() {
  const t = useTranslations("tasks");
  const [assignee, setAssignee] = useQueryState("tkAssignee", parseAsString);
  const { data, isLoading } = trpc.operations.adminTaskTeamDashboard.useQuery();

  const rows = (data ?? []) as WorkloadRow[];

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<Skeleton className="h-40 w-full" />}>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("team_member")}</TableHead>
              <TableHead className="text-center">{t("pending")}</TableHead>
              <TableHead className="text-center">{t("in_progress")}</TableHead>
              <TableHead className="text-center">{t("overdue")}</TableHead>
              <TableHead className="text-center">{t("completed")}</TableHead>
              <TableHead className="text-center">{t("team_total")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground h-24 text-center">
                  {t("no_staff_tasks")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.user_id}
                  className={cn("cursor-pointer", assignee === row.user_id && "bg-accent")}
                  onClick={() => setAssignee(assignee === row.user_id ? null : row.user_id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserRound className="text-muted-foreground size-4" />
                      <div>
                        <p className="text-sm font-medium">{row.name}</p>
                        {row.email && (
                          <p className="text-muted-foreground text-xs">{row.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{row.pending}</TableCell>
                  <TableCell className="text-center">{row.in_progress}</TableCell>
                  <TableCell className="text-center">
                    {row.overdue > 0 ? (
                      <Badge variant="destructive">{row.overdue}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{row.completed}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{row.active}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </QueryGuard>
  );
}
