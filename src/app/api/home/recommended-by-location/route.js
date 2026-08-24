import { NextResponse } from "next/server";
import {
  buildLatestProjectsForRegion,
  buildMixedRecommendationsForRegion,
  buildNewLaunchProjectsForRegion,
  buildSubtitleForRegion,
  buildSubtitleLatestProjectsNear,
  buildSubtitleNewLaunchesNear,
  fetchSpotlightDataForApi,
  isNewLaunchProject,
  normalizeProjectsArray,
  normalizePlaceToken,
  projectLatestTimestamp,
} from "@/app/(home)/components/home/recommendedSpotlight";
import {
  DELHI_NCR_POPULAR_PROJECT_SLUGS,
  isDelhiNcrRegion,
  isDelhiNcrUmbrellaLabel,
  POPULAR_PROMO_MAX_ITEMS,
  resolvePopularProjectsFromSlugs,
  scopeHomeProjectsForLocation,
} from "@/app/_global_components/popularRightNowProjects";
import { slimProjectListForListing } from "@/lib/slimProjectListing";

function parseCoord(value) {
  const n = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : null;
}

function norm(s) {
  return normalizePlaceToken(s);
}

function mergeGeoTokens(...groups) {
  const set = new Set();
  for (const g of groups) {
    if (!g) continue;
    if (Array.isArray(g)) {
      for (const x of g) {
        const n = norm(x);
        if (n.length >= 3) set.add(n);
      }
    } else {
      const n = norm(g);
      if (n.length >= 3) set.add(n);
    }
  }
  return [...set];
}

function addCommaSplitTokens(set, str) {
  if (!str || typeof str !== "string") return;
  for (const part of str.split(",")) {
    const n = norm(part);
    if (n.length >= 3) set.add(n);
  }
}

const GOOGLE_TOKEN_TYPES = new Set([
  "locality",
  "sublocality",
  "sublocality_level_1",
  "sublocality_level_2",
  "sublocality_level_3",
  "neighborhood",
  "administrative_area_level_3",
  "administrative_area_level_2",
  "administrative_area_level_1",
  "premise",
  "point_of_interest",
]);

function tokensFromGoogleComponents(components) {
  const set = new Set();
  if (!Array.isArray(components)) return set;
  for (const c of components) {
    if (!Array.isArray(c.types) || typeof c.long_name !== "string") continue;
    if (!c.types.some((t) => GOOGLE_TOKEN_TYPES.has(t))) continue;
    const n = norm(c.long_name);
    if (n.length >= 3) set.add(n);
  }
  return set;
}

/**
 * East of the Yamuna through Noida / Greater Noida / YEIDA.
 * Intentionally looser than Delhi-proper so Sector 14–18 and Noida border GPS still count.
 */
function isLikelyNoidaGreaterNoidaArea(lat, lon) {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    lat >= 28.34 &&
    lat <= 28.76 &&
    lon >= 77.26 &&
    lon <= 77.75
  );
}

function placeBlob(region) {
  return norm(
    [region?.city, region?.state, region?.formattedAddress, ...(region?.geoTokens || [])]
      .filter(Boolean)
      .join(" "),
  );
}

function cityFromNoidaHints(blob) {
  if (blob.includes("greater noida")) return "Greater Noida";
  if (blob.includes("noida")) return "Noida";
  if (blob.includes("gautam") && blob.includes("nagar")) return "Noida";
  if (blob.includes("yeida") || blob.includes("surajpur")) return "Noida";
  return "";
}

/**
 * Google often puts "Delhi" / "New Delhi" in formatted_address even for Noida Sector 142.
 * Those tokens still match Delhi projects at tier 1 — remove them when coords are clearly east NCR.
 */
function stripMisleadingDelhiTokensInNcrEast(lat, lon, tokens) {
  if (!isLikelyNoidaGreaterNoidaArea(lat, lon) || !Array.isArray(tokens)) return tokens;
  return tokens.filter((t) => {
    const n = norm(t);
    if (n.includes("delhi")) return false;
    if (n === "ncr" || n === "national capital territory") return false;
    return true;
  });
}

/**
 * If coords sit in the Noida–Greater Noida band but reverse geocode says Delhi,
 * bias toward Noida + UP so listings match your project data.
 */
function correctNcrBias(lat, lon, region) {
  if (!region) return region;

  const c = norm(region.city);
  const s = norm(region.state);
  const blob = placeBlob(region);

  if (blob.includes("ghaziabad") && !blob.includes("noida")) return region;

  const noidaCity = cityFromNoidaHints(blob);
  if (noidaCity) {
    return { ...region, city: noidaCity, state: region.state || "Uttar Pradesh" };
  }

  if (!isLikelyNoidaGreaterNoidaArea(lat, lon)) return region;

  if (c.includes("noida") || c.includes("greater noida")) return region;

  const saidDelhi =
    c.includes("delhi") ||
    s.includes("delhi") ||
    s === "national capital territory of delhi" ||
    s === "ncr" ||
    isDelhiNcrUmbrellaLabel(region.city);

  const saidUp = s.includes("uttar pradesh") || s === "up";

  if (saidDelhi || !c || c.length < 2 || saidUp) {
    return { ...region, city: "Noida", state: region.state || "Uttar Pradesh" };
  }

  return region;
}

function googleGeocodeCityState(components) {
  if (!Array.isArray(components)) return { city: "", state: "" };

  const longName = (type) => {
    const x = components.find((c) => Array.isArray(c.types) && c.types.includes(type));
    return typeof x?.long_name === "string" ? x.long_name.trim() : "";
  };

  const allNames = components
    .map((x) => (typeof x?.long_name === "string" ? x.long_name : ""))
    .join(" ")
    .toLowerCase();

  let city =
    longName("locality") ||
    longName("sublocality_level_1") ||
    longName("neighborhood") ||
    longName("administrative_area_level_3") ||
    longName("postal_town") ||
    longName("administrative_area_level_2");

  const state = longName("administrative_area_level_1");

  if (allNames.includes("greater noida")) {
    city = "Greater Noida";
  } else if (allNames.includes("noida") && !norm(city).includes("noida")) {
    city = "Noida";
  } else if (allNames.includes("gautam buddha nagar") || allNames.includes("gautam buddh nagar")) {
    if (!norm(city).includes("noida")) city = "Noida";
  }

  return { city, state };
}

function regionFromGoogleResult(result) {
  const { city, state } = googleGeocodeCityState(result.address_components);
  const tokenSet = tokensFromGoogleComponents(result.address_components);
  addCommaSplitTokens(tokenSet, result.formatted_address);
  if (city) tokenSet.add(norm(city));
  if (state) tokenSet.add(norm(state));

  return {
    city,
    state,
    formattedAddress: typeof result.formatted_address === "string" ? result.formatted_address : "",
    geoTokens: [...tokenSet],
  };
}

function scoreGoogleRegion(region) {
  const blob = placeBlob(region);
  if (blob.includes("greater noida")) return 100;
  if (blob.includes("noida")) return 90;
  if (blob.includes("gautam") && blob.includes("nagar")) return 80;
  if (region.city && !norm(region.city).includes("delhi")) return 30;
  if (region.city) return 10;
  return 0;
}

async function reverseGeocodeGoogle(lat, lon, apiKey) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lon}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "en");

  const res = await fetch(url.toString(), {
    next: { revalidate: 86_400 },
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== "OK" || !Array.isArray(data.results) || data.results.length === 0) {
    return null;
  }

  let best = null;
  let bestScore = -1;
  for (const result of data.results) {
    if (!Array.isArray(result?.address_components)) continue;
    const region = regionFromGoogleResult(result);
    const score = scoreGoogleRegion(region);
    if (score > bestScore) {
      best = region;
      bestScore = score;
    }
    if (score >= 90) break;
  }

  if (!best) return null;

  return {
    ...best,
    source: "google",
  };
}

function extractFromNominatimAddress(data) {
  const a = data?.address || {};
  const blob = Object.values(a)
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();

  let city =
    a.city ||
    a.town ||
    a.village ||
    a.suburb ||
    a.hamlet ||
    a.city_district ||
    a.county ||
    "";
  city = typeof city === "string" ? city.trim() : "";

  if (blob.includes("greater noida")) {
    city = "Greater Noida";
  } else if (blob.includes("noida") && !norm(city).includes("noida")) {
    city = "Noida";
  }

  const state = typeof a.state === "string" ? a.state.trim() : "";

  const tokenSet = new Set();
  for (const v of Object.values(a)) {
    if (typeof v === "string" && v.trim()) {
      tokenSet.add(norm(v));
      addCommaSplitTokens(tokenSet, v);
    }
  }
  addCommaSplitTokens(tokenSet, data?.display_name);
  if (city) tokenSet.add(norm(city));
  if (state) tokenSet.add(norm(state));

  return {
    city,
    state,
    source: "nominatim",
    geoTokens: [...tokenSet],
  };
}

async function reverseGeocodeNominatim(lat, lon) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "MyPropertyFact/1.0 (https://mypropertyfact.com)",
    },
    next: { revalidate: 86_400 },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return extractFromNominatimAddress(data);
}

async function reverseGeocodeFull(lat, lon) {
  const googleKey =
    process.env.GOOGLE_MAPS_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

  if (googleKey) {
    const fromGoogle = await reverseGeocodeGoogle(lat, lon, googleKey);
    if (fromGoogle && (fromGoogle.city || fromGoogle.state || fromGoogle.geoTokens?.length)) {
      return fromGoogle;
    }
  }

  const fromOsm = await reverseGeocodeNominatim(lat, lon);
  if (fromOsm && (fromOsm.city || fromOsm.state || fromOsm.geoTokens?.length)) {
    return fromOsm;
  }

  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseCoord(searchParams.get("lat"));
    const lon = parseCoord(searchParams.get("lon"));
    const _accuracyM = parseCoord(searchParams.get("accuracy"));
    /** `mixed` = projects + public listings. `projects` = new-launch projects near coords. `latest-projects` = MPF projects only, newest-first (home Recommended Projects row). `popular-promo` = curated Delhi-NCR tick list or area projects for other cities (home Popular right now popup). */
    const intent = searchParams.get("intent") || "mixed";
    const selectedCity = (searchParams.get("city") || "").trim();
    if (!selectedCity) {
      if (
        lat == null ||
        lon == null ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid lat and lon are required",
          },
          { status: 400 }
        );
      }
    }

    let rawRegion;

    if (selectedCity) {
      rawRegion = {
        city: selectedCity,
        state: "",
        source: "dropdown",
        geoTokens: [normalizePlaceToken(selectedCity)],
      };
    } else {
      rawRegion = await reverseGeocodeFull(lat, lon);

      if (!rawRegion) {
        return NextResponse.json({
          success: false,
          message: "Could not resolve location",
          items: [],
        });
      }
    }

    const regionBiased = selectedCity
  ? rawRegion
  : correctNcrBias(lat, lon, rawRegion);
    let geoTokens = mergeGeoTokens(
      regionBiased.geoTokens,
      regionBiased.city,
      regionBiased.state,
    );
    geoTokens = stripMisleadingDelhiTokensInNcrEast(lat, lon, geoTokens);

    const region = {
      city: regionBiased.city,
      state: regionBiased.state,
      source: regionBiased.source,
      geoTokens,
    };

    if (!region.city && !region.state && geoTokens.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Could not resolve location",
        items: [],
      });
    }

    const { projects, latestPublicListings } = await fetchSpotlightDataForApi();

    if (intent === "projects") {
      const newLaunchProjects = normalizeProjectsArray(projects).filter(isNewLaunchProject);
      const locationScope = scopeHomeProjectsForLocation({
        projects: newLaunchProjects,
        city: region.city,
        state: region.state,
        geoTokens,
        lat,
        lon,
        source: region.source,
      });

      const items = slimProjectListForListing(
        buildNewLaunchProjectsForRegion({
          projects: locationScope.projects,
          excludeSlugSet: new Set(),
          geoCity: locationScope.geoCity,
          geoState: locationScope.geoState,
          geoTokens: locationScope.geoTokens,
          limit: 8,
          strictRegion: Boolean(locationScope.strict),
        }),
      );

      const displayCity =
        region.city && !isDelhiNcrUmbrellaLabel(region.city)
          ? region.city
          : locationScope.label;

      let subtitle = buildSubtitleNewLaunchesNear(displayCity, "").trim();
      if (!subtitle) subtitle = "Explore New Residential & Commercial Properties near Delhi NCR";

      return NextResponse.json({
        success: true,
        items,
        subtitle,
        region: {
          city: displayCity,
          state: region.state,
          source: region.source,
          ...(typeof _accuracyM === "number" && _accuracyM > 0 ? { accuracyM: _accuracyM } : {}),
        },
      });
    }

    if (intent === "latest-projects") {
      const locationScope = scopeHomeProjectsForLocation({
        projects: normalizeProjectsArray(projects),
        city: region.city,
        state: region.state,
        geoTokens,
        lat,
        lon,
        source: region.source,
      });

      const items = slimProjectListForListing(
        buildLatestProjectsForRegion({
          projects: locationScope.projects,
          excludeSlugSet: new Set(),
          geoCity: locationScope.geoCity,
          geoState: locationScope.geoState,
          geoTokens: locationScope.geoTokens,
          limit: 8,
          strictRegion: Boolean(locationScope.strict),
        }),
      );

      const displayCity =
        region.city && !isDelhiNcrUmbrellaLabel(region.city)
          ? region.city
          : locationScope.label;

      let subtitle = buildSubtitleLatestProjectsNear(displayCity, "").trim();
      if (!subtitle) subtitle = "Explore the Best-Selling Properties Today nearby Delhi NCR";

      return NextResponse.json({
        success: true,
        items,
        subtitle,
        region: {
          city: displayCity,
          state: region.state,
          source: region.source,
          ...(typeof _accuracyM === "number" && _accuracyM > 0 ? { accuracyM: _accuracyM } : {}),
        },
      });
    }

    if (intent === "popular-promo") {
      const allProjects = normalizeProjectsArray(projects);
      const inDelhiNcr = isDelhiNcrRegion(
        region.city,
        region.state,
        geoTokens,
        lat,
        lon,
      );

      let items;
      if (inDelhiNcr) {
        items = resolvePopularProjectsFromSlugs(
          allProjects,
          DELHI_NCR_POPULAR_PROJECT_SLUGS,
          POPULAR_PROMO_MAX_ITEMS,
        );
      } else {
        const baseArgs = {
          projects: allProjects,
          excludeSlugSet: new Set(),
          geoTokens,
          limit: POPULAR_PROMO_MAX_ITEMS,
        };

        items = buildLatestProjectsForRegion({
          ...baseArgs,
          geoCity: region.city,
          geoState: region.state,
        });

        if (items.length === 0 && region.state) {
          items = buildLatestProjectsForRegion({
            ...baseArgs,
            geoCity: "",
            geoState: region.state,
          });
        }

        if (items.length === 0 && geoTokens.length > 0) {
          items = buildLatestProjectsForRegion({
            ...baseArgs,
            geoCity: "",
            geoState: "",
          });
        }
      }

      return NextResponse.json({
        success: items.length > 0,
        items,
        region: {
          city: region.city,
          state: region.state,
          source: region.source,
          isDelhiNcr: inDelhiNcr,
          ...(typeof _accuracyM === "number" && _accuracyM > 0 ? { accuracyM: _accuracyM } : {}),
        },
      });
    }

    const list = normalizeProjectsArray(projects);
    const projectsSortedLatest = [...list]
      .filter((p) => p?.slugURL && p?.projectName)
      .sort((a, b) => projectLatestTimestamp(b) - projectLatestTimestamp(a));
    const recommendedTop = projectsSortedLatest.slice(0, 8);
    const excludeSlugSet = new Set(recommendedTop.map((p) => p.slugURL));

    const baseArgs = {
      projects,
      latestPublicListings,
      excludeSlugSet,
      geoTokens,
      limit: 8,
    };

    let items = buildMixedRecommendationsForRegion({
      ...baseArgs,
      geoCity: region.city,
      geoState: region.state,
    });

    if (items.length === 0 && region.state) {
      items = buildMixedRecommendationsForRegion({
        ...baseArgs,
        geoCity: "",
        geoState: region.state,
      });
    }

    if (items.length === 0 && geoTokens.length > 0) {
      items = buildMixedRecommendationsForRegion({
        ...baseArgs,
        geoCity: "",
        geoState: "",
      });
    }

    const subtitle = buildSubtitleForRegion(region.city, region.state);

    return NextResponse.json({
      success: true,
      items,
      subtitle,
      region: {
        city: region.city,
        state: region.state,
        source: region.source,
        ...(typeof _accuracyM === "number" && _accuracyM > 0 ? { accuracyM: _accuracyM } : {}),
      },
    });
  } catch (error) {
    console.error("recommended-by-location:", error);
    return NextResponse.json(
      { success: false, message: "Failed to build recommendations", items: [] },
      { status: 500 },
    );
  }
}
