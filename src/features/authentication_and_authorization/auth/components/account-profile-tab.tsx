"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

const profile_form_schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(255),
});

type ProfileFormValues = z.infer<typeof profile_form_schema>;

export function AccountProfileTab() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.auth.me.useQuery();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profile_form_schema),
    values: { name: data?.user.name ?? "" },
  });

  const update = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  async function on_submit(values: ProfileFormValues) {
    await update.mutateAsync(values);
  }

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Modifiez les informations de votre profil</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Nom complet</FieldLabel>
                <Input {...form.register("name")} />
                {form.formState.errors.name && (
                  <FieldError>{form.formState.errors.name.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={data?.user.email ?? ""} disabled className="text-muted-foreground" />
                <p className="text-muted-foreground text-xs">L&apos;email ne peut pas être modifié.</p>
              </Field>

              <Field>
                <FieldLabel>Rôles</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {data?.roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel>Membre depuis</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {formatDate(data?.user.createdAt)}
                </p>
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={update.isPending || !form.formState.isDirty}>
              {update.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
