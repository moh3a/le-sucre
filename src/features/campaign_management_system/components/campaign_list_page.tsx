"use client";

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8d152]/20">
            <Megaphone className="h-5 w-5 text-[#c8d152]" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold">Campagnes</h1>
            <p className="text-muted-foreground text-sm">
              Gérez vos campagnes marketing et bannières
            </p>
          </div>
        </div>
        <Button asChild className="bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90">
          <Link href="/console/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <CampaignStatsRow />

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
                        ? format(new Date(campaign.starts_at), "dd MMM yyyy HH:mm", { locale: fr })
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
  );
}

function CampaignStatsRow() {
  const { data: all } = trpc.campaigns.adminList.useQuery({ page: 1, limit: 1 });
  const { data: active } = trpc.campaigns.adminList.useQuery({
    page: 1,
    limit: 1,
    status: CAMPAIGN_STATUS.active,
  });
  const { data: scheduled } = trpc.campaigns.adminList.useQuery({
    page: 1,
    limit: 1,
    status: CAMPAIGN_STATUS.scheduled,
  });
  const { data: draft } = trpc.campaigns.adminList.useQuery({
    page: 1,
    limit: 1,
    status: CAMPAIGN_STATUS.draft,
  });

  const stats = [
    { label: "Total", value: all?.total ?? 0, icon: Layers, color: "text-blue-500" },
    { label: "Actives", value: active?.total ?? 0, icon: Megaphone, color: "text-[#c8d152]" },
    { label: "Planifiées", value: scheduled?.total ?? 0, icon: Calendar, color: "text-orange-500" },
    { label: "Brouillons", value: draft?.total ?? 0, icon: Eye, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`bg-muted rounded-lg p-2 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-muted-foreground text-xs">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
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
