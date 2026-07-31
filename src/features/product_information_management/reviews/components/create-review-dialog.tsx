"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { ProductCombobox } from "@/features/product_information_management/products/components/product-combobox";
import { CustomerCombobox } from "@/features/order_management_system/customers/components/customer-combobox";

const form_schema = z.object({
  product_id: z.string().min(1),
  user_id: z.string().min(1),
  rating: z.string(),
  title: z.string().max(255).optional(),
  body: z.string().min(20).max(5000),
});

type FormValues = z.infer<typeof form_schema>;

export function CreateReviewDialog() {
  const t = useTranslations("reviews");
  const [open, setOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      product_id: "",
      user_id: "",
      rating: "5",
      title: "",
      body: "",
    },
  });

  const product_id = watch("product_id");
  const user_id = watch("user_id");
  const rating = watch("rating");

  const utils = trpc.useUtils();

  const create = trpc.reviews.adminCreate.useMutation({
    onSuccess: () => {
      toast.success(t("admin_review_created"));
      setOpen(false);
      reset();
      void utils.reviews.adminList.invalidate();
      void utils.reviews.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function onSubmit(values: FormValues) {
    create.mutate({
      product_id: values.product_id,
      user_id: values.user_id,
      rating: Number(values.rating),
      title: values.title || undefined,
      body: values.body,
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("admin_product")}</Label>
              <input type="hidden" {...register("product_id")} />
              <ProductCombobox
                value={product_id}
                onValueChange={(v) => setValue("product_id", v ?? "", { shouldValidate: true })}
              />
              {errors.product_id && (
                <p className="text-xs text-red-500">{errors.product_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("admin_customer")}</Label>
              <input type="hidden" {...register("user_id")} />
              <CustomerCombobox
                value={user_id}
                onValueChange={(v) => setValue("user_id", v ?? "", { shouldValidate: true })}
              />
              {errors.user_id && (
                <p className="text-xs text-red-500">{errors.user_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("admin_rating")}</Label>
              <Select
                value={rating}
                onValueChange={(v) => setValue("rating", v, { shouldValidate: true })}
              >
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
              <Input {...register("title")} />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("admin_comment")}</Label>
              <Textarea {...register("body")} rows={4} />
              {errors.body && (
                <p className="text-xs text-red-500">{errors.body.message}</p>
              )}
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
