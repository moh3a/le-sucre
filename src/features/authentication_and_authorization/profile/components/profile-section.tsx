"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";
import { update_profile_schema } from "@/features/authentication_and_authorization/profile/validators/profile.validators";
import type { AppLocale } from "@/i18n/config";

const profile_form_schema = update_profile_schema.extend({
  name: z.string().min(2).max(255),
  image: z.string().max(2048).nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profile_form_schema>;

export function ProfileSection() {
  const t = useTranslations("profile");
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.auth.me.useQuery();
  const initProfile = trpc.profile.initialize.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success(t("profile_initialized"));
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success(t("profile_updated"));
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const updateUser = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const profile = data?.profile;
  const is_initialized = profile !== null;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profile_form_schema),
    values: {
      name: data?.user.name ?? "",
      image: data?.user.image ?? null,
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      phone_secondary: profile?.phone_secondary ?? "",
      date_of_birth: profile?.date_of_birth ?? "",
      gender: profile?.gender ?? undefined,
      company: profile?.company ?? "",
      tax_id: profile?.tax_id ?? "",
      vat_number: profile?.vat_number ?? "",
      bio: profile?.bio ?? "",
      newsletter_opt_in: profile?.newsletter_opt_in ?? false,
      marketing_opt_in: profile?.marketing_opt_in ?? false,
      sms_notifications: profile?.sms_notifications ?? false,
      push_notifications: profile?.push_notifications ?? true,
      preferred_language: (profile?.preferred_language ?? "fr") as AppLocale,
      preferred_currency: profile?.preferred_currency ?? "DZD",
      notes: profile?.notes ?? "",
    },
  });

  const is_saving = updateProfile.isPending || initProfile.isPending || updateUser.isPending;

  async function on_submit(values: ProfileFormValues) {
    const { name, image, ...profile_fields } = values;

    await updateUser.mutateAsync({ name, image: image ?? undefined });

    if (!is_initialized) {
      await initProfile.mutateAsync({
        first_name: (profile_fields.first_name ?? "") as string,
        last_name: (profile_fields.last_name ?? "") as string,
      });
    } else if (Object.keys(profile_fields).length > 0) {
      await updateProfile.mutateAsync(profile_fields);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        {t("error_prefix")}: {error.message}
      </p>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("identity_title")}</CardTitle>
          <CardDescription>{t("identity_description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>{t("full_name")}</FieldLabel>
            <Input {...form.register("name")} />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t("email")}</FieldLabel>
            <Input value={data?.user.email ?? ""} disabled className="text-muted-foreground" />
          </Field>

          <Field>
            <FieldLabel>{t("first_name")}</FieldLabel>
            <Input {...form.register("first_name")} />
            <FieldError>{form.formState.errors.first_name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t("last_name")}</FieldLabel>
            <Input {...form.register("last_name")} />
            <FieldError>{form.formState.errors.last_name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t("phone_login")}</FieldLabel>
            <Input
              value={(data?.user as { phone?: string })?.phone ?? ""}
              disabled
              className="text-muted-foreground"
            />
            <p className="text-muted-foreground text-xs">{t("phone_login_hint")}</p>
          </Field>

          <Field>
            <FieldLabel>{t("phone_secondary")}</FieldLabel>
            <Input {...form.register("phone_secondary")} placeholder={t("phone_placeholder")} />
          </Field>

          <Field>
            <FieldLabel>{t("date_of_birth")}</FieldLabel>
            <Input {...form.register("date_of_birth")} type="date" />
          </Field>

          <Field>
            <FieldLabel>{t("gender")}</FieldLabel>
            <Select
              value={form.watch("gender") ?? ""}
              onValueChange={(v) => form.setValue("gender", v as ProfileFormValues["gender"])}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("not_specified")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("male")}</SelectItem>
                <SelectItem value="female">{t("female")}</SelectItem>
                <SelectItem value="other">{t("other")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("professional_info_title")}</CardTitle>
          <CardDescription>{t("professional_info_description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel>{t("company")}</FieldLabel>
            <Input {...form.register("company")} />
          </Field>

          <Field>
            <FieldLabel>{t("vat_number")}</FieldLabel>
            <Input {...form.register("vat_number")} />
          </Field>

          <Field>
            <FieldLabel>{t("tax_id")}</FieldLabel>
            <Input {...form.register("tax_id")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("bio_title")}</CardTitle>
          <CardDescription>{t("bio_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea {...form.register("bio")} rows={3} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("preferences_title")}</CardTitle>
          <CardDescription>{t("preferences_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>{t("preferred_language")}</FieldLabel>
              <Select
                value={form.watch("preferred_language")}
                onValueChange={(v) =>
                  form.setValue("preferred_language", v as ProfileFormValues["preferred_language"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">{t("french")}</SelectItem>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="ar">{t("arabic")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>{t("preferred_currency")}</FieldLabel>
              <Input {...form.register("preferred_currency")} />
            </Field>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("newsletter")}</p>
                <p className="text-muted-foreground text-xs">{t("newsletter_description")}</p>
              </div>
              <Switch
                checked={form.watch("newsletter_opt_in") ?? false}
                onCheckedChange={(v) => form.setValue("newsletter_opt_in", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("marketing")}</p>
                <p className="text-muted-foreground text-xs">{t("marketing_description")}</p>
              </div>
              <Switch
                checked={form.watch("marketing_opt_in") ?? false}
                onCheckedChange={(v) => form.setValue("marketing_opt_in", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("sms_notifications")}</p>
                <p className="text-muted-foreground text-xs">
                  {t("sms_notifications_description")}
                </p>
              </div>
              <Switch
                checked={form.watch("sms_notifications") ?? false}
                onCheckedChange={(v) => form.setValue("sms_notifications", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("push_notifications")}</p>
                <p className="text-muted-foreground text-xs">
                  {t("push_notifications_description")}
                </p>
              </div>
              <Switch
                checked={form.watch("push_notifications") ?? true}
                onCheckedChange={(v) => form.setValue("push_notifications", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={is_saving || !form.formState.isDirty}>
          {is_saving ? t("saving") : t("save_changes")}
        </Button>
      </div>
    </form>
  );
}
