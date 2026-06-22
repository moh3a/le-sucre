"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import {
  add_to_blacklist_schema,
  type AddToBlacklistInput,
} from "@/features/ip_blacklist/validators/blacklist.validator";

interface BlacklistAddDialogProps {
  open: boolean;
  on_open_change: (open: boolean) => void;
  on_added: () => void;
}

export function BlacklistAddDialog({ open, on_open_change, on_added }: BlacklistAddDialogProps) {
  const [error, set_error] = useState<string | null>(null);
  const add_mutation = trpc.blacklist.add.useMutation({
    onSuccess: () => {
      form.reset();
      set_error(null);
      on_added();
    },
    onError: (err) => set_error(err.message),
  });

  const form = useForm<AddToBlacklistInput>({
    resolver: zodResolver(add_to_blacklist_schema),
    defaultValues: {
      ip_address: "",
      reason: "",
      reason_fr: "",
      reason_ar: "",
      expires_at: null,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    set_error(null);
    add_mutation.mutate(data);
  });

  return (
    <QueryGuard mutation={add_mutation}>
    <Dialog open={open} onOpenChange={on_open_change}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquer une adresse IP</DialogTitle>
          <DialogDescription>
            Ajoutez une adresse IP à la liste noire. Elle sera immédiatement bloquée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip_address">Adresse IP *</Label>
            <Input id="ip_address" placeholder="192.168.1.1" {...form.register("ip_address")} />
            {form.formState.errors.ip_address && (
              <p className="text-destructive text-sm">{form.formState.errors.ip_address.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason_fr">Motif (français)</Label>
            <Textarea
              id="reason_fr"
              placeholder="Tentatives de connexion suspectes"
              {...form.register("reason_fr")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Motif (anglais)</Label>
            <Textarea
              id="reason"
              placeholder="Suspicious login attempts"
              {...form.register("reason")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason_ar">Motif (arabe)</Label>
            <Textarea
              id="reason_ar"
              placeholder="محاولات تسجيل دخول مشبوهة"
              {...form.register("reason_ar")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expires_at">Expiration (optionnelle)</Label>
            <Input id="expires_at" type="datetime-local" {...form.register("expires_at")} />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => on_open_change(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={add_mutation.isPending}>
              {add_mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Bloquer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
