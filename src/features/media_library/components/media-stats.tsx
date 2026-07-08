/* eslint-disable jsx-a11y/alt-text */
"use client";

import { Image, FileVideo, HardDrive } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Stat, StatLabel, StatValue, StatIndicator } from "@/components/ui/stat";
import { Skeleton } from "@/components/ui/skeleton";

function format_bytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

export function MediaStats() {
  const { data: stats, isLoading } = trpc.media.stats.useQuery();

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    }>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Stat>
        <StatLabel>Total des fichiers</StatLabel>
        <StatValue>{stats?.total_media ?? 0}</StatValue>
        <StatIndicator>
          <HardDrive />
        </StatIndicator>
      </Stat>
      <Stat>
        <StatLabel>Images</StatLabel>
        <StatValue>{stats?.total_images ?? 0}</StatValue>
        <StatIndicator>
          <Image />
        </StatIndicator>
      </Stat>
      <Stat>
        <StatLabel>Vidéos</StatLabel>
        <StatValue>{stats?.total_videos ?? 0}</StatValue>
        <StatIndicator>
          <FileVideo />
        </StatIndicator>
      </Stat>
      <Stat>
        <StatLabel>Espace utilisé</StatLabel>
        <StatValue>{format_bytes(stats?.total_size ?? 0)}</StatValue>
        <StatIndicator>
          <HardDrive />
        </StatIndicator>
      </Stat>
    </div>
    </QueryGuard>
  );
}
