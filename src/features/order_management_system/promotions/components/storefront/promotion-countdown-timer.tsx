"use client";

import { useEffect, useRef, useState } from "react";

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

function computeTimeLeft(endsAt: string): TimeLeft {
  const end = new Date(endsAt).getTime();
  const diff = Math.max(0, end - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    totalSeconds: Math.floor(diff / 1000),
  };
}

export function CountdownTimer({ endsAt, onExpired, variant = "default", label }: CountdownTimerProps) {
  const [, setTick] = useState(0);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!endsAt) return;

    expiredRef.current = false;

    const interval = setInterval(() => {
      const t = computeTimeLeft(endsAt);
      setTick(c => c + 1);
      if (t.totalSeconds <= 0) {
        clearInterval(interval);
        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpired?.();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onExpired]);

  if (!endsAt) return null;

  const time = computeTimeLeft(endsAt);

  if (time.totalSeconds <= 0) return null;

  if (variant === "bar") {
    return (
      <div className="flex items-center justify-center gap-4 bg-linear-to-r from-red-600 to-orange-500 px-4 py-3 text-white">
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
