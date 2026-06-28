"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaPickerDialog } from "@/features/media_library/components/media-picker-dialog";
import { formatDate } from "@/lib/format";
import type { MediaDTO } from "@/features/media_library/types";

function get_profile_form_schema(t: ReturnType<typeof useTranslations<"profile">>) {
  return z.object({
    name: z.string().min(2, t("name_min_length")).max(255),
    image: z.string().max(2048).nullable().optional(),
  });
}

type ProfileFormValues = z.infer<ReturnType<typeof get_profile_form_schema>>;

export function AccountProfileTab() {
  const t = useTranslations("profile");
  const utils = trpc.useUtils();

  const profile_form_schema = useMemo(() => get_profile_form_schema(t), [t]);
  const { data, isLoading, error } = trpc.auth.me.useQuery();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profile_form_schema),
    values: { name: data?.user.name ?? "", image: data?.user.image ?? null },
  });

  const update = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  async function on_submit(values: ProfileFormValues) {
    await update.mutateAsync({
      name: values.name,
      image: values.image ?? undefined,
    });
  }

  const image_value = form.watch("image");

  function handle_image_select(media: MediaDTO) {
    form.setValue("image", media.url, { shouldDirty: true });
  }

  function handle_image_clear() {
    form.setValue("image", null, { shouldDirty: true });
  }

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    }>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile_photo_title")}</CardTitle>
          <CardDescription>{t("profile_photo_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <MediaPickerDialog
            onSelect={handle_image_select}
            trigger={
              <div className="group relative inline-flex cursor-pointer overflow-hidden rounded-full">
                {image_value ? (
                  <Image
                    src={image_value}
                    alt={t("avatar_alt")}
                    width={96}
                    height={96}
                    className="size-24 object-cover transition-opacity group-hover:opacity-75"
                    unoptimized
                  />
                ) : (
                  <div className="bg-muted flex size-24 items-center justify-center rounded-full">
                    <Camera className="text-muted-foreground size-8" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/20">
                  <span className="text-white text-xs opacity-0 transition-opacity group-hover:opacity-100">
                    {t("change_photo")}
                  </span>
                </div>
              </div>
            }
          />
          {image_value && (
            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={handle_image_clear}>
              {t("delete_photo")}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("personal_info_title")}</CardTitle>
          <CardDescription>{t("personal_info_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>{t("full_name")}</FieldLabel>
                <Input {...form.register("name")} />
                {form.formState.errors.name && (
                  <FieldError>{form.formState.errors.name.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>{t("email")}</FieldLabel>
                <Input value={data?.user.email ?? ""} disabled className="text-muted-foreground" />
                <p className="text-muted-foreground text-xs">{t("email_cannot_change")}</p>
              </Field>

              <Field>
                <FieldLabel>{t("roles")}</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {data?.roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel>{t("member_since")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {formatDate(data?.user.createdAt)}
                </p>
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={update.isPending || !form.formState.isDirty}>
              {update.isPending ? t("saving") : t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </QueryGuard>
  );
}
