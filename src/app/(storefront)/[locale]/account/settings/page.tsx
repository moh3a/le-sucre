import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Paramètres du compte",
};

type Props = { params: Promise<{ locale: string }> };

export default async function AccountSettingsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{t("settings_title", { fallback: "Paramètres du compte" })}</h1>
      <p className="text-muted-foreground">
        {t("settings_description", { fallback: "Gérez vos informations personnelles et préférences" })}
      </p>

      <Separator />

      {/* SETTINGS NAV */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="profile">{t("tab_profile", { fallback: "Profil" })}</TabsTrigger>
          <TabsTrigger value="security">{t("tab_security", { fallback: "Sécurité" })}</TabsTrigger>
          <TabsTrigger value="preferences">{t("tab_preferences", { fallback: "Préférences" })}</TabsTrigger>
          <TabsTrigger value="notifications">{t("tab_notifications", { fallback: "Notifications" })}</TabsTrigger>
        </TabsList>

        {/* PROFILE FORM */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile_title", { fallback: "Informations personnelles" })}</CardTitle>
              <CardDescription>
                {t("profile_description", { fallback: "Mettez à jour vos informations personnelles" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Replace with actual form and validation */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    {t("first_name", { fallback: "Prénom" })}
                  </label>
                  <Input id="firstName" placeholder={t("first_name_placeholder", { fallback: "Votre prénom" })} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    {t("last_name", { fallback: "Nom" })}
                  </label>
                  <Input id="lastName" placeholder={t("last_name_placeholder", { fallback: "Votre nom" })} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t("email", { fallback: "Email" })}
                </label>
                <Input id="email" type="email" placeholder="email@exemple.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  {t("phone", { fallback: "Téléphone" })}
                </label>
                <Input id="phone" type="tel" placeholder="+213 5XX XX XX XX" />
              </div>
              <Button>{t("save_changes", { fallback: "Enregistrer les modifications" })}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHANGE PASSWORD */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("change_password_title", { fallback: "Changer le mot de passe" })}</CardTitle>
              <CardDescription>
                {t("change_password_description", { fallback: "Assurez-vous d'utiliser un mot de passe sécurisé" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Replace with actual password change form */}
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium">
                  {t("current_password", { fallback: "Mot de passe actuel" })}
                </label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  {t("new_password", { fallback: "Nouveau mot de passe" })}
                </label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t("confirm_password", { fallback: "Confirmer le mot de passe" })}
                </label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>{t("update_password", { fallback: "Mettre à jour le mot de passe" })}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LANGUAGE PREFERENCE */}
        <TabsContent value="preferences" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("language_title", { fallback: "Langue" })}</CardTitle>
              <CardDescription>
                {t("language_description", { fallback: "Choisissez votre langue préférée" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Replace with actual language selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 rounded-lg border p-3">
                  <input type="radio" name="language" defaultChecked className="size-4" />
                  <span className="text-sm font-medium">{t("french", { fallback: "Français" })}</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border p-3">
                  <input type="radio" name="language" className="size-4" />
                  <span className="text-sm font-medium">{t("english", { fallback: "English" })}</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border p-3">
                  <input type="radio" name="language" className="size-4" />
                  <span className="text-sm font-medium">{t("arabic", { fallback: "العربية" })}</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATION PREFERENCES */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("notifications_title", { fallback: "Préférences de notification" })}</CardTitle>
              <CardDescription>
                {t("notifications_description", { fallback: "Choisissez les notifications que vous souhaitez recevoir" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Replace with actual toggle switches */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notif_order_confirmation", { fallback: "Confirmation de commande" })}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("notif_order_confirmation_desc", { fallback: "Recevoir un email lors de la confirmation d'une commande" })}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notif_shipping", { fallback: "Expédition" })}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("notif_shipping_desc", { fallback: "Recevoir un email lors de l'expédition" })}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notif_promotions", { fallback: "Promotions" })}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("notif_promotions_desc", { fallback: "Recevoir des offres promotionnelles" })}
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notif_newsletter", { fallback: "Newsletter" })}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("notif_newsletter_desc", { fallback: "Recevoir la newsletter" })}
                  </p>
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
          <CardTitle className="text-destructive">
            {t("danger_zone", { fallback: "Zone de danger" })}
          </CardTitle>
          <CardDescription>
            {t("danger_zone_description", { fallback: "Actions irréversibles pour votre compte" })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Add confirmation dialog */}
          <Button variant="destructive">
            {t("delete_account", { fallback: "Supprimer mon compte" })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
