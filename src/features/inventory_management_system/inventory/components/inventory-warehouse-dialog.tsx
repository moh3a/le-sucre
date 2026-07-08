"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useEffect, useEffectEvent } from "react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WarehouseRow } from "../../warehouses/types";

const warehouse_form_schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9_-]+$/, "Lettres minuscules, chiffres, tirets et underscores uniquement"),
  location: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable(),
});

type WarehouseForm = z.infer<typeof warehouse_form_schema>;

type Props = {
  warehouse?: WarehouseRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InventoryWarehouseDialog({ warehouse, open, onOpenChange }: Props) {
  const t = useTranslations("warehouses");
  const utils = trpc.useUtils();
  const is_editing = !!warehouse;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseForm>({
    resolver: zodResolver(warehouse_form_schema),
    defaultValues: {
      name: warehouse?.name ?? "",
      slug: warehouse?.slug ?? "",
      location: warehouse?.location ?? "",
      phone: warehouse?.phone ?? "",
      email: warehouse?.email ?? "",
    },
  });

  const syncForm = useEffectEvent(() => {
    reset({
      name: warehouse?.name ?? "",
      slug: warehouse?.slug ?? "",
      location: warehouse?.location ?? "",
      phone: warehouse?.phone ?? "",
      email: warehouse?.email ?? "",
    });
  });

  useEffect(() => {
    if (open) syncForm();
  }, [open]);

  const create = trpc.warehouses.create.useMutation({
    onSuccess: async () => {
      toast.success(t("created"));
      await utils.warehouses.list.invalidate();
      await utils.warehouses.listAllActive.invalidate();
      await utils.inventory.adminStats.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.warehouses.update.useMutation({
    onSuccess: async () => {
      toast.success(t("updated"));
      await utils.warehouses.list.invalidate();
      await utils.warehouses.listAllActive.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = async (data: WarehouseForm) => {
    if (is_editing) {
      update.mutate({ id: warehouse!.id, ...data });
    } else {
      create.mutate(data);
    }
  };

  return (
    <QueryGuard mutation={create}>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{is_editing ? t("edit_warehouse") : t("new_warehouse")}</DialogTitle>
            <DialogDescription>
              {is_editing ? t("edit_description") : t("new_description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" {...register("name")} placeholder={t("name_placeholder")} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">{t("slug")}</Label>
              <Input id="slug" {...register("slug")} placeholder={t("slug_placeholder")} />
              {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">{t("location")}</Label>
              <Input id="location" {...register("location")} placeholder={t("location_placeholder")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input id="phone" {...register("phone")} placeholder={t("phone_placeholder")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" {...register("email")} placeholder={t("email_placeholder")} />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending || isSubmitting}>
              {is_editing ? t("save_warehouse") : t("create_warehouse")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
