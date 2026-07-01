import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Ruler } from "lucide-react";

type RowData = {
  labelKey: string;
  values: string[];
};

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sizeGuide" });
  return { title: t("title") };
}

const CLOTHING_ROWS: RowData[] = [
  { labelKey: "clothes_chest", values: ["82-86", "86-90", "90-95", "95-100", "100-106", "106-112"] },
  { labelKey: "clothes_waist", values: ["62-66", "66-70", "70-75", "75-80", "80-86", "86-92"] },
  { labelKey: "clothes_hips", values: ["88-92", "92-96", "96-100", "100-105", "105-110", "110-116"] },
  { labelKey: "clothes_length", values: ["60", "62", "64", "66", "68", "70"] },
];

const SHOE_ROWS: RowData[] = [
  { labelKey: "shoe_foot", values: ["22.5", "23", "23.8", "24.5", "25.2", "25.8", "26.5", "27.2", "27.8", "28.5"] },
  { labelKey: "shoe_eu", values: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] },
  { labelKey: "shoe_uk", values: ["3.5", "4", "5", "5.5", "6.5", "7.5", "8", "9", "9.5", "10.5"] },
];

const ACCESSORY_ROWS: RowData[] = [
  { labelKey: "accessory_caps", values: ["S/M : 54-57", "L/XL : 57-60", "-"] },
  { labelKey: "accessory_belts", values: ["75-85", "85-95", "95-105"] },
  { labelKey: "accessory_watches", values: ["Bracelet 16cm", "Bracelet 18cm", "Bracelet 20cm"] },
];

const TIPS = [
  { titleKey: "tip_chest_title", descKey: "tip_chest_desc" },
  { titleKey: "tip_waist_title", descKey: "tip_waist_desc" },
  { titleKey: "tip_hips_title", descKey: "tip_hips_desc" },
];

export default async function SizeGuidePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sizeGuide" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t("subtitle")}</p>
      </section>

      <Separator />

      <section>
        <Tabs defaultValue="clothing" className="w-full">
          <TabsList className="mb-8 w-full justify-start">
            <TabsTrigger value="clothing">{t("tabClothing")}</TabsTrigger>
            <TabsTrigger value="shoes">{t("tabShoes")}</TabsTrigger>
            <TabsTrigger value="accessories">{t("tabAccessories")}</TabsTrigger>
          </TabsList>

          <TabsContent value="clothing">
            <Card>
              <CardHeader>
                <CardTitle>{t("clothingTitle")}</CardTitle>
                <CardDescription>{t("clothingDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground p-3 text-left font-medium">{t("measureHeader")}</th>
                        {["XS", "S", "M", "L", "XL", "XXL"].map((h) => (
                          <th key={h} className="text-muted-foreground p-3 text-center font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CLOTHING_ROWS.map((row) => (
                        <tr key={row.labelKey} className="border-b last:border-0">
                          <td className="p-3 font-medium">{t(row.labelKey)}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="p-3 text-center">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shoes">
            <Card>
              <CardHeader>
                <CardTitle>{t("shoesTitle")}</CardTitle>
                <CardDescription>{t("shoesDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground p-3 text-left font-medium">{t("measureHeader")}</th>
                        {["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"].map((h) => (
                          <th key={h} className="text-muted-foreground p-3 text-center font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SHOE_ROWS.map((row) => (
                        <tr key={row.labelKey} className="border-b last:border-0">
                          <td className="p-3 font-medium">{t(row.labelKey)}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="p-3 text-center">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessories">
            <Card>
              <CardHeader>
                <CardTitle>{t("accessoriesTitle")}</CardTitle>
                <CardDescription>{t("accessoriesDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground p-3 text-left font-medium">{t("typeHeader")}</th>
                        {[t("accessoryHead"), t("accessoryDiameter")].map((h) => (
                          <th key={h} className="text-muted-foreground p-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ACCESSORY_ROWS.map((row) => (
                        <tr key={row.labelKey} className="border-b last:border-0">
                          <td className="p-3 font-medium">{t(row.labelKey)}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="p-3">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("tipsTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {TIPS.map((tip) => (
            <Card key={tip.titleKey}>
              <CardHeader>
                <div className="bg-muted mb-2 flex h-24 items-center justify-center rounded-lg">
                  <Ruler className="text-muted-foreground size-8" />
                </div>
                <CardTitle className="text-base">{t(tip.titleKey)}</CardTitle>
                <CardDescription>{t(tip.descKey)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 text-center text-sm">{t("tipsComingSoon")}</p>
      </section>
    </div>
  );
}
