"use client";

import { useEffect, useRef, useState } from "react";
import HomeRecommendationCards from "./HomeRecommendationCards";

export default function RecommendedProjectsWithGeolocation({
  fallbackItems,
  fallbackSubtitle,
  viewAllHref,
  className = "",
}) {
  const [items, setItems] = useState(fallbackItems);
  const [subtitle, setSubtitle] = useState(fallbackSubtitle);
  const attemptedRef = useRef(false);
  const geoAppliedRef = useRef(false);

  useEffect(() => {
    if (geoAppliedRef.current) return;
    setItems(fallbackItems);
    setSubtitle(fallbackSubtitle);
  }, [fallbackItems, fallbackSubtitle]);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `/api/home/recommended-by-location?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`,
          );
          const data = await res.json();
          if (
            data.success &&
            Array.isArray(data.items) &&
            data.items.length > 0 &&
            typeof data.subtitle === "string" &&
            data.subtitle.trim()
          ) {
            geoAppliedRef.current = true;
            setItems(data.items);
            setSubtitle(data.subtitle.trim());
          }
        } catch {
          /* keep SSR fallback */
        }
      },
      () => {
        /* denied or unavailable — keep fallback */
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 12_000,
      },
    );
  }, []);

  return (
    <HomeRecommendationCards
      title="Recommended Projects"
      subtitle={subtitle}
      items={items}
      kind="mixed"
      viewAllHref={viewAllHref}
      className={className}
    />
  );
}
