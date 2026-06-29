"use client";

import { useEffect, useState } from "react";

interface Props {
  ends_at: string | null;
  on_expired?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total_seconds: number;
}

export function StorefrontFlashSaleTimer({ ends_at, on_expired }: Props) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!ends_at) return;

    const end = new Date(ends_at).getTime();

    function compute(): TimeLeft {
      const diff = Math.max(0, end - Date.now());
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        total_seconds: Math.floor(diff / 1000),
      };
    }

    setTime(compute());
    const interval = setInterval(() => {
      const t = compute();
      setTime(t);
      if (t.total_seconds <= 0) {
        clearInterval(interval);
        on_expired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ends_at, on_expired]);

  if (!time || time.total_seconds <= 0) return null;

  return (
    <div className="flash-sale-timer flex items-center gap-3">
      <TimerUnit value={time.days} label="Days" />
      <Separator />
      <TimerUnit value={time.hours} label="Hours" />
      <Separator />
      <TimerUnit value={time.minutes} label="Minutes" />
      <Separator />
      <TimerUnit value={time.seconds} label="Seconds" />
    </div>
  );
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-xs uppercase tracking-wider opacity-70">{label}</span>
    </div>
  );
}

function Separator() {
  return <span className="text-2xl font-bold opacity-50">:</span>;
}
