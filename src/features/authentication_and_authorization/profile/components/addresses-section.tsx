"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useUndoAction } from "@/hooks/use-undo-action";

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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { create_address_schema } from "@/features/authentication_and_authorization/profile/validators/profile.validators";
import type { UserAddress } from "@/features/authentication_and_authorization/profile/types";
import type { CreateAddressInput } from "@/features/authentication_and_authorization/profile/validators/profile.validators";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddressFormCard({
  address,
  onSaved,
  onDeleted,
}: {
  address?: UserAddress;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const t = useTranslations("addresses");
  const [open, setOpen] = useState(false);
  const { execute_with_undo } = useUndoAction();
  const createAddress = trpc.profile.createAddress.useMutation({
    onSuccess: () => {
      toast.success(t("address_added"));
      onSaved();
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });
  const updateAddress = trpc.profile.updateAddress.useMutation({
    onSuccess: () => {
      toast.success(t("address_updated"));
      onSaved();
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteAddress = trpc.profile.deleteAddress.useMutation({
    onSuccess: () => {
      setOpen(false);
      execute_with_undo({
        description: address?.label ?? address?.address_line_1 ?? "",
        execute: () => {
          onDeleted();
        },
        rollback: () => {
          onDeleted();
        },
        undoTimeoutMs: 8_000,
      });
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<CreateAddressInput>({
    resolver: zodResolver(create_address_schema),
    values: address
      ? {
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
        }
      : {
          country: "Algeria" as const,
          type: "both" as const,
          is_default: false,
          address_line_1: "",
          city: "",
        },
  });

  const is_saving = createAddress.isPending || updateAddress.isPending || deleteAddress.isPending;

  async function onSubmit(values: CreateAddressInput) {
    if (address) {
      await updateAddress.mutateAsync({ id: address.id, ...values });
    } else {
      await createAddress.mutateAsync(values);
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        {address ? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 size-3" />
            {t("edit")}
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 size-4" />
            {t("add_address")}
          </Button>
        )}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="md:min-w-[75vw] md:min-h-[75vh]">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {address ? t("edit_address_title") : t("new_address_title")}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {address ? t("edit_address_description") : t("new_address_description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ScrollArea className="md:max-h-full">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 px-0">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>{t("label")}</FieldLabel>
                  <Input {...form.register("label")} placeholder={t("label_placeholder")} />
                </Field>

                <Field>
                  <FieldLabel>{t("type")}</FieldLabel>
                  <Select
                    value={form.watch("type")}
                    onValueChange={(v) =>
                      form.setValue("type", v as "shipping" | "billing" | "both")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">{t("delivery_billing")}</SelectItem>
                      <SelectItem value="shipping">{t("delivery")}</SelectItem>
                      <SelectItem value="billing">{t("billing")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>{t("first_name")}</FieldLabel>
                  <Input {...form.register("first_name")} />
                </Field>

                <Field>
                  <FieldLabel>{t("last_name")}</FieldLabel>
                  <Input {...form.register("last_name")} />
                </Field>

                <Field>
                  <FieldLabel>{t("company")}</FieldLabel>
                  <Input {...form.register("company")} />
                </Field>

                <Field>
                  <FieldLabel>{t("phone")}</FieldLabel>
                  <Input {...form.register("phone")} placeholder={t("phone_placeholder")} />
                </Field>
              </div>

              <Field>
                <FieldLabel>{t("address_line_1")}</FieldLabel>
                <Input {...form.register("address_line_1")} />
                <FieldError>{form.formState.errors.address_line_1?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>{t("address_line_2")}</FieldLabel>
                <Input {...form.register("address_line_2")} />
              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Field className="md:col-span-2">
                  <FieldLabel>{t("city")}</FieldLabel>
                  <Input {...form.register("city")} />
                  <FieldError>{form.formState.errors.city?.message}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>{t("state")}</FieldLabel>
                  <Input {...form.register("state")} />
                </Field>

                <Field>
                  <FieldLabel>{t("postal_code")}</FieldLabel>
                  <Input {...form.register("postal_code")} />
                </Field>
              </div>

              <Field>
                <FieldLabel>{t("country")}</FieldLabel>
                <Input {...form.register("country")} />
              </Field>

              <Field>
                <FieldLabel>{t("delivery_instructions")}</FieldLabel>
                <Textarea {...form.register("instructions")} rows={2} />
              </Field>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.watch("is_default")}
                  onChange={(e) => form.setValue("is_default", e.target.checked)}
                  className="size-4"
                />
                {t("default_address")}
              </label>
            </div>

            <ResponsiveDialogFooter className="mt-6">
              <div className="flex w-full items-center justify-between gap-2">
                {address && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteAddress.mutate({ address_id: address.id })}
                    disabled={is_saving}
                  >
                    <Trash2 className="mr-2 size-4" />
                    {t("delete")}
                  </Button>
                )}
                <div className={address ? "ml-auto" : "w-full"}>
                  <Button
                    type="submit"
                    disabled={is_saving || !form.formState.isDirty}
                    className={address ? "" : "w-full"}
                  >
                    {is_saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {is_saving ? t("saving") : address ? t("update") : t("add")}
                  </Button>
                </div>
              </div>
            </ResponsiveDialogFooter>
          </form>
        </ScrollArea>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function AddressesSection() {
  const t = useTranslations("addresses");
  const { data, isLoading, error } = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();

  const addresses = data?.addresses ?? [];

  const refresh = () => {
    utils.profile.get.invalidate();
  };

  const setDefault = trpc.profile.setDefaultAddress.useMutation({
    onSuccess: () => {
      refresh();
      toast.success(t("default_address_updated"));
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error)
    return (
      <p className="text-destructive">
        {t("error_prefix")}: {error.message}
      </p>
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("my_addresses")}</CardTitle>
          <CardDescription>
            {addresses.length > 0
              ? t("addresses_count", { count: addresses.length })
              : t("no_addresses")}
          </CardDescription>
        </div>
        {addresses.length < 10 && <AddressFormCard onSaved={refresh} onDeleted={refresh} />}
      </CardHeader>

      <CardContent className="space-y-3">
        {addresses.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-sm">
            <MapPin className="size-8" />
            <p>{t("no_addresses_yet")}</p>
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
                  {addr.type === "both"
                    ? t("delivery_billing")
                    : addr.type === "shipping"
                      ? t("delivery")
                      : t("billing")}
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
                    {t("set_default")}
                  </Button>
                )}
                <AddressFormCard
                  address={addr as UserAddress}
                  onSaved={refresh}
                  onDeleted={refresh}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
