import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletterConfirm" });
  return { title: t("title") };
}

export default async function NewsletterConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "newsletterConfirm" });
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) ?? "";
  const isSuccess = status === "success";

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          {isSuccess ? (
            <>
              <CheckCircle className="mx-auto mb-4 size-16 text-green-500" />
              <CardTitle className="text-2xl">{t("successTitle")}</CardTitle>
              <CardDescription className="mt-2">{t("successDesc")}</CardDescription>
            </>
          ) : (
            <>
              <XCircle className="mx-auto mb-4 size-16 text-red-500" />
              <CardTitle className="text-2xl">{t("errorTitle")}</CardTitle>
              <CardDescription className="mt-2">{t("errorDesc")}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess ? (
            <Button className="w-full" asChild>
              <Link href="/">{t("goHome")}</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <Button className="w-full">{t("retry")}</Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">{t("goHome")}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <section className="text-center">
        <h2 className="mb-4 text-xl font-bold">{t("followTitle")}</h2>
        <p className="text-muted-foreground mb-6 text-sm">{t("followDesc")}</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
