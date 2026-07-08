import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setTick((c) => c + 1);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}
