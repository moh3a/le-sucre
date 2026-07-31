import { HealthPageClient } from "@/features/system/monitoring/health/components/health-page-client";

export const metadata = { title: "État des services" };

export default function HealthPage() {
  return <HealthPageClient />;
}
