"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DangerZoneProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  confirmMessage?: string;
}

export function DangerZone({
  title,
  description,
  actionLabel,
  onAction,
}: DangerZoneProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
