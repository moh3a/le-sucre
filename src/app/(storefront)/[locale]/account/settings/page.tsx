import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("settings_title") };
}

export default async function AccountSettingsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{t("settings_title")}</h1>
      <p className="text-muted-foreground">{t("settings_description")}</p>

      <Separator />

      {/* SETTINGS NAV */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="profile">{t("tab_profile")}</TabsTrigger>
          <TabsTrigger value="security">{t("tab_security")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("tab_preferences")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("tab_notifications")}</TabsTrigger>
        </TabsList>

        {/* PROFILE FORM */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile_title")}</CardTitle>
              <CardDescription>{t("profile_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Replace with actual form and validation */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    {t("first_name")}
                  </label>
                  <Input id="firstName" placeholder={t("first_name_placeholder")} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    {t("last_name")}
                  </label>
                  <Input id="lastName" placeholder={t("last_name_placeholder")} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t("email")}
                </label>
                <Input id="email" type="email" placeholder="email@exemple.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  {t("phone")}
                </label>
                <Input id="phone" type="tel" placeholder="+213 5XX XX XX XX" />
              </div>
              <Button>{t("save_changes")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHANGE PASSWORD */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("change_password_title")}</CardTitle>
              <CardDescription>{t("change_password_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Replace with actual password change form */}
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium">
                  {t("current_password")}
                </label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  {t("new_password")}
                </label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t("confirm_password")}
                </label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>{t("update_password")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LANGUAGE PREFERENCE */}
        <TabsContent value="preferences" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("language_title")}</CardTitle>
              <CardDescription>{t("language_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Replace with actual language selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 rounded-lg border p-3">
                  <input type="radio" name="language" defaultChecked className="size-4" />
                  <span className="text-sm font-medium">{t("french")}</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border p-3">
                  <input type="radio" name="language" className="size-4" />
                  <span className="text-sm font-medium">{t("english")}</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border p-3">
                  <input type="radio" name="language" className="size-4" />
                  <span className="text-sm font-medium">{t("arabic")}</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATION PREFERENCES */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("notifications_title")}</CardTitle>
              <CardDescription>{t("notifications_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Replace with actual toggle switches */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notif_order_confirmation")}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("notif_order_confirmation_desc")}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notif_shipping")}</p>
                  <p className="text-muted-foreground text-xs">{t("notif_shipping_desc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notif_promotions")}</p>
                  <p className="text-muted-foreground text-xs">{t("notif_promotions_desc")}</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notif_newsletter")}</p>
                  <p className="text-muted-foreground text-xs">{t("notif_newsletter_desc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* DANGER ZONE */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("danger_zone")}</CardTitle>
          <CardDescription>{t("danger_zone_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Add confirmation dialog */}
          <Button variant="destructive">{t("delete_account")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
