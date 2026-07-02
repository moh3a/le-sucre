"use client";

import { Link } from "@/i18n/navigation";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: Props) {
  const t = useTranslations("errorPage");

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 size-16 text-crimson-violet" />
        <h1 className="mb-2 text-8xl font-bold text-primary">500</h1>
        <h2 className="mb-4 text-2xl font-bold">{t("title")}</h2>
        <p className="text-muted-foreground mb-8">{t("description")}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={reset}>
            {t("retry")}
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">{t("goHome")}</Link>
          </Button>
        </div>

        <Separator className="my-8" />

        <p className="text-muted-foreground text-sm">{t("contactText")}</p>
      </div>
    </div>
  );
}
