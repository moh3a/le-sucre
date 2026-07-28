"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function CreateCustomerDialog() {
  const t = useTranslations("customers");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address_line_1, setAddressLine1] = React.useState("");
  const [address_line_2, setAddressLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [postal_code, setPostalCode] = React.useState("");

  const utils = trpc.useUtils();

  const create = trpc.adminAuth.createUser.useMutation({
    onSuccess: () => {
      toast.success(t("customer_created"));
      setOpen(false);
      reset();
      void utils.customers.adminList.invalidate();
      void utils.customers.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function reset() {
    setName("");
    setPhone("");
    setPassword("");
    setEmail("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setPostalCode("");
  }

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      name,
      phone,
      password,
      role: "customer",
      email: email || undefined,
      address_line_1: address_line_1 || undefined,
      address_line_2: address_line_2 || undefined,
      city: city || undefined,
      state: state || undefined,
      postal_code: postal_code || undefined,
    });
  }

  return (
    <QueryGuard mutation={create}>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("new_customer_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create_customer_title")}</DialogTitle>
          <DialogDescription>
            {t("create_customer_desc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("name")} *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("phone")} *</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t("password")} *</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("role")}</Label>
            <Input value={t("role_customer")} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t("email_optional")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email_placeholder")} />
          </div>

          <div className="space-y-2">
            <Label>{t("address_section")}</Label>
            <div className="space-y-3 rounded-lg border p-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t("address_line_1")}</Label>
                <Input value={address_line_1} onChange={(e) => setAddressLine1(e.target.value)} placeholder={t("address_line_1_placeholder")} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t("address_line_2")}</Label>
                <Input value={address_line_2} onChange={(e) => setAddressLine2(e.target.value)} placeholder={t("address_line_2_placeholder")} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t("city")}</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t("state")}</Label>
                  <Input value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t("postal_code")}</Label>
                  <Input value={postal_code} onChange={(e) => setPostalCode(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={create.isPending}>
            <UserPlus />
            {t("create_customer_button")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
    </QueryGuard>
  );
}
