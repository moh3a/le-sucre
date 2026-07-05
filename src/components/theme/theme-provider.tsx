"use client";

import Script from "next/script";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  themes: Theme[];
  systemTheme: "light" | "dark" | null;
  forcedTheme?: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme";
const THEMES: Theme[] = ["light", "dark", "system"];

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {}
  return "system";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

const FOUC_SCRIPT = `
(function() {
  var theme;
  try { theme = localStorage.getItem('theme') || 'system'; } catch(e) { theme = 'system'; }
  if (theme === 'system') theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
})();
`;

interface ThemeProviderProps {
  children: React.ReactNode;
  forcedTheme?: Theme;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  forcedTheme,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);

    const sys = getSystemTheme();
    setSystemTheme(sys);
    setResolvedTheme(stored === "system" ? sys : stored);
    applyTheme(stored);
    setMounted(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const sys = e.matches ? "dark" : "light";
      setSystemTheme(sys);
      setResolvedTheme((prev) => {
        const currentTheme = theme;
        if (currentTheme === "system") {
          applyTheme("system");
          return sys;
        }
        return prev;
      });
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {}
    if (forcedTheme) return;
    applyTheme(newTheme);
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
  }, [forcedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: forcedTheme ?? theme,
      setTheme,
      resolvedTheme,
      themes: THEMES,
      systemTheme: mounted ? systemTheme : null,
      forcedTheme,
    }),
    [theme, forcedTheme, setTheme, resolvedTheme, systemTheme, mounted],
  );

  return (
    <ThemeContext.Provider value={value}>
      <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
