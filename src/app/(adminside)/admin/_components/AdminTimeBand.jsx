"use client";

import { useEffect } from "react";

/**
 * Sets `data-admin-timeband` on `<html>` from local clock for subtle ambient UI (corner accents).
 * Values: morning · day · evening · night
 */
export default function AdminTimeBand() {
  useEffect(() => {
    const apply = () => {
      const h = new Date().getHours();
      let band = "night";
      if (h >= 5 && h < 12) band = "morning";
      else if (h >= 12 && h < 17) band = "day";
      else if (h >= 17 && h < 21) band = "evening";
      document.documentElement.setAttribute("data-admin-timeband", band);
    };
    apply();
    const id = window.setInterval(apply, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
