/**
 * Reverse geocode lat/lng to a human-readable address (server-side).
 * Used by lead tracking and home recommendations.
 */

function pickComponent(components, type) {
  const c = components.find((item) => item.types?.includes(type));
  return c?.long_name ?? c?.short_name ?? "";
}

export function parseGoogleGeocodeResult(result) {
  const components = result?.address_components ?? [];
  const streetNumber = pickComponent(components, "street_number");
  const route = pickComponent(components, "route");
  const sublocality =
    pickComponent(components, "sublocality_level_1") ||
    pickComponent(components, "sublocality") ||
    pickComponent(components, "neighborhood");
  const city =
    pickComponent(components, "locality") ||
    pickComponent(components, "administrative_area_level_2");
  const state = pickComponent(components, "administrative_area_level_1");
  const pincode = pickComponent(components, "postal_code");
  const country = pickComponent(components, "country");

  const street = [streetNumber, route].filter(Boolean).join(" ").trim();
  const formatted =
    typeof result?.formatted_address === "string" ? result.formatted_address : "";

  return {
    formatted_address: formatted || [street, sublocality, city, state, pincode].filter(Boolean).join(", "),
    street: street || null,
    locality: sublocality || null,
    area: sublocality || null,
    city: city || null,
    state: state || null,
    pincode: pincode || null,
    country: country || null,
    source: "google",
  };
}

export function parseNominatimResult(data) {
  const a = data?.address ?? {};
  const streetNumber = a.house_number ?? "";
  const route = a.road ?? "";
  const street = [streetNumber, route].filter(Boolean).join(" ").trim();
  const locality =
    a.suburb || a.neighbourhood || a.residential || a.quarter || a.city_district || "";
  const city = a.city || a.town || a.village || a.county || "";
  const state = a.state ?? "";
  const pincode = a.postcode ?? "";
  const country = a.country ?? "";
  const formatted = typeof data?.display_name === "string" ? data.display_name : "";

  return {
    formatted_address:
      formatted || [street, locality, city, state, pincode].filter(Boolean).join(", "),
    street: street || null,
    locality: locality || null,
    area: locality || null,
    city: city || null,
    state: state || null,
    pincode: pincode || null,
    country: country || null,
    source: "nominatim",
  };
}

export async function reverseGeocodeGoogle(lat, lon, apiKey) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lon}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "en");

  const res = await fetch(url.toString(), { next: { revalidate: 86_400 } });
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "OK" || !data.results?.[0]) return null;

  return parseGoogleGeocodeResult(data.results[0]);
}

export async function reverseGeocodeNominatim(lat, lon) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "MyPropertyFact/1.0 (lead-tracking)" },
    next: { revalidate: 86_400 },
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.address) return null;

  return parseNominatimResult(data);
}

export async function reverseGeocodeCoordinates(lat, lon) {
  const googleKey =
    process.env.GOOGLE_MAPS_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

  if (googleKey) {
    const fromGoogle = await reverseGeocodeGoogle(lat, lon, googleKey);
    if (fromGoogle?.formatted_address) return fromGoogle;
  }

  return reverseGeocodeNominatim(lat, lon);
}
