"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const password_form_schema = z
  .object({
    current_password: z.string().min(1, "Mot de passe actuel requis"),
    new_password: z.string().min(8, "Minimum 8 caractères").max(128),
    confirm_password: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type PasswordFormValues = z.infer<typeof password_form_schema>;

export function AccountSecurityTab() {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
          <CardDescription>
            Utilisez un mot de passe fort et unique pour protéger votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Mot de passe actuel</FieldLabel>
                <Input type="password" {...form.register("current_password")} />
                {form.formState.errors.current_password && (
                  <FieldError>{form.formState.errors.current_password.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>Nouveau mot de passe</FieldLabel>
                <Input type="password" {...form.register("new_password")} />
                {form.formState.errors.new_password && (
                  <FieldError>{form.formState.errors.new_password.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>Confirmer le mot de passe</FieldLabel>
                <Input type="password" {...form.register("confirm_password")} />
                {form.formState.errors.confirm_password && (
                  <FieldError>{form.formState.errors.confirm_password.message}</FieldError>
                )}
              </Field>
            </FieldGroup>

            {change.isSuccess && (
              <p className="text-sm text-green-600">Mot de passe mis à jour avec succès.</p>
            )}

            {change.isError && (
              <p className="text-sm text-destructive">
                {change.error.message ?? "Une erreur est survenue."}
              </p>
            )}

            <Button type="submit" disabled={change.isPending}>
              {change.isPending ? "Mise à jour…" : "Mettre à jour"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
