"use client";

import { useEffect, useState } from "react";

function format_remaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const total_sec = Math.floor(ms / 1000);
  const h = String(Math.floor(total_sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((total_sec % 3600) / 60)).padStart(2, "0");
  const s = String(total_sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function FlashSaleCountdown({ ends_at }: { ends_at: string }) {
  const [remaining, set_remaining] = useState(() =>
    format_remaining(new Date(ends_at).getTime() - Date.now()),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      set_remaining(format_remaining(new Date(ends_at).getTime() - Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [ends_at]);

  return (
    <span className="font-mono text-sm font-semibold text-(--crimson-violet) tabular-nums">
      {remaining}
    </span>
  );
}
