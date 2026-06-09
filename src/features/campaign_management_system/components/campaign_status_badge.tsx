import { Badge } from "@/components/ui/badge";
import { CAMPAIGN_STATUS } from "../constants/campaign_types";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  [CAMPAIGN_STATUS.draft]: {
    label: "Brouillon",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  [CAMPAIGN_STATUS.scheduled]: {
    label: "Planifiée",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  [CAMPAIGN_STATUS.active]: {
    label: "Active",
    className: "bg-[#c8d152]/20 text-[#4d4c20] dark:bg-[#c8d152]/10 dark:text-[#c8d152]",
  },
  [CAMPAIGN_STATUS.paused]: {
    label: "En pause",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  [CAMPAIGN_STATUS.ended]: {
    label: "Terminée",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  [CAMPAIGN_STATUS.cancelled]: {
    label: "Annulée",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "" };
  return (
    <Badge className={`border-0 text-xs font-medium ${config.className}`}>{config.label}</Badge>
  );
}
