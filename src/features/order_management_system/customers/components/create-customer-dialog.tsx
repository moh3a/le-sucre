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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

const ROLES = ["customer", "admin", "moderator", "operator", "delivery_person"] as const;

export function CreateCustomerDialog() {
  const t = useTranslations("customers");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("customer");

  const utils = trpc.useUtils();

  const create = trpc.adminAuth.createUser.useMutation({
    onSuccess: () => {
      toast.success(t("customer_created"));
      setOpen(false);
      setName("");
      setPhone("");
      setPassword("");
      setRole("customer");
      void utils.customers.adminList.invalidate();
      void utils.customers.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({ name, phone, password, role: role as "admin" | "moderator" | "operator" | "delivery_person" | "customer" });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create_customer_title")}</DialogTitle>
          <DialogDescription>
            {t("create_customer_desc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle_submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("phone")}</Label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("password")}</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>{t("role")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{t(`role_${r}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
