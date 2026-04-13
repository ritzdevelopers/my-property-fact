"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { setAdminTelemetryPath, getAdminTelemetryHeaders } from "@/lib/adminTelemetry";
import { installAdminFetchTelemetry } from "@/lib/adminFetchTelemetry";

/**
 * Tracks the current admin pathname and injects X-MPF-Admin-Page / X-MPF-Dwell-Ms on admin API calls
 * (axios + fetch) for Super Admin audit logs.
 */
export default function AdminTelemetryMount() {
  const pathname = usePathname();

  useEffect(() => {
    setAdminTelemetryPath(pathname || "");
  }, [pathname]);

  useEffect(() => {
    const reqId = axios.interceptors.request.use((config) => {
      const url = `${config.baseURL || ""}${config.url || ""}`;
      if (!url.includes("/api/v1/admin")) {
        return config;
      }
      const extra = getAdminTelemetryHeaders();
      const h = config.headers;
      if (h && typeof h.set === "function") {
        Object.entries(extra).forEach(([k, v]) => h.set(k, v));
      } else {
        config.headers = { ...(h || {}), ...extra };
      }
      return config;
    });
    const uninstallFetch = installAdminFetchTelemetry();
    return () => {
      axios.interceptors.request.eject(reqId);
      uninstallFetch();
    };
  }, []);

  return null;
}
