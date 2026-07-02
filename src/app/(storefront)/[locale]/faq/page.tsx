import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

const CATEGORIES = ["commandes", "livraison", "retours", "paiements", "compte"] as const;
const ITEMS_PER_CATEGORY = 5;

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title") };
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("heading")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t("subtitle")}</p>
      </section>

      <Separator />

      <section>
        <Tabs defaultValue="commandes" className="w-full">
          <TabsList className="mb-8 w-full justify-start">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat}>{t(`tab_${cat}`)}</TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((category) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle>{t(`${category}_title`)}</CardTitle>
                  <CardDescription>{t(`${category}_desc`)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {Array.from({ length: ITEMS_PER_CATEGORY }).map((_, index) => (
                      <AccordionItem key={index} value={`${category}-${index}`}>
                        <AccordionTrigger>{t(`${category}_q_${index + 1}`)}</AccordionTrigger>
                        <AccordionContent>{t(`${category}_a_${index + 1}`)}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <Separator />

      <section className="text-center">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>{t("ctaTitle")}</CardTitle>
            <CardDescription>{t("ctaDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/contact">{t("ctaButton")}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
