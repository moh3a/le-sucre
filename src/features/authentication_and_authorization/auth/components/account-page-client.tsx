"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountProfileTab } from "./account-profile-tab";
import { AccountSecurityTab } from "./account-security-tab";
import { AccountActivityTab } from "./account-activity-tab";

const tab_schema = z.enum(["profile", "security", "activity"]);

export function AccountPageClient() {
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
    <ConsolePageShell title="Mon compte" subtitle="Gérez votre profil et vos paramètres de sécurité">
      <Tabs value={active_tab} onValueChange={on_tab_change}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <AccountProfileTab />
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
