import { notFound } from "next/navigation";
import PropertyDetailClient from "./propertyDetailClient";
import {
  getPropertyIdFromSlug,
  projectSlugFromPropertyName,
} from "./propertySlugUtils";

function apiRoot() {
  const u = process.env.NEXT_PUBLIC_API_URL || "";
  if (!u) return "";
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

async function fetchJson(url) {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params;
  const propertyId = getPropertyIdFromSlug(slug);
  if (!propertyId) notFound();

  const base = apiRoot();
  if (!base) notFound();

  const [propertyRes, relatedRes, amenities, features, nearbyRaw] =
    await Promise.all([
      fetchJson(`${base}/public/properties/${propertyId}`),
      fetchJson(`${base}/public/properties?limit=4`),
      fetchJson(`${base}/amenity/get-all`),
      fetchJson(`${base}/feature/get-all`),
      fetchJson(`${base}/nearby-benefit/get-all`),
    ]);

  if (!propertyRes?.success || !propertyRes?.property) {
    notFound();
  }

  const property = propertyRes.property;
  const relatedList = Array.isArray(relatedRes?.properties)
    ? relatedRes.properties
        .filter((p) => String(p.id) !== String(propertyId))
        .slice(0, 4)
    : [];

  const allAmenities = Array.isArray(amenities) ? amenities : [];
  const allFeatures = Array.isArray(features) ? features : [];
  const allNearby = Array.isArray(nearbyRaw) ? nearbyRaw : [];

  let projectDetails = null;
  const pSlug = projectSlugFromPropertyName(property.projectName);
  if (pSlug) {
    const proj = await fetchJson(`${base}/projects/get/${pSlug}`);
    if (proj?.projectName) projectDetails = proj;
  }

  return (
    <PropertyDetailClient
      slug={slug}
      initialProperty={property}
      initialRelatedProperties={relatedList}
      initialAllAmenities={allAmenities}
      initialAllFeatures={allFeatures}
      initialAllNearbyBenefits={allNearby}
      initialProjectDetails={projectDetails}
    />
  );
}
