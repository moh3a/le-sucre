import { getTranslations } from "next-intl/server";
import { GalleryVerticalEnd } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/constants";

export const metadata = { title: "Mot de passe oublié" };

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");
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
            <h1 className="text-2xl font-bold">{t("forgot_password_title")}</h1>
            {/* INSTRUCTIONS */}
            <p className="text-muted-foreground text-sm text-balance">
              {t("forgot_password_instructions")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email_placeholder")}
                autoComplete="email"
              />
            </div>
            {/* SUCCESS MESSAGE PLACEHOLDER */}
            <Button type="submit" className="w-full">
              {t("send_reset_link")}
            </Button>
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
