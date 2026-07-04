import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface CartEmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
  onCta?: () => void;
}

export function CartEmptyState({
  icon = "🛒",
  title,
  description,
  ctaLabel,
  ctaHref = "/",
  onCta,
}: CartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <div className="text-6xl" aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
      {onCta ? (
        <Button onClick={onCta}>{ctaLabel}</Button>
      ) : (
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
    </div>
  );
}
