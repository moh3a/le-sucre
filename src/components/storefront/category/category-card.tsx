import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { CategoryItem } from "@/components/storefront/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: CategoryItem;
  variant?: "grid" | "compact" | "home";
}

export function CategoryCard({ category, variant = "grid" }: CategoryCardProps) {
  if (variant === "home") {
    return (
      <Link href={`/c/${category.slug}`} className="group block">
        <Card className="group cursor-pointer overflow-hidden p-4 text-center transition-shadow hover:shadow-md h-full">
          <div className="bg-muted mx-auto mb-3 h-20 w-20 rounded-full transition-transform group-hover:scale-105" />
          <p className="text-sm font-medium">{category.name}</p>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/c/${category.slug}`} className="group block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">{category.name}</CardTitle>
          {category.description && (
            <CardDescription className="line-clamp-2">{category.description}</CardDescription>
          )}
        </CardHeader>
        {category.children.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {category.children.slice(0, 6).map((child) => (
                <Badge
                  key={child.id}
                  variant="secondary"
                  className={cn(
                    "bg-muted text-muted-foreground hover:bg-lemon-lime/20 hover:text-olive-leaf",
                    "cursor-pointer text-xs font-normal transition-colors",
                  )}
                  asChild
                >
                  <Link href={`/c/${child.slug}`}>{child.name}</Link>
                </Badge>
              ))}
              {category.children.length > 6 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{category.children.length - 6}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
