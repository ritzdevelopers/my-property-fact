import { notFound } from "next/navigation";
import PropertyDetailClient from "./propertyDetailClient";
import {
  getPropertyIdFromSlug,
  projectSlugFromPropertyName,
} from "./propertySlugUtils";
import SeoNarrative from "@/app/_global_components/seo/SeoNarrative";

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

/** Keep only catalog rows needed for this listing (shrinks RSC/HTML payload vs full get-all). */
function selectAmenitiesForProperty(property, allAmenities) {
  if (!property || !Array.isArray(allAmenities) || !allAmenities.length) {
    return [];
  }
  if (property.amenityIds?.length) {
    const idSet = new Set(property.amenityIds.map((id) => String(id)));
    return allAmenities.filter((a) => a?.id != null && idSet.has(String(a.id)));
  }
  if (property.amenityNames?.length) {
    return allAmenities.filter((amenity) =>
      property.amenityNames.some(
        (name) =>
          name?.toLowerCase() === String(amenity?.title ?? "").toLowerCase(),
      ),
    );
  }
  return [];
}

function selectFeaturesForProperty(property, allFeatures) {
  if (!property || !Array.isArray(allFeatures) || !allFeatures.length) {
    return [];
  }
  if (property.featureIds?.length) {
    const idSet = new Set(property.featureIds.map((id) => String(id)));
    return allFeatures.filter((f) => f?.id != null && idSet.has(String(f.id)));
  }
  if (property.featureNames?.length) {
    return allFeatures.filter((feature) =>
      property.featureNames.some(
        (name) =>
          name?.toLowerCase() === String(feature?.title ?? "").toLowerCase(),
      ),
    );
  }
  return [];
}

function selectNearbyCatalogForProperty(property, allNearby) {
  if (!property?.nearbyBenefits?.length || !Array.isArray(allNearby)) {
    return [];
  }
  const idKeys = new Set(
    property.nearbyBenefits
      .map((b) => b?.id)
      .filter((id) => id != null && id !== "")
      .map((id) => String(id)),
  );
  if (!idKeys.size) return [];
  return allNearby.filter(
    (b) => b?.id != null && idKeys.has(String(b.id)),
  );
}

/** Drop heavy fields from listing API objects (only fields used on this page). */
function slimRelatedPropertyPayload(p) {
  if (!p || typeof p !== "object") return p;
  const urls = Array.isArray(p.imageUrls) ? p.imageUrls : [];
  return {
    id: p.id,
    title: p.title,
    locality: p.locality,
    city: p.city,
    bedrooms: p.bedrooms,
    totalPrice: p.totalPrice,
    carpetArea: p.carpetArea,
    builtUpArea: p.builtUpArea,
    status: p.status,
    imageUrls: urls.length ? [urls[0]] : [],
    totalImageCount: urls.length,
  };
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
        .map(slimRelatedPropertyPayload)
    : [];

  const allAmenities = Array.isArray(amenities) ? amenities : [];
  const allFeatures = Array.isArray(features) ? features : [];
  const allNearby = Array.isArray(nearbyRaw) ? nearbyRaw : [];

  const amenitiesCatalogForProperty = selectAmenitiesForProperty(
    property,
    allAmenities,
  );
  const featuresCatalogForProperty = selectFeaturesForProperty(
    property,
    allFeatures,
  );
  const nearbyCatalogForProperty = selectNearbyCatalogForProperty(
    property,
    allNearby,
  );

  let projectDetails = null;
  const pSlug = projectSlugFromPropertyName(property.projectName);
  if (pSlug) {
    const proj = await fetchJson(`${base}/projects/get/${pSlug}`);
    if (proj?.projectName) projectDetails = proj;
  }

  const seoSummary = [
    property?.metaDescription,
    property?.title,
    property?.projectName,
    property?.locality,
    property?.city,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <SeoNarrative>{seoSummary}</SeoNarrative>
      <PropertyDetailClient
      slug={slug}
      initialProperty={property}
      initialRelatedProperties={relatedList}
      initialAllAmenities={amenitiesCatalogForProperty}
      initialAllFeatures={featuresCatalogForProperty}
      initialAllNearbyBenefits={nearbyCatalogForProperty}
      initialProjectDetails={projectDetails}
    />
    </>
  );
}
