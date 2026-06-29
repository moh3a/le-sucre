"use client";

import { trpc } from "@/components/providers/app-providers";
import { useTranslations } from "next-intl";
import { useState } from "react";

const TRIGGER_OPTIONS = [
  "campaign.activated", "campaign.ended", "campaign.paused",
  "campaign.flash_sale_starting", "campaign.flash_sale_ending",
  "campaign.analytics_threshold_met", "campaign.scheduled", "campaign.status_changed",
];

const ACTION_OPTIONS = [
  "send_email", "send_push", "create_order_promotion",
  "update_product_prices", "invalidate_cache", "dispatch_webhook", "trigger_sms",
];

export function AutomationRulesClient() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");
  const { data: rules, refetch } = trpc.campaigns.automationRules.useQuery();
  const { data: logs } = trpc.campaigns.automationLogs.useQuery({ limit: 20 });
  const create = trpc.campaigns.createAutomationRule.useMutation({ onSuccess: () => refetch() });
  const toggle = trpc.campaigns.automationRuleToggle.useMutation({ onSuccess: () => refetch() });
  const del = trpc.campaigns.automationRuleDelete.useMutation({ onSuccess: () => refetch() });

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("automation_rules")}</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          {showForm ? tc("cancel") : t("add_rule")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border bg-white p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t("rule_name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t("trigger")}</label>
              <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="w-full rounded border px-3 py-2 text-sm">
                {TRIGGER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("action")}</label>
              <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full rounded border px-3 py-2 text-sm">
                {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">{t("create_rule")}</button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">{t("rules")} ({rules?.length ?? 0})</h2>
          <div className="divide-y">
            {rules?.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{rule.name}</p>
                  <p className="text-xs text-gray-500">{rule.trigger} → {rule.action} · {t("priority_label")} {rule.priority}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${rule.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {rule.is_active ? tc("active") : tc("inactive")}
                  </span>
                  <button onClick={() => toggle.mutate({ id: rule.id, is_active: !rule.is_active })} className="text-xs text-blue-600 hover:underline">{t("toggle")}</button>
                  <button onClick={() => del.mutate({ id: rule.id })} className="text-xs text-red-600 hover:underline">{tc("delete")}</button>
                </div>
              </div>
            ))}
            {(!rules || rules.length === 0) && <p className="p-4 text-sm text-gray-400">{t("no_automation_rules")}</p>}
          </div>
        </div>

        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 font-semibold text-sm">{t("recent_logs")}</h2>
          <div className="divide-y max-h-96 overflow-y-auto">
            {logs?.map((log) => (
              <div key={log.id} className="px-4 py-2">
                <p className="text-xs font-medium">{log.trigger} → {log.action}</p>
                <p className="text-xs text-gray-400">{log.status} · {new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
            {(!logs || logs.length === 0) && <p className="p-4 text-sm text-gray-400">{t("no_logs_yet")}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
