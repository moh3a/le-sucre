"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthForm } from "./auth-form";

interface AuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthSheet({ open, onOpenChange }: AuthSheetProps) {
  const tLayout = useTranslations("layout");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isRtl ? "left" : "right"} className="w-full overflow-y-auto data-[side=left]:sm:max-w-2xl data-[side=right]:sm:max-w-2xl p-6">
        <SheetHeader className="mb-6">
          <SheetTitle>{tLayout("customer_auth_title") || "Mon compte"}</SheetTitle>
          <SheetDescription>
            {tLayout("customer_auth_desc") || "Connectez-vous ou créez un compte"}
          </SheetDescription>
        </SheetHeader>

        <AuthForm onSuccess={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
