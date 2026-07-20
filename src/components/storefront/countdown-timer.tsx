"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  remainingSeconds: number;
  labels?: {
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
  className?: string;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer({
  remainingSeconds: initial,
  labels,
  className,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(Math.max(0, initial));

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [remaining > 0]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const segments = [
    { value: pad2(days), label: labels?.hours ?? "J" },
    { value: pad2(hours), label: labels?.hours ?? "H" },
    { value: pad2(minutes), label: labels?.minutes ?? "Min" },
    { value: pad2(seconds), label: labels?.seconds ?? "Sec" },
  ];

  return (
    <div className={className}>
      <div className="flex gap-3 text-center">
        {segments.map((seg, i) => (
          <div key={i} className="bg-background rounded-lg px-3 py-2 shadow-sm">
            <span className="text-2xl font-bold">{seg.value}</span>
            <p className="text-muted-foreground text-xs">{seg.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
