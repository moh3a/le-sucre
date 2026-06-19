"use client";

import { LinkIcon, type LucideIcon } from "lucide-react";
import { Stat, StatDescription, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export type StatItem = {
  label: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  color?: "default" | "success" | "info" | "warning" | "error";
  link?: string;
};

export function StatsGrid({ items, loading }: { items: StatItem[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Stat key={item.label}>
          {item.link ? (
            <Link href={item.link}>
              <StatLabel className="flex items-center gap-1">
                {item.label}
                <LinkIcon className="h-3 w-3" />
              </StatLabel>
            </Link>
          ) : (
            <StatLabel>{item.label}</StatLabel>
          )}
          <StatValue>{item.value}</StatValue>
          <StatIndicator variant="icon" color={item.color ?? "default"}>
            <item.icon />
          </StatIndicator>
          {item.description ? <StatDescription>{item.description}</StatDescription> : null}
        </Stat>
      ))}
    </div>
  );
}
