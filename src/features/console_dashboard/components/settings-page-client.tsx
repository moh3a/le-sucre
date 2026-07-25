"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QueryGuard } from "@/components/query-guard";
import { toast } from "sonner";
import { extract_error_message } from "@/lib/error-detection";
import { DatabaseTab } from "./database-tab";
import {
  Store,
  CreditCard,
  Truck,
  Shield,
  Database,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

type StoreSettings = Record<string, Record<string, string>>;

type EnvStatus = {
  payments: { stripe: boolean; paypal: boolean };
  shipping: { yalidine: boolean };
  redis: boolean;
  rate_limiting: boolean;
  auth: boolean;
};

const TAB_VALUES = ["general", "payments", "shipping", "security", "database"] as const;
const tab_schema = z.enum(TAB_VALUES);

export function SettingsPageClient() {
  const t = useTranslations("settings");
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = tab_schema.safeParse(searchParams.get("tab"));
  const active_tab = parsed.success ? parsed.data : "general";

  const on_tab_change = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const settings_query = trpc.settings.getAll.useQuery();
  const env_query = trpc.settings.getEnvStatus.useQuery();

  const settings = settings_query.data as StoreSettings | undefined;
  const env = env_query.data as EnvStatus | undefined;

  const tab_triggers = [
    { value: "general", icon: Store, label: t("tab_general") },
    { value: "payments", icon: CreditCard, label: t("tab_payments") },
    { value: "shipping", icon: Truck, label: t("tab_shipping") },
    { value: "security", icon: Shield, label: t("tab_security") },
    { value: "database", icon: Database, label: t("tab_database") },
  ] as const;

  return (
    <ConsolePageShell title={t("title")} subtitle={t("subtitle")}>
      <QueryGuard
        query={settings_query}
        className="p-0"
        loadingFallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </CardContent>
          </Card>
        }
      >
        <Tabs value={active_tab} onValueChange={on_tab_change}>
          <TabsList>
            {tab_triggers.map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="gap-2">
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <Separator className="my-4" />
          <div className="mt-4">
            <TabsContent value="general" className="mt-0 space-y-4">
              <GeneralTab settings={settings} />
            </TabsContent>
            <TabsContent value="payments" className="mt-0 space-y-4">
              <PaymentsTab env={env} />
            </TabsContent>
            <TabsContent value="shipping" className="mt-0 space-y-4">
              <ShippingTab env={env} />
            </TabsContent>
            <TabsContent value="security" className="mt-0 space-y-4">
              <SecurityTab env={env} />
            </TabsContent>
            <TabsContent value="database" className="mt-0 space-y-4">
              <DatabaseTab />
            </TabsContent>
          </div>
        </Tabs>
      </QueryGuard>
    </ConsolePageShell>
  );
}

function GeneralTab({ settings }: { settings: StoreSettings | undefined }) {
  const t = useTranslations("settings");
  const utils = trpc.useUtils();
  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setForm(settings.general ?? {});
    setInitialized(true);
  }

  const update_mutation = trpc.settings.updateMany.useMutation({
    onSuccess: () => {
      toast.success(t("save_success"));
      utils.settings.getAll.invalidate();
    },
    onError: (err) => {
      const message = extract_error_message(err) || t("save_error");
      toast.error(message);
    },
  });

  const handle_save = () => {
    const entries = Object.entries(form).map(([key, value]) => ({
      key,
      value,
      category: "general",
    }));
    update_mutation.mutate({ entries });
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("general_title")}</CardTitle>
        <CardDescription>{t("general_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("store_name")} value={form.store_name ?? ""} onChange={set("store_name")} />
          <FormField label={t("store_phone")} value={form.store_phone ?? ""} onChange={set("store_phone")} />
          <FormField label={t("store_address")} value={form.store_address ?? ""} onChange={set("store_address")} className="sm:col-span-2" />
          <FormField label={t("store_vat")} value={form.store_vat_number ?? ""} onChange={set("store_vat_number")} />
          <FormField label={t("currency")} value={form.currency ?? ""} onChange={set("currency")} />
          <FormField label={t("tax_rate")} value={form.tax_rate ?? ""} onChange={set("tax_rate")} type="number" />
          <FormField label={t("default_language")} value={form.default_language ?? ""} onChange={set("default_language")} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handle_save} disabled={update_mutation.isPending}>
            {update_mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Save className="size-4" data-icon="inline-start" />
            )}
            {t("save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentsTab({ env }: { env: EnvStatus | undefined }) {
  const t = useTranslations("settings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tab_payments")}</CardTitle>
        <CardDescription>{t("payments_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EnvStatusRow label="Stripe" configured={env?.payments.stripe ?? false} />
        <EnvStatusRow label="PayPal" configured={env?.payments.paypal ?? false} />
        <Separator />
        <p className="text-muted-foreground text-xs">{t("env_readonly_note")}</p>
      </CardContent>
    </Card>
  );
}

function ShippingTab({ env }: { env: EnvStatus | undefined }) {
  const t = useTranslations("settings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tab_shipping")}</CardTitle>
        <CardDescription>{t("carriers_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EnvStatusRow label="Yalidine" configured={env?.shipping.yalidine ?? false} />
        <Separator />
        <p className="text-muted-foreground text-xs">{t("env_readonly_note")}</p>
      </CardContent>
    </Card>
  );
}

function SecurityTab({ env }: { env: EnvStatus | undefined }) {
  const t = useTranslations("settings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tab_security")}</CardTitle>
        <CardDescription>{t("security_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EnvStatusRow label={t("auth_provider")} configured={env?.auth ?? false} />
        <EnvStatusRow label={t("rate_limiting")} configured={env?.rate_limiting ?? false} />
        <EnvStatusRow label="Redis" configured={env?.redis ?? false} />
        <Separator />
        <p className="text-muted-foreground text-xs">{t("env_readonly_note")}</p>
      </CardContent>
    </Card>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5">{label}</Label>
      <Input value={value} onChange={onChange} type={type} />
    </div>
  );
}

function EnvStatusRow({ label, configured }: { label: string; configured: boolean }) {
  const t = useTranslations("settings");

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      {configured ? (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="size-3" />
          {t("status_configured")}
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="size-3" />
          {t("status_not_configured")}
        </Badge>
      )}
    </div>
  );
}
