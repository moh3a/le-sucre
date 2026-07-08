"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Star } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function CreateReviewDialog() {
  const t = useTranslations("reviews");
  const [open, setOpen] = React.useState(false);
  const [product_id, setProductId] = React.useState("");
  const [rating, setRating] = React.useState("5");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");

  const utils = trpc.useUtils();

  const create = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success(t("admin_review_created"));
      setOpen(false);
      setProductId("");
      setRating("5");
      setTitle("");
      setBody("");
      void utils.reviews.adminList.invalidate();
      void utils.reviews.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      product_id,
      rating: Number(rating),
      title: title || undefined,
      body,
      locale: "fr",
    });
  }

  return (
    <QueryGuard mutation={create}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus />
            {t("admin_new_review")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin_create_title")}</DialogTitle>
            <DialogDescription>{t("admin_create_description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handle_submit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("admin_product_id")}</Label>
              <Input value={product_id} onChange={(e) => setProductId(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t("admin_rating")}</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {t("admin_stars", { count: n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("admin_title_optional")}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("admin_comment")}</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} required />
            </div>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              <Star />
              {t("admin_publish")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}
