"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  body: z.string().min(20, "L'avis doit contenir au moins 20 caractères").max(5000),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductReviewFormProps {
  product_id: string;
  onSuccess?: () => void;
}

export function ProductReviewForm({ product_id, onSuccess }: ProductReviewFormProps) {
  const t = useTranslations("reviews");
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 5,
      title: "",
      body: "",
    },
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success(t("submitted_for_moderation"));
      reset();
      setRating(5);
      utils.reviews.summaryByProduct.invalidate({ product_id });
      utils.reviews.listByProduct.invalidate({ product_id });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || t("submit_error"));
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      product_id,
      rating,
      title: values.title || undefined,
      body: values.body,
      locale: "fr",
    });
  };

  return (
    <QueryGuard mutation={createMutation}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="font-moya border-primary-foreground/15 bg-background space-y-6 rounded-2xl border p-6 shadow-sm"
      >
        <h3 className="font-orla text-primary-foreground text-lg">{t("heading")}</h3>

        {/* Star Picker */}
        <div className="space-y-2">
          <Label className="text-secondary text-sm font-semibold">{t("overall_rating")}</Label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="text-yellow-500 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`size-8 ${
                    star <= (hoverRating ?? rating) ? "fill-yellow-500" : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-secondary text-sm font-semibold">
            {t("review_title_optional")}
          </Label>
          <Input
            id="title"
            placeholder={t("review_title_placeholder")}
            className="text-secondary border-primary-foreground/30 focus-visible:ring-crimson-violet"
            {...register("title")}
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Body */}
        <div className="space-y-2">
          <Label htmlFor="body" className="text-secondary text-sm font-semibold">
            {t("your_comment")}
          </Label>
          <Textarea
            id="body"
            placeholder={t("comment_placeholder")}
            className="text-secondary border-primary-foreground/30 focus-visible:ring-crimson-violet min-h-32"
            {...register("body")}
          />
          {errors.body && <p className="text-xs text-red-500">{errors.body.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-crimson-violet hover:bg-crimson-violet/90 w-full rounded-xl text-white"
        >
          {createMutation.isPending ? t("submitting") : t("submit_review")}
        </Button>
      </form>
    </QueryGuard>
  );
}
export default ProductReviewForm;
