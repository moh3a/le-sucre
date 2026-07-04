"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/storefront/data-state";

interface PasswordField {
  name: string;
  label: string;
  placeholder?: string;
}

interface PasswordFormProps {
  title?: string;
  description?: string;
  fields?: PasswordField[];
  isLoading?: boolean;
  error?: unknown;
  updateLabel?: string;
  isUpdating?: boolean;
  values?: Record<string, string>;
  onChange?: (name: string, value: string) => void;
  onUpdate?: () => void;
}

export function PasswordForm({
  title = "Mot de passe",
  description = "Modifiez votre mot de passe.",
  fields = [],
  isLoading,
  error,
  updateLabel = "Mettre à jour",
  isUpdating,
  values,
  onChange,
  onUpdate,
}: PasswordFormProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={false}
      loadingState={
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                placeholder={field.placeholder ?? ""}
                value={values?.[field.name] ?? ""}
                onChange={(e) => onChange?.(field.name, e.target.value)}
              />
            </div>
          ))}
          <Button onClick={onUpdate} disabled={isUpdating}>
            {isUpdating ? "..." : updateLabel}
          </Button>
        </CardContent>
      </Card>
    </DataState>
  );
}
