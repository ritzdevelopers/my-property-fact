"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import HomeRecommendationCards from "./HomeRecommendationCards";
import { getCityPageHref } from "@/app/_global_components/cityAliasUtils";
import { resolveDeviceCity } from "@/lib/resolveIpCity";

/** Ultimate fallback when GPS is denied and IP city has no listings. */
const DEFAULT_CITY_WITHOUT_LOCATION = "Delhi NCR";
const HEADER_CITY_STORAGE_KEY = "mpf_header_city";

function isDelhiNcrLabel(city) {
  const n = String(city || "").trim().toLowerCase();
  return !n || n === "ncr" || n === "delhi ncr" || n.includes("delhi ncr");
}

function readSavedHeaderCity() {
  if (typeof window === "undefined") return "";
  try {
    const saved = String(window.localStorage.getItem(HEADER_CITY_STORAGE_KEY) || "").trim();
    return saved && !isDelhiNcrLabel(saved) ? saved : "";
  } catch {
    return "";
  }
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
  /** First N card images load eagerly (LCP); rest stay lazy. */
  eagerImageCount = 0,
}) {
  const [items, setItems] = useState(fallbackItems);
  const [loading, setLoading] = useState(false);
  const [subtitle, setSubtitle] = useState(fallbackSubtitle);
  const [activeViewAllHref, setActiveViewAllHref] = useState(viewAllHref);
  const [activeCity, setActiveCity] = useState("");
  const cityOverrideRef = useRef("");
  const citySourceRef = useRef("");
  const fetchGenRef = useRef(0);
  const fallbackItemsRef = useRef(fallbackItems);

  useLayoutEffect(() => {
    const savedCity = readSavedHeaderCity();
    if (!savedCity) return;
    cityOverrideRef.current = savedCity;
    citySourceRef.current = "manual";
    setActiveCity(savedCity);
    setLoading(true);
  }, []);

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
    async (
      cityName,
      { fallbackToNcrOnEmpty = false, preserveItemsOnEmpty } = {},
    ) => {
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

        // Prefer the city the user picked — never let an empty→NCR API swap rename the rail.
        const apiCity = String(data?.region?.city || "").trim();
        const nextItems = Array.isArray(data?.items) ? data.items : [];
        const rejectNcrSwap =
          !fallbackToNcrOnEmpty &&
          !isDelhiNcrLabel(city) &&
          isDelhiNcrLabel(apiCity);
        const displayCity = rejectNcrSwap ? city : apiCity || city;

        if (
          fallbackToNcrOnEmpty &&
          nextItems.length === 0 &&
          !isDelhiNcrLabel(city)
        ) {
          await fetchForCity(DEFAULT_CITY_WITHOUT_LOCATION, {
            fallbackToNcrOnEmpty: false,
            preserveItemsOnEmpty: false,
          });
          return;
        }

        // Explicit city pick: ignore NCR substitute cards from the API.
        const scopedData = rejectNcrSwap
          ? { ...data, items: [], region: { ...(data?.region || {}), city } }
          : data;

        applyCityResults(scopedData, displayCity, {
          preserveItemsOnEmpty:
            typeof preserveItemsOnEmpty === "boolean"
              ? preserveItemsOnEmpty
              : !fallbackToNcrOnEmpty,
        });
      } catch (err) {
        console.error(err);
        if (
          fallbackToNcrOnEmpty &&
          gen === fetchGenRef.current &&
          !isDelhiNcrLabel(city)
        ) {
          await fetchForCity(DEFAULT_CITY_WITHOUT_LOCATION, {
            fallbackToNcrOnEmpty: false,
            preserveItemsOnEmpty: false,
          });
        } else if (gen === fetchGenRef.current && preserveItemsOnEmpty === false) {
          applyCityResults({ items: [], region: { city } }, city, {
            preserveItemsOnEmpty: false,
          });
        }
      } finally {
        if (gen === fetchGenRef.current) setLoading(false);
      }
    },
    [applyCityResults, locationIntent],
  );

  const applyDetectedCity = useCallback(async () => {
    try {
      // Header stays mounted across city-page navigation; this rail remounts.
      // Honor the last city the user picked so back/refresh does not snap to GPS (e.g. Noida).
      const savedCity = readSavedHeaderCity();
      if (savedCity) {
        cityOverrideRef.current = savedCity;
        citySourceRef.current = "manual";
        await fetchForCity(savedCity, {
          fallbackToNcrOnEmpty: false,
          preserveItemsOnEmpty: false,
        });
        return;
      }

      const { city, source } = await resolveDeviceCity();
      if (citySourceRef.current === "gps" || citySourceRef.current === "manual") {
        return;
      }
      if (!city) {
        cityOverrideRef.current = DEFAULT_CITY_WITHOUT_LOCATION;
        citySourceRef.current = "ip";
        await fetchForCity(DEFAULT_CITY_WITHOUT_LOCATION);
        return;
      }
      cityOverrideRef.current = city;
      citySourceRef.current = source || "ip";
      await fetchForCity(city, { fallbackToNcrOnEmpty: source !== "gps" });
    } catch {
      if (citySourceRef.current === "gps" || citySourceRef.current === "manual") return;
      cityOverrideRef.current = DEFAULT_CITY_WITHOUT_LOCATION;
      citySourceRef.current = "ip";
      await fetchForCity(DEFAULT_CITY_WITHOUT_LOCATION);
    }
  }, [fetchForCity]);

  useEffect(() => {
    applyDetectedCity();
  }, [applyDetectedCity]);

  useEffect(() => {
    const handleCityChanged = (e) => {
      const cityName = cityNameFromEvent(e.detail);
      if (!cityName) return;
      const source = String(e.detail?.source || "manual").trim() || "manual";

      if (source === "ip" && (citySourceRef.current === "gps" || citySourceRef.current === "manual")) {
        return;
      }

      // Stale GPS must not replace the city the user already picked (still in storage).
      const savedCity = readSavedHeaderCity();
      if (
        source === "gps" &&
        citySourceRef.current === "manual" &&
        savedCity &&
        savedCity.toLowerCase() !== cityName.toLowerCase()
      ) {
        return;
      }

      // Keep a specific GPS/manual city if header later falls back to Delhi NCR.
      if (
        isDelhiNcrLabel(cityName) &&
        cityOverrideRef.current &&
        !isDelhiNcrLabel(cityOverrideRef.current)
      ) {
        return;
      }

      cityOverrideRef.current = cityName;
      citySourceRef.current = source;

      if (isDelhiNcrLabel(cityName) && fallbackItemsRef.current?.length > 0) {
        setActiveCity(cityName);
        return;
      }

      // Explicit header city pick — never substitute Delhi NCR or keep prior city cards.
      fetchForCity(cityName, {
        fallbackToNcrOnEmpty: false,
        preserveItemsOnEmpty: false,
      });
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
        eagerImageCount={eagerImageCount}
      />
    </section>
  );
}
