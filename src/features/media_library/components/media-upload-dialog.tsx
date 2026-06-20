"use client";

import * as React from "react";
import { CloudUpload, X, Crop, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Cropper, CropperArea, CropperImage } from "@/components/ui/cropper";
import { trpc } from "@/components/providers/app-providers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";
import { csrf_safe_fetch } from "@/lib/http/csrf";

type MediaUploadDialogProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (media: unknown) => void;
  entity_type?: string;
  entity_id?: string;
  field?: string;
  is_primary?: boolean;
};

function crop_image(
  file: File,
  crop_area: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop_area.width;
      canvas.height = crop_area.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(
        img,
        crop_area.x,
        crop_area.y,
        crop_area.width,
        crop_area.height,
        0,
        0,
        crop_area.width,
        crop_area.height,
      );
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        file.type,
        0.95,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function MediaUploadDialog({
  trigger,
  open: open_prop,
  onOpenChange: on_open_change_prop,
  onSuccess,
  entity_type,
  entity_id,
  field,
  is_primary: is_primary_prop,
}: MediaUploadDialogProps) {
  const [open_internal, set_open_internal] = React.useState(false);
  const open = open_prop ?? open_internal;
  const on_open_change = on_open_change_prop ?? set_open_internal;

  const [files, set_files] = React.useState<File[]>([]);
  const [uploading, set_uploading] = React.useState(false);
  const [alt, set_alt] = React.useState("");
  const [caption, set_caption] = React.useState("");
  const [is_public, set_is_public] = React.useState(true);
  const [is_primary, set_is_primary] = React.useState(is_primary_prop ?? false);
  const [tab, set_tab] = React.useState<"upload" | "crop">("upload");
  const [zoom, set_zoom] = React.useState(1);
  const [rotation, set_rotation] = React.useState(0);
  const [crop_area, set_crop_area] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const is_mobile = useIsMobile();

  const utils = trpc.useUtils();

  const selected_file = files[0] ?? null;
  const is_image = selected_file?.type.startsWith("image/") && !selected_file?.type.includes("svg");

  async function handle_upload(cropped_blob?: Blob) {
    if (!selected_file) return;
    set_uploading(true);
    try {
      const file_to_upload = cropped_blob
        ? new File([cropped_blob], selected_file.name, {
            type: selected_file.type,
          })
        : selected_file;

      const form_data = new FormData();
      form_data.append("file", file_to_upload);
      form_data.append("alt", alt);
      form_data.append("caption", caption);
      form_data.append("is_public", String(is_public));
      if (entity_type) form_data.append("entity_type", entity_type);
      if (entity_id) form_data.append("entity_id", entity_id);
      if (field) form_data.append("field", field);
      form_data.append("is_primary", String(is_primary));

      if (cropped_blob) {
        form_data.append("width", String(crop_area?.width ?? 0));
        form_data.append("height", String(crop_area?.height ?? 0));
      }

      const res = await csrf_safe_fetch("/api/admin/media/upload", {
        method: "POST",
        body: form_data,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Upload failed");
      }

      const result = await res.json();
      toast.success("Fichier importé avec succès");
      onSuccess?.(result.data);
      utils.media.list.invalidate();
      utils.media.stats.invalidate();
      reset();
      on_open_change(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'importation");
    } finally {
      set_uploading(false);
    }
  }

  function reset() {
    set_files([]);
    set_alt("");
    set_caption("");
    set_is_public(true);
    set_is_primary(is_primary_prop ?? false);
    set_tab("upload");
    set_zoom(1);
    set_rotation(0);
    set_crop_area(null);
  }

  async function handle_crop_and_upload() {
    if (!selected_file || !crop_area) return;
    try {
      const blob = await crop_image(selected_file, crop_area);
      await handle_upload(blob);
    } catch (error) {
      toast.error("Échec du recadrage");
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={on_open_change}>
      {trigger ? <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger> : null}
      <ResponsiveDialogContent className={is_mobile ? "" : "sm:max-w-2xl"}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Importer un fichier</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Importez une image, une vidéo ou un document dans la médiathèque.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-2">
          <FileUpload
            value={files}
            onValueChange={(new_files) => {
              set_files(new_files);
              set_crop_area(null);
              set_zoom(1);
              set_rotation(0);
              if (new_files.length > 0) {
                set_tab(is_image ? "crop" : "upload");
              }
            }}
            accept="image/*,video/*,application/pdf"
            maxFiles={1}
            maxSize={100 * 1024 * 1024}
            disabled={uploading}
          >
            <FileUploadDropzone className="border-dotted text-center">
              <CloudUpload className="mx-auto size-8" />
              <p className="text-sm">Glissez-déposez un fichier ou</p>
              <FileUploadTrigger asChild>
                <Button variant="link" size="sm" className="p-0">
                  choisissez un fichier
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {files.map((file, index) => (
                <FileUploadItem key={index} value={file}>
                  <FileUploadItemPreview />
                  <FileUploadItemMetadata />
                  <FileUploadItemDelete asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <X />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>

          {selected_file && is_image && (
            <Tabs value={tab} onValueChange={(v) => set_tab(v as "upload" | "crop")}>
              <TabsList className="w-full">
                <TabsTrigger value="crop" className="flex-1">
                  <Crop />
                  Recadrer
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex-1">
                  Original
                </TabsTrigger>
              </TabsList>
              <TabsContent value="crop" className="space-y-4">
                <div className="aspect-square max-h-80 w-full overflow-hidden rounded-lg bg-black/5">
                  <Cropper
                    aspectRatio={1}
                    zoom={zoom}
                    rotation={rotation}
                    onZoomChange={set_zoom}
                    onRotationChange={set_rotation}
                    onCropComplete={(_percentages, pixels) => {
                      set_crop_area(pixels);
                    }}
                  >
                    <CropperImage
                      src={URL.createObjectURL(selected_file)}
                      alt={selected_file.name}
                      className="max-h-80"
                    />
                    <CropperArea withGrid />
                  </Cropper>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ZoomOut className="size-4" />
                    <Slider
                      value={[zoom]}
                      onValueChange={([v]) => set_zoom(v)}
                      min={1}
                      max={3}
                      step={0.1}
                      className="w-24"
                    />
                    <ZoomIn className="size-4" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => set_rotation((r) => r + 90)}>
                    <RotateCw />
                    Rotation
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="alt">Texte alternatif (Alt)</Label>
              <Input
                id="alt"
                value={alt}
                onChange={(e) => set_alt(e.target.value)}
                placeholder="Description de l'image"
              />
            </div>
            <div>
              <Label htmlFor="caption">Légende</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => set_caption(e.target.value)}
                placeholder="Légende optionnelle"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <Checkbox checked={is_public} onCheckedChange={(v) => set_is_public(v === true)} />
                <span className="text-sm">Public</span>
              </label>
              {(entity_type || is_primary_prop) && (
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={is_primary}
                    onCheckedChange={(v) => set_is_primary(v === true)}
                  />
                  <span className="text-sm">Image principale</span>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => on_open_change(false)} disabled={uploading}>
            Annuler
          </Button>
          <Button
            onClick={tab === "crop" && crop_area ? handle_crop_and_upload : () => handle_upload()}
            disabled={!selected_file || uploading}
          >
            {uploading ? "Importation..." : "Importer"}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
