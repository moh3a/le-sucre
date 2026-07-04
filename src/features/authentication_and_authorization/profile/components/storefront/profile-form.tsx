"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataState } from "@/components/storefront/data-state";

interface ProfileField {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  fullWidth?: boolean;
}

interface ProfileFormProps {
  title?: string;
  description?: string;
  fields?: ProfileField[];
  values?: Record<string, string>;
  isLoading?: boolean;
  error?: unknown;
  saveLabel?: string;
  isSaving?: boolean;
  onChange?: (name: string, value: string) => void;
  onSave?: () => void;
}

export function ProfileForm({
  title = "Profil",
  description = "Modifiez vos informations personnelles.",
  fields = [],
  values,
  isLoading,
  error,
  saveLabel = "Enregistrer",
  isSaving,
  onChange,
  onSave,
}: ProfileFormProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={false}
      loadingState={
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className={i === 3 ? "sm:col-span-2 h-10" : "h-10"} />
              ))}
            </div>
            <Skeleton className="h-10 w-32" />
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
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={field.fullWidth ? "sm:col-span-2 space-y-2" : "space-y-2"}>
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  value={values?.[field.name] ?? ""}
                  onChange={(e) => onChange?.(field.name, e.target.value)}
                />
              </div>
            ))}
          </div>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "..." : saveLabel}
          </Button>
        </CardContent>
      </Card>
    </DataState>
  );
}
