import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
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
import { useTranslations } from "next-intl";

type VariantPropertyEditorProps = {
  property_id: string;
  product_id: string;
  on_change?: () => void;
};

export function DeletePropertyDialog({
  property_id,
  product_id,
  on_change,
}: VariantPropertyEditorProps) {
  const t = useTranslations("variants");

  const utils = trpc.useUtils();
  async function invalidate() {
    await utils.variants.getConfig.invalidate({ product_id });
    on_change?.();
  }

  const delete_property = trpc.variants.deleteProperty.useMutation({
    onSuccess: invalidate,
    onError: (err) => toast.error(err.message),
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="icon">
          <Trash />
          <span className="sr-only">{t("delete_property")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{t("delete_property")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              delete_property.mutate({ id: property_id });
            }}
          >
            Oui, {t("delete_property")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
