"use client";

import { useEffect, useState } from "react";
import type { CampaignBanner } from "./types";

interface Props {
  banner: CampaignBanner;
  end_time?: string;
}

export function CampaignCountdownBar({ banner, end_time }: Props) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!end_time) return;
    const end = new Date(end_time).getTime();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setRemaining(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [end_time]);

  if (remaining <= 0) return null;

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="campaign-countdown-bar flex items-center justify-center gap-4 bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 text-white">
      <span className="text-sm font-medium">{banner.alt_text ?? "Offre à durée limitée"}</span>
      <div className="flex items-center gap-1 text-lg font-mono font-bold tabular-nums">
        <span className="rounded bg-white/20 px-2 py-1">{String(hours).padStart(2, "0")}</span>
        <span>:</span>
        <span className="rounded bg-white/20 px-2 py-1">{String(minutes).padStart(2, "0")}</span>
        <span>:</span>
        <span className="rounded bg-white/20 px-2 py-1">{String(seconds).padStart(2, "0")}</span>
      </div>
      {banner.link_url && (
        <a
          href={banner.link_url}
          target={banner.link_target ?? "_self"}
          className="rounded bg-white px-4 py-1 text-sm font-semibold text-red-600 transition hover:bg-gray-100"
        >
          {banner.overlay_content?.en?.cta ?? "Shop Now"}
        </a>
      )}
    </div>
  );
}
