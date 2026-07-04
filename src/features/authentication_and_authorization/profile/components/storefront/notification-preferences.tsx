"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DataState } from "@/components/storefront/data-state";

interface NotificationItem {
  key: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}

interface NotificationPreferencesProps {
  title?: string;
  description?: string;
  items?: NotificationItem[];
  values?: Record<string, boolean>;
  isLoading?: boolean;
  error?: unknown;
  onChange?: (key: string, checked: boolean) => void;
}

export function NotificationPreferences({
  title = "Notifications",
  description = "Gérez vos préférences de notification.",
  items = [],
  values,
  isLoading,
  error,
  onChange,
}: NotificationPreferencesProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!items.length}
      loadingState={
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                {i > 1 && <Skeleton className="mb-4 h-px w-full" />}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      }
      emptyState={null}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.key}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.description}</p>
                </div>
                <Switch
                  checked={values?.[item.key] ?? item.defaultChecked ?? false}
                  onCheckedChange={(checked) => onChange?.(item.key, checked)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DataState>
  );
}
