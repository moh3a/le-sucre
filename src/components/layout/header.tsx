"use client";

import { Menu, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/constants";
import { authClient } from "@/lib/auth/client";
import { QueryGuard } from "@/components/query-guard";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("layout");
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/boutique", label: t("boutique_title") },
    { href: "/categories", label: t("categories") },
    { href: "/promotions", label: t("promotions") },
  ];
  const { data: session, isPending, error } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <QueryGuard session={{ isPending, error }}>
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl font-bold text-brand-olive-leaf">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-olive-leaf",
                pathname === link.href
                  ? "text-brand-olive-leaf"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/panier">
              <ShoppingCart className="h-5 w-5" />
              {/* Cart count — wired in cart feature */}
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-brand-crimson-violet text-white border-0">
                0
              </Badge>
            </Link>
          </Button>

          {/* User menu */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/compte">{t("my_account")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/commandes">{t("my_orders")}</Link>
                </DropdownMenuItem>
                {session.user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">{t("administration")}</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => authClient.signOut()}
                >
                  {t("sign_out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">
                <User className="h-4 w-4" />
                {t("login")}
              </Link>
            </Button>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  href="/"
                  className="font-heading text-xl font-bold text-brand-olive-leaf"
                  onClick={() => setMobileOpen(false)}
                >
                  {siteConfig.name}
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-base font-medium transition-colors hover:text-brand-olive-leaf",
                        pathname === link.href
                          ? "text-brand-olive-leaf"
                          : "text-muted-foreground",
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </QueryGuard>
  );
}
