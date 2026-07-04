"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileFormField {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  colSpan?: boolean;
}

interface ProfileFormProps {
  title: string;
  description: string;
  fields: ProfileFormField[];
  values?: Record<string, string>;
  onChange?: (name: string, value: string) => void;
  saveLabel?: string;
  onSave?: () => void;
}

export function ProfileForm({
  title,
  description,
  fields,
  values,
  onChange,
  saveLabel = "Save changes",
  onSave,
}: ProfileFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.colSpan ? "sm:col-span-2 space-y-2" : "space-y-2"}>
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
        <Button onClick={onSave}>{saveLabel}</Button>
      </CardContent>
    </Card>
  );
}
