"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DangerZoneProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isDeleting?: boolean;
}

export function DangerZone({
  title = "Zone dangereuse",
  description = "Cette action est irréversible.",
  actionLabel = "Supprimer",
  onAction,
  isDeleting,
}: DangerZoneProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={onAction} disabled={isDeleting}>
          {isDeleting ? "..." : actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
