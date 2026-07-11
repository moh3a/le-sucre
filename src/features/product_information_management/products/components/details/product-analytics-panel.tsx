"use client";

import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import {
  Stat,
  StatLabel,
  StatValue,
  StatIndicator,
  StatDescription,
  StatSeparator,
} from "@/components/ui/stat";
import { DollarSign } from "lucide-react";

const chartConfig = {
  revenu: {
    label: "Revenu",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ProductAnalyticsPanel({ product_id }: { product_id: string }) {
  const t = useTranslations("products");
  const range = useMemo(() => {
    return {
      from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    };
  }, []);

  const query = trpc.analytics.productDetail.useQuery(
    {
      product_id,
      ...range,
    },
    {
      enabled: !!range.to && !!range.from,
    },
  );
  const { data } = query;

  if (!data) return <p>{t("analytics_no_data")}</p>;

  return (
    <QueryGuard query={query} loadingFallback={<p>{t("analytics_no_data")}</p>}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat>
          <StatLabel>{t("analytics_revenue_30d")}</StatLabel>
          <StatIndicator variant="icon" color="success">
            <DollarSign />
          </StatIndicator>
          <StatValue>{data.totals.revenue} DZD</StatValue>
          <StatSeparator />
          <StatDescription>{t("analytics_revenue_30d_desc")}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>{t("analytics_views")}</StatLabel>
          <StatIndicator variant="icon" color="success">
            <DollarSign />
          </StatIndicator>
          <StatValue>{data.totals.views}</StatValue>
          <StatSeparator />
          <StatDescription>{t("analytics_views_desc")}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>{t("analytics_cart")}</StatLabel>
          <StatIndicator variant="icon" color="success">
            <DollarSign />
          </StatIndicator>
          <StatValue>{data.totals.add_to_cart}</StatValue>
          <StatSeparator />
          <StatDescription>{t("analytics_cart_desc")}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>{t("analytics_conversion")}</StatLabel>
          <StatIndicator variant="icon" color="success">
            <DollarSign />
          </StatIndicator>
          <StatValue>{(data.totals.avg_conversion * 100).toFixed(1)}%</StatValue>
          <StatSeparator />
          <StatDescription>{t("analytics_conversion_desc")}</StatDescription>
        </Stat>
        <Card className="col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>{t("analytics_daily_revenue")}</CardTitle>
            <CardDescription>
              {range.from} - {range.to}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={(data.daily_series ?? []).map((day) => ({
                  day_key: day.day_key,
                  revenu: day.revenue,
                }))}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day_key"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="revenu"
                  type="natural"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </QueryGuard>
  );
}
