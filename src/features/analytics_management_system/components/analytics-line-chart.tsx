"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function AnalyticsLineChart({
  data,
  x_key,
  y_key,
}: {
  data: Array<Record<string, string | number | null>>;
  x_key: string;
  y_key: string;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={x_key} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={y_key} stroke="#700145" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
