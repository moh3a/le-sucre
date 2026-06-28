"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function get_password_form_schema(t: ReturnType<typeof useTranslations<"profile">>) {
  return z
    .object({
      current_password: z.string().min(1, t("current_password_required")),
      new_password: z.string().min(8, t("password_min_length")).max(128),
      confirm_password: z.string().min(1, t("confirmation_required")),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t("passwords_dont_match"),
      path: ["confirm_password"],
    });
}

type PasswordFormValues = z.infer<ReturnType<typeof get_password_form_schema>>;

export function AccountSecurityTab() {
  const t = useTranslations("profile");

  const password_form_schema = useMemo(() => get_password_form_schema(t), [t]);
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(password_form_schema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const change = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      form.reset();
    },
  });

  async function on_submit(values: PasswordFormValues) {
    await change.mutateAsync({
      current_password: values.current_password,
      new_password: values.new_password,
    });
  }

  return (
    <QueryGuard mutation={{ isPending: change.isPending, error: change.error }}>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("change_password_title")}</CardTitle>
          <CardDescription>
            {t("change_password_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>{t("current_password")}</FieldLabel>
                <Input type="password" {...form.register("current_password")} />
                {form.formState.errors.current_password && (
                  <FieldError>{form.formState.errors.current_password.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>{t("new_password")}</FieldLabel>
                <Input type="password" {...form.register("new_password")} />
                {form.formState.errors.new_password && (
                  <FieldError>{form.formState.errors.new_password.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>{t("confirm_password")}</FieldLabel>
                <Input type="password" {...form.register("confirm_password")} />
                {form.formState.errors.confirm_password && (
                  <FieldError>{form.formState.errors.confirm_password.message}</FieldError>
                )}
              </Field>
            </FieldGroup>

            {change.isSuccess && (
              <p className="text-sm text-green-600">{t("password_updated_success")}</p>
            )}

            {change.isError && (
              <p className="text-sm text-destructive">
                {change.error.message ?? t("error_occurred")}
              </p>
            )}

            <Button type="submit" disabled={change.isPending}>
              {change.isPending ? t("updating") : t("update")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </QueryGuard>
  );
}
