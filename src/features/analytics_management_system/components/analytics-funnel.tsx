"use client";

import { BarChart, ArrowRight, Eye, ShoppingCart, CreditCard, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function AnalyticsFunnel({ from, to }: { from: string; to: string }) {
  const t = useTranslations("analytics");
  const { data, isLoading } = trpc.analytics.overview.useQuery({ from, to });

  const stepsMap: Record<
    string,
    { label: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    view: { label: t("funnel_view"), icon: Eye },
    add_to_cart: { label: t("funnel_add_to_cart"), icon: ShoppingCart },
    checkout: { label: t("funnel_checkout"), icon: CreditCard },
    purchase: { label: t("funnel_purchase"), icon: ShoppingBag },
  };

  const funnelSteps = (data?.funnel ?? []).map((s) => ({
    ...s,
    info: stepsMap[s.step] || { label: s.step, icon: BarChart },
  }));

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<p className="text-muted-foreground text-sm">{t("loading")}</p>}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("funnel_title")}</CardTitle>
          <CardDescription>{t("funnel_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8 py-4">
            {funnelSteps.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center">
                {t("funnel_empty")}
              </p>
            ) : (
              <div className="flex flex-col gap-6">
                {funnelSteps.map((step, idx) => {
                  const IconComponent = step.info.icon;
                  const percentage = Math.round(step.rate * 100);
                  return (
                    <div key={step.step} className="flex flex-col items-center gap-4 md:flex-row">
                      <div className="flex w-full items-center gap-3 md:w-64">
                        <div className="bg-secondary text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                          <IconComponent className="text-olive-leaf h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{step.info.label}</p>
                          <p className="text-muted-foreground text-xs">
                            {step.sessions.toLocaleString()} {t("funnel_sessions")}
                          </p>
                        </div>
                      </div>

                      <div className="bg-secondary relative h-8 w-full flex-1 overflow-hidden rounded-md">
                        <div
                          className="bg-primary h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="text-olive-leaf absolute inset-0 flex items-center justify-end px-3 text-xs font-bold">
                          {percentage}%
                        </span>
                      </div>

                      {idx < funnelSteps.length - 1 && (
                        <div className="text-muted-foreground hidden h-8 items-center md:flex">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </QueryGuard>
  );
}
