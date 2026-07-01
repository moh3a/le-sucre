import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "flashSales" });
  return { title: t("activeSales") };
}

export default async function FlashSalesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "flashSales" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* ACTIVE FLASH SALES */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-2xl font-bold">{t("activeSales")}</h2>
          <Badge variant="destructive">{t("live")}</Badge>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { nameKey: "sale1_name", remaining: "02:14:30" },
            { nameKey: "sale2_name", remaining: "00:45:12" },
          ].map((sale) => (
            <Card key={sale.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t(sale.nameKey)}</CardTitle>
                  <Badge variant="outline" className="font-mono text-base">
                    {sale.remaining}
                  </Badge>
                </div>
                <CardDescription>{t("limitedTime")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((p) => (
                    <div
                      key={p}
                      className="bg-muted flex aspect-square items-center justify-center rounded-lg"
                    >
                      <span className="text-muted-foreground text-sm">
                        {t("product")} {p}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">{t("viewAll")}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* UPCOMING FLASH SALES */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("upcoming")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t("comingSoon")}</CardTitle>
                  <Badge variant="secondary">{t("bientot")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {t("startsIn")} {`${i * 3}h`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* ENDED FLASH SALES */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("ended")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-lg line-through">
                  {t("saleName", { index: i })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-muted-foreground">
                  {t("termine")}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
