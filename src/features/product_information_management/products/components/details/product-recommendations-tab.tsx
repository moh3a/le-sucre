"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, RefreshCw, Star } from "lucide-react";
import Image from "next/image";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { RECOMMENDATION_TYPE } from "@/features/product_information_management/recommendations/constants/recommendation-types";

type Props = {
  product_id: string;
};



export function ProductRecommendationsTab({ product_id }: Props) {
  const t = useTranslations("products");
  const utils = trpc.useUtils();

  const { data: product_data } = trpc.products.byId.useQuery({ id: product_id });
  const product = product_data?.product;

  const { data: edges_data, isLoading: edges_loading } = trpc.recommendations.admin.edges.useQuery({
    source_product_id: product_id,
  });

  const add_edge = trpc.recommendations.admin.addEdge.useMutation({
    onSuccess: () => {
      utils.recommendations.admin.edges.invalidate({ source_product_id: product_id });
      toast.success(t("recommendation_added"));
      set_search_query("");
      set_selected_target(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const remove_edge = trpc.recommendations.admin.removeEdge.useMutation({
    onSuccess: () => {
      utils.recommendations.admin.edges.invalidate({ source_product_id: product_id });
      toast.success(t("recommendation_removed"));
    },
    onError: (err) => toast.error(err.message),
  });

  const reindex = trpc.recommendations.admin.reindex.useMutation({
    onSuccess: () =>       toast.success(t("reindex_scheduled")),
    onError: (err) => toast.error(err.message),
  });

  // ─── Catalog discovery controls ───
  const update = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.byId.invalidate({ id: product_id });
      toast.success(t("product_updated"));
    },
  });

  // ─── Add edge state ───
  const [new_edge_type, set_new_edge_type] = useState("similar");
  const [search_query, set_search_query] = useState("");
  const [selected_target, set_selected_target] = useState<{
    id: string;
    name: string;
    image_url: string | null;
  } | null>(null);

  const { data: search_results, isFetching: search_loading } =
    trpc.products.adminList.useQuery(
      { search: search_query, page: 1, limit: 10 },
      { enabled: search_query.length >= 2 },
    );

  const edges = edges_data?.edges ?? [];
  const edge_counts = edges_data?.counts ?? [];

  const edges_by_type: Record<string, typeof edges> = {};
  for (const edge of edges) {
    if (!edges_by_type[edge.recommendation_type]) edges_by_type[edge.recommendation_type] = [];
    edges_by_type[edge.recommendation_type].push(edge);
  }

  function handle_add_edge() {
    if (!selected_target) return;
    add_edge.mutate({
      source_product_id: product_id,
      target_product_id: selected_target.id,
      recommendation_type: new_edge_type as "similar" | "related" | "fbt",
      score: 75,
    });
  }

  function handle_remove_edge(edge_id: string) {
    remove_edge.mutate({ edge_id });
  }

  function handle_toggle_featured() {
    if (!product) return;
    update.mutate({
      id: product_id,
      is_featured: !product.is_featured,
    });
  }

  return (
    <QueryGuard mutation={add_edge}>
    <div className="space-y-6">
      {/* ─── Catalog Discovery Section ─── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("catalog_discovery")}</CardTitle>
          <CardDescription>
            {t("catalog_discovery_description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Switch
              checked={product?.is_featured ?? false}
              onCheckedChange={handle_toggle_featured}
              disabled={update.isPending}
            />
            <div>
              <p className="text-sm font-medium">{t("featured_product")}</p>
              <p className="text-muted-foreground text-xs">
                {t("featured_product_description")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Recommendation Edges Section ─── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("recommendations")}</CardTitle>
            <CardDescription>
              {t("recommendations_description")}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reindex.mutate({ product_id, locale: "fr" })}
            disabled={reindex.isPending}
          >
            <RefreshCw
              className={`mr-2 size-4 ${reindex.isPending ? "animate-spin" : ""}`}
            />
            {t("reindex")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {edges_loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : edges.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {t("no_recommendations")}
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(edges_by_type).map(([type, type_edges]) => (
                <div key={type}>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary">{t(`type_${type}`)}</Badge>
                    <span className="text-muted-foreground text-xs">
                      {type_edges.length} {t("product_count")}
                    </span>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">{t("rank")}</TableHead>
                          <TableHead>{t("product")}</TableHead>
                          <TableHead className="w-24 text-right">{t("score")}</TableHead>
                          <TableHead className="w-20" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {type_edges.map((edge) => (
                          <TableRow key={edge.id}>
                            <TableCell className="text-muted-foreground text-xs">
                              #{edge.rank}
                            </TableCell>
                            <TableCell>
                              <EdgeProductCell target_product_id={edge.target_product_id} />
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {Number(edge.score).toFixed(1)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive"
                                onClick={() => handle_remove_edge(edge.id)}
                                disabled={remove_edge.isPending}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Add Manual Edge ─── */}
          <div className="rounded-lg border p-4">
            <h4 className="mb-3 text-sm font-medium">{t("add_manual_recommendation")}</h4>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[160px] flex-1">
                <Field>
                  <FieldLabel className="text-xs">{t("type")}</FieldLabel>
                  <Select value={new_edge_type} onValueChange={set_new_edge_type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RECOMMENDATION_TYPE.similar}>{t("type_similar")}</SelectItem>
                      <SelectItem value={RECOMMENDATION_TYPE.related}>{t("type_related")}</SelectItem>
                      <SelectItem value={RECOMMENDATION_TYPE.fbt}>
                        {t("type_fbt")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="min-w-[200px] flex-1">
                <Field>
                  <FieldLabel className="text-xs">{t("target_product")}</FieldLabel>
                  <Combobox
                    value={selected_target?.id ?? ""}
                    onValueChange={(val) => {
                      const found = search_results?.items?.find((p) => p.id === val);
                      if (found) {
                        set_selected_target({
                          id: found.id,
                          name: found.name ?? found.slug,
                          image_url: found.image_url,
                        });
                      }
                    }}
                  >
                    <ComboboxInput
                      placeholder={t("search_product_placeholder")}
                      value={search_query}
                      onChange={(e) => set_search_query(e.target.value)}
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {search_loading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="size-4 animate-spin" />
                          </div>
                        ) : search_results?.items?.length ? (
                          search_results.items
                            .filter((p) => p.id !== product_id)
                            .map((p) => (
                              <ComboboxItem key={p.id} value={p.id}>
                                <div className="flex items-center gap-2">
                                  {p.image_url ? (
                                    <Image
                                      src={p.image_url}
                                      alt=""
                                      width={24}
                                      height={24}
                                      className="size-6 rounded object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="size-6 rounded bg-neutral-200" />
                                  )}
                                  <span className="truncate">{p.name ?? p.slug}</span>
                                </div>
                              </ComboboxItem>
                            ))
                        ) : search_query.length >= 2 ? (
                          <p className="text-muted-foreground p-4 text-center text-sm">
                            {t("no_results")}
                          </p>
                        ) : (
                          <p className="text-muted-foreground p-4 text-center text-sm">
                            {t("type_at_least")}
                          </p>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              </div>

              {selected_target && (
                <div className="flex items-center gap-2 pb-2">
                  <Badge variant="outline" className="gap-1">
                    {selected_target.image_url && (
                      <Image
                        src={selected_target.image_url}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 rounded object-cover"
                        unoptimized
                      />
                    )}
                    {selected_target.name}
                  </Badge>
                </div>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handle_add_edge}
                disabled={!selected_target || add_edge.isPending}
                className="mb-0.5"
              >
                <Plus className="mr-1 size-4" />
                {t("add")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </QueryGuard>
  );
}

function EdgeProductCell({ target_product_id }: { target_product_id: string }) {
  const { data } = trpc.products.byId.useQuery({ id: target_product_id });
  const name = data?.translations?.find((t) => t.locale === "fr")?.name;
  const image = data?.media?.find((m) => m.is_primary)?.url ?? data?.media?.[0]?.url;
  const slug = data?.product?.slug;

  if (!data) return <Skeleton className="h-5 w-40" />;

  return (
    <div className="flex items-center gap-2">
      {image ? (
        <Image
          src={image}
          alt=""
          width={32}
          height={32}
          className="size-8 rounded object-cover"
          unoptimized
        />
      ) : (
        <div className="size-8 rounded bg-neutral-200" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name ?? slug}</p>
        <p className="text-muted-foreground truncate text-xs">{slug}</p>
      </div>
    </div>
  );
}
