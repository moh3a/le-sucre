"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Headphones, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SupportPageSkeleton } from "./support-page-skeleton";

const STATUS_BADGE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  assigned: "secondary",
  in_progress: "secondary",
  resolved: "outline",
  closed: "outline",
  reopened: "destructive",
};

export function CustomerSupportPageClient() {
  const t = useTranslations("support");
  const query = trpc.operations.myCases.useQuery();
  const createMut = trpc.operations.myCreateCase.useMutation({
    onSuccess: () => {
      query.refetch();
      setSubject("");
      setDescription("");
      setCategory("general");
      setOrderId("");
      toast.success("Cas créé avec succès");
    },
    onError: (err) => toast.error(err.message),
  });
  const utils = trpc.useUtils();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [orderId, setOrderId] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    await createMut.mutateAsync({
      subject: subject.trim(),
      description: description.trim(),
      category,
      order_id: orderId.trim() || undefined,
    });
  }

  return (
    <QueryGuard
      query={{ isLoading: query.isLoading, error: query.error }}
      loadingFallback={<SupportPageSkeleton />}
    >
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <div>
          <h1 className="text-2xl font-bold">{t("heading")}</h1>
          <p className="text-sm text-muted-foreground">{t("create_case_description")}</p>
        </div>

        {!query.data?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Headphones className="mb-3 size-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">{t("no_cases")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {query.data.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium">{c.subject}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t(c.category) ?? c.category}</span>
                        <span>·</span>
                        <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                    </div>
                    <Badge variant={STATUS_BADGE[c.status] ?? "outline"} className="shrink-0">
                      {t(c.status) ?? c.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {createMut.isSuccess && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-green-700">{t("case_created")}</p>
            </CardContent>
          </Card>
        )}

        <hr className="border-t" />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="size-5" />
              {t("new_case")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">{t("subject")}</Label>
                <Input
                  id="subject"
                  placeholder={t("subject_placeholder")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("category")}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t("general")}</SelectItem>
                    <SelectItem value="shipping">{t("shipping")}</SelectItem>
                    <SelectItem value="delivery">{t("delivery")}</SelectItem>
                    <SelectItem value="payment">{t("payment")}</SelectItem>
                    <SelectItem value="return">{t("return")}</SelectItem>
                    <SelectItem value="product">{t("product")}</SelectItem>
                    <SelectItem value="complaint">{t("complaint")}</SelectItem>
                    <SelectItem value="technical">{t("technical")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">{t("order_id_placeholder")}</Label>
                <Input
                  id="orderId"
                  placeholder={t("order_id_placeholder")}
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("description_placeholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={!subject.trim() || !description.trim() || createMut.isPending}>
                {createMut.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("create_case")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </QueryGuard>
  );
}
