"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

type ProductMediaGalleryProps = {
  product_id: string;
  initial_media: Array<{
    id: string;
    url: string;
    alt: string | null;
    is_primary: boolean;
    sort_order: number;
  }>;
};

export function ProductMediaGallery({ product_id, initial_media }: ProductMediaGalleryProps) {
  const t = useTranslations("products");
  const [uploading, set_uploading] = useState(false);
  const utils = trpc.useUtils();
  const remove_media = trpc.products.removeMedia.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
  });

  async function on_upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set_uploading(true);
    try {
      const form_data = new FormData();
      form_data.append("file", file);
      form_data.append("is_primary", "false");
      await fetch(`/api/admin/products/${product_id}/media/upload`, {
        method: "POST",
        body: form_data,
        credentials: "include",
      });
      await utils.products.byId.invalidate({ id: product_id });
    } finally {
      set_uploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel>{t("media_upload")}</FieldLabel>
        <Input type="file" accept="image/*,video/*" disabled={uploading} onChange={on_upload} />
      </Field>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {initial_media.map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-lg border">
            {item.url.match(/\.(mp4|webm)$/i) ? (
              <video src={item.url} className="h-32 w-full object-cover" controls />
            ) : (
              <Image
                src={item.url}
                alt={item.alt ?? ""}
                width={320}
                height={180}
                className="h-32 w-full object-cover"
                unoptimized
              />
            )}
            {item.is_primary && (
              <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {t("media_primary")}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute bottom-2 right-2"
              onClick={() => remove_media.mutate({ product_id, media_id: item.id })}
            >
              {t("delete")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
