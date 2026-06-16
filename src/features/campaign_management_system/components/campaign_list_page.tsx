"use client";

import {
  Megaphone,
  Plus,
  Search,
  Eye,
  Pencil,
  Loader2,
  BarChart3,
  Layers,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import {
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPE,
} from "@/features/campaign_management_system/constants/campaign_types";
import { CampaignStatusBadge } from "./campaign_status_badge";
import { trpc } from "@/components/providers/app-providers";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: CAMPAIGN_STATUS.draft, label: "Brouillon" },
  { value: CAMPAIGN_STATUS.scheduled, label: "Planifiée" },
  { value: CAMPAIGN_STATUS.active, label: "Active" },
  { value: CAMPAIGN_STATUS.paused, label: "En pause" },
  { value: CAMPAIGN_STATUS.ended, label: "Terminée" },
  { value: CAMPAIGN_STATUS.cancelled, label: "Annulée" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Tous les types" },
  { value: CAMPAIGN_TYPE.homepage, label: "Page d'accueil" },
  { value: CAMPAIGN_TYPE.seasonal, label: "Saisonnière" },
  { value: CAMPAIGN_TYPE.flash_sale, label: "Vente flash" },
  { value: CAMPAIGN_TYPE.targeted, label: "Ciblée" },
  { value: CAMPAIGN_TYPE.banner, label: "Bannière" },
  { value: CAMPAIGN_TYPE.category, label: "Catégorie" },
  { value: CAMPAIGN_TYPE.brand, label: "Marque" },
  { value: CAMPAIGN_TYPE.landing_page, label: "Page d'atterrissage" },
];

export function CampaignListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [campaign_type, setCampaignType] = useState("all");

  const { data, isLoading } = trpc.campaigns.adminList.useQuery({
    page,
    limit: 20,
    status: status === "all" ? undefined : status,
    campaign_type: campaign_type === "all" ? undefined : campaign_type,
    search: search || undefined,
  });

  return (
    <ConsolePageShell
      title="Campagnes"
      subtitle="Gérez vos campagnes marketing et bannières"
      actions={
        <Button asChild>
          <Link href="/console/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Link>
        </Button>
      }
      stats={<CampaignStatsRow />}
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Rechercher une campagne..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={campaign_type}
                onValueChange={(v) => {
                  setCampaignType(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campagne</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.rows?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground py-12 text-center">
                        Aucune campagne trouvée
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.rows?.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-muted-foreground text-xs">{campaign.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CampaignTypeBadge type={campaign.campaign_type} />
                      </TableCell>
                      <TableCell>
                        <CampaignStatusBadge status={campaign.status} />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{campaign.priority}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {campaign.starts_at
                          ? format(new Date(campaign.starts_at), "dd MMM yyyy HH:mm", {
                              locale: fr,
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {campaign.ends_at
                          ? format(new Date(campaign.ends_at), "dd MMM yyyy HH:mm", { locale: fr })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="ghost" size="icon">
                            <Link href={`/console/campaigns/${campaign.id}/analytics`}>
                              <BarChart3 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon">
                            <Link href={`/console/campaigns/${campaign.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">{data.total} campagnes au total</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * 20 >= data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </ConsolePageShell>
  );
}

function CampaignStatsRow() {
  const { data, isFetching, isLoading } = trpc.campaigns.adminList.useQuery({ page: 1, limit: 1 });

  return (
    <StatsGrid
      loading={isFetching || isLoading}
      items={[
        {
          label: "Total",
          value: data?.total ?? 0,
          icon: Layers,
          color: "info",
        },
        {
          label: "Actives",
          value: data?.rows.filter((row) => row.status === CAMPAIGN_STATUS.active).length ?? 0,
          icon: Megaphone,
          color: "success",
        },
        {
          label: "Planifiées",
          value: data?.rows.filter((row) => row.status === CAMPAIGN_STATUS.scheduled).length ?? 0,
          icon: Calendar,
          color: "warning",
        },
        {
          label: "Brouillons",
          value: data?.rows.filter((row) => row.status === CAMPAIGN_STATUS.draft).length ?? 0,
          icon: Eye,
          color: "default",
        },
      ]}
    />
  );
}

function CampaignTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    homepage: "Accueil",
    seasonal: "Saisonnière",
    flash_sale: "Flash",
    targeted: "Ciblée",
    banner: "Bannière",
    category: "Catégorie",
    brand: "Marque",
    landing_page: "Landing",
  };
  return (
    <Badge variant="outline" className="text-xs">
      {labels[type] ?? type}
    </Badge>
  );
}
