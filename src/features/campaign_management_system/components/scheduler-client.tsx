"use client";

import { trpc } from "@/components/providers/app-providers";
import { useState } from "react";

export function SchedulerClient() {
  const [campaignId, setCampaignId] = useState("");

  const scheduleActivation = trpc.campaigns.update.useMutation();
  const scheduleDeactivation = trpc.campaigns.update.useMutation();

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
      <p className="text-sm text-gray-500">Schedule campaign activation and deactivation dates.</p>

      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Campaign ID</label>
          <input
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Enter campaign ID"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSchedule} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Schedule Activation
          </button>
          <button onClick={handleDeactivate} className="rounded bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">
            Schedule Deactivation
          </button>
        </div>
        {scheduleActivation.isSuccess && <p className="text-sm text-green-600">Activation scheduled successfully!</p>}
        {scheduleDeactivation.isSuccess && <p className="text-sm text-green-600">Deactivation scheduled successfully!</p>}
      </div>

      <div className="rounded-lg border p-4 text-sm text-gray-500">
        <p>Scheduling is managed by setting <code className="text-xs bg-gray-100 px-1 rounded">starts_at</code> and <code className="text-xs bg-gray-100 px-1 rounded">ends_at</code> on the campaign. The campaign scheduler job checks these dates and activates/deactivates campaigns accordingly.</p>
      </div>
    </div>
  );
}
