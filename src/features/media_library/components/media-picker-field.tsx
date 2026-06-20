"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MediaPickerDialog } from "./media-picker-dialog";
import type { MediaDTO } from "../types";

type MediaPickerFieldProps = {
  value?: string | null;
  media_item?: MediaDTO | null;
  onSelect: (media: MediaDTO) => void;
  onClear?: () => void;
  entity_type?: string;
  entity_id?: string;
  field?: string;
  className?: string;
};

export function MediaPickerField({
  value,
  media_item,
  onSelect,
  onClear,
  entity_type,
  entity_id,
  field,
  className,
}: MediaPickerFieldProps) {
  return (
    <div className={className}>
      <MediaPickerDialog
        onSelect={onSelect}
        entity_type={entity_type}
        entity_id={entity_id}
        field={field}
        trigger={
          media_item?.url ? (
            <div className="group relative inline-flex cursor-pointer overflow-hidden rounded-lg border">
              <Image
                src={media_item.url}
                alt={media_item.alt ?? ""}
                width={160}
                height={160}
                className="size-32 object-cover transition-opacity group-hover:opacity-75"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <span className="text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Changer
                </span>
              </div>
              {onClear && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="bg-destructive text-destructive-foreground absolute top-1 right-1 flex size-5 items-center justify-center rounded-full"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="flex size-32 flex-col items-center justify-center gap-1"
            >
              <ImagePlus className="size-6" />
              <span className="text-xs">Choisir</span>
            </Button>
          )
        }
      />
    </div>
  );
}
