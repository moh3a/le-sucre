import { HealthPageClient } from "@/features/monitoring/health/components/health-page-client";

export const metadata = { title: "État des services" };

export default function HealthPage() {
  return <HealthPageClient />;
}
