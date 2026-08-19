"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faMapMarkerAlt,
  faCheck,
  faUser,
  faBriefcase,
  faShieldHalved,
  faHouseChimney,
  faXmark,
  faCircleInfo,
  faSearchPlus,
  faSearchMinus,
  faChevronLeft,
  faChevronRight,
  faExpand,
  faCamera,
  faVideo,
  faRulerCombined,
  faBed,
  faBath,
  faIndianRupeeSign,
  faBuilding,
  faClock,
  faStar,
  faRoad,
} from "@fortawesome/free-solid-svg-icons";
import {
  Spinner,
  Alert,
  Button,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import axios from "axios";
import "./property-detail.css";
import "./property-listing-pdp.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function resolveListerType(property) {
  const raw = String(
    property?.listerType ||
      property?.userType ||
      property?.postedBy ||
      "",
  ).toUpperCase();
  if (/BROKER|DEALER|AGENT/.test(raw)) return "BROKER";
  if (/OWNER/.test(raw)) return "OWNER";
  if (property?.userExperience || Number(property?.userTotalDeals) > 0) {
    return "BROKER";
  }
  return "OWNER";
}

export default function PropertyDetailClient({
  slug: slugProp,
  initialProperty,
  initialRelatedProperties = [],
  initialAllAmenities = [],
  initialAllFeatures = [],
  initialAllNearbyBenefits = [],
  initialProjectDetails = null,
}) {
  const params = useParams();
  const router = useRouter();
  const slug = slugProp ?? params?.slug;
  const [property, setProperty] = useState(initialProperty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [relatedProperties, setRelatedProperties] = useState(
    initialRelatedProperties,
  );
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [allAmenities, setAllAmenities] = useState(initialAllAmenities);
  const [allFeatures, setAllFeatures] = useState(initialAllFeatures);
  const [allNearbyBenefits, setAllNearbyBenefits] = useState(
    initialAllNearbyBenefits,
  );
  const [projectDetails, setProjectDetails] = useState(initialProjectDetails);
  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    setProperty(initialProperty);
    setRelatedProperties(initialRelatedProperties);
    setAllAmenities(initialAllAmenities);
    setAllFeatures(initialAllFeatures);
    setAllNearbyBenefits(initialAllNearbyBenefits);
    setProjectDetails(initialProjectDetails);
    setError(null);
  }, [
    initialProperty,
    initialRelatedProperties,
    initialAllAmenities,
    initialAllFeatures,
    initialAllNearbyBenefits,
    initialProjectDetails,
  ]);

  // Tooltips for nearby benefits
  const NearbyBenefitsTooltip = (props) => (
    <Tooltip id="nearby-benefits-tooltip" {...props} className="custom-tooltip">
      <div style={{ textAlign: "left", maxWidth: "300px" }}>
        All nearby landmarks that are mentioned on this page are done so at the
        sole discretion of the publisher of this listing. Distances mentioned
        for all landmarks are to be considered approximate values at best. We
        recommend that you do your own research before making any purchase
        decisions.
      </div>
    </Tooltip>
  );

  // Tooltips for amenities
  const AmenitiesTooltip = (props) => (
    <Tooltip id="amenities-tooltip" {...props} className="custom-tooltip">
      <div style={{ textAlign: "left", maxWidth: "300px" }}>
        All amenities that are mentioned on this page are done so at the sole
        discretion of the publisher of this listing. We recommend that you do
        your own research before making any purchase decisions.
      </div>
    </Tooltip>
  );

  // Tooltpips for projects features
  const FeaturesTooltip = (props) => (
    <Tooltip id="features-tooltip" {...props} className="custom-tooltip">
      <div style={{ textAlign: "left", maxWidth: "300px" }}>
        All furnishings that are mentioned on this page are done so at the sole
        discretion of the publisher of this listing. We recommend that you do
        your own research before making any purchase decisions.
      </div>
    </Tooltip>
  );

  // Extract ID from slug (slug format: title-id or just id)
  const propertyId = slug
    ? (() => {
        const slugStr = slug.toString();
        // Try to extract ID from end of slug (after last hyphen)
        const parts = slugStr.split("-");
        const lastPart = parts[parts.length - 1];
        // Check if last part is a number
        if (!isNaN(lastPart) && lastPart !== "") {
          return parseInt(lastPart);
        }
        // If not, try parsing the whole slug as ID
        return !isNaN(slugStr) ? parseInt(slugStr) : null;
      })()
    : null;

  useEffect(() => {
    document.body.classList.add("mpf-pdp-listing");
    return () => document.body.classList.remove("mpf-pdp-listing");
  }, []);

  // Smooth scroll behavior
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [propertyId]);

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 156; // site header + sticky section tabs
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Scroll spy to update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "overview-section", tab: "Overview" },
        { id: "dealer-section", tab: "Dealer Details" },
        { id: "price-trends-section", tab: "Price Trends" },
        { id: "locality-section", tab: "Explore Locality" },
        { id: "recommendation-section", tab: "Articles" },
      ];

      const scrollPosition = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section) {
          const sectionTop = section.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveTab(sections[i].tab);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [property]);

  // Function for handle submit contact form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}public/properties/lead`,
        {
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message,
          propertyId: propertyId,
        },
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        setContactForm({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => {
          setShowContactModal(false);
          setSubmitSuccess(false);
        }, 2000);
      } else {
        setSubmitError(
          response.data.message ||
            "Failed to submit inquiry. Please try again.",
        );
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setSubmitError(
        err.response?.data?.message ||
          "Failed to submit inquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Setting form data from input fields
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function for getting image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    let cleanImageUrl = imageUrl;
    if (cleanImageUrl.match(/^[A-Za-z]:[\/\\]/)) {
      const propertyListingsIndex = cleanImageUrl
        .toLowerCase()
        .indexOf("property-listings");
      if (propertyListingsIndex !== -1) {
        cleanImageUrl = cleanImageUrl.substring(propertyListingsIndex);
      } else {
        return null;
      }
    }

    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }
    if (cleanImageUrl.startsWith("uploads/")) {
      cleanImageUrl = cleanImageUrl.replace("uploads/", "");
    }

    const pathParts = cleanImageUrl.split("/");
    if (pathParts.length >= 3 && pathParts[0] === "property-listings") {
      const listingId = pathParts[1];
      const filename = pathParts.slice(2).join("/");
      return `${API_BASE_URL}get/images/property-listings/${listingId}/${filename}`;
    }
    return null;
  };

  // Function for formatting price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "Price on request";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "Price on request";
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(numPrice).toLocaleString("en-IN")}`;
  };

  // Function for formatting area
  const formatArea = (area, showSqM = false) => {
    if (area === null || area === undefined || area === "") return null;
    const numericArea = typeof area === "string" ? parseFloat(area) : area;
    if (Number.isNaN(numericArea)) return null;
    if (showSqM) {
      const sqM = (numericArea * 0.092903).toFixed(2);
      return `${numericArea.toLocaleString("en-IN")} sq.ft. (${sqM} sq.m.)`;
    }
    return `${numericArea.toLocaleString("en-IN")} sq.ft.`;
  };

  // Function for formatting price per square foot
  const formatPricePerSqft = (price, perSqM = false) => {
    if (!price) return null;
    if (perSqM) {
      const pricePerSqM = (price * 10.764).toFixed(0);
      return `₹${pricePerSqM}`;
    }
    return `₹${Math.round(price).toLocaleString("en-IN")} per sq.ft.`;
  };

  // Function for getting bedroom label
  const getBedroomLabel = (bedrooms) => {
    if (!bedrooms) return null;
    if (bedrooms === 1) return "1 RK/1 BHK";
    return `${bedrooms} BHK`;
  };

  // Function for getting amenity image URL
  const getAmenityImageUrl = (amenityImageUrl) => {
    if (!amenityImageUrl) return null;
    if (
      amenityImageUrl.startsWith("http://") ||
      amenityImageUrl.startsWith("https://")
    ) {
      return amenityImageUrl;
    }
    let cleanImageUrl = amenityImageUrl;

    // Handle Windows paths
    if (cleanImageUrl.match(/^[A-Za-z]:[\/\\]/)) {
      const amenityIndex = cleanImageUrl.toLowerCase().indexOf("amenity");
      if (amenityIndex !== -1) {
        cleanImageUrl = cleanImageUrl.substring(amenityIndex);
      }
    }

    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");

    // Remove leading slashes
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }

    // Extract just the filename if there's a path
    const pathParts = cleanImageUrl.split("/");
    const filename = pathParts[pathParts.length - 1];

    // Use the amenity image endpoint
    return `${API_BASE_URL}fetch-image/amenity/${filename}`;
  };

  // Function for getting feature image URL
  const getFeatureImageUrl = (featureImageUrl) => {
    if (!featureImageUrl) return null;
    if (
      featureImageUrl.startsWith("http://") ||
      featureImageUrl.startsWith("https://")
    ) {
      return featureImageUrl;
    }
    let cleanImageUrl = featureImageUrl;

    // Handle Windows paths
    if (cleanImageUrl.match(/^[A-Za-z]:[\/\\]/)) {
      const featureIndex = cleanImageUrl.toLowerCase().indexOf("feature");
      if (featureIndex !== -1) {
        cleanImageUrl = cleanImageUrl.substring(featureIndex);
      }
    }

    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");

    // Remove leading slashes
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }

    // Extract just the filename if there's a path
    const pathParts = cleanImageUrl.split("/");
    const filename = pathParts[pathParts.length - 1];

    // Use the feature image endpoint
    return `${API_BASE_URL}fetch-image/feature/${filename}`;
  };

  // Function for getting nearby benefit image URL
  const getNearbyBenefitImageUrl = (benefitImageUrl) => {
    if (!benefitImageUrl) return null;
    if (
      benefitImageUrl.startsWith("http://") ||
      benefitImageUrl.startsWith("https://")
    ) {
      return benefitImageUrl;
    }
    let cleanImageUrl = benefitImageUrl;

    // Handle Windows paths
    if (cleanImageUrl.match(/^[A-Za-z]:[\/\\]/)) {
      const benefitIndex = cleanImageUrl
        .toLowerCase()
        .indexOf("nearby-benefit");
      if (benefitIndex !== -1) {
        cleanImageUrl = cleanImageUrl.substring(benefitIndex);
      }
    }

    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");

    // Remove leading slashes
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }

    // Extract just the filename if there's a path
    const pathParts = cleanImageUrl.split("/");
    const filename = pathParts[pathParts.length - 1];

    // Use the nearby benefit image endpoint
    return `${API_BASE_URL}fetch-image/nearby-benefit/${filename}`;
  };

  // Function for getting amenities with images for the property
  const getPropertyAmenities = () => {
    if (!property || !allAmenities.length) return [];

    // Try to match by IDs first
    if (property.amenityIds && property.amenityIds.length > 0) {
      return allAmenities.filter((amenity) =>
        property.amenityIds.includes(amenity.id),
      );
    }

    // Fallback to matching by names
    if (property.amenityNames && property.amenityNames.length > 0) {
      return allAmenities.filter((amenity) =>
        property.amenityNames.some(
          (name) => name.toLowerCase() === amenity.title?.toLowerCase(),
        ),
      );
    }

    return [];
  };

  // Function for getting features with images for the property
  const getPropertyFeatures = () => {
    if (!property || !allFeatures.length) return [];

    // Try to match by IDs first
    if (property.featureIds && property.featureIds.length > 0) {
      return allFeatures.filter((feature) =>
        property.featureIds.includes(feature.id),
      );
    }

    // Fallback to matching by names
    if (property.featureNames && property.featureNames.length > 0) {
      return allFeatures.filter((feature) =>
        property.featureNames.some(
          (name) => name.toLowerCase() === feature.title?.toLowerCase(),
        ),
      );
    }

    return [];
  };

  // Get nearby benefits for the property (already includes distance from backend)
  const getPropertyNearbyBenefits = () => {
    if (!property || !property.nearbyBenefits) return [];
    return property.nearbyBenefits;
  };

  const openLightbox = (index = 0) => {
    setLightboxImageIndex(index);
    setLightboxZoom(1);
    setShowImageLightbox(true);
  };

  const relatedSlugOf = (related) =>
    related?.title
      ? `${related.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}-${related.id}`
      : String(related?.id ?? "");

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container my-5">
        <Alert variant="danger">
          <Alert.Heading>Property Not Found</Alert.Heading>
          <p>
            {error ||
              "The property you are looking for does not exist or is not available."}
          </p>
          <Button
            variant="outline-danger"
            onClick={() => router.push("/properties")}
          >
            Back to Properties
          </Button>
        </Alert>
      </div>
    );
  }

  const allImageUrls =
    property.imageUrls && property.imageUrls.length > 0
      ? property.imageUrls.map((img) => getImageUrl(img)).filter(Boolean)
      : [];

  const locationParts = [];
  // Address removed - will be viewed elsewhere
  if (property.locality) locationParts.push(property.locality);
  if (property.city) locationParts.push(property.city);
  if (property.pincode) locationParts.push(property.pincode);

  const locationLabel = locationParts.filter(Boolean).join(", ");
  const primaryArea =
    property.superBuiltUpArea ||
    property.builtUpArea ||
    property.carpetArea ||
    property.plotArea;
  const areaLabel = formatArea(primaryArea, true) || "—";
  const configLabel = [
    property.bedrooms != null ? `${property.bedrooms} Beds` : null,
    property.bathrooms != null ? `${property.bathrooms} Baths` : null,
    property.balconies ? `${property.balconies} Balcony` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const floorLabel =
    property.floorNumber || property.totalFloors
      ? `${property.floorNumber || "—"} of ${property.totalFloors || "—"}`
      : null;
  const propertyAmenities = getPropertyAmenities();
  const propertyFeatures = getPropertyFeatures();
  const propertyNearbyBenefits = getPropertyNearbyBenefits();
  const listerType = resolveListerType(property);
  const isBroker = listerType === "BROKER";
  const posterName =
    property.contactName ||
    property.userName ||
    (isBroker ? "Property Broker" : "Property Owner");
  const ownerInitials = posterName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const highlightChips = [
    property.status,
    property.transaction ? `For ${property.transaction}` : null,
    property.furnished,
    property.facing ? `${property.facing} facing` : null,
    property.ownershipType,
    property.listingType,
    property.subType,
  ].filter(Boolean);
  const detailFacts = [
    property.listingType && {
      label: "Property Type",
      value: `${property.listingType}${property.subType ? ` · ${property.subType}` : ""}`,
    },
    property.transaction && { label: "Transaction", value: property.transaction },
    property.status && { label: "Status", value: property.status },
    property.possession && { label: "Possession", value: property.possession },
    property.occupancy && { label: "Occupancy", value: property.occupancy },
    property.ownershipType && {
      label: "Ownership",
      value: property.ownershipType,
    },
    property.furnished && { label: "Furnishing", value: property.furnished },
    property.parking && { label: "Parking", value: property.parking },
    property.noticePeriod != null && {
      label: "Notice Period",
      value: `${property.noticePeriod} ${property.noticePeriod === 1 ? "Month" : "Months"}`,
    },
    floorLabel && { label: "Floor", value: floorLabel },
    property.facing && { label: "Facing", value: property.facing },
    property.ageOfConstruction != null && {
      label: "Property Age",
      value: `${property.ageOfConstruction} to ${property.ageOfConstruction + 1} Year Old`,
    },
    property.maintenanceCharges && {
      label: "Maintenance",
      value: formatPrice(property.maintenanceCharges),
    },
    property.bookingAmount && {
      label: "Booking Amount",
      value: formatPrice(property.bookingAmount),
    },
    property.pricePerSqft && {
      label: "Price per sq.ft",
      value: formatPricePerSqft(property.pricePerSqft),
    },
    property.reraId && { label: "RERA", value: property.reraId },
  ].filter(Boolean);
  const navTabs = [
    { id: "overview-section", tab: "Overview" },
    { id: "dealer-section", tab: "Dealer Details" },
    { id: "price-trends-section", tab: "Price Trends" },
    { id: "locality-section", tab: "Explore Locality" },
    relatedProperties.length
      ? { id: "recommendation-section", tab: "Articles" }
      : null,
  ].filter(Boolean);
  const descText = property.description || "No description available.";
  const showReadMore = descText.length > 280;
  const sideImg1 = allImageUrls[1] || allImageUrls[0];
  const sideImg2 = allImageUrls[2] || allImageUrls[0];
  const currentGallery = allImageUrls[galleryIndex] || allImageUrls[0];
  const areaLines = [
    property.carpetArea ? `Carpet ${formatArea(property.carpetArea)}` : null,
    property.superBuiltUpArea
      ? `Super Built-up ${formatArea(property.superBuiltUpArea)}`
      : property.builtUpArea
        ? `Built-up ${formatArea(property.builtUpArea)}`
        : null,
  ].filter(Boolean);
  const highlightText =
    highlightChips.slice(0, 3).join(", ") || property.furnished || null;
  const goGallery = (dir) => {
    if (allImageUrls.length < 2) return;
    setGalleryIndex(
      (i) => (i + dir + allImageUrls.length) % allImageUrls.length,
    );
  };

  return (
    <div className={`pdp99 ${isBroker ? "pdp99--broker" : "pdp99--owner"}`}>
      <div className="pdp99-tabsbar">
        <div className="pdp99-wrap pdp99-tabsbar__inner">
          {navTabs.map((item) => (
            <button
              key={item.tab}
              type="button"
              className={`pdp99-tab${activeTab === item.tab ? " is-active" : ""}`}
              onClick={() => {
                setActiveTab(item.tab);
                scrollToSection(item.id);
              }}
            >
              {item.tab}
            </button>
          ))}
        </div>
      </div>

      <div className="pdp99-wrap">
        <nav className="pdp99-crumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="pdp99-crumb__sep">›</span>
          <Link href="/properties">Properties</Link>
          {property.city && (
            <>
              <span className="pdp99-crumb__sep">›</span>
              <span>{property.city}</span>
            </>
          )}
          <span className="pdp99-crumb__sep">›</span>
          <span>{property.title || "Listing"}</span>
        </nav>

        <div className="pdp99-poster-row">
          <span className={`pdp99-poster-pill ${isBroker ? "is-broker" : "is-owner"}`}>
            <FontAwesomeIcon icon={isBroker ? faBriefcase : faHouseChimney} />
            {isBroker ? "Broker listing" : "Owner listing"}
          </span>
          {property.userVerified ? (
            <span className="pdp99-poster-pill is-verified">
              <FontAwesomeIcon icon={faShieldHalved} />
              Verified
            </span>
          ) : null}
          <h1 className="pdp99-title pdp99-title--inline">
            {property.title || "Property for sale"}
          </h1>
        </div>

        <section className="pdp99-hero" aria-label="Property overview">
          <div className="pdp99-carousel">
            {currentGallery ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentGallery}
                  alt={property.title || "Property"}
                  onClick={() => openLightbox(galleryIndex)}
                />
                <div className="pdp99-carousel__pills">
                  <button
                    type="button"
                    className="pdp99-pill is-on"
                    onClick={() => openLightbox(galleryIndex)}
                  >
                    <FontAwesomeIcon icon={faCamera} />
                    Photos ({allImageUrls.length})
                  </button>
                  <span className="pdp99-pill">
                    <FontAwesomeIcon icon={faVideo} />
                    Videos (0)
                  </span>
                </div>
                <button
                  type="button"
                  className="pdp99-viewall"
                  onClick={() => openLightbox(galleryIndex)}
                >
                  View all photos
                </button>
                {allImageUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="pdp99-carousel__nav is-prev"
                      aria-label="Previous photo"
                      onClick={() => goGallery(-1)}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                      type="button"
                      className="pdp99-carousel__nav is-next"
                      aria-label="Next photo"
                      onClick={() => goGallery(1)}
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <div className="pdp99-dots">
                      {allImageUrls.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={i === galleryIndex ? "is-on" : ""}
                          aria-label={`Photo ${i + 1}`}
                          onClick={() => setGalleryIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="pdp99-gallery__empty">No photos available</div>
            )}
          </div>

          <div className="pdp99-kvgrid">
            <div className="pdp99-kv">
              <FontAwesomeIcon icon={faRulerCombined} />
              <div>
                <span>Area</span>
                <strong>{formatArea(primaryArea) || "—"}</strong>
                {areaLines.length > 0 && <em>{areaLines.join(" · ")}</em>}
              </div>
            </div>
            <div className="pdp99-kv">
              <FontAwesomeIcon icon={faBed} />
              <div>
                <span>Configuration</span>
                <strong>{configLabel || "—"}</strong>
              </div>
            </div>
            <div className="pdp99-kv">
              <FontAwesomeIcon icon={faIndianRupeeSign} />
              <div>
                <span>Price</span>
                <strong>{formatPrice(property.totalPrice)}</strong>
                <button
                  type="button"
                  className="pdp99-readmore"
                  onClick={() => setShowContactModal(true)}
                >
                  View Price Details
                </button>
              </div>
            </div>
            <div className="pdp99-kv">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <div>
                <span>Address</span>
                <strong>{locationLabel || "—"}</strong>
              </div>
            </div>
            <div className="pdp99-kv">
              <FontAwesomeIcon icon={faBuilding} />
              <div>
                <span>Floor Number</span>
                <strong>{floorLabel || "—"}</strong>
              </div>
            </div>
            {highlightText && (
              <div className="pdp99-kv">
                <FontAwesomeIcon icon={faStar} />
                <div>
                  <span>Highlights</span>
                  <strong>{highlightText}</strong>
                </div>
              </div>
            )}
            {property.facing && (
              <div className="pdp99-kv">
                <FontAwesomeIcon icon={faRoad} />
                <div>
                  <span>Facing / Overlooking</span>
                  <strong>{property.facing}</strong>
                </div>
              </div>
            )}
            <div className="pdp99-kv">
              <FontAwesomeIcon icon={faClock} />
              <div>
                <span>Property Age</span>
                <strong>
                  {property.ageOfConstruction != null
                    ? `${property.ageOfConstruction} to ${property.ageOfConstruction + 1} Year Old`
                    : property.status || "—"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <div className="pdp99-statbar">
          <div className="pdp99-stat">
            <FontAwesomeIcon icon={faIndianRupeeSign} />
            <strong>{formatPrice(property.totalPrice)}</strong>
            <span>Price</span>
          </div>
          <div className="pdp99-stat">
            <FontAwesomeIcon icon={faRulerCombined} />
            <strong>{formatArea(primaryArea) || "—"}</strong>
            <span>Super Built-up Area</span>
          </div>
          <div className="pdp99-stat">
            <FontAwesomeIcon icon={faBath} />
            <strong>{property.bathrooms ? `${property.bathrooms} Baths` : "—"}</strong>
            <span>Bathrooms</span>
          </div>
          <div className="pdp99-stat">
            <FontAwesomeIcon icon={faBuilding} />
            <strong>{floorLabel || "—"}</strong>
            <span>Floor</span>
          </div>
          <div className="pdp99-stat">
            <FontAwesomeIcon icon={faClock} />
            <strong>{property.status || property.possession || "—"}</strong>
            <span>Possession</span>
          </div>
        </div>

        <div className="pdp99-layout">
          <div className="pdp99-main">
            <section id="overview-section" className="pdp99-card">
              <p className={`pdp99-desc${showReadMore && !descExpanded ? " is-clamp" : ""}`}>
                {descText}
              </p>
              <div className="pdp99-desc-links">
                {showReadMore && (
                  <button
                    type="button"
                    className="pdp99-readmore"
                    onClick={() => setDescExpanded((v) => !v)}
                  >
                    {descExpanded ? "Read less" : "Read more"}
                  </button>
                )}
                {property.virtualTour && (
                  <a
                    href={property.virtualTour}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdp99-readmore"
                  >
                    View Virtual Tour
                  </a>
                )}
              </div>
            </section>

            <section id="dealer-section" className="pdp99-card pdp99-dealer">
              <div className={`pdp99-lister pdp99-lister--flat ${isBroker ? "is-broker" : "is-owner"}`}>
                <div className="pdp99-lister__banner">
                  {isBroker ? "Broker / Dealer" : "Direct Owner"}
                </div>
                <div className="pdp99-owner__row">
                  <div className="pdp99-avatar">
                    {property.userAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={property.userAvatar} alt="" />
                    ) : (
                      ownerInitials || (isBroker ? "B" : "O")
                    )}
                  </div>
                  <div>
                    <p className="pdp99-owner__name">{posterName}</p>
                    <span className="pdp99-owner__tag">
                      <FontAwesomeIcon icon={isBroker ? faBriefcase : faUser} />
                      {isBroker ? "Broker" : "Owner"}
                    </span>
                  </div>
                </div>
                <p className="pdp99-owner__note">
                  {isBroker
                    ? "This property is listed by a broker. Request a callback for inventory, pricing, and site visits."
                    : "Listed directly by the owner. Confirm availability and the final quoted price with the owner."}
                </p>
                <div className="pdp99-owner__actions pdp99-owner__actions--inline">
                  <button
                    type="button"
                    className="pdp99-btn pdp99-btn--outline"
                    onClick={() => setShowContactModal(true)}
                  >
                    View Number
                  </button>
                  <button
                    type="button"
                    className="pdp99-btn pdp99-btn--primary"
                    onClick={() => setShowContactModal(true)}
                  >
                    {isBroker ? "Contact Broker" : "Contact Owner"}
                  </button>
                </div>
              </div>
            </section>

            <section id="details-section" className="pdp99-card">
              <h2 className="pdp99-card__title">More Details</h2>
              <dl className="pdp99-facts">
                {detailFacts.map((fact) => (
                  <div key={fact.label} className="pdp99-fact">
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {(propertyAmenities.length > 0 || property.amenityNames?.length > 0) && (
              <section className="pdp99-card">
                <div className="pdp99-card__head">
                  <h2 className="pdp99-card__title">Amenities</h2>
                  <OverlayTrigger placement="top" overlay={AmenitiesTooltip}>
                    <FontAwesomeIcon icon={faCircleInfo} className="pdp99-info" />
                  </OverlayTrigger>
                </div>
                <div className="pdp99-grid">
                  {propertyAmenities.length > 0
                    ? propertyAmenities.map((amenity, index) => {
                        const imageUrl = getAmenityImageUrl(amenity.amenityImageUrl);
                        return (
                          <div key={amenity.id || index} className="pdp99-amenity">
                            {imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imageUrl} alt={amenity.title || "Amenity"} />
                            ) : (
                              <span className="pdp99-amenity-ico">
                                <FontAwesomeIcon icon={faCheck} />
                              </span>
                            )}
                            <span>{amenity.title || property.amenityNames?.[index]}</span>
                          </div>
                        );
                      })
                    : property.amenityNames.map((amenity, index) => (
                        <div key={index} className="pdp99-amenity">
                          <span className="pdp99-amenity-ico">
                            <FontAwesomeIcon icon={faCheck} />
                          </span>
                          <span>{amenity}</span>
                        </div>
                      ))}
                </div>
              </section>
            )}

            {(propertyFeatures.length > 0 || property.featureNames?.length > 0) && (
              <section className="pdp99-card">
                <div className="pdp99-card__head">
                  <h2 className="pdp99-card__title">Furnishings</h2>
                  <OverlayTrigger placement="top" overlay={FeaturesTooltip}>
                    <FontAwesomeIcon icon={faCircleInfo} className="pdp99-info" />
                  </OverlayTrigger>
                </div>
                <div className="pdp99-grid">
                  {propertyFeatures.length > 0
                    ? propertyFeatures.map((feature, index) => {
                        const imageUrl = getFeatureImageUrl(feature.iconImageUrl);
                        return (
                          <div key={feature.id || index} className="pdp99-amenity">
                            {imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imageUrl} alt={feature.title || "Feature"} />
                            ) : (
                              <span className="pdp99-amenity-ico">
                                <FontAwesomeIcon icon={faCheck} />
                              </span>
                            )}
                            <span>{feature.title || property.featureNames?.[index]}</span>
                          </div>
                        );
                      })
                    : property.featureNames.map((feature, index) => (
                        <div key={index} className="pdp99-amenity">
                          <span className="pdp99-amenity-ico">
                            <FontAwesomeIcon icon={faCheck} />
                          </span>
                          <span>{feature}</span>
                        </div>
                      ))}
                </div>
              </section>
            )}

            {property.projectName && (
              <section id="society-section" className="pdp99-card pdp99-society">
                <h2 className="pdp99-card__title">Society</h2>
                <h5>{property.projectName}</h5>
                {(projectDetails?.builderName || property.builderName) && (
                  <p>
                    Developed / built by{" "}
                    {projectDetails?.builderName || property.builderName}
                  </p>
                )}
                {projectDetails?.projectDescription && (
                  <p>{projectDetails.projectDescription}</p>
                )}
                {projectDetails?.projectType && (
                  <p>
                    <strong>Project Type:</strong> {projectDetails.projectType}
                  </p>
                )}
                {projectDetails?.totalUnits && (
                  <p>
                    <strong>Total Units:</strong> {projectDetails.totalUnits}
                  </p>
                )}
                {projectDetails?.constructionStatus && (
                  <p>
                    <strong>Construction Status:</strong>{" "}
                    {projectDetails.constructionStatus}
                  </p>
                )}
                {loadingProject && (
                  <p className="pdp99-price-sub">Loading project details…</p>
                )}
              </section>
            )}

            <section id="price-trends-section" className="pdp99-card">
              <h2 className="pdp99-card__title">Price Trends</h2>
              <p className="pdp99-desc">
                Indicative pricing for this listing. Confirm current rates with
                the owner before making a decision.
              </p>
              {property.totalPrice && (
                <div className="pdp99-trend-row">
                  <span>Current Price</span>
                  <strong>{formatPrice(property.totalPrice)}</strong>
                </div>
              )}
              {property.pricePerSqft && (
                <div className="pdp99-trend-row">
                  <span>Price per sq.ft</span>
                  <strong>{formatPricePerSqft(property.pricePerSqft)}</strong>
                </div>
              )}
            </section>

            <section id="locality-section" className="pdp99-card">
              <div className="pdp99-card__head">
                <h2 className="pdp99-card__title">Explore Locality</h2>
                <OverlayTrigger placement="top" overlay={NearbyBenefitsTooltip}>
                  <FontAwesomeIcon icon={faCircleInfo} className="pdp99-info" />
                </OverlayTrigger>
              </div>
              {locationLabel && (
                <p className="pdp99-desc">
                  <strong>Location:</strong> {locationLabel}
                </p>
              )}
              {property.latitude && property.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdp99-map"
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  View on Map
                </a>
              )}
              {propertyNearbyBenefits.length > 0 && (
                <div className="pdp99-grid mt-4">
                  {propertyNearbyBenefits.map((benefit, index) => {
                    const fullBenefit = allNearbyBenefits.find(
                      (b) => b.id === benefit.id,
                    );
                    const benefitIcon =
                      benefit.benefitIcon || fullBenefit?.benefitIcon;
                    const imageUrl = benefitIcon
                      ? getNearbyBenefitImageUrl(benefitIcon)
                      : null;
                    const benefitName =
                      benefit.benefitName ||
                      fullBenefit?.benefitName ||
                      "Nearby";
                    const distance = benefit.distance
                      ? `~ ${benefit.distance} KM`
                      : "";
                    return (
                      <div key={benefit.id || index} className="pdp99-amenity">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imageUrl} alt={benefitName} />
                        ) : (
                          <span className="pdp99-amenity-ico">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                          </span>
                        )}
                        <span>{benefitName}</span>
                        {distance ? <span className="sub">{distance}</span> : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="pdp99-aside">
            {relatedProperties.length > 0 && (
              <div id="recommendation-section" className="pdp99-aside-list">
                <div className="pdp99-aside-list__head">
                  <h3>Similar Properties</h3>
                  <Link href="/properties">View All</Link>
                </div>
                {relatedProperties.slice(0, 4).map((related) => {
                  const relatedImageUrl =
                    related.imageUrls && related.imageUrls.length > 0
                      ? getImageUrl(related.imageUrls[0])
                      : null;
                  return (
                    <Link
                      key={`aside-${related.id}`}
                      href={`/properties/${relatedSlugOf(related)}`}
                      className="pdp99-aside-item"
                    >
                      {relatedImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={relatedImageUrl} alt="" />
                      ) : (
                        <div className="pdp99-aside-ph" />
                      )}
                      <div>
                        <strong>{formatPrice(related.totalPrice)}</strong>
                        <span>
                          {[related.locality, related.city].filter(Boolean).join(", ")}
                        </span>
                        <span>
                          {formatArea(related.carpetArea || related.builtUpArea) || ""}
                          {related.subType || related.listingType
                            ? ` · ${related.subType || related.listingType}`
                            : " · Property"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>

      <div className="pdp99-mobile-cta">
        <button
          type="button"
          className="pdp99-btn pdp99-btn--outline"
          onClick={() => setShowContactModal(true)}
        >
          View Number
        </button>
        <button
          type="button"
          className="pdp99-btn pdp99-btn--primary"
          onClick={() => setShowContactModal(true)}
        >
          Contact
        </button>
      </div>

      {/* Contact Form Modal - Compact Modern Design */}
      <Modal
        show={showContactModal}
        onHide={() => {
          setShowContactModal(false);
          setSubmitError(null);
          setSubmitSuccess(false);
        }}
        centered
        size="sm"
        className="modern-contact-modal"
        backdrop="static"
        style={{ zIndex: 9999 }}
      >
        <Modal.Header className="modern-modal-header-compact" closeButton>
          <Modal.Title className="modern-modal-title-compact">
            <FontAwesomeIcon icon={faPhone} className="me-2" />
            Contact {isBroker ? "Broker" : "Owner"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modern-modal-body-compact">
          {submitSuccess ? (
            <div className="success-message-compact">
              <div className="success-icon-compact">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <h5 className="mb-2">Thank You!</h5>
              <p className="mb-0">
                Your inquiry has been submitted. The owner will contact you
                soon.
              </p>
            </div>
          ) : (
            <Form
              onSubmit={handleContactSubmit}
              className="modern-contact-form-compact"
            >
              {submitError && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setSubmitError(null)}
                  className="modern-alert-compact mb-3"
                >
                  <FontAwesomeIcon icon={faXmark} className="me-2" />
                  {submitError}
                </Alert>
              )}

              <Form.Group className="modern-form-group-compact">
                <Form.Label className="modern-form-label-compact">
                  Name <span className="required-star">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactFormChange}
                  required
                  placeholder="Your full name"
                  className="modern-form-control-compact"
                />
              </Form.Group>

              <Form.Group className="modern-form-group-compact">
                <Form.Label className="modern-form-label-compact">
                  Email <span className="required-star">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactFormChange}
                  required
                  placeholder="your.email@example.com"
                  className="modern-form-control-compact"
                />
              </Form.Group>

              <Form.Group className="modern-form-group-compact">
                <Form.Label className="modern-form-label-compact">
                  Phone <span className="required-star">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactFormChange}
                  required
                  placeholder="+91 98765 43210"
                  className="modern-form-control-compact"
                />
              </Form.Group>

              <Form.Group className="modern-form-group-compact">
                <Form.Label className="modern-form-label-compact">
                  Message
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactFormChange}
                  placeholder="Your message (optional)"
                  className="modern-form-control-compact modern-textarea-compact"
                />
              </Form.Group>

              <div className="form-footer-compact">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setShowContactModal(false);
                    setSubmitError(null);
                    setSubmitSuccess(false);
                  }}
                  disabled={submitting}
                  className="modern-cancel-btn-compact"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="modern-submit-btn-compact"
                  size="sm"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" animation="border" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="me-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Image Lightbox Modal - click image to open, zoom in/out */}
      <Modal
        show={showImageLightbox}
        onHide={() => {
          setShowImageLightbox(false);
          setLightboxZoom(1);
        }}
        centered
        size="xl"
        className="property-image-lightbox-modal"
        backdrop="static"
        style={{ zIndex: 10000 }}
        aria-label="Image zoom viewer"
      >
        <Modal.Header className="property-lightbox-header">
          <span className="property-lightbox-title">
            Image {lightboxImageIndex + 1} of {allImageUrls.length}
          </span>
          <Button
            variant="outline-light"
            size="sm"
            className="property-lightbox-close-btn"
            onClick={() => {
              setShowImageLightbox(false);
              setLightboxZoom(1);
            }}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </Button>
        </Modal.Header>
        <Modal.Body className="property-lightbox-body p-0">
          <div className="property-lightbox-toolbar">
            <Button
              variant="outline-dark"
              size="sm"
              className="property-lightbox-zoom-btn"
              onClick={() => setLightboxZoom((z) => Math.max(0.5, z - 0.25))}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <FontAwesomeIcon icon={faSearchMinus} className="magnifier-icon" />
              <span className="d-none d-sm-inline ms-1">Zoom out</span>
            </Button>
            <span className="property-lightbox-zoom-value">
              {Math.round(lightboxZoom * 100)}%
            </span>
            <Button
              variant="outline-dark"
              size="sm"
              className="property-lightbox-zoom-btn"
              onClick={() => setLightboxZoom((z) => Math.min(4, z + 0.25))}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <FontAwesomeIcon icon={faSearchPlus} className="magnifier-icon" />
              <span className="d-none d-sm-inline ms-1">Zoom in</span>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setLightboxZoom(1)}
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              <FontAwesomeIcon icon={faExpand} className="me-1" />
              Reset
            </Button>
          </div>
          <div className="property-lightbox-content">
            {allImageUrls.length > 1 && (
              <>
                <Button
                  variant="outline-light"
                  className="property-lightbox-nav property-lightbox-prev"
                  onClick={() => {
                    setLightboxImageIndex((i) =>
                      i === 0 ? allImageUrls.length - 1 : i - 1
                    );
                    setLightboxZoom(1);
                  }}
                  aria-label="Previous image"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </Button>
                <Button
                  variant="outline-light"
                  className="property-lightbox-nav property-lightbox-next"
                  onClick={() => {
                    setLightboxImageIndex((i) =>
                      i === allImageUrls.length - 1 ? 0 : i + 1
                    );
                    setLightboxZoom(1);
                  }}
                  aria-label="Next image"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </Button>
              </>
            )}
            <div
              className="property-lightbox-image-wrap"
              style={{ overflow: "auto" }}
              onWheel={(e) => {
                if (!e.ctrlKey && !e.metaKey) return;
                e.preventDefault();
                setLightboxZoom((z) =>
                  e.deltaY < 0
                    ? Math.min(4, z + 0.2)
                    : Math.max(0.5, z - 0.2)
                );
              }}
            >
              <div
                className="property-lightbox-image-scaler"
                style={{
                  transform: `scale(${lightboxZoom})`,
                  transformOrigin: "center center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={allImageUrls[lightboxImageIndex]}
                  alt={`${property?.title || "Property"} - Image ${lightboxImageIndex + 1}`}
                  className="property-lightbox-img-normal"
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
