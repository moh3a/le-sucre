"use client";

import { Link } from "@/i18n/navigation";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ConsoleErrorPage({ reset }: Props) {
  const t = useTranslations("errorPage");

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardContent className="space-y-4 pt-6">
          <AlertTriangle className="text-crimson-violet mx-auto size-12 opacity-80" />
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t("description")}
          </CardDescription>
          <div className="flex justify-center gap-2">
            <Button onClick={reset} className="gap-1.5">
              <RefreshCw className="size-4" />
              {t("retry")}
            </Button>
            <Button variant="outline" asChild className="gap-1.5">
              <Link href="/console">
                <Home className="size-4" />
                {t("goHome")}
              </Link>
            </Button>
          </div>
          {t("contactText") && <p className="text-muted-foreground text-xs">{t("contactText")}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
