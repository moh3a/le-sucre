"use client";

import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/constants";
import { authClient } from "@/lib/auth/client";
import { QueryGuard } from "@/components/query-guard";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("layout");
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending, error } = authClient.useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

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
    <QueryGuard session={{ isPending, error }}>
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
            <form onSubmit={handleSearch} className="hidden w-full max-w-md md:block">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="search"
                  placeholder={t("search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring flex h-9 w-full rounded-md border bg-transparent py-2 pr-3 pl-10 text-sm shadow-xs transition-colors focus-visible:ring-0 focus-visible:outline-hidden"
                />
              </div>
            </form>
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
            {session ? (
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
            ) : (
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link href="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

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
