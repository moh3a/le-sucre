"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface Language {
  code: string;
  label: string;
}

interface LanguageSelectorProps {
  title: string;
  description: string;
  languages: Language[];
  selected?: string;
  onChange?: (code: string) => void;
}

export function LanguageSelector({
  title,
  description,
  languages,
  selected,
  onChange,
}: LanguageSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {languages.map((lang) => (
            <label
              key={lang.code}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted has-checked:border-primary"
            >
              <input
                type="radio"
                name="language"
                value={lang.code}
                checked={selected === lang.code}
                onChange={() => onChange?.(lang.code)}
                className="accent-primary size-4"
              />
              <span className="text-sm font-medium">{lang.label}</span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
