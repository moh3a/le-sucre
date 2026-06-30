/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";
import { GalleryVerticalEnd } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/constants";

export const metadata = { title: "Créer un compte" };

export default async function RegisterPage() {
  const t = await getTranslations("auth");
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            {APP_NAME}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Card>
              <CardHeader>
                <h1 className="text-2xl font-bold">{t("register_title")}</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {t("register_subtitle")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* REGISTER FORM */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">{t("full_name")}</Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder={t("full_name_placeholder")}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("email_placeholder")}
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("phone_placeholder")}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("password")}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("password_placeholder")}
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
                    {t("create_account")}
                  </Button>
                </div>

                <Separator />

                {/* SOCIAL LOGIN PLACEHOLDER */}
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" disabled>
                    {t("sign_in_with_google")}
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    {t("sign_in_with_facebook")}
                  </Button>
                </div>

                {/* TERMS CHECKBOX */}
                <p className="text-muted-foreground text-center text-xs">
                  {t("terms_accept")}
                </p>

                {/* LOGIN LINK */}
                <div className="text-center text-sm">
                  <a href="/auth" className="text-primary underline-offset-4 hover:underline">
                    {t("already_have_account")}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="hidden h-full w-full p-2 lg:block">
        <div className="bg-muted relative h-full w-full rounded-xl">
          <img
            src="/window.svg"
            alt={t("login_image_alt")}
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </div>
  );
}
