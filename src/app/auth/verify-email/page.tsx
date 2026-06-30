"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function VerifyEmailPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const t = useTranslations("auth");

  const is_verifying = false;
  const is_success = false;
  const is_error = false;

  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">{t("verify_email_title")}</h1>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            {/* VERIFYING STATE */}
            {is_verifying && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="text-muted-foreground size-8 animate-spin" />
                <p className="text-muted-foreground text-sm">{t("verifying_email")}</p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {is_success && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="size-8 text-green-600" />
                <p className="text-sm font-medium">{t("email_verified")}</p>
                <Button className="mt-2">{t("continue")}</Button>
              </div>
            )}

            {/* ERROR STATE */}
            {is_error && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-destructive text-sm">{t("invalid_verification_link")}</p>
                <Button variant="outline">{t("resend_email")}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
