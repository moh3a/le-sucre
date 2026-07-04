"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordFormField {
  name: string;
  label: string;
  placeholder?: string;
}

interface PasswordFormProps {
  title: string;
  description: string;
  fields: PasswordFormField[];
  values?: Record<string, string>;
  onChange?: (name: string, value: string) => void;
  updateLabel?: string;
  onUpdate?: () => void;
}

export function PasswordForm({
  title,
  description,
  fields,
  values,
  onChange,
  updateLabel = "Update password",
  onUpdate,
}: PasswordFormProps) {
  return (
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
        <Button onClick={onUpdate}>{updateLabel}</Button>
      </CardContent>
    </Card>
  );
}
