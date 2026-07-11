"use client";

import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

type DeletePropertyDialogProps = {
  property_id: string;
  product_id: string;
  on_change?: () => void;
};

export function DeletePropertyDialog({
  property_id,
  product_id,
  on_change,
}: DeletePropertyDialogProps) {
  const t = useTranslations("variants");

  const utils = trpc.useUtils();
  async function invalidate() {
    await utils.variants.getConfig.invalidate({ product_id });
    on_change?.();
  }

  const delete_property = trpc.variants.deleteProperty.useMutation({
    onSuccess: async () => {
      toast.success(t("property_deleted"));
      await invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <QueryGuard mutation={delete_property}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" size="icon">
            <Trash />
            <span className="sr-only">{t("delete_property")}</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_property_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_property_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={delete_property.isPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={delete_property.isPending}
              onClick={() => {
                delete_property.mutate({ id: property_id });
              }}
            >
              {delete_property.isPending ? t("deleting") : t("confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </QueryGuard>
  );
}
