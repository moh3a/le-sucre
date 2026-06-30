import { getTranslations } from "next-intl/server";
import { GalleryVerticalEnd } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/constants";

export const metadata = { title: "Réinitialiser le mot de passe" };

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const t = await getTranslations("auth");
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            {APP_NAME}
          </a>
        </div>
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">{t("reset_password_title")}</h1>
            <p className="text-muted-foreground text-sm text-balance">
              {t("reset_password_instructions")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* TOKEN VALIDATION */}
            <input type="hidden" name="token" value={token ?? ""} />

            {token ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("new_password")}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={t("new_password_placeholder")}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("confirm_password")}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder={t("confirm_password_placeholder")}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("reset_password")}
                </Button>
              </>
            ) : (
              /* EXPIRED/INVALID TOKEN ERROR PLACEHOLDER */
              <p className="text-destructive text-center text-sm">
                {t("invalid_reset_token")}
              </p>
            )}

            {/* SUCCESS STATE PLACEHOLDER */}

            <div className="text-center text-sm">
              <a href="/auth" className="text-primary underline-offset-4 hover:underline">
                {t("back_to_login")}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
