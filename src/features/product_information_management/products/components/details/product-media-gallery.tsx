"use client";

import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CloudUpload, X } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { full_product_media_dto } from "../../models/product.dto";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { objectToFormData } from "@/lib/utils";

type ProductMediaGalleryProps = {
  product_id: string;
  initial_media: Array<z.infer<typeof full_product_media_dto>>;
};

const formSchema = z.object({
  files: z
    .array(z.custom<File>())
    .min(1, "Please select at least one file")
    // .max(2, "Please select up to 2 files")
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
      message: "File size must be less than 5MB",
      path: ["files"],
    }),
  product_id: z.string(),
  alt: z.string(),
  is_primary: z.boolean(),
  sort_order: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductMediaGallery({ product_id, initial_media }: ProductMediaGalleryProps) {
  const t = useTranslations("products");
  const [uploading, set_uploading] = useState(false);
  const utils = trpc.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id,
      alt: "",
      is_primary: false,
      sort_order: 1,
      files: [],
    },
  });

  const remove_media = trpc.products.removeMedia.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
  });

  const upload_media = trpc.products.mediaUpload.useMutation({
    onSuccess: () => utils.products.byId.invalidate({ id: product_id }),
  });

  const onFileReject = useCallback(
    (file: File, message: string) => {
      toast(message, {
        description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
      });
      form.setError("files", {
        message,
      });
    },
    [form],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-6">
        <div>
          <CardTitle>Média</CardTitle>
          <CardDescription>Gérer le contenu mediatique du produit.</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Ajouter du média</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter du média</DialogTitle>
              <DialogDescription>Ajouter une image ou une vidéo au produit.</DialogDescription>
            </DialogHeader>
            <form
              method="post" 
              action={`/api/admin/products/${product_id}/media/upload`}
              encType="multipart/form-data"
              // FIXME fix media upload
              onSubmit={(_event) => {
                set_uploading(true);
                void form.handleSubmit(async ({ files, ...values }, event) => {
                  await upload_media.mutateAsync(
                    { ...values, file: files[0] },
                    {
                      onSuccess() {
                        toast("Successfully uploaded media.");
                        void utils.products.byId.invalidate({ id: product_id });
                      },
                    },
                  );
                })(_event);
                set_uploading(false);
              }}
            >
              <FieldGroup>
                <Controller
                  name="files"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Attachments</FieldLabel>
                      <FileUpload
                        value={field.value}
                        onValueChange={field.onChange}
                        onFileReject={onFileReject}
                        disabled={uploading}
                        accept="image/*,video/*"
                        maxFiles={1}
                        maxSize={5 * 1024 * 1024}
                        className="w-full"
                      >
                        <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center">
                          <CloudUpload className="size-4" />
                          Drag and drop or
                          <FileUploadTrigger asChild>
                            <Button variant="link" size="sm" className="p-0">
                              choose files
                            </Button>
                          </FileUploadTrigger>
                          to upload
                        </FileUploadDropzone>
                        <FileUploadList>
                          {field.value?.map((file, index) => (
                            <FileUploadItem key={index} value={file}>
                              <FileUploadItemPreview />
                              <FileUploadItemMetadata />
                              <FileUploadItemDelete asChild>
                                <Button variant="ghost" size="icon" className="size-7">
                                  <X />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </FileUploadItemDelete>
                            </FileUploadItem>
                          ))}
                        </FileUploadList>
                      </FileUpload>
                      <FieldDescription>Upload up to 2 images up to 5MB each.</FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  name="alt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="alt">Image alt</FieldLabel>
                      <Input id="alt" value={field.value} onChange={field.onChange} />
                    </Field>
                  )}
                />
                <Controller
                  name="is_primary"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <FieldLabel htmlFor="is_primary">
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <Checkbox
                          id="is_primary"
                          name="is_primary"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldTitle>Is image primary</FieldTitle>
                          <FieldDescription>
                            You can enable or disable this image as primary product image.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  )}
                />
              </FieldGroup>
              <Button type="submit" className="mt-4">
                Submit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                    height={180}
                    className="h-32 w-full object-cover"
                    unoptimized
                  />
                )}
                {item.is_primary && (
                  <span className="bg-primary text-primary-foreground absolute top-2 left-2 rounded px-2 py-0.5 text-xs">
                    {t("media_primary")}
                  </span>
                )}
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
