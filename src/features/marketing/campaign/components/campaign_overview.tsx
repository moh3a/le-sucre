"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Coins,
  Eye,
  FileText,
  FlaskConical,
  MousePointerClick,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Trophy,
  Webhook,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { format_currency, formatDate } from "@/lib/format";
import { CampaignStatusBadge } from "./campaign_status_badge";

const CHART_DAYS = 30;

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-lg lg:col-span-2" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

function OverviewSection({
  title,
  action_href,
  action_label,
  children,
  className,
}: {
  title: string;
  action_href: string;
  action_label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={action_href} className="gap-1">
            {action_label}
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function OverviewKpi({
  label,
  value,
  hint,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {label}
          </p>
          <p className="text-2xl font-bold">{value}</p>
          {hint ? <p className="text-muted-foreground text-[10px]">{hint}</p> : null}
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({
  href,
  title,
  description,
  count,
  icon: Icon,
  color,
}: {
  href: string;
  title: string;
  description: string;
  count?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardContent className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`rounded-lg p-2 ${color}`}>
                <Icon className="size-4" />
              </span>
              <p className="truncate text-sm font-semibold">{title}</p>
            </div>
            <p className="text-muted-foreground line-clamp-2 text-xs">{description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {count !== undefined ? (
              <span className="text-lg font-bold tabular-nums">{count.toLocaleString()}</span>
            ) : null}
            <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CampaignOverview() {
  const t = useTranslations("campaigns");
  const { data, isLoading } = trpc.campaigns.campaignOverview.useQuery();

  const chart_config = {
    impressions: {
      label: t("impressions"),
      color: "var(--chart-1)",
    },
    conversions: {
      label: t("conversions"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const totals = data?.analytics?.totals;
  const total_clicks = (totals?.clicks ?? 0) + (totals?.banner_clicks ?? 0);

  const chart_data =
    data?.analytics?.timeseries.map((day) => ({
      label: format(new Date(`${day.day_key}T00:00:00`), "dd MMM", { locale: fr }),
      impressions: day.impressions ?? 0,
      conversions: day.conversions ?? 0,
    })) ?? [];

  const ab_tests = data?.ab_tests?.slice(0, 3) ?? [];
  const landing_pages = data?.landing_pages ?? [];
  const upcoming = data?.upcoming ?? [];
  const counts = data?.counts;

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<OverviewSkeleton />}>
      <div className="space-y-6">
        {/* Global campaign analytics KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewKpi
            label={t("impressions")}
            value={(totals?.impressions ?? 0).toLocaleString()}
            hint={t("overview_last_days", { days: CHART_DAYS })}
            icon={Eye}
            color="text-blue-500 bg-blue-500/10"
          />
          <OverviewKpi
            label={t("clicks")}
            value={total_clicks.toLocaleString()}
            hint={t("overview_banner_clicks", { clicks: totals?.banner_clicks ?? 0 })}
            icon={MousePointerClick}
            color="text-amber-500 bg-amber-500/10"
          />
          <OverviewKpi
            label={t("conversions")}
            value={(totals?.conversions ?? 0).toLocaleString()}
            hint={t("overview_conversion_rate", {
              rate: (totals?.impressions ?? 0) > 0
                ? (((totals?.conversions ?? 0) / (totals?.impressions ?? 0)) * 100).toFixed(2)
                : "0.00",
            })}
            icon={TrendingUp}
            color="text-purple-500 bg-purple-500/10"
          />
          <OverviewKpi
            label={t("revenue")}
            value={format_currency(Number(totals?.revenue ?? 0))}
            hint={t("overview_last_days", { days: CHART_DAYS })}
            icon={Coins}
            color="text-primary bg-primary/10"
          />
        </div>

        {/* Quick access to every campaign sub-feature */}
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold">{t("overview_quick_title")}</h2>
            <p className="text-muted-foreground text-sm">{t("overview_quick_desc")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLinkCard
              href="/console/campaigns/ab-testing"
              title={t("overview_quick_ab_testing")}
              description={t("overview_quick_ab_testing_desc")}
              count={counts?.ab_groups}
              icon={FlaskConical}
              color="text-violet-500 bg-violet-500/10"
            />
            <QuickLinkCard
              href="/console/campaigns/landing-pages"
              title={t("overview_quick_landing_pages")}
              description={t("overview_quick_landing_pages_desc")}
              count={counts?.landing_pages}
              icon={FileText}
              color="text-blue-500 bg-blue-500/10"
            />
            <QuickLinkCard
              href="/console/campaigns/flash-sales"
              title={t("overview_quick_flash_sales")}
              description={t("overview_quick_flash_sales_desc")}
              count={counts?.flash_sales}
              icon={Zap}
              color="text-amber-500 bg-amber-500/10"
            />
            <QuickLinkCard
              href="/console/campaigns/automation-rules"
              title={t("overview_quick_automation")}
              description={t("overview_quick_automation_desc")}
              count={counts?.automation_rules}
              icon={Workflow}
              color="text-emerald-500 bg-emerald-500/10"
            />
            <QuickLinkCard
              href="/console/campaigns/scheduler"
              title={t("overview_quick_scheduler")}
              description={t("overview_quick_scheduler_desc")}
              count={counts?.scheduled_jobs}
              icon={CalendarClock}
              color="text-cyan-500 bg-cyan-500/10"
            />
            <QuickLinkCard
              href="/console/campaigns/recommendations"
              title={t("overview_quick_recommendations")}
              description={t("overview_quick_recommendations_desc")}
              icon={Sparkles}
              color="text-pink-500 bg-pink-500/10"
            />
            <QuickLinkCard
              href="/console/campaigns/webhooks"
              title={t("overview_quick_webhooks")}
              description={t("overview_quick_webhooks_desc")}
              count={counts?.webhook_events}
              icon={Webhook}
              color="text-slate-500 bg-slate-500/10"
            />
            <QuickLinkCard
              href="/console/campaigns/new"
              title={t("overview_quick_new")}
              description={t("overview_quick_new_desc")}
              icon={PlusCircle}
              color="text-primary bg-primary/10"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Performance chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t("overview_performance_title")}</CardTitle>
              <CardDescription>{t("overview_performance_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {chart_data.length === 0 ? (
                <div className="text-muted-foreground py-16 text-center text-sm">
                  {t("no_analytics_data")}
                </div>
              ) : (
                <ChartContainer config={chart_config} className="h-64 w-full">
                  <ComposedChart accessibilityLayer data={chart_data}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={24}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="impressions"
                      fill="var(--color-impressions)"
                      radius={4}
                      barSize={14}
                    />
                    <Line
                      dataKey="conversions"
                      type="natural"
                      stroke="var(--color-conversions)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* A/B testing overview */}
          <OverviewSection
            title={t("overview_ab_testing_title")}
            action_href="/console/campaigns/ab-testing"
            action_label={t("overview_view_all")}
          >
            {ab_tests.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {t("overview_no_ab_tests")}
              </p>
            ) : (
              <div className="space-y-5">
                {ab_tests.map((test) => {
                  const winner = test.variants.find((v) => v.variant_id === test.winner_id);
                  return (
                    <div key={test.test_group}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <FlaskConical className="text-muted-foreground size-4 shrink-0" />
                          <span className="truncate font-mono text-xs font-medium">
                            {test.test_group}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {test.significant && winner && (
                            <Badge className="border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <Trophy className="mr-1 size-3" />
                              {winner.name}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {test.total_impressions.toLocaleString()} {t("impressions").toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {test.variants.map((v) => (
                          <div
                            key={v.variant_id}
                            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className={`size-2 shrink-0 rounded-full ${
                                  v.winner ? "bg-emerald-500" : "bg-muted-foreground/40"
                                }`}
                              />
                              <span className="truncate">{v.name}</span>
                            </div>
                            <div className="text-muted-foreground flex shrink-0 items-center gap-3 font-mono text-xs">
                              <span>{v.traffic_split}%</span>
                              <span>{v.conversions}</span>
                              <span>{v.conversion_rate.toFixed(2)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </OverviewSection>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Landing pages overview */}
          <OverviewSection
            title={t("overview_landing_pages_title")}
            action_href="/console/campaigns/landing-pages"
            action_label={t("overview_view_all")}
          >
            {landing_pages.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {t("overview_no_landing_pages")}
              </p>
            ) : (
              <div className="divide-y">
                {landing_pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="text-muted-foreground size-4 shrink-0" />
                      <div className="min-w-0">
                        <Link
                          href={`/console/campaigns/${page.id}`}
                          className="block truncate text-sm font-medium hover:underline"
                        >
                          {page.name}
                        </Link>
                        <p className="text-muted-foreground truncate font-mono text-xs">
                          /{page.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right font-mono text-xs">
                        <div>
                          {page.conversions.toLocaleString()} {t("conversions").toLowerCase()}
                        </div>
                        <div className="text-muted-foreground">
                          {format_currency(Number(page.revenue))}
                        </div>
                      </div>
                      <CampaignStatusBadge status={page.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </OverviewSection>

          {/* Upcoming scheduled campaigns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base">{t("overview_upcoming_title")}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/console/campaigns" className="gap-1">
                  {t("overview_view_all")}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {t("overview_no_upcoming")}
                </p>
              ) : (
                <div className="divide-y">
                  {upcoming.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <CalendarClock className="text-muted-foreground size-4 shrink-0" />
                        <Link
                          href={`/console/campaigns/${campaign.id}`}
                          className="block truncate text-sm font-medium hover:underline"
                        >
                          {campaign.name}
                        </Link>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-muted-foreground text-xs">
                          {campaign.starts_at ? formatDate(campaign.starts_at) : "—"}
                        </span>
                        <CampaignStatusBadge status={campaign.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </QueryGuard>
  );
}
