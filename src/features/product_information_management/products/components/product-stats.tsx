"use client";

import { Archive, CheckCircle2, FileEdit, Package } from "lucide-react";
import { useTranslations } from "next-intl";

import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";

export function ProductStats() {
  const t = useTranslations("products");

  const total = trpc.products.list.useQuery({ page: 1, limit: 1 });
  const published = trpc.products.list.useQuery({ page: 1, limit: 1, status: "published" });
  const draft = trpc.products.list.useQuery({ page: 1, limit: 1, status: "draft" });
  const archived = trpc.products.list.useQuery({ page: 1, limit: 1, status: "archived" });

  const loading = total.isLoading || published.isLoading || draft.isLoading || archived.isLoading;

  return (
    <StatsGrid
      loading={loading}
      items={[
        {
          label: "Total",
          value: total.data?.meta.total_records ?? 0,
          icon: Package,
          color: "info",
        },
        {
          label: t("status_published"),
          value: published.data?.meta.total_records ?? 0,
          icon: CheckCircle2,
          color: "success",
        },
        {
          label: t("status_draft"),
          value: draft.data?.meta.total_records ?? 0,
          icon: FileEdit,
          color: "warning",
        },
        {
          label: t("status_archived"),
          value: archived.data?.meta.total_records ?? 0,
          icon: Archive,
          color: "default",
        },
      ]}
    />
  );
}
