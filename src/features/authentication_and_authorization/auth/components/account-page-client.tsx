"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountProfileTab } from "./account-profile-tab";
import { AccountSecurityTab } from "./account-security-tab";
import { AccountActivityTab } from "./account-activity-tab";
import { ProfileSection } from "@/features/authentication_and_authorization/profile/components/profile-section";
import { AddressesSection } from "@/features/authentication_and_authorization/profile/components/addresses-section";

const tab_schema = z.enum(["profile", "security", "activity", "addresses"]);

export function AccountPageClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = tab_schema.safeParse(searchParams.get("tab"));
  const active_tab = parsed.success ? parsed.data : "profile";

  const on_tab_change = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <ConsolePageShell title={t("account_title")} subtitle={t("account_subtitle")}>
      <Tabs value={active_tab} onValueChange={on_tab_change}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile">{t("tab_profile")}</TabsTrigger>
          <TabsTrigger value="addresses">{t("tab_addresses")}</TabsTrigger>
          <TabsTrigger value="security">{t("tab_security")}</TabsTrigger>
          <TabsTrigger value="activity">{t("tab_activity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <AddressesSection />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <AccountSecurityTab />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <AccountActivityTab />
        </TabsContent>
      </Tabs>
    </ConsolePageShell>
  );
}
