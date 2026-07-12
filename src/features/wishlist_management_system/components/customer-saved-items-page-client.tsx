"use client";

import { useTranslations } from "next-intl";
import { Save } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { SaveForLaterPanel, type SaveForLaterPanelProps } from "./save-for-later";
import { SavedItemsPageSkeleton } from "./saved-items-page-skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

export function CustomerSavedItemsPageClient() {
  const t = useTranslations("wishlist");
  const { data, isLoading, error } = trpc.wishlistManagement.saveForLater.list.useQuery({
    page: 1,
    limit: 50,
  });
  const utils = trpc.useUtils();

  const items = (data?.items ?? []).map((item: SaveForLaterPanelProps["items"][number]) => item);

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<SavedItemsPageSkeleton />}>
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">{t("saved_title")}</h1>
        {!items || items.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Save className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("no_saved_items")}</EmptyTitle>
              <EmptyDescription>{t("saved_for_later_desc")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <SaveForLaterPanel
            items={items}
            onMovedToCart={() => {
              utils.wishlistManagement.saveForLater.list.invalidate();
            }}
          />
        )}
      </div>
    </QueryGuard>
  );
}
