"use client";

import { trpc } from "@/components/providers/app-providers";
import { useState } from "react";
import { toast } from "sonner";

export function SchedulerClient() {
  const [campaignId, setCampaignId] = useState("");

  const utils = trpc.useUtils();

  const scheduleActivation = trpc.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success("Activation scheduled successfully!");
      utils.campaigns.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to schedule activation"),
  });

  const scheduleDeactivation = trpc.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success("Deactivation scheduled successfully!");
      utils.campaigns.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to schedule deactivation"),
  });

  const handleSchedule = () => {
    const startsAt = prompt("Activation date (ISO string, e.g. 2026-07-01T00:00:00Z):");
    if (!startsAt || !campaignId) return;
    scheduleActivation.mutate({ id: campaignId, starts_at: startsAt });
  };

  const handleDeactivate = () => {
    const endsAt = prompt("Deactivation date (ISO string):");
    if (!endsAt || !campaignId) return;
    scheduleDeactivation.mutate({ id: campaignId, ends_at: endsAt });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Campaign Scheduler</h1>
      <p className="text-muted-foreground text-sm">
        Schedule campaign activation and deactivation dates.
      </p>

      <div className="bg-card space-y-3 rounded-lg border p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Campaign ID</label>
          <input
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Enter campaign ID"
            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSchedule}
            disabled={scheduleActivation.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {scheduleActivation.isPending ? "Scheduling…" : "Schedule Activation"}
          </button>
          <button
            onClick={handleDeactivate}
            disabled={scheduleDeactivation.isPending}
            className="rounded bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
          >
            {scheduleDeactivation.isPending ? "Scheduling…" : "Schedule Deactivation"}
          </button>
        </div>
      </div>

      <div className="bg-card text-muted-foreground rounded-lg border p-4 text-sm">
        <p>
          Scheduling is managed by setting{" "}
          <code className="bg-muted text-foreground rounded px-1 text-xs">starts_at</code> and{" "}
          <code className="bg-muted text-foreground rounded px-1 text-xs">ends_at</code> on the
          campaign. The campaign scheduler job checks these dates and activates/deactivates
          campaigns accordingly.
        </p>
      </div>
    </div>
  );
}
