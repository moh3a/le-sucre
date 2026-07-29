"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus, ShieldCheck } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OrderCombobox } from "@/features/order_management_system/orders/components/order-combobox";
import { QueryGuard } from "@/components/query-guard";

const issue_rma_schema = z.object({
  order_id: z.string().min(1),
  carrier: z.string().max(64).optional(),
  tracking_number: z.string().max(128).optional(),
});

type IssueRMAFormValues = z.infer<typeof issue_rma_schema>;

export function IssueRMADialog() {
  const t = useTranslations("return_requests");
  const utils = trpc.useUtils();
  const [open, setOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IssueRMAFormValues>({
    resolver: zodResolver(issue_rma_schema),
    defaultValues: {
      order_id: "",
      carrier: "",
      tracking_number: "",
    },
  });

  const order_id = watch("order_id");

  const issue_mutation = trpc.operationsWorkflows.rmaIssue.useMutation({
    onSuccess: () => {
      toast.success(t("rma_issue_success"));
      setOpen(false);
      reset();
      void utils.operationsWorkflows.rmaList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function onSubmit(values: IssueRMAFormValues) {
    issue_mutation.mutate({
      order_id: values.order_id,
      carrier: values.carrier || undefined,
      tracking_number: values.tracking_number || undefined,
    });
  }

  return (
    <QueryGuard mutation={issue_mutation}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus />
            {t("rma_issue_trigger")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rma_issue_title")}</DialogTitle>
            <DialogDescription>{t("rma_issue_description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("select_order")}</Label>
              <input type="hidden" {...register("order_id")} />
              <OrderCombobox
                value={order_id}
                onValueChange={(v) => setValue("order_id", v ?? "", { shouldValidate: true })}
                disabled={issue_mutation.isPending}
              />
              {errors.order_id && (
                <p className="text-xs text-red-500">{errors.order_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("rma_carrier")}</Label>
              <Input
                {...register("carrier")}
                placeholder="ex: Yalidine, ZR Express"
                disabled={issue_mutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("rma_tracking")}</Label>
              <Input
                {...register("tracking_number")}
                placeholder="123456789"
                disabled={issue_mutation.isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={issue_mutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={issue_mutation.isPending}>
                <ShieldCheck />
                {issue_mutation.isPending ? t("rma_issuing") : t("rma_issue_button")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}
