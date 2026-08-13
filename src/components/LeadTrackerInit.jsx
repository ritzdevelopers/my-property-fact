"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initLeadTracker, trackPageView } from "@/lib/leadTracker";

let initialized = false;

export default function LeadTrackerInit() {
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized) {
      initLeadTracker();
      initialized = true;
    }
  }, []);

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
