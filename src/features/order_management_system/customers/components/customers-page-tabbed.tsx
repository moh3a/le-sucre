"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, Phone, Headphones } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CustomersContent } from "./customers-page-client";
import { FollowUpsContent } from "@/features/order_management_system/customers/operations/components/follow-ups-page-client";
import { SupportCasesContent } from "@/features/order_management_system/customers/operations/components/support-cases-page-client";
import { CreateCustomerDialog } from "./create-customer-dialog";
import { CreateFollowUpDialog } from "@/features/order_management_system/customers/operations/components/create-follow-up-dialog";
import { CreateSupportCaseDialog } from "@/features/order_management_system/customers/operations/components/create-support-case-dialog";

const TABS = [
  { value: "customers", icon: Users },
  { value: "follow_ups", icon: Phone },
  { value: "support_cases", icon: Headphones },
] as const;

export function CustomersPageClientTabbed() {
  const t = useTranslations("customers");
  const [tab, setTab] = useState("customers");

  const actions: Record<string, React.ReactNode> = {
    customers: <CreateCustomerDialog />,
    follow_ups: <CreateFollowUpDialog />,
    support_cases: <CreateSupportCaseDialog />,
  };

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={actions[tab]}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map(({ value, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="size-4" />
              {t(`tab_${value}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <Separator className="my-4" />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t(`tab_${tab}`)}</CardTitle>
            <CardDescription>{t(`tab_description_${tab}`)}</CardDescription>
          </CardHeader>
        </Card>

        <div className="mt-4">
          <TabsContent value="customers" className="mt-0 space-y-4">
            <CustomersContent />
          </TabsContent>

          <TabsContent value="follow_ups" className="mt-0 space-y-4">
            <FollowUpsContent />
          </TabsContent>

          <TabsContent value="support_cases" className="mt-0 space-y-4">
            <SupportCasesContent />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
