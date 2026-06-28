"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { HeadphonesIcon, Plus, RefreshCw, XCircle } from "lucide-react";

const STATUS_BADGES: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  open: "destructive",
  assigned: "secondary",
  in_progress: "secondary",
  resolved: "default",
  closed: "outline",
  reopened: "destructive",
};

type CustomerSupportTabProps = { user_id: string };

export function CustomerSupportTab({ user_id }: CustomerSupportTabProps) {
  const t = useTranslations("support");
  const STATUS_LABELS: Record<string, string> = {
    open: t("open"),
    assigned: t("assigned"),
    in_progress: t("in_progress"),
    resolved: t("resolved"),
    closed: t("closed"),
    reopened: t("reopened"),
  };
  const { data: cases, isLoading, refetch } = trpc.operations.customerGetCasesByUser.useQuery({ user_id });
  const [show_form, set_show_form] = useState(false);
  const [subject, set_subject] = useState("");
  const [description, set_description] = useState("");
  const [category, set_category] = useState("general");

  const create_case = trpc.operations.customerCreateCase.useMutation({
    onSuccess: () => {
      refetch();
      set_show_form(false);
      set_subject("");
      set_description("");
      toast.success("Cas de support créé");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const resolve = trpc.operations.customerResolveCase.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Cas résolu");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  const close = trpc.operations.customerCloseCase.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Cas fermé");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<Skeleton className="h-48 w-full" />}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("title")}</h3>
        <Button size="sm" onClick={() => set_show_form(!show_form)}>
          <Plus className="mr-1 h-3 w-3" />
          {t("new_case")}
        </Button>
      </div>

      {show_form && (
        <Card className="border-blue-200">
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t("subject")}</label>
              <input
                className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={subject}
                onChange={(e) => set_subject(e.target.value)}
                placeholder={t("subject_placeholder")}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">{t("category")}</label>
                <select
                  className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                  value={category}
                  onChange={(e) => set_category(e.target.value)}
                >
                  <option value="general">Général</option>
                  <option value="order">Commande</option>
                  <option value="delivery">Livraison</option>
                  <option value="product">Produit</option>
                  <option value="payment">Paiement</option>
                  <option value="technical">Technique</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">{t("description")}</label>
              <textarea
                className="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 text-sm"
                rows={4}
                value={description}
                onChange={(e) => set_description(e.target.value)}
                placeholder={t("problem_placeholder")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => set_show_form(false)}>
                {t("cancel")}
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  create_case.mutate({ user_id, subject, description, category })
                }
                disabled={!subject.trim() || !description.trim() || create_case.isPending}
              >
                {t("create_case")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(cases?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">{t("no_cases")}</p>
      ) : (
        <div className="space-y-2">
          {cases?.map((c) => (
            <div key={c.id} className="rounded-md border p-3 text-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{c.subject}</span>
                  <Badge variant={STATUS_BADGES[c.status]}>
                    {STATUS_LABELS[c.status] ?? c.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{c.category}</span>
                </div>
                <div className="flex gap-1">
                  {(c.status === "open" || c.status === "assigned" || c.status === "in_progress") && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => resolve.mutate({ case_id: c.id, resolution: "Résolu" })}
                        disabled={resolve.isPending}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        {t("resolve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-red-500"
                        onClick={() => close.mutate({ case_id: c.id })}
                        disabled={close.isPending}
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        {t("close")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-1 text-muted-foreground">{c.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(c.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                {c.assigned_to_user_id && ` · Assigné à: ${c.assigned_to_user_id}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
    </QueryGuard>
  );
}
