import type { PropsWithChildren } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnonymousSessionProvider } from "@/features/authentication_and_authorization/auth/components/AnonymousSessionProvider";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { campaign_service } from "@/features/campaign_management_system/services/campaign.service";
import { StorefrontAnnouncementBar } from "@/components/storefront/storefront-announcement-bar";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";
import type { CampaignBanner } from "@/features/campaign_management_system/components/storefront/types";

type Props = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

async function getNavCategories(): Promise<CategoryTreeNode[]> {
  try {
    const tree = await category_service.get_full_tree(true);
    return tree;
  } catch {
    return [];
  }
}

async function getAnnouncementBanners(locale: string): Promise<CampaignBanner[]> {
  try {
    const campaigns = await campaign_service.get_storefront_sections({
      locale: locale as "fr" | "en" | "ar",
      page_slug: "home",
    }) as Array<{
      banners: Array<{
        id: string;
        banner_type: string;
        image_url: string | null;
        mobile_image_url: string | null;
        video_url: string | null;
        link_url: string | null;
        link_target: string | null;
        alt_text: string | null;
        sort_order: number;
        is_active: boolean;
        placement: string[];
        overlay_content: {
          en?: { headline?: string; body?: string; cta?: string };
          fr?: { headline?: string; body?: string; cta?: string };
          ar?: { headline?: string; body?: string; cta?: string };
        } | null;
        device_target: string | null;
      }>;
    }>;

    const banners: CampaignBanner[] = [];
    for (const campaign of campaigns) {
      for (const banner of campaign.banners) {
        if (banner.is_active) {
          banners.push({
            id: banner.id,
            banner_type: banner.banner_type,
            image_url: banner.image_url,
            mobile_image_url: banner.mobile_image_url,
            video_url: banner.video_url,
            link_url: banner.link_url,
            link_target: banner.link_target ?? "_self",
            alt_text: banner.alt_text,
            sort_order: banner.sort_order,
            is_active: banner.is_active,
            placement: (banner.placement as string[]) ?? [],
            overlay_content: banner.overlay_content as CampaignBanner["overlay_content"],
            device_target: banner.device_target ?? "all",
          });
        }
      }
    }

    return banners;
  } catch {
    return [];
  }
}

export default async function StorefrontLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const [categories, announcementBanners]: [CategoryTreeNode[], CampaignBanner[]] = await Promise.all([
    getNavCategories(),
    getAnnouncementBanners(locale),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <AnonymousSessionProvider>
        <StorefrontAnnouncementBar banners={announcementBanners} />
        <Header locale={locale} categories={categories} />
        <main className="flex-1 pb-16 md:pb-0">
          <div className="container mx-auto p-6">{children}</div>
        </main>
        <Footer />
      </AnonymousSessionProvider>
    </div>
  );
}
