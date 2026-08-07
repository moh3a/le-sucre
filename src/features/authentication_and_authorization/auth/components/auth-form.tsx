"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { trpc } from "@/components/providers/app-providers";
import { reset_cart_bootstrap } from "@/features/order_management_system/carts/hooks/use-storefront-cart";

const phone_regex = /^\+?[\d\s\-()]{7,20}$/;
const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function resolve_identifier_to_email(identifier: string): Promise<string | null> {
  try {
    const res = await fetch("/api/phone-auth/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.email ?? null;
  } catch {
    return null;
  }
}

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const t = useTranslations("auth");
  const tLayout = useTranslations("layout");
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Sign in state
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [signUpError, setSignUpError] = useState("");

  const merge_mutation = trpc.cart.mergeGuestCart.useMutation();

  const signUpMutation = trpc.auth.signUp.useMutation({
    onSuccess: async () => {
      const identifier = signUpEmail || signUpPhone;
      if (identifier) {
        const email = await resolve_identifier_to_email(identifier);
        if (email) {
          const result = await authClient.signIn.email({
            email,
            password: signUpPassword,
          });
          if (result.error) {
            setTab("signin");
            return;
          }
          try {
            await merge_mutation.mutateAsync();
          } catch {
            // non-blocking — a stale guest cart is harmless
          }
          reset_cart_bootstrap();
        }
      }
      reset();
      onSuccess?.();
      router.refresh();
    },
    onError: (err) => {
      setSignUpError(err.message);
    },
  });

  function reset() {
    setSignInIdentifier("");
    setSignInPassword("");
    setSignInError("");
    setSignInLoading(false);
    setSignUpName("");
    setSignUpEmail("");
    setSignUpPhone("");
    setSignUpPassword("");
    setSignUpConfirm("");
    setSignUpError("");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSignInError("");

    if (!signInIdentifier) {
      setSignInError(t("identifier_required") || "Email ou téléphone requis");
      return;
    }
    if (signInPassword.length < 8) {
      setSignInError(t("password_too_short"));
      return;
    }

    setSignInLoading(true);
    try {
      const email = await resolve_identifier_to_email(signInIdentifier);
      if (!email) {
        setSignInError(t("error_invalid"));
        return;
      }

      const result = await authClient.signIn.email({
        email,
        password: signInPassword,
      });
      if (result.error) {
        setSignInError(t("error_invalid"));
        return;
      }

      try {
        await merge_mutation.mutateAsync();
      } catch {
        // non-blocking — a stale guest cart is harmless
      }
      reset_cart_bootstrap();

      reset();
      onSuccess?.();
      router.refresh();
    } catch {
      setSignInError(t("error_unknown"));
    } finally {
      setSignInLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSignUpError("");

    if (signUpName.length < 2) {
      setSignUpError(t("name_required") || "Nom requis");
      return;
    }

    const has_email = Boolean(signUpEmail && email_regex.test(signUpEmail));
    const has_phone = Boolean(signUpPhone && phone_regex.test(signUpPhone));

    if (!has_email && !has_phone) {
      setSignUpError(t("identifier_required") || "Email ou téléphone requis");
      return;
    }

    if (signUpPassword.length < 8) {
      setSignUpError(t("password_too_short"));
      return;
    }
    if (signUpPassword !== signUpConfirm) {
      setSignUpError(t("passwords_mismatch") || "Les mots de passe ne correspondent pas");
      return;
    }

    signUpMutation.mutate({
      name: signUpName,
      email: has_email ? signUpEmail : undefined,
      phone: has_phone ? signUpPhone : undefined,
      password: signUpPassword,
    });
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
      <TabsList className="mb-6 grid w-full grid-cols-2">
        <TabsTrigger value="signin">{tLayout("login") || "Connexion"}</TabsTrigger>
        <TabsTrigger value="signup">{tLayout("register") || "Inscription"}</TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-signin-identifier">{t("identifier")}</Label>
            <Input
              id="auth-signin-identifier"
              type="text"
              autoComplete="username"
              placeholder={t("identifier_placeholder")}
              value={signInIdentifier}
              onChange={(e) => setSignInIdentifier(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-signin-password">{t("password")}</Label>
            <Input
              id="auth-signin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
            />
          </div>
          {signInError && <p className="text-destructive text-sm">{signInError}</p>}
          <Button type="submit" className="w-full" disabled={signInLoading}>
            {signInLoading ? t("loading_ellipsis") : tLayout("login") || "Se connecter"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-signup-name">{tLayout("name") || "Nom complet"}</Label>
            <Input
              id="auth-signup-name"
              type="text"
              autoComplete="name"
              placeholder="Votre nom"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-signup-email">{t("email") || "Email"}</Label>
            <Input
              id="auth-signup-email"
              type="email"
              autoComplete="email"
              placeholder="email@exemple.com"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-signup-phone">{t("phone")}</Label>
            <Input
              id="auth-signup-phone"
              type="tel"
              autoComplete="tel"
              placeholder={t("phone_placeholder")}
              value={signUpPhone}
              onChange={(e) => setSignUpPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-signup-password">{t("password")}</Label>
            <Input
              id="auth-signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-signup-confirm">
              {tLayout("confirm_password") || "Confirmer le mot de passe"}
            </Label>
            <Input
              id="auth-signup-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={signUpConfirm}
              onChange={(e) => setSignUpConfirm(e.target.value)}
            />
          </div>
          {signUpError && <p className="text-destructive text-sm">{signUpError}</p>}
          <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
            {signUpMutation.isPending
              ? t("loading_ellipsis")
              : tLayout("register") || "Créer un compte"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
