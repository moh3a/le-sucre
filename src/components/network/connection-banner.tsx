"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useNetworkContext } from "@/components/network/network-provider";

type BannerKey = "offline" | "backend" | "timeout" | "slow" | "restored";

export function ConnectionBanner() {
  const t = useTranslations("common");
  const { isOnline, isOffline, isSlow, backend_available, last_error_type, clear_error, mark_backend_available } =
    useNetworkContext();

  const active_ref = useRef<BannerKey | null>(null);
  const prev_offline_ref = useRef(false);

  useEffect(() => {
    if (prev_offline_ref.current && isOnline) {
      prev_offline_ref.current = false;

      if (active_ref.current) {
        toast.dismiss(active_ref.current);
      }
      active_ref.current = null;

      toast.success(t("connection_restored"), { id: "restored", duration: 4000 });
      return;
    }
    prev_offline_ref.current = isOffline;
  }, [isOnline, isOffline, t]);

  useEffect(() => {
    if (isOffline) {
      if (active_ref.current) toast.dismiss(active_ref.current);
      active_ref.current = "offline";
      toast.error(t("you_are_offline"), {
        id: "offline",
        duration: Infinity,
        description: t("will_reconnect_automatically"),
      });
      return;
    }

    if (last_error_type === "backend_unavailable" || (!backend_available && !isOffline)) {
      if (active_ref.current) toast.dismiss(active_ref.current);
      active_ref.current = "backend";
      toast.error(t("server_unavailable"), {
        id: "backend",
        duration: Infinity,
        action: {
          label: t("retry"),
          onClick: () => {
            clear_error();
            mark_backend_available();
            active_ref.current = null;
          },
        },
      });
      return;
    }

    if (last_error_type === "timeout" || last_error_type === "gateway_timeout") {
      if (active_ref.current) toast.dismiss(active_ref.current);
      active_ref.current = "timeout";
      toast.error(t("request_timed_out"), {
        id: "timeout",
        duration: Infinity,
        action: {
          label: t("retry"),
          onClick: () => {
            clear_error();
            mark_backend_available();
            active_ref.current = null;
          },
        },
      });
      return;
    }

    if (isSlow) {
      if (active_ref.current) toast.dismiss(active_ref.current);
      active_ref.current = "slow";
      toast.warning(t("slow_connection"), {
        id: "slow",
        duration: 8000,
      });
      return;
    }

    if (active_ref.current) {
      toast.dismiss(active_ref.current);
      active_ref.current = null;
    }
  }, [isOffline, isSlow, backend_available, last_error_type, clear_error, mark_backend_available, t]);

  return null;
}
