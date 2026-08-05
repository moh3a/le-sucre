"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { CheckCircle2, Eye, FlaskConical, ShoppingCart, Trophy, XCircle } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid, type StatItem } from "@/components/console/stats-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format_currency } from "@/lib/format";

type ABTestReport = {
  test_group: string;
  variants: Array<{
    variant_id: string;
    campaign_id: string;
    name: string;
    traffic_split: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversion_rate: number;
    winner: boolean;
    confidence: number;
  }>;
  total_impressions: number;
  total_conversions: number;
  started_at: string | null;
  ended_at: string | null;
  significant: boolean;
  winner_id: string | null;
};

function ABTestingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ABTestingReport({ report }: { report: ABTestReport }) {
  const t = useTranslations("campaigns");

  const winner_name = report.winner_id
    ? (report.variants.find((v) => v.variant_id === report.winner_id)?.name ?? "—")
    : "—";

  const stats: StatItem[] = [
    {
      label: t("ab_testing_total_impressions"),
      value: report.total_impressions.toLocaleString(),
      icon: Eye,
      color: "info",
    },
    {
      label: t("ab_testing_total_conversions"),
      value: report.total_conversions.toLocaleString(),
      icon: ShoppingCart,
      color: "success",
    },
    {
      label: t("ab_testing_significant"),
      value: report.significant ? t("ab_testing_yes") : t("ab_testing_no"),
      icon: report.significant ? CheckCircle2 : XCircle,
      color: report.significant ? "success" : "warning",
    },
    {
      label: t("ab_testing_winner"),
      value: winner_name,
      icon: Trophy,
      color: "default",
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid items={stats} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-base">{t("ab_testing")}</CardTitle>
            <CardDescription>{report.test_group}</CardDescription>
          </div>
          <Badge variant={report.significant ? "success" : "outline"}>
            {report.significant ? t("ab_testing_yes") : t("ab_testing_no")}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ab_testing_variant")}</TableHead>
                <TableHead className="text-right">{t("ab_testing_traffic")}</TableHead>
                <TableHead className="text-right">{t("impressions")}</TableHead>
                <TableHead className="text-right">{t("clicks")}</TableHead>
                <TableHead className="text-right">{t("ab_testing_ctr")}</TableHead>
                <TableHead className="text-right">{t("conversions")}</TableHead>
                <TableHead className="text-right">{t("ab_testing_conv_rate")}</TableHead>
                <TableHead className="text-right">{t("revenue")}</TableHead>
                <TableHead className="text-right">{t("ab_testing_confidence")}</TableHead>
                <TableHead className="text-center">{t("ab_testing_winner_badge")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.variants.map((v) => (
                <TableRow key={v.variant_id} className={v.winner ? "bg-success/5" : undefined}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="text-right">{v.traffic_split}%</TableCell>
                  <TableCell className="text-right">{v.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{v.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {v.ctr.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">{v.conversions.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {v.conversion_rate.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {format_currency(v.revenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{v.confidence}%</TableCell>
                  <TableCell className="text-center">
                    {v.winner && <Badge variant="success">{t("ab_testing_winner_badge")}</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function ABTestingClient() {
  const t = useTranslations("campaigns");
  const groupsQuery = trpc.campaigns.abTestGroups.useQuery();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const reportQuery = trpc.campaigns.abTestReport.useQuery(
    { test_group: selectedGroup ?? "", days: 30 },
    { enabled: !!selectedGroup },
  );

  return (
    <QueryGuard query={groupsQuery} loadingFallback={<ABTestingSkeleton />}>
      <ConsolePageShell title={t("ab_testing")} subtitle={t("ab_testing_subtitle")}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="text-muted-foreground size-4" />
              {t("ab_testing")}
            </CardTitle>
            <CardDescription>{t("ab_testing_select_group")}</CardDescription>
          </CardHeader>
          <CardContent>
            {groupsQuery.data?.length ? (
              <div className="flex flex-wrap gap-2">
                {groupsQuery.data.map((group) => {
                  const active = selectedGroup === group;
                  return (
                    <Button
                      key={group}
                      variant={active ? "default" : "outline"}
                      aria-pressed={active}
                      onClick={() => setSelectedGroup(group)}
                    >
                      {group}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t("ab_testing_no_groups")}</p>
            )}
          </CardContent>
        </Card>

        {selectedGroup && (
          <QueryGuard query={reportQuery} loadingFallback={<ABTestingSkeleton />}>
            {reportQuery.data &&
              (reportQuery.data.variants.length ? (
                <ABTestingReport report={reportQuery.data} />
              ) : (
                <Empty>
                  <EmptyMedia variant="icon">
                    <FlaskConical />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>{t("ab_testing")}</EmptyTitle>
                    <EmptyDescription>{t("ab_testing_no_report")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ))}
          </QueryGuard>
        )}
      </ConsolePageShell>
    </QueryGuard>
  );
}
