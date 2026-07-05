"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/components/providers/app-providers";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ProfileForm } from "@/features/authentication_and_authorization/profile/components/storefront/profile-form";
import { PasswordForm } from "@/features/authentication_and_authorization/profile/components/storefront/password-form";
import { LanguageSelector } from "@/features/authentication_and_authorization/profile/components/storefront/language-selector";
import { NotificationPreferences } from "@/features/authentication_and_authorization/profile/components/storefront/notification-preferences";
import { DangerZone } from "@/features/authentication_and_authorization/profile/components/storefront/danger-zone";
import { CookieSettingsSection } from "@/components/cookie-consent/cookie-settings-section";

export function SettingsPageClient() {
  const t = useTranslations("account");
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.auth.me.useQuery();

  const [profileValues, setProfileValues] = useState<Record<string, string>>({});
  const [passwordValues, setPasswordValues] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [notifValues, setNotifValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data) {
      const profile = data.profile;
      setProfileValues({
        first_name: profile?.first_name ?? "",
        last_name: profile?.last_name ?? "",
        email: data.user.email ?? "",
        phone: profile?.phone_secondary ?? "",
      });
      setSelectedLanguage(profile?.preferred_language ?? "fr");
      setNotifValues({
        order_confirmation: profile?.push_notifications ?? true,
        shipping: profile?.sms_notifications ?? false,
        promotions: profile?.marketing_opt_in ?? false,
        newsletter: profile?.newsletter_opt_in ?? true,
      });
    }
  }, [data]);

  const profileSave = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success(t("profile_updated") ?? "Profile updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const passwordUpdate = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setPasswordValues({ current_password: "", new_password: "", confirm_password: "" });
      toast.success(t("password_updated") ?? "Password updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const languageUpdate = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success(t("language_updated") ?? "Language updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const notifUpdate = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success(t("notifications_updated") ?? "Preferences updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleProfileChange = (name: string, value: string) => {
    setProfileValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = () => {
    profileSave.mutate({
      first_name: profileValues.first_name || undefined,
      last_name: profileValues.last_name || undefined,
      phone_secondary: profileValues.phone || null,
    });
  };

  const handlePasswordChange = (name: string, value: string) => {
    setPasswordValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = () => {
    if (passwordValues.new_password !== passwordValues.confirm_password) {
      toast.error(t("passwords_dont_match") ?? "Passwords do not match");
      return;
    }
    passwordUpdate.mutate({
      current_password: passwordValues.current_password,
      new_password: passwordValues.new_password,
    });
  };

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    languageUpdate.mutate({ preferred_language: code as "fr" | "en" | "ar" });
  };

  const handleNotifChange = (key: string, checked: boolean) => {
    const next = { ...notifValues, [key]: checked };
    setNotifValues(next);
    const payload: Record<string, boolean> = {};
    if (key === "order_confirmation") payload.push_notifications = checked;
    if (key === "shipping") payload.sms_notifications = checked;
    if (key === "promotions") payload.marketing_opt_in = checked;
    if (key === "newsletter") payload.newsletter_opt_in = checked;
    notifUpdate.mutate(payload);
  };

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

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
            values={profileValues}
            isLoading={false}
            saveLabel={t("save_changes")}
            isSaving={profileSave.isPending}
            onChange={handleProfileChange}
            onSave={handleProfileSave}
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
            values={passwordValues}
            isLoading={false}
            updateLabel={t("update_password")}
            isUpdating={passwordUpdate.isPending}
            onChange={handlePasswordChange}
            onUpdate={handlePasswordUpdate}
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
            selected={selectedLanguage}
            isLoading={languageUpdate.isPending}
            onChange={handleLanguageChange}
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
                defaultChecked: false,
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
            values={notifValues}
            isLoading={false}
            onChange={handleNotifChange}
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

function SettingsPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-10 w-full" />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className={i === 3 ? "sm:col-span-2 h-10" : "h-10"} />
            ))}
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
