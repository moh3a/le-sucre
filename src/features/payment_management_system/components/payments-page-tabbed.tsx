"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Banknote, Wallet, ShieldCheck } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentsContent } from "./payments-page-client";
import { RefundsContent } from "./refunds-page-client";
import { PayoutsContent } from "./payouts-page-client";
import { VerificationsContent } from "@/features/payment_management_system/operations/components/payment-verifications-page-client";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { CreateRefundDialog } from "./create-refund-dialog";
import { CreatePayoutDialog } from "./create-payout-dialog";
import { CreateVerificationDialog } from "@/features/payment_management_system/operations/components/create-verification-dialog";
import { RecordPartialPaymentDialog } from "@/features/payment_management_system/operations/components/record-partial-payment-dialog";

const TABS = [
  { value: "payments", icon: CreditCard },
  { value: "refunds", icon: Banknote },
  { value: "payouts", icon: Wallet },
  { value: "verifications", icon: ShieldCheck },
] as const;

export function PaymentsPageClient() {
  const t = useTranslations("payments");
  const [tab, setTab] = useState("payments");

  const actions: Record<string, React.ReactNode> = {
    payments: <RecordPaymentDialog />,
    refunds: <CreateRefundDialog />,
    payouts: <CreatePayoutDialog />,
    verifications: (
      <div className="flex gap-2">
        <CreateVerificationDialog />
        <RecordPartialPaymentDialog />
      </div>
    ),
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
          <TabsContent value="payments" className="mt-0 space-y-4">
            <PaymentsContent />
          </TabsContent>

          <TabsContent value="refunds" className="mt-0 space-y-4">
            <RefundsContent />
          </TabsContent>

          <TabsContent value="payouts" className="mt-0 space-y-4">
            <PayoutsContent />
          </TabsContent>

          <TabsContent value="verifications" className="mt-0 space-y-4">
            <VerificationsContent />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
