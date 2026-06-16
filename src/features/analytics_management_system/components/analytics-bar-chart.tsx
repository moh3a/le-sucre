"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "A bar chart";

export function AnalyticsBarChart({
  title,
  description,
  data,
  x_key,
  y_key,
  compact_y_key = false,
}: {
  title?: string;
  description?: string;
  data: Array<Record<string, string | number | null>>;
  x_key: string;
  y_key: string;
  compact_y_key?: boolean;
}) {
  const chartConfig = {
    y_key: {
      label: y_key,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={x_key}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => (compact_y_key ? value.slice(0, 3) : value)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey={y_key} fill="var(--color-y_key)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
