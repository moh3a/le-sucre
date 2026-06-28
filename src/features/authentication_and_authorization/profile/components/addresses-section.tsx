"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, MapPin } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { create_address_schema } from "@/features/authentication_and_authorization/profile/validators/profile.validators";
import type { UserAddress } from "@/features/authentication_and_authorization/profile/types";

function AddressFormCard({
  address,
  onSaved,
  onDeleted,
}: {
  address?: UserAddress;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const createAddress = trpc.profile.createAddress.useMutation({
    onSuccess: () => { toast.success("Adresse ajoutée"); onSaved(); setOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const updateAddress = trpc.profile.updateAddress.useMutation({
    onSuccess: () => { toast.success("Adresse mise à jour"); onSaved(); setOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteAddress = trpc.profile.deleteAddress.useMutation({
    onSuccess: () => { toast.success("Adresse supprimée"); onDeleted(); setOpen(false); },
    onError: (err) => toast.error(err.message),
  });
  const setDefault = trpc.profile.setDefaultAddress.useMutation({
    onSuccess: () => { onSaved(); toast.success("Adresse par défaut mise à jour"); },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm({
    resolver: zodResolver(create_address_schema) as any,
    values: address ? {
      label: address.label ?? "",
      type: (address.type ?? "both") as "shipping" | "billing" | "both",
      first_name: address.first_name ?? "",
      last_name: address.last_name ?? "",
      company: address.company ?? "",
      address_line_1: address.address_line_1 ?? "",
      address_line_2: address.address_line_2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postal_code: address.postal_code ?? "",
      country: address.country ?? "Algeria",
      phone: address.phone ?? "",
      instructions: address.instructions ?? "",
      is_default: address.is_default,
      latitude: address.latitude ? Number(address.latitude) : undefined,
      longitude: address.longitude ? Number(address.longitude) : undefined,
    } : {
      country: "Algeria" as const,
      type: "both" as const,
      is_default: false,
      address_line_1: "",
      city: "",
    },
  });

  const is_saving = createAddress.isPending || updateAddress.isPending || deleteAddress.isPending;

  async function onSubmit(values: Record<string, unknown>) {
    if (address) {
      await updateAddress.mutateAsync({ id: address.id, ...values } as any);
    } else {
      await createAddress.mutateAsync(values as any);
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {address ? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 size-3" />
            Modifier
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 size-4" />
            Ajouter une adresse
          </Button>
        )}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {address ? "Modifier l'adresse" : "Nouvelle adresse"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {address ? "Modifiez les détails de votre adresse" : "Ajoutez une nouvelle adresse"}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="max-h-[60vh] space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Libellé</FieldLabel>
              <Input {...form.register("label")} placeholder="Domicile, Bureau..." />
            </Field>

            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as "shipping" | "billing" | "both")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Livraison et facturation</SelectItem>
                  <SelectItem value="shipping">Livraison</SelectItem>
                  <SelectItem value="billing">Facturation</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Prénom</FieldLabel>
              <Input {...form.register("first_name")} />
            </Field>

            <Field>
              <FieldLabel>Nom</FieldLabel>
              <Input {...form.register("last_name")} />
            </Field>

            <Field>
              <FieldLabel>Entreprise</FieldLabel>
              <Input {...form.register("company")} />
            </Field>

            <Field>
              <FieldLabel>Téléphone</FieldLabel>
              <Input {...form.register("phone")} placeholder="+213 5XX XX XX XX" />
            </Field>
          </div>

          <Field>
            <FieldLabel>Adresse ligne 1</FieldLabel>
            <Input {...form.register("address_line_1")} />
            <FieldError>{form.formState.errors.address_line_1?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Adresse ligne 2</FieldLabel>
            <Input {...form.register("address_line_2")} />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Field className="md:col-span-2">
              <FieldLabel>Ville</FieldLabel>
              <Input {...form.register("city")} />
              <FieldError>{form.formState.errors.city?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Wilaya</FieldLabel>
              <Input {...form.register("state")} />
            </Field>

            <Field>
              <FieldLabel>Code postal</FieldLabel>
              <Input {...form.register("postal_code")} />
            </Field>
          </div>

          <Field>
            <FieldLabel>Pays</FieldLabel>
            <Input {...form.register("country")} />
          </Field>

          <Field>
            <FieldLabel>Instructions de livraison</FieldLabel>
            <Textarea {...form.register("instructions")} rows={2} />
          </Field>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.watch("is_default")}
                onChange={(e) => form.setValue("is_default", e.target.checked)}
                className="size-4"
              />
              Adresse par défaut
            </label>
          </div>

          <div className="flex justify-between">
            {address && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteAddress.mutate({ address_id: address.id })}
                disabled={is_saving}
              >
                <Trash2 className="mr-2 size-4" />
                Supprimer
              </Button>
            )}
            <Button type="submit" disabled={is_saving || !form.formState.isDirty} className="ml-auto">
              {is_saving ? "Enregistrement…" : address ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function AddressesSection() {
  const { data, isLoading, error } = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  const addresses = data?.addresses ?? [];

  const refresh = () => { utils.profile.get.invalidate(); };

  const setDefault = trpc.profile.setDefaultAddress.useMutation({
    onSuccess: () => { refresh(); toast.success("Adresse par défaut mise à jour"); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) return <p className="text-destructive">Erreur: {error.message}</p>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mes adresses</CardTitle>
          <CardDescription>
            {addresses.length > 0
              ? `${addresses.length} adresse${addresses.length > 1 ? "s" : ""} enregistrée${addresses.length > 1 ? "s" : ""}`
              : "Aucune adresse enregistrée"}
          </CardDescription>
        </div>
        {addresses.length < 10 && <AddressFormCard onSaved={refresh} onDeleted={refresh} />}
      </CardHeader>

      <CardContent className="space-y-3">
        {addresses.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-sm">
            <MapPin className="size-8" />
            <p>Aucune adresse pour le moment</p>
          </div>
        )}

        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="relative flex items-start justify-between rounded-lg border p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {addr.is_default && <Star className="size-4 fill-yellow-400 text-yellow-400" />}
                {addr.label && <span className="font-medium">{addr.label}</span>}
                <Badge variant="outline" className="text-xs">
                  {addr.type === "both" ? "Livraison & Facturation" : addr.type === "shipping" ? "Livraison" : "Facturation"}
                </Badge>
              </div>
              <p className="text-sm">
                {[addr.first_name, addr.last_name].filter(Boolean).join(" ")}
                {addr.company && ` — ${addr.company}`}
              </p>
              <p className="text-muted-foreground text-sm">
                {addr.address_line_1}
                {addr.address_line_2 && `, ${addr.address_line_2}`}
              </p>
              <p className="text-muted-foreground text-sm">
                {[addr.postal_code, addr.city, addr.state].filter(Boolean).join(" ")}
                {addr.country !== "Algeria" && `, ${addr.country}`}
              </p>
              {addr.phone && <p className="text-muted-foreground text-xs">{addr.phone}</p>}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-1">
                {!addr.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefault.mutate({ address_id: addr.id, type: "shipping" })}
                  >
                    Définir par défaut
                  </Button>
                )}
                <AddressFormCard address={addr as UserAddress} onSaved={refresh} onDeleted={refresh} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
