import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/features/authentication_and_authorization/profile/components/storefront/profile-form";
import { PasswordForm } from "@/features/authentication_and_authorization/profile/components/storefront/password-form";
import { LanguageSelector } from "@/features/authentication_and_authorization/profile/components/storefront/language-selector";
import { NotificationPreferences } from "@/features/authentication_and_authorization/profile/components/storefront/notification-preferences";
import { DangerZone } from "@/features/authentication_and_authorization/profile/components/storefront/danger-zone";
import { CookieSettingsSection } from "@/components/cookie-consent/cookie-settings-section";

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

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="profile">{t("tab_profile")}</TabsTrigger>
          <TabsTrigger value="security">{t("tab_security")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("tab_preferences")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("tab_notifications")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <ProfileForm
            title={t("profile_title")}
            description={t("profile_description")}
            fields={[
              { name: "first_name", label: t("first_name"), placeholder: t("first_name_placeholder") },
              { name: "last_name", label: t("last_name"), placeholder: t("last_name_placeholder") },
              { name: "email", label: t("email"), placeholder: "email@exemple.com", type: "email", fullWidth: true },
              { name: "phone", label: t("phone"), placeholder: "+213 5XX XX XX XX", type: "tel", fullWidth: true },
            ]}
            saveLabel={t("save_changes")}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <PasswordForm
            title={t("change_password_title")}
            description={t("change_password_description")}
            fields={[
              { name: "current_password", label: t("current_password") },
              { name: "new_password", label: t("new_password") },
              { name: "confirm_password", label: t("confirm_password") },
            ]}
            updateLabel={t("update_password")}
          />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 space-y-4">
          <LanguageSelector
            title={t("language_title")}
            description={t("language_description")}
            languages={[
              { code: "fr", label: t("french") },
              { code: "en", label: t("english") },
              { code: "ar", label: t("arabic") },
            ]}
            selected="fr"
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <NotificationPreferences
            title={t("notifications_title")}
            description={t("notifications_description")}
            items={[
              {
                key: "order_confirmation",
                title: t("notif_order_confirmation"),
                description: t("notif_order_confirmation_desc"),
                defaultChecked: true,
              },
              {
                key: "shipping",
                title: t("notif_shipping"),
                description: t("notif_shipping_desc"),
                defaultChecked: true,
              },
              {
                key: "promotions",
                title: t("notif_promotions"),
                description: t("notif_promotions_desc"),
                defaultChecked: false,
              },
              {
                key: "newsletter",
                title: t("notif_newsletter"),
                description: t("notif_newsletter_desc"),
                defaultChecked: true,
              },
            ]}
          />
        </TabsContent>
      </Tabs>

      <Separator />

      <DangerZone
        title={t("danger_zone")}
        description={t("danger_zone_description")}
        actionLabel={t("delete_account")}
      />

      <Separator />

      <CookieSettingsSection />
    </div>
  );
}
