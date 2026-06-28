"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { ROLE_LABELS } from "@/features/authentication_and_authorization/authorization/constants/roles";

const ROLE_OPTIONS = ["admin", "moderator", "operator", "delivery_person", "customer"] as const;

export function CreateUserDialog() {
  const t = useTranslations("users");
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("customer");

  const create_user = trpc.adminAuth.createUser.useMutation({
    onSuccess: () => {
      toast.success(t("user_created"));
      setOpen(false);
      setName("");
      setPhone("");
      setPassword("");
      setRole("customer");
      void utils.adminAuth.listUsers.invalidate();
      void utils.adminAuth.getStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const on_submit = (e: React.FormEvent) => {
    e.preventDefault();
    create_user.mutate({
      name,
      phone,
      password,
      role: role as (typeof ROLE_OPTIONS)[number],
    });
  };

  return (
    <QueryGuard mutation={create_user}>
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button>
          <Plus />
          {t("create_user_button")}
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t("create_user_title")}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {t("create_user_description")}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={on_submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">{t("name")}</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("full_name_placeholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-phone">{t("phone")}</Label>
            <Input
              id="create-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phone_placeholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-password">{t("password")}</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password_min_placeholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-role">{t("role")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="create-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={create_user.isPending}
          >
            {create_user.isPending ? t("creating") : t("create_user_submit")}
          </Button>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
    </QueryGuard>
  );
}
