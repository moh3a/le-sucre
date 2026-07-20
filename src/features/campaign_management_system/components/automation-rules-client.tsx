"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useState } from "react";

const TRIGGER_OPTIONS = [
  "campaign.activated",
  "campaign.ended",
  "campaign.paused",
  "campaign.flash_sale_starting",
  "campaign.flash_sale_ending",
  "campaign.analytics_threshold_met",
  "campaign.scheduled",
  "campaign.status_changed",
];

const ACTION_OPTIONS = [
  "send_email",
  "send_push",
  "create_order_promotion",
  "update_product_prices",
  "invalidate_cache",
  "dispatch_webhook",
  "trigger_sms",
];

function AutomationSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border">
        <div className="border-b bg-gray-50 px-4 py-2">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border">
        <div className="border-b bg-gray-50 px-4 py-2">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1 px-4 py-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AutomationRulesClient() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");
  const rulesQuery = trpc.campaigns.automationRules.useQuery();
  const logsQuery = trpc.campaigns.automationLogs.useQuery({ limit: 20 });
  const create = trpc.campaigns.createAutomationRule.useMutation({
    onSuccess: () => rulesQuery.refetch(),
  });
  const toggle = trpc.campaigns.automationRuleToggle.useMutation({
    onSuccess: () => rulesQuery.refetch(),
  });
  const del = trpc.campaigns.automationRuleDelete.useMutation({
    onSuccess: () => rulesQuery.refetch(),
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(TRIGGER_OPTIONS[0]);
  const [action, setAction] = useState(ACTION_OPTIONS[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ name, trigger, action, config: {} });
    setName("");
    setShowForm(false);
  };

  const isLoading = rulesQuery.isLoading || logsQuery.isLoading;
  const error = rulesQuery.error ?? logsQuery.error;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("automation_rules")}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm transition-colors"
        >
          {showForm ? tc("cancel") : t("add_rule")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card space-y-3 rounded-lg border p-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("rule_name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">{t("trigger")}</label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              >
                {TRIGGER_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("action")}</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              >
                {ACTION_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
          >
            {t("create_rule")}
          </button>
        </form>
      )}

      <QueryGuard
        query={{
          isLoading,
          error,
          refetch: () => {
            rulesQuery.refetch();
            logsQuery.refetch();
          },
        }}
        loadingFallback={<AutomationSkeleton />}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border">
            <h2 className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
              {t("rules")} ({rulesQuery.data?.length ?? 0})
            </h2>
            <div className="divide-y">
              {rulesQuery.data?.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {rule.trigger} → {rule.action} · {t("priority_label")} {rule.priority}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${rule.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {rule.is_active ? tc("active") : tc("inactive")}
                    </span>
                    <button
                      onClick={() => toggle.mutate({ id: rule.id, is_active: !rule.is_active })}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {t("toggle")}
                    </button>
                    <button
                      onClick={() => del.mutate({ id: rule.id })}
                      className="text-xs text-red-600 hover:underline"
                    >
                      {tc("delete")}
                    </button>
                  </div>
                </div>
              ))}
              {rulesQuery.data?.length === 0 && (
                <p className="text-muted-foreground p-4 text-sm">{t("no_automation_rules")}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border">
            <h2 className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
              {t("recent_logs")}
            </h2>
            <div className="max-h-96 divide-y overflow-y-auto">
              {logsQuery.data?.map((log) => (
                <div key={log.id} className="px-4 py-2">
                  <p className="text-xs font-medium">
                    {log.trigger} → {log.action}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {log.status} · {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              {logsQuery.data?.length === 0 && (
                <p className="text-muted-foreground p-4 text-sm">{t("no_logs_yet")}</p>
              )}
            </div>
          </div>
        </div>
      </QueryGuard>
    </div>
  );
}
