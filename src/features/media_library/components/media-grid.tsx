"use client";

import { useState } from "react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCard } from "./media-card";
import type { MediaListItem } from "../types";

type MediaGridProps = {
  search?: string;
};

export function MediaGrid({ search }: MediaGridProps) {
  const [page, set_page] = useState(1);

  const { data, isLoading } = trpc.media.list.useQuery({
    search,
    limit: 24,
    page,
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    }>
    {!data ? null : (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {(data.items as MediaListItem[]).map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 py-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => set_page((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Précédent
        </Button>
        <span className="text-muted-foreground text-sm">
          Page {page} / {data.meta.total_pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => set_page((p) => p + 1)}
          disabled={!data.meta.has_more}
        >
          Suivant
        </Button>
      </div>
    </div>
    )}
    </QueryGuard>
  );
}
