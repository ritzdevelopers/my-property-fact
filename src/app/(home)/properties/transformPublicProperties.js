/**
 * Shared transform for `public/properties` API rows (server or build-time safe).
 */
export function transformPublicPropertyList(apiProperties) {
  if (!Array.isArray(apiProperties)) return [];

  return apiProperties.map((property) => {
    const locationParts = [];
    if (property.address) locationParts.push(property.address);
    if (property.locality) locationParts.push(property.locality);
    if (property.city) locationParts.push(property.city);

    const formatPrice = (price) => {
      if (!price && price !== 0) return "Price on request";
      const numPrice = typeof price === "string" ? parseFloat(price) : price;
      if (isNaN(numPrice)) return "Price on request";
      if (numPrice >= 10000000) {
        return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
      }
      if (numPrice >= 100000) {
        return `₹${(numPrice / 100000).toFixed(2)} L`;
      }
      return `₹${Math.round(numPrice).toLocaleString("en-IN")}`;
    };

    const formatPricePerSqft = (price) => {
      if (!price) return null;
      return `₹${Math.round(price).toLocaleString("en-IN")} per sqft`;
    };

    const getBedroomLabel = (bedrooms) => {
      if (!bedrooms) return null;
      if (bedrooms === 1) return "1 RK/1 BHK";
      return `${bedrooms} BHK`;
    };

    const mapStatus = (status) => {
      if (!status) return null;
      if (status.toLowerCase().includes("ready")) return "Ready to move";
      if (status.toLowerCase().includes("construction")) return "Under Construction";
      return "New Launch";
    };

    const generateSlug = (title, id) => {
      if (!title) return id.toString();
      return (
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        id
      );
    };

    const propertyTitle =
      property.title ||
      `${getBedroomLabel(property.bedrooms) || ""} ${property.subType || "Property"}`.trim();

    return {
      id: property.id,
      slug: generateSlug(propertyTitle, property.id),
      title: propertyTitle,
      location:
        locationParts.filter(Boolean).join(", ") || "Location not specified",
      price: formatPrice(property.totalPrice),
      pricePerSqft: formatPricePerSqft(property.pricePerSqft),
      area:
        property.carpetArea ||
        property.builtUpArea ||
        property.superBuiltUpArea ||
        property.plotArea,
      areaLabel: property.carpetArea
        ? "Carpet Area"
        : property.builtUpArea
          ? "Built-up Area"
          : property.superBuiltUpArea
            ? "Super Built-up Area"
            : "Plot Area",
      bedrooms: property.bedrooms,
      bedroom: getBedroomLabel(property.bedrooms),
      bathrooms: property.bathrooms,
      balconies: property.balconies,
      facing: property.facing,
      status: property.status,
      constructionStatus: mapStatus(property.status),
      transaction: property.transaction,
      listingType: property.listingType,
      subType: property.subType,
      propertyTypeCategory:
        property.subType === "Apartment" || property.subType === "Flat"
          ? "Residential Apartment"
          : property.subType || "Residential Apartment",
      furnished: property.furnished,
      image:
        property.imageUrls && property.imageUrls.length > 0
          ? property.imageUrls[0]
          : null,
      imageCount: property.imageUrls ? property.imageUrls.length : 0,
      postedDate: property.createdAt
        ? new Date(property.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null,
      verified: property.approvalStatus === "APPROVED",
      numericPrice: property.totalPrice || 0,
      raw: property,
    };
  });
}
