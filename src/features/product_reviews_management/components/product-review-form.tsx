"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
      toast.success("Votre avis a été soumis pour modération.");
      reset();
      setRating(5);
      utils.reviews.summaryByProduct.invalidate({ product_id });
      utils.reviews.listByProduct.invalidate({ product_id });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de soumettre l'avis.");
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
      className="font-moya space-y-6 rounded-2xl border border-[#4d4c20]/15 bg-white p-6 shadow-sm"
    >
      <h3 className="font-orla text-lg text-[#4d4c20]">Écrire un avis</h3>

      {/* Star Picker */}
      <div className="space-y-2">
        <Label className="text-secondary text-sm font-semibold">Note globale</Label>
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
          Titre de l&apos;avis (optionnel)
        </Label>
        <Input
          id="title"
          placeholder="Ex: Excellent gâteau, je recommande !"
          className="text-secondary border-[#4d4c20]/30 focus-visible:ring-[#700145]"
          {...register("title")}
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="body" className="text-secondary text-sm font-semibold">
          Votre commentaire
        </Label>
        <Textarea
          id="body"
          placeholder="Dites-nous ce que vous avez aimé ou amélioré..."
          className="text-secondary min-h-32 border-[#4d4c20]/30 focus-visible:ring-[#700145]"
          {...register("body")}
        />
        {errors.body && <p className="text-xs text-red-500">{errors.body.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full rounded-xl bg-[#700145] text-white hover:bg-[#700145]/90"
      >
        {createMutation.isPending ? "Soumission..." : "Soumettre l'avis"}
      </Button>
    </form>
    </QueryGuard>
  );
}
export default ProductReviewForm;
