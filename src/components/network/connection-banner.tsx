"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

import { useNetworkContext } from "@/components/network/network-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useConnectionMessage() {
  const t = useTranslations("common");
  const { isOffline, isSlow, backend_available, last_error_type } = useNetworkContext();

  if (isOffline) {
    return {
      key: "offline",
      message: t("you_are_offline"),
      icon: WifiOff,
      variant: "destructive" as const,
      dismissible: false,
    };
  }

  if (last_error_type === "backend_unavailable" || (!backend_available && !isOffline)) {
    return {
      key: "backend",
      message: t("server_unavailable"),
      icon: AlertTriangle,
      variant: "destructive" as const,
      dismissible: true,
    };
  }

  if (last_error_type === "timeout" || last_error_type === "gateway_timeout") {
    return {
      key: "timeout",
      message: t("request_timed_out"),
      icon: AlertTriangle,
      variant: "destructive" as const,
      dismissible: true,
    };
  }

  if (isSlow) {
    return {
      key: "slow",
      message: t("slow_connection"),
      icon: Wifi,
      variant: "warning" as const,
      dismissible: true,
    };
  }

  return null;
}

export function ConnectionBanner() {
  const { isOnline, clear_error, mark_backend_available } = useNetworkContext();
  const banner = useConnectionMessage();
  const [dismissed_key, setDismissedKey] = useState<string | null>(null);
  const [just_reconnected, setJustReconnected] = useState(false);
  const prev_offline_ref = useRef(false);
  const t = useTranslations("common");

  // Track offline → online transition for "restored" message
  useEffect(() => {
    if (prev_offline_ref.current && isOnline) {
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 4000);
      return () => clearTimeout(timer);
    }
    prev_offline_ref.current = !isOnline;
  }, [isOnline]);

  const is_dismissed = banner && dismissed_key === banner.key;

  if (just_reconnected) {
    return (
      <div className="bg-primary/10 border-primary/30 fixed top-0 right-0 left-0 z-[9999] border-b px-4 py-2.5 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="text-primary size-4" />
            <span className="text-sm font-medium">{t("connection_restored")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!banner || is_dismissed) return null;

  const Icon = banner.icon;

  return (
    <div
      className={cn(
        "fixed top-0 right-0 left-0 z-[9999] border-b px-4 py-2.5 transition-all duration-300",
        banner.variant === "destructive"
          ? "bg-destructive/10 border-destructive/30"
          : "bg-yellow-500/10 border-yellow-500/30",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "size-4",
              banner.variant === "destructive" ? "text-destructive" : "text-yellow-600",
            )}
          />
          <span className="text-sm font-medium">{banner.message}</span>
        </div>
        <div className="flex items-center gap-2">
          {isOnline && banner.dismissible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => {
                clear_error();
                mark_backend_available();
                setDismissedKey(banner.key);
              }}
            >
              {t("retry")}
            </Button>
          )}
          {!isOnline && banner.key === "offline" && (
            <span className="text-muted-foreground text-xs">
              {t("will_reconnect_automatically")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
