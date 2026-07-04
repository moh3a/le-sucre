"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CountdownTimerProps {
  endsAt: string | null;
  onExpired?: () => void;
  variant?: "default" | "bar" | "inline";
  label?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function CountdownTimer({ endsAt, onExpired, variant = "default", label }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const end = new Date(endsAt).getTime();

    function compute(): TimeLeft {
      const diff = Math.max(0, end - Date.now());
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        totalSeconds: Math.floor(diff / 1000),
      };
    }

    setTime(compute());
    const interval = setInterval(() => {
      const t = compute();
      setTime(t);
      if (t.totalSeconds <= 0) {
        clearInterval(interval);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onExpired]);

  if (!endsAt) return null;

  if (!time) {
    return variant === "bar" ? (
      <Skeleton className="h-12 w-full rounded" />
    ) : (
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (time.totalSeconds <= 0) return null;

  if (variant === "bar") {
    return (
      <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 text-white">
        {label && <span className="text-sm font-medium">{label}</span>}
        <div className="flex items-center gap-1 font-mono text-lg font-bold tabular-nums">
          <span className="rounded bg-white/20 px-2 py-1">{String(time.hours).padStart(2, "0")}</span>
          <span>:</span>
          <span className="rounded bg-white/20 px-2 py-1">{String(time.minutes).padStart(2, "0")}</span>
          <span>:</span>
          <span className="rounded bg-white/20 px-2 py-1">{String(time.seconds).padStart(2, "0")}</span>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className="font-mono text-sm font-bold tabular-nums">
        {time.days > 0 ? `${time.days}d ` : ""}
        {String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}:{String(time.seconds).padStart(2, "0")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <TimerUnit value={time.days} label="Jours" />
      <SeparatorDot />
      <TimerUnit value={time.hours} label="Heures" />
      <SeparatorDot />
      <TimerUnit value={time.minutes} label="Minutes" />
      <SeparatorDot />
      <TimerUnit value={time.seconds} label="Secondes" />
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

function SeparatorDot() {
  return <span className="text-2xl font-bold opacity-50">:</span>;
}
