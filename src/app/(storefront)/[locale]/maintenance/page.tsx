import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { APP_NAME } from "@/constants";

type Props = {
  params: Promise<{ locale: string }>;
};

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    children: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    viewBox: "0 0 24 24",
  },
  {
    label: "Instagram",
    href: "#",
    children: (
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </>
    ),
    viewBox: "0 0 24 24",
  },
  {
    label: "Twitter",
    href: "#",
    children: <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />,
    viewBox: "0 0 24 24",
  },
] as const;

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "maintenance" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MaintenancePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "maintenance" });

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="mx-auto max-w-md text-center">
        <div className="bg-primary mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full">
          <span className="text-primary-foreground text-2xl font-bold">LS</span>
        </div>

        <h1 className="mb-4 text-balance text-4xl font-bold">{t("heading")}</h1>

        <p className="text-muted-foreground mb-8 text-lg leading-relaxed text-balance">
          {t("description")}
        </p>

        <div className="bg-cream mb-8 inline-block rounded-lg px-6 py-3 dark:bg-muted">
          <p className="text-sm font-medium">{t("estimatedReturn")}</p>
        </div>

        <div className="mb-8">
          <p className="text-muted-foreground mb-4 text-sm">{t("followText")}</p>
          <div className="flex justify-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <Button key={social.label} variant="outline" size="icon" asChild>
                <Link href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                  <svg className="size-5" viewBox={social.viewBox} fill="currentColor">
                    {social.children}
                  </svg>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground text-xs">{t("copyright", { appName: APP_NAME })}</p>
      </div>
    </div>
  );
}
