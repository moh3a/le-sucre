"use client";

import { Home, LayoutGrid, Search, ShoppingCart, User, LogIn } from "lucide-react";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

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
import { LocaleSelector } from "@/components/ui/locale-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/constants";
import { authClient } from "@/lib/auth/client";
import { QueryGuard } from "@/components/query-guard";
import { AuthSheet } from "@/features/authentication_and_authorization/auth/components/auth-sheet";
import { cn } from "@/lib/utils";
import { CatalogSearchBar } from "@/features/product_information_management/catalog_discovery/components/catalog-search-bar";

interface HeaderProps {
  locale?: string;
}

export function Header({ locale = "fr" }: HeaderProps) {
  const t = useTranslations("layout");
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending, error } = authClient.useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [authSheetOpen, setAuthSheetOpen] = useState(false);

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const bottomNavItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/categories", label: t("categories"), icon: LayoutGrid },
    { href: "/search", label: t("search"), icon: Search },
    { href: "/cart", label: t("cart"), icon: ShoppingCart },
    { href: "/account", label: t("my_account"), icon: User },
  ] as const;

  return (
    <QueryGuard
      session={{ isPending, error }}
      loadingFallback={
        <>
          {/* Desktop header skeleton */}
          <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
              <div className="flex flex-1 items-center gap-6">
                <Skeleton className="h-7 w-28" />
                <nav className="hidden items-center gap-6 md:flex">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </nav>
                <Skeleton className="hidden h-9 w-full max-w-md rounded-md md:block" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="hidden h-8 w-8 rounded-md md:block" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="hidden items-center gap-1 md:flex">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-[70px] rounded-md" />
                </div>
              </div>
            </div>
          </header>
          {/* Mobile bottom nav skeleton */}
          <nav className="bg-background/95 supports-backdrop-filter:bg-background/60 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur md:hidden">
            <div className="flex h-16 items-center justify-around px-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 px-3 py-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
          </nav>
        </>
      }
    >
      {/* Desktop header */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex flex-1 items-center gap-6">
            {/* Left: Brand logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="font-heading text-brand-olive-leaf text-2xl font-bold">
                {siteConfig.name}
              </span>
            </Link>
            {/* Desktop nav links */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/categories"
                className={cn(
                  "hover:text-brand-olive-leaf text-sm font-medium transition-colors",
                  isActive("/categories") ? "text-brand-olive-leaf" : "text-muted-foreground",
                )}
              >
                {t("categories")}
              </Link>
              <Link
                href="/promotions"
                className={cn(
                  "hover:text-brand-olive-leaf text-sm font-medium transition-colors",
                  isActive("/promotions") ? "text-brand-olive-leaf" : "text-muted-foreground",
                )}
              >
                {t("promotions")}
              </Link>
            </nav>
            {/* Desktop search bar */}
            <div className="hidden w-full max-w-md md:block">
              <CatalogSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={(q) => {
                  const query = q.trim();
                  router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
                }}
                placeholder={t("search_placeholder")}
                locale={locale}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative shrink-0">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="bg-brand-crimson-violet absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-0 p-0 text-xs text-white">
                  0
                </Badge>
              </Link>
            </Button>

            {/* Account */}
            {session?.user?.isAnonymous ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">{t("my_orders")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account">{t("my_account")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-brand-olive-leaf font-medium"
                    onClick={() => setAuthSheetOpen(true)}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("sign_in_sign_up") || "Se connecter / S'inscrire"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account">{t("my_account")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">{t("my_orders")}</Link>
                  </DropdownMenuItem>
                  {session.user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/console">{t("administration")}</Link>
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
            ) : null}

            <AuthSheet open={authSheetOpen} onOpenChange={setAuthSheetOpen} />

            {/* Theme toggle & locale selector — desktop only */}
            <div className="hidden items-center gap-1 md:flex">
              <ThemeToggle />
              <LocaleSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="bg-background/95 supports-backdrop-filter:bg-background/60 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors",
                  active
                    ? "text-brand-olive-leaf"
                    : "text-muted-foreground hover:text-brand-olive-leaf",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </QueryGuard>
  );
}
