import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return <main className={cn("flex-1 overflow-y-auto p-6", className)}>{children}</main>;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex items-start justify-between gap-4", className)}>
      <div>
        <h1 className="font-heading text-foreground text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageContent({ children, className }: PageWrapperProps) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
