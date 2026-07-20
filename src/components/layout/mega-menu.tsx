"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Zap, TrendingUp, Star, Package, ChevronRight } from "lucide-react";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";

type MegaMenuProps = {
  categories: CategoryTreeNode[];
  locale: string;
};

const MAX_TOP_CATEGORIES = 5;
const MAX_SUBCATEGORIES = 5;

const quickLinks = [
  { key: "new_arrivals", href: "/new-arrivals", icon: Sparkles },
  { key: "flash_sales", href: "/flash-sales", icon: Zap },
  { key: "best_sellers", href: "/best-sellers", icon: TrendingUp },
  { key: "trending", href: "/promotions", icon: Star },
  { key: "all_products", href: "/categories", icon: Package },
] as const;

function MegaMenuDesktop({ categories }: MegaMenuProps) {
  const t = useTranslations("layout.nav");
  const topCategories = categories.slice(0, MAX_TOP_CATEGORIES);

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-sm font-medium">
            {t("categories")}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-1 p-4 md:w-[700px] lg:w-[850px]">
              <div className="grid grid-cols-[1fr_200px] gap-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  {topCategories.map((category) => (
                    <div key={category.id} className="space-y-1">
                      <NavigationMenuLink
                        href={`/c/${category.slug}`}
                        className="text-foreground hover:bg-muted rounded-xl px-3 py-2 text-sm font-semibold"
                      >
                        {category.name}
                      </NavigationMenuLink>
                      <ul className="space-y-0.5">
                        {category.children.slice(0, MAX_SUBCATEGORIES).map((sub) => (
                          <li key={sub.id}>
                            <NavigationMenuLink
                              href={`/c/${category.slug}/${sub.slug}`}
                              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-3 py-1.5 text-xs"
                            >
                              {sub.name}
                            </NavigationMenuLink>
                          </li>
                        ))}
                        {category.children.length > MAX_SUBCATEGORIES && (
                          <li>
                            <NavigationMenuLink
                              href={`/c/${category.slug}`}
                              className="text-primary hover:bg-muted inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium"
                            >
                              {t("view_all")}
                              <ChevronRight className="size-3" />
                            </NavigationMenuLink>
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="border-border space-y-1 border-l pl-4">
                  <p className="text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                    {t("quick_links")}
                  </p>
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavigationMenuLink
                        key={link.key}
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm"
                      >
                        <Icon className="text-primary size-4" />
                        {t(`quick.${link.key}`)}
                      </NavigationMenuLink>
                    );
                  })}
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MegaMenuMobile({ categories }: MegaMenuProps) {
  const t = useTranslations("layout.nav");
  const topCategories = categories.slice(0, MAX_TOP_CATEGORIES);

  return (
    <div className="space-y-2">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="categories" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm font-semibold">
            {t("categories")}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 pl-2">
              {topCategories.map((category) => (
                <Accordion key={category.id} type="multiple" className="w-full">
                  <AccordionItem value={category.id} className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm">{category.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-0.5 pl-2">
                        <Link
                          href={`/c/${category.slug}`}
                          className="text-primary block py-1.5 text-xs font-medium hover:underline"
                        >
                          {t("view_all")} {category.name}
                        </Link>
                        {category.children.slice(0, MAX_SUBCATEGORIES).map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/c/${category.slug}/${sub.slug}`}
                            className="text-muted-foreground hover:text-foreground block py-1.5 text-xs"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <div className="space-y-0.5">
        <p className="text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wider uppercase">
          {t("quick_links")}
        </p>
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.key}
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm"
            >
              <Icon className="text-primary size-4" />
              {t(`quick.${link.key}`)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export { MegaMenuDesktop, MegaMenuMobile };
