import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ShoppingCart } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";

interface CartEmptyStateProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
  onCta?: () => void;
}

export function CartEmptyState({
  title,
  description,
  ctaLabel,
  ctaHref = "/",
  onCta,
}: CartEmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingCart className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onCta ? (
          <Button onClick={onCta}>{ctaLabel}</Button>
        ) : (
          <Button asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
