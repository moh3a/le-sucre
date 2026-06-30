import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Comparer",
};

export default async function ComparePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });

  const hasProducts = false;

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* PAGE HEADER */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <Button variant="outline">{t("addProduct")}</Button>
      </section>

      <Separator />

      {/* COMPARISON TABLE */}
      {hasProducts ? (
        <section>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">{t("feature")}</TableHead>
                <TableHead>{t("productA")}</TableHead>
                <TableHead>{t("productB")}</TableHead>
                <TableHead>{t("productC")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[t("image"), t("name"), t("price"), t("rating"), t("description"), t("specs"), t("availability")].map(
                (feature) => (
                  <TableRow key={feature}>
                    <TableCell className="font-medium">{feature}</TableCell>
                    <TableCell>
                      <div className="bg-muted h-16 w-16 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-16 w-16 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-16 w-16 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </section>
      ) : (
        /* EMPTY STATE */
        <section className="py-16 text-center">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>{t("emptyTitle")}</CardTitle>
              <CardDescription>{t("emptyDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-3">
              <Button variant="outline">{t("addProduct")}</Button>
              <Button variant="link">{t("browseProducts")}</Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
