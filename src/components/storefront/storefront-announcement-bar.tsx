"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { CampaignBanner } from "@/features/campaign_management_system/components/storefront/types";

interface Props {
  banners: CampaignBanner[];
}

export function StorefrontAnnouncementBar({ banners }: Props) {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((c) => c + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const visible = banners.filter((b) => b.is_active && !dismissed[b.id]);
  if (!visible.length) return null;

  return (
    <div className="relative z-50">
      {visible.map((banner) => (
        <AnnouncementItem
          key={banner.id}
          banner={banner}
          tick={tick}
          onDismiss={() => setDismissed((d) => ({ ...d, [banner.id]: true }))}
        />
      ))}
    </div>
  );
}

function AnnouncementItem({
  banner,
  tick,
  onDismiss,
}: {
  banner: CampaignBanner;
  tick: number;
  onDismiss: () => void;
}) {
  const overlay = banner.overlay_content?.fr ?? banner.overlay_content?.en ?? null;
  const headline = overlay?.headline ?? banner.alt_text ?? "";
  const cta = overlay?.cta;
  const href = banner.link_url ?? "#";
  const now = useMemo(() => +new Date(), []);

  if (banner.banner_type === "countdown_bar" && banner.placement.includes("countdown_bar")) {
    const end_time = (banner as CampaignBanner & { ends_at?: string }).ends_at;
    const remaining = end_time ? Math.max(0, new Date(end_time).getTime() - now) : 0;
    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return (
      <div className="from-crimson-violet to-crimson-violet/80 flex items-center justify-center gap-3 bg-linear-to-r px-4 py-2.5 text-sm text-white">
        {headline && <span className="font-medium">{headline}</span>}
        <div className="flex items-center gap-1 font-mono font-bold tabular-nums">
          <span className="rounded bg-white/20 px-1.5 py-0.5">
            {String(hours).padStart(2, "0")}
          </span>
          <span>:</span>
          <span className="rounded bg-white/20 px-1.5 py-0.5">
            {String(minutes).padStart(2, "0")}
          </span>
          <span>:</span>
          <span className="rounded bg-white/20 px-1.5 py-0.5">
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
        {cta && (
          <Link
            href={href}
            className="text-crimson-violet rounded bg-white px-3 py-1 text-xs font-semibold transition hover:bg-white/90"
          >
            {cta}
          </Link>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 transition hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-olive-leaf flex items-center justify-center gap-3 px-4 py-2.5 text-sm text-white">
      {headline && <span className="font-medium">{headline}</span>}
      {overlay?.body && <span className="hidden text-white/80 sm:inline">{overlay.body}</span>}
      {cta && (
        <Link
          href={href}
          className="text-olive-leaf rounded bg-white px-3 py-1 text-xs font-semibold transition hover:bg-white/90"
        >
          {cta}
        </Link>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 transition hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
