"use client";

import z from "zod";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login_dto } from "@/features/authentication_and_authorization/auth/models/auth.dto";
import { authClient } from "@/lib/auth/client";

type LoginFormValues = z.infer<typeof login_dto>;

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const t = useTranslations("auth");

  const router = useRouter();
  const search_params = useSearchParams();
  const [root_error, set_root_error] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(login_dto),
    defaultValues: { email: "", password: "" },
  });

  const is_submitting = form.formState.isSubmitting;

  async function on_submit(values: LoginFormValues) {
    set_root_error(null);
    const result = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (result.error) {
      console.log(result.error);
      set_root_error(t("error_invalid"));
      return;
    }
    const session = await authClient.getSession();
    const user_id = session.data?.user?.id;
    if (!user_id) {
      set_root_error(t("error_invalid"));
      return;
    }
    const me_res = await fetch("/api/admin/me", { credentials: "include" });
    if (!me_res.ok) {
      await authClient.signOut();
      set_root_error(t("error_forbidden"));
      return;
    }
    const next = search_params.get("next") ?? "/console";
    router.push(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(on_submit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground text-sm text-balance">{t("subtitle")}</p>
        </div>

        {root_error && <FieldError role="alert">{root_error}</FieldError>}

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">{t("email")}</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="email"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">{t("password")}</FieldLabel>
              <Input
                {...field}
                id="login-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Button type="submit" className="w-full" disabled={is_submitting}>
          {is_submitting ? "…" : t("submit")}
        </Button>
        <FieldSeparator></FieldSeparator>

        <FieldDescription className="text-muted-foreground text-center text-xs">
          Accès réservé au personnel autorisé.
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
