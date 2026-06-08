"use client";

import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { trpc } from "@/components/providers/app-providers";
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
  const range = useMemo(() => {
    return {
      from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    };
  }, []);

  const { data, isLoading } = trpc.analytics.productDetail.useQuery(
    {
      product_id,
      ...range,
    },
    {
      enabled: !!range.to && !!range.from,
    },
  );

  if (isLoading) return <p>Chargement…</p>;
  if (!data) return <p>Aucune donnée</p>;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"> 
      <Stat>
        <StatLabel>Revenu (30j)</StatLabel>
        <StatIndicator variant="icon" color="success">
          <DollarSign />
        </StatIndicator>
        <StatValue>{data.totals.revenue} DZD</StatValue>
        <StatSeparator />
        <StatDescription>Revenu total generate dans les 30 derniers jours</StatDescription>
      </Stat>
      <Stat>
        <StatLabel>Vues</StatLabel>
        <StatIndicator variant="icon" color="success">
          <DollarSign />
        </StatIndicator>
        <StatValue>{data.totals.views}</StatValue>
        <StatSeparator />
        <StatDescription>Total des vues de produits</StatDescription>
      </Stat>
      <Stat>
        <StatLabel>Panier</StatLabel>
        <StatIndicator variant="icon" color="success">
          <DollarSign />
        </StatIndicator>
        <StatValue>{data.totals.add_to_cart}</StatValue>
        <StatSeparator />
        <StatDescription>Total des ajouts au panier du produit</StatDescription>
      </Stat>
      <Stat>
        <StatLabel>Conversion</StatLabel>
        <StatIndicator variant="icon" color="success">
          <DollarSign />
        </StatIndicator>
        <StatValue>{(data.totals.avg_conversion * 100).toFixed(1)}%</StatValue>
        <StatSeparator />
        <StatDescription>Moyenne de conversion du produit</StatDescription>
      </Stat>
      <Card className="col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Revenus journaliers</CardTitle>
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
  );
}
