"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";

import { trpc } from "@/components/providers/app-providers";
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
import { Switch } from "@/components/ui/switch";
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

  useEffect(() => {
    if (open) {
      reset({
        name: warehouse?.name ?? "",
        slug: warehouse?.slug ?? "",
        location: warehouse?.location ?? "",
        phone: warehouse?.phone ?? "",
        email: warehouse?.email ?? "",
      });
    }
  }, [open, warehouse, reset]);

  const create = trpc.warehouses.create.useMutation({
    onSuccess: async () => {
      toast.success("Entrepôt créé avec succès");
      await utils.warehouses.list.invalidate();
      await utils.warehouses.listAllActive.invalidate();
      await utils.inventory.adminStats.invalidate();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.warehouses.update.useMutation({
    onSuccess: async () => {
      toast.success("Entrepôt mis à jour");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{is_editing ? "Modifier l'entrepôt" : "Nouvel entrepôt"}</DialogTitle>
            <DialogDescription>
              {is_editing ? "Modifiez les informations de l'entrepôt" : "Créez un nouvel entrepôt"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom *</Label>
              <Input id="name" {...register("name")} placeholder="Entrepôt principal" />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" {...register("slug")} placeholder="entrepot-principal" />
              {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Adresse</Label>
              <Input id="location" {...register("location")} placeholder="Alger, Algérie" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" {...register("phone")} placeholder="+213 555 00 00 00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} placeholder="contact@entrepot.dz" />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={create.isPending || update.isPending || isSubmitting}>
              {is_editing ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
