"use client";

import { trpc } from "@/components/providers/app-providers";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function RoutingRulesClient() {
  const t = useTranslations("routing_rules");
  const { data: rules, refetch } = trpc.operationsWorkflows.routingRulesList.useQuery();
  const create = trpc.operationsWorkflows.routingRuleCreate.useMutation({ onSuccess: () => refetch() });
  const toggle = trpc.operationsWorkflows.routingRuleToggle.useMutation({ onSuccess: () => refetch() });
  const del = trpc.operationsWorkflows.routingRuleDelete.useMutation({ onSuccess: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [conditions, setConditions] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      name,
      conditions: JSON.parse(conditions || "[]"),
      priority: (rules?.length ?? 0) + 1,
    });
    setName("");
    setConditions("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          {showForm ? t("cancel") : t("add_rule")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border bg-white p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t("rule_name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("conditions_label")}</label>
            <textarea value={conditions} onChange={(e) => setConditions(e.target.value)} rows={3} className="w-full rounded border px-3 py-2 text-sm font-mono" placeholder={t("conditions_placeholder")} />
          </div>
          <button type="submit" className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">{t("create_rule")}</button>
        </form>
      )}

      <div className="rounded-lg border">
        <div className="divide-y">
          {rules?.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{rule.name}</p>
                <p className="text-xs text-gray-500">
                  {t("priority", { priority: rule.priority })}
                  {rule.assign_to_role ? ` · ${t("role", { role: rule.assign_to_role })}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${rule.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {rule.is_active ? t("active") : t("inactive")}
                </span>
                <button onClick={() => toggle.mutate({ id: rule.id, is_active: !rule.is_active })} className="text-xs text-blue-600 hover:underline">
                  {t("toggle")}
                </button>
                <button onClick={() => del.mutate({ id: rule.id })} className="text-xs text-red-600 hover:underline">{t("delete")}</button>
              </div>
            </div>
          ))}
          {(!rules || rules.length === 0) && <p className="p-4 text-sm text-gray-400">{t("empty")}</p>}
        </div>
      </div>
    </div>
  );
}
