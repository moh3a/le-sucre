"use client";

import z from "zod";
import { useMemo, useState } from "react";
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
import { authClient } from "@/lib/auth/client";

const phone_regex = /^\+?[\d\s\-()]{7,20}$/;

type LoginFormValues = z.infer<ReturnType<typeof get_login_form_schema>>;

/** Resolves phone → auto-generated email for Better Auth client auth. */
async function resolve_phone_to_email(phone: string): Promise<string | null> {
  try {
    const res = await fetch("/api/phone-auth/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.email ?? null;
  } catch {
    return null;
  }
}

function get_login_form_schema(t: ReturnType<typeof useTranslations<"auth">>) {
  return z.object({
    phone: z.string().regex(phone_regex, t("invalid_phone")),
    password: z.string().min(8, t("password_too_short")).max(128),
  });
}

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const t = useTranslations("auth");
  const login_form_schema = useMemo(() => get_login_form_schema(t), [t]);

  const router = useRouter();
  const search_params = useSearchParams();
  const [root_error, set_root_error] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(login_form_schema),
    defaultValues: { phone: "", password: "" },
  });

  const is_submitting = form.formState.isSubmitting;

  async function on_submit(values: LoginFormValues) {
    set_root_error(null);

    // Resolve phone to auto-generated email
    const email = await resolve_phone_to_email(values.phone);
    if (!email) {
      set_root_error(t("error_invalid"));
      return;
    }

    const result = await authClient.signIn.email({
      email,
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
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-phone">{t("phone")}</FieldLabel>
              <Input
                {...field}
                id="login-phone"
                type="tel"
                autoComplete="tel"
                placeholder={t("phone_placeholder")}
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
          {is_submitting ? t("loading_ellipsis") : t("submit")}
        </Button>
        <FieldSeparator></FieldSeparator>

        <FieldDescription className="text-muted-foreground text-center text-xs">
          {t("description")}
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
