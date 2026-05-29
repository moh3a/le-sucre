import { AnalyticsDashboardClient } from "@/features/analytics_management_system/components/analytics-dashboard-client";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl">Analytique</h1>
      <AnalyticsDashboardClient />
    </div>
  );
}
