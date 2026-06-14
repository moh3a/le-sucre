"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";

type ConsolePageShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  tabs?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  back_href?: string;
};

export function ConsolePageShell({
  title,
  subtitle,
  actions,
  stats,
  tabs,
  children,
  className,
  back_href,
}: ConsolePageShellProps) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {back_href && (
            <Link href={back_href}>
              <Button variant="outline" size="icon">
                <ChevronLeft />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold">{title}</h1>
            {subtitle ? <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p> : null}
          </div>
        </div>
        {actions}
      </div>
      {stats}
      {tabs ?? children}
    </div>
  );
}
