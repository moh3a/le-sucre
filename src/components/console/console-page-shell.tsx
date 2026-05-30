"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

type ConsolePageShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  tabs?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function ConsolePageShell({
  title,
  subtitle,
  actions,
  stats,
  tabs,
  children,
  className,
}: ConsolePageShellProps) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{title}</h1>
          {subtitle ? <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {stats}
      {tabs ?? children}
    </div>
  );
}
