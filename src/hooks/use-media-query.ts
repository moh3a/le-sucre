import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [, setTick] = useState(0);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setTick((c) => c + 1);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

// Convenience hooks for Tailwind breakpoints
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
