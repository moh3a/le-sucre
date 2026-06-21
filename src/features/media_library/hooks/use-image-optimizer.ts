"use client";

import * as React from "react";
import type { ImageSizes } from "../types";

interface OptimizationResult {
  variants: ImageSizes | null;
  loading: boolean;
  error: string | null;
  optimize: (media_id: string) => Promise<ImageSizes | null>;
}

export function useImageOptimizer(): OptimizationResult {
  const [loading, set_loading] = React.useState(false);
  const [error, set_error] = React.useState<string | null>(null);
  const [variants, set_variants] = React.useState<ImageSizes | null>(null);

  const optimize = React.useCallback(
    async (media_id: string): Promise<ImageSizes | null> => {
      set_loading(true);
      set_error(null);
      try {
        const res = await fetch(`/api/admin/media/optimize/${media_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message ?? "Optimization failed");
        }
        const result = await res.json();
        const sizes = result.data?.variants ?? null;
        set_variants(sizes);
        return sizes;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Optimization failed";
        set_error(msg);
        return null;
      } finally {
        set_loading(false);
      }
    },
    [],
  );

  return { variants, loading, error, optimize };
}

export function useImageSrc(
  media_url: string | null | undefined,
  variants: ImageSizes | null | undefined,
  size: "thumbnail" | "medium" | "original" = "original",
): string {
  return React.useMemo(() => {
    if (!media_url) return "/placeholder.svg";

    if (variants && variants[size]) {
      return variants[size].url;
    }

    return media_url;
  }, [media_url, variants, size]);
}
