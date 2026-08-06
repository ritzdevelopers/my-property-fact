"use client";

import { useEffect, useRef, useState } from "react";
import HomeRecommendationCards from "./HomeRecommendationCards";

export default function RecommendedProjectsWithGeolocation({
  title = "Recommended Projects",
  fallbackItems,
  fallbackSubtitle,
  viewAllHref,
  className = "",
  /** Cards row: `project` = new projects only, `mixed` = projects + resale listings */
  kind = "mixed",
  /** API `intent`: `mixed` = projects + listings; `projects` = new launches near you; `latest-projects` = MPF projects only (newest, home Recommended Projects). */
  locationIntent = "mixed",
  badgeColor = "#e84b7a",
}) {
  const [items, setItems] = useState(fallbackItems);
  const [loading, setLoading] = useState(false);
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
          const { latitude, longitude, accuracy } = pos.coords;
          const q = new URLSearchParams({
            lat: String(latitude),
            lon: String(longitude),
          });
          if (typeof accuracy === "number" && Number.isFinite(accuracy)) {
            q.set("accuracy", String(Math.round(accuracy)));
          }
          q.set("intent", locationIntent);
          const res = await fetch(`/api/home/recommended-by-location?${q.toString()}`);
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
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20_000,
      },
    );
  }, [locationIntent]);

  useEffect(() => {
    const handleCityChanged = async (e) => {
      const city = e.detail;
console.log("Received city:", city);
      if (!city) return;

      setLoading(true);

      try {
        const q = new URLSearchParams({
          city: city.cityName,
          intent: locationIntent,
        });

        const res = await fetch(
          `/api/home/recommended-by-location?${q.toString()}`
        );

        const data = await res.json();

        if (data.success) {
          setItems(data.items);

          setSubtitle(
            `Explore New Residential & Commercial Properties near ${city.cityName}`
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener("cityChanged", handleCityChanged);

    return () =>
      window.removeEventListener(
        "cityChanged",
        handleCityChanged
      );
  }, []);

  return (
    <section id="recommended-projects">
      <HomeRecommendationCards
        title={title}
        subtitle={subtitle}
        items={items}
        kind={kind}
        viewAllHref={viewAllHref}
        className={className}
        badgeColor={badgeColor}
      />
    </section>
  );
}
