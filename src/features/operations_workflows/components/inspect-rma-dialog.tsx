"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const inspect_schema = z.object({
  inspection_notes: z.string().min(1).max(4096),
  disposition: z.string().min(1).max(128),
});

type InspectFormValues = z.infer<typeof inspect_schema>;

type InspectRMADialogProps = {
  rma_id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InspectRMADialog({ rma_id, open, onOpenChange }: InspectRMADialogProps) {
  const t = useTranslations("return_requests");
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InspectFormValues>({
    resolver: zodResolver(inspect_schema),
    defaultValues: {
      inspection_notes: "",
      disposition: "",
    },
  });

  const inspect_mutation = trpc.operationsWorkflows.rmaInspect.useMutation({
    onSuccess: () => {
      toast.success(t("rma_inspect_success"));
      onOpenChange(false);
      reset();
      void utils.operationsWorkflows.rmaList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function onSubmit(values: InspectFormValues) {
    inspect_mutation.mutate({
      id: rma_id,
      inspection_notes: values.inspection_notes,
      disposition: values.disposition,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("rma_inspect_title")}</DialogTitle>
          <DialogDescription>{t("rma_inspect_description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("rma_inspect_notes_label")}</Label>
            <Textarea
              {...register("inspection_notes")}
              className="min-h-[100px]"
              disabled={inspect_mutation.isPending}
            />
            {errors.inspection_notes && (
              <p className="text-xs text-red-500">{errors.inspection_notes.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("rma_inspect_disposition_label")}</Label>
            <Input
              {...register("disposition")}
              placeholder={t("rma_inspect_disposition_placeholder")}
              disabled={inspect_mutation.isPending}
            />
            {errors.disposition && (
              <p className="text-xs text-red-500">{errors.disposition.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={inspect_mutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={inspect_mutation.isPending}>
              <Search />
              {inspect_mutation.isPending ? t("rma_inspecting") : t("rma_inspect_button")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
