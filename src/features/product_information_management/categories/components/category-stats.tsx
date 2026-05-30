"use client";

import { CheckCircle2, FolderTree, Layers, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { Stat, StatDescription, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export function CategoryStats() {
  const t = useTranslations("categories");

  // TODO create an analytics route
  const total_query = trpc.categories.list.useQuery({ page: 1, limit: 1 });
  const active_query = trpc.categories.list.useQuery({ page: 1, limit: 1, is_active: true });
  const inactive_query = trpc.categories.list.useQuery({ page: 1, limit: 1, is_active: false });
  const root_query = trpc.categories.list.useQuery({
    page: 1,
    limit: 1,
    parent_id: null,
  });

  const is_loading =
    total_query.isLoading ||
    active_query.isLoading ||
    inactive_query.isLoading ||
    root_query.isLoading;

  if (is_loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-lg" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: t("stats_total"),
      value: total_query.data?.meta.total_records ?? 0,
      description: t("stats_total_desc"),
      icon: FolderTree,
      color: "info" as const,
    },
    {
      label: t("stats_active"),
      value: active_query.data?.meta.total_records ?? 0,
      description: t("stats_active_desc"),
      icon: CheckCircle2,
      color: "success" as const,
    },
    {
      label: t("stats_inactive"),
      value: inactive_query.data?.meta.total_records ?? 0,
      description: t("stats_inactive_desc"),
      icon: XCircle,
      color: "warning" as const,
    },
    {
      label: t("stats_root"),
      value: root_query.data?.meta.total_records ?? 0,
      description: t("stats_root_desc"),
      icon: Layers,
      color: "default" as const,
    },
  ];

  return (
    <Carousel>
      <CarouselContent>
        {stats.map((stat) => (
          <CarouselItem key={stat.label} className="lg:basis-[22%]">
            <Stat>
              <StatLabel>{stat.label}</StatLabel>
              <StatValue>{stat.value}</StatValue>
              <StatIndicator variant="icon" color={stat.color}>
                <stat.icon />
              </StatIndicator>
              <StatDescription>{stat.description}</StatDescription>
            </Stat>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
