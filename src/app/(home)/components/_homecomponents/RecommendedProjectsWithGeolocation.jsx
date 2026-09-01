"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HomeRecommendationCards from "./HomeRecommendationCards";
import { getCityPageHref } from "@/app/_global_components/cityAliasUtils";

function isDelhiNcrLabel(city) {
  const n = String(city || "").trim().toLowerCase();
  return !n || n === "ncr" || n === "delhi ncr" || n.includes("delhi ncr");
}

function cityNameFromEvent(detail) {
  if (!detail) return "";
  if (typeof detail === "string") return detail.trim();
  return String(detail.cityName || "").trim();
}

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
  sectionId = "recommended-projects",
}) {
  const [items, setItems] = useState(fallbackItems);
  const [loading, setLoading] = useState(false);
  const [subtitle, setSubtitle] = useState(fallbackSubtitle);
  const [activeViewAllHref, setActiveViewAllHref] = useState(viewAllHref);
  const [activeCity, setActiveCity] = useState("");
  const cityOverrideRef = useRef("");
  const fetchGenRef = useRef(0);
  const fallbackItemsRef = useRef(fallbackItems);

  useEffect(() => {
    fallbackItemsRef.current = fallbackItems;
  }, [fallbackItems]);

  useEffect(() => {
    if (cityOverrideRef.current) return;
    setItems(fallbackItems);
    setSubtitle(fallbackSubtitle);
    setActiveViewAllHref(viewAllHref);
  }, [fallbackItems, fallbackSubtitle, viewAllHref]);

  const applyCityResults = useCallback(
    (data, cityName, { preserveItemsOnEmpty = true } = {}) => {
      const nextItems = Array.isArray(data?.items) ? data.items : [];
      const hasItems = nextItems.length > 0;

      if (hasItems) {
        setItems(nextItems);
      } else if (!preserveItemsOnEmpty) {
        setItems([]);
      }

      // Keep SSR fallback when location API has no matches for this city.
      if (!hasItems && preserveItemsOnEmpty) return;

      const nextSubtitle =
        (typeof data?.subtitle === "string" && data.subtitle.trim()) ||
        (locationIntent === "latest-projects"
          ? `Explore the Best-Selling Properties Today nearby ${cityName}`
          : `Explore New Residential & Commercial Properties near ${cityName}`);
      setSubtitle(nextSubtitle);
      setActiveViewAllHref(
        isDelhiNcrLabel(cityName) ? viewAllHref : getCityPageHref(cityName),
      );
      setActiveCity(cityName);
    },
    [locationIntent, viewAllHref],
  );

  const fetchForCity = useCallback(
    async (cityName) => {
      const city = String(cityName || "").trim();
      if (!city) return;

      const gen = ++fetchGenRef.current;
      setActiveCity(city);
      setLoading(true);
      try {
        const q = new URLSearchParams({
          city,
          intent: locationIntent,
        });
        const res = await fetch(`/api/home/recommended-by-location?${q.toString()}`);
        const data = await res.json();
        if (gen !== fetchGenRef.current) return;
        applyCityResults(data, city, { preserveItemsOnEmpty: true });
      } catch (err) {
        console.error(err);
      } finally {
        if (gen === fetchGenRef.current) setLoading(false);
      }
    },
    [applyCityResults, locationIntent],
  );

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return undefined;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cityOverrideRef.current) return;
        const gen = ++fetchGenRef.current;
        setLoading(true);
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          const q = new URLSearchParams({
            lat: String(latitude),
            lon: String(longitude),
            intent: locationIntent,
          });
          if (typeof accuracy === "number" && Number.isFinite(accuracy)) {
            q.set("accuracy", String(Math.round(accuracy)));
          }
          const res = await fetch(`/api/home/recommended-by-location?${q.toString()}`);
          const data = await res.json();
          if (gen !== fetchGenRef.current || cityOverrideRef.current) return;
          const resolvedCity = String(data?.region?.city || "").trim();
          if (resolvedCity) {
            applyCityResults(data, resolvedCity, { preserveItemsOnEmpty: true });
          } else if (
            data.success &&
            Array.isArray(data.items) &&
            data.items.length > 0 &&
            typeof data.subtitle === "string" &&
            data.subtitle.trim()
          ) {
            setItems(data.items);
            setSubtitle(data.subtitle.trim());
          }
        } catch {
          /* keep SSR fallback */
        } finally {
          if (gen === fetchGenRef.current) setLoading(false);
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

    return undefined;
  }, [applyCityResults, locationIntent]);

  useEffect(() => {
    const handleCityChanged = (e) => {
      const cityName = cityNameFromEvent(e.detail);
      if (!cityName) return;
      cityOverrideRef.current = cityName;

      // Header auto-detect often falls back to Delhi NCR — SSR cards already use that scope.
      if (isDelhiNcrLabel(cityName) && fallbackItemsRef.current?.length > 0) {
        return;
      }

      fetchForCity(cityName);
    };

    window.addEventListener("cityChanged", handleCityChanged);
    return () => window.removeEventListener("cityChanged", handleCityChanged);
  }, [fetchForCity]);

  const cityHref =
    activeCity && !isDelhiNcrLabel(activeCity) ? getCityPageHref(activeCity) : "";
  const emptyMessage =
    activeCity && !loading && (!items || items.length === 0)
      ? `No ${title.toLowerCase()} found in ${activeCity}`
      : "";

  return (
    <section id={sectionId} aria-busy={loading || undefined}>
      <HomeRecommendationCards
        title={title}
        subtitle={subtitle}
        items={items}
        kind={kind}
        viewAllHref={activeViewAllHref}
        className={className}
        emptyMessage={emptyMessage}
        loading={loading}
        cityName={activeCity}
        cityHref={cityHref}
      />
    </section>
  );
}
