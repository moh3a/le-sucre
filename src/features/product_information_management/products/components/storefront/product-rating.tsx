import { cn } from "@/lib/utils";

interface ProductRatingProps {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ProductRating({
  rating,
  maxRating = 5,
  reviewCount,
  showCount = true,
  size = "sm",
  className,
}: ProductRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i < rating);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className={cn("flex", size === "sm" ? "text-sm" : "text-base")}>
        {stars.map((filled, i) => (
          <span key={i} className={filled ? "text-yellow-500" : "text-muted-foreground/30"}>
            {filled ? "★" : "☆"}
          </span>
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-muted-foreground text-xs">({reviewCount})</span>
      )}
    </div>
  );
}
