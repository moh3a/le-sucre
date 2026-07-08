"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/app-providers";
import { useTranslations } from "next-intl";
import type { approval_workflows, approval_requests } from "../schema";

type ApprovalWorkflow = typeof approval_workflows.$inferSelect;
type ApprovalRequest = typeof approval_requests.$inferSelect;

export function ApprovalWorkflowsClient() {
  const t = useTranslations("approval_workflows");
  const utils = trpc.useUtils();
  const { data: workflows } = trpc.operationsWorkflows.approvalWorkflowsList.useQuery();
  const { data: requests } = trpc.operationsWorkflows.approvalRequestsList.useQuery();
  const createWorkflow = trpc.operationsWorkflows.approvalWorkflowCreate.useMutation({
    onSuccess: () => utils.operationsWorkflows.approvalWorkflowsList.invalidate(),
  });
  const approveStep = trpc.operationsWorkflows.approvalApproveStep.useMutation({
    onSuccess: () => utils.operationsWorkflows.approvalWorkflowsList.invalidate(),
  });
  const rejectReq = trpc.operationsWorkflows.approvalReject.useMutation({
    onSuccess: () => utils.operationsWorkflows.approvalWorkflowsList.invalidate(),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          {showCreate ? t("cancel") : t("new_workflow")}
        </button>
      </div>

      {showCreate && (
        <div className="space-y-3 rounded-lg border p-4">
          <input
            placeholder={t("workflow_name_placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder={t("entity_type_placeholder")}
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              createWorkflow.mutate({
                name,
                entity_type: entityType,
                steps: [
                  { order: 0, role: "reviewer", label: "Review" },
                  { order: 1, role: "admin", label: "Final Approval" },
                ],
              });
              setShowCreate(false);
              setName("");
              setEntityType("");
            }}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            {t("create")}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
            {t("workflows_label", { count: workflows?.length ?? 0 })}
          </h2>
          <div className="divide-y">
            {workflows?.map((wf: ApprovalWorkflow) => (
              <div key={wf.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{wf.name}</p>
                  <p className="text-xs text-gray-500">
                    {wf.entity_type} · {t("steps_label", { count: wf.steps?.length ?? 0 })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${wf.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {wf.is_active ? t("active") : t("inactive")}
                </span>
              </div>
            ))}
            {(!workflows || workflows.length === 0) && (
              <p className="p-4 text-sm text-gray-400">{t("no_workflows")}</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border">
          <h2 className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold">
            {t("pending_requests_label", { count: requests?.length ?? 0 })}
          </h2>
          <div className="divide-y">
            {requests?.map((req: ApprovalRequest) => (
              <div key={req.id} className="px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {req.entity_type}:{req.entity_id.slice(0, 12)}
                  </p>
                  <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                    {t("step_label", { step: req.current_step + 1 })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveStep.mutate({ request_id: req.id })}
                    className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                  >
                    {t("approve")}
                  </button>
                  <button
                    onClick={() => rejectReq.mutate({ request_id: req.id, comment: "Rejected" })}
                    className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                  >
                    {t("reject")}
                  </button>
                </div>
              </div>
            ))}
            {(!requests || requests.length === 0) && (
              <p className="p-4 text-sm text-gray-400">{t("no_pending_requests")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
