"use client";

import z from "zod";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog } from "@/features/media_library/components/media-picker-dialog";
import { full_product_media_dto } from "../../models/product.dto";
import type { MediaDTO } from "@/features/media_library/types";
import { Badge } from "@/components/ui/badge";

type ProductMediaGalleryProps = {
  product_id: string;
  initial_media: Array<z.infer<typeof full_product_media_dto>>;
};

export function ProductMediaGallery({ product_id, initial_media }: ProductMediaGalleryProps) {
  const t = useTranslations("products");
  const utils = trpc.useUtils();

  const remove_media = trpc.products.removeMedia.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
  });

  const link_media = trpc.products.addMedia.useMutation({
    onSuccess: () => {
      toast.success("Média ajouté depuis la bibliothèque");
      utils.products.byId.invalidate({ id: product_id });
    },
    onError: (err) => toast.error(err.message),
  });

  async function handle_library_select(media: MediaDTO) {
    await link_media.mutateAsync({
      product_id,
      url: media.url,
      filename: media.original_name,
      mime_type: media.mime_type,
      kind: media.kind === "video" ? "video" : "image",
      alt: media.alt ?? undefined,
      sort_order: initial_media.length + 1,
      is_primary: initial_media.length === 0,
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-6">
        <div>
          <CardTitle>Média</CardTitle>
          <CardDescription>Gérer le contenu mediatique du produit.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <MediaPickerDialog
            onSelect={handle_library_select}
            entity_type="product"
            entity_id={product_id}
            field="gallery"
            trigger={
              <Button disabled={link_media.isPending}>
                <ImagePlus className="mr-2 size-4" />
                Ajouter du média
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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
                    height={320}
                    className="aspect-square w-full object-cover"
                    unoptimized
                  />
                )}
                {item.is_primary && <Badge className="absolute top-2 left-2">{t("media_primary")}</Badge>}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute right-2 bottom-2"
                  onClick={() => remove_media.mutate({ product_id, media_id: item.id })}
                >
                  {t("delete")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
