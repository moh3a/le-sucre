"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthForm } from "@/features/authentication_and_authorization/auth/components/auth-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CustomerLoginPage() {
  const t = useTranslations("layout");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("my_account")}
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold">
          {t("customer_auth_title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("customer_auth_desc")}
        </p>
      </div>

      <AuthForm />
    </div>
  );
}
