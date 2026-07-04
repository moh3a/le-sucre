"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface NotificationItem {
  key: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}

interface NotificationPreferencesProps {
  title: string;
  description: string;
  items: NotificationItem[];
  values?: Record<string, boolean>;
  onChange?: (key: string, checked: boolean) => void;
}

export function NotificationPreferences({
  title,
  description,
  items,
  values,
  onChange,
}: NotificationPreferencesProps) {
  return (
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
  );
}
