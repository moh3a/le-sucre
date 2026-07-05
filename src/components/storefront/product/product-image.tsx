"use client";

import { type ImgHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  fallback?: string;
}

export function ProductImage({
  alt,
  className,
  fallback = "No image",
  src,
  ...props
}: ProductImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          "bg-muted/20 text-muted-foreground/40 flex items-center justify-center",
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover object-center", className)}
      onError={() => setError(true)}
      {...props}
    />
  );
}
