"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faMapMarkerAlt,
  faCheck,
  faXmark,
  faHome,
  faBuilding,
  faCompass,
  faBirthdayCake,
  faRocket,
  faVolumeMute,
  faCircleInfo,
  faSearchPlus,
  faSearchMinus,
  faChevronLeft,
  faChevronRight,
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
import {
  Spinner,
  Alert,
  Badge,
  Button,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import axios from "axios";
import "./property-detail.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [imageIndex, setImageIndex] = useState(0);
  const [mediaTab, setMediaTab] = useState("Property");
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
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

  // Smooth scroll behavior
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [propertyId]);

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100; // Offset for fixed header if any
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
        { id: "society-section", tab: "Society" },
        { id: "price-trends-section", tab: "Price Trends" },
        { id: "locality-section", tab: "Explore Locality" },
        { id: "recommendation-section", tab: "Recommendation" },
      ];

      const scrollPosition = window.scrollY + 150; // Offset for better detection

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

  return (
    <div className="property-detail-page mt-5">
      {/* Header Section */}
      <div className="property-header-section mt-5 pt-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 py-3">
            <div className="flex-grow-1">
              {property.title && (
                <h1 className="property-header-title mb-2">{property.title}</h1>
              )}
              <div className="d-flex align-items-center flex-wrap gap-3 mb-2">
                <h2 className="property-header-price mb-0">
                  {formatPrice(property.totalPrice)}
                  {getBedroomLabel(property.bedrooms) &&
                    ` • ${getBedroomLabel(property.bedrooms)}`}
                  {property.bathrooms ? ` • ${property.bathrooms} Baths` : ""}
                </h2>
              </div>
              {locationParts.filter(Boolean).length > 0 && (
                <div className="property-header-location mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  <span>{locationParts.filter(Boolean).join(", ")}</span>
                </div>
              )}
              <div className="d-flex align-items-center flex-wrap gap-3">
                {property.reraId && (
                  <div className="rera-status">
                    <span>RERA: </span>
                    <a
                      href={
                        property.reraState
                          ? `http://${property.reraState.toLowerCase()}-rera.in/projects`
                          : "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {property.reraId}
                    </a>
                  </div>
                )}
                {property.status && (
                  <Badge
                    bg={
                      property.status.toLowerCase().includes("ready")
                        ? "success"
                        : "warning"
                    }
                    className="modern-badge"
                    style={{
                      background: property.status
                        .toLowerCase()
                        .includes("ready")
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      fontWeight: "600",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    {property.status}
                  </Badge>
                )}
                {property.transaction && (
                  <Badge
                    bg="info"
                    className="modern-badge"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      fontWeight: "600",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    For {property.transaction}
                  </Badge>
                )}
              </div>
            </div>
            <div className="d-flex flex-column gap-2">
              <Button
                variant="primary"
                className="contact-dealer-btn"
                onClick={() => setShowContactModal(true)}
              >
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                Contact Owner
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="property-nav-tabs">
            <button
              className={activeTab === "Overview" ? "active" : ""}
              onClick={() => {
                setActiveTab("Overview");
                scrollToSection("overview-section");
              }}
            >
              Overview
            </button>
            {property.projectName && (
              <button
                className={activeTab === "Society" ? "active" : ""}
                onClick={() => {
                  setActiveTab("Society");
                  scrollToSection("society-section");
                }}
              >
                Society
              </button>
            )}
            <button
              className={activeTab === "Price Trends" ? "active" : ""}
              onClick={() => {
                setActiveTab("Price Trends");
                scrollToSection("price-trends-section");
              }}
            >
              Price Trends
            </button>
            <button
              className={activeTab === "Explore Locality" ? "active" : ""}
              onClick={() => {
                setActiveTab("Explore Locality");
                scrollToSection("locality-section");
              }}
            >
              Explore Locality
            </button>
            <button
              className={activeTab === "Recommendation" ? "active" : ""}
              onClick={() => {
                setActiveTab("Recommendation");
                scrollToSection("recommendation-section");
              }}
            >
              Recommendation
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container my-4">
        <div className="row hero-section-row">
          {/* Left Panel - Media Gallery (40%) */}
          <div className="col-lg-5 col-md-12 mb-4">
            <div className="property-media-gallery">
              {/* Media Tabs */}
              <div className="media-tabs">
                <button
                  className={`media-tab ${mediaTab === "Videos" ? "active" : ""}`}
                  onClick={() => setMediaTab("Videos")}
                >
                  Videos (0)
                </button>
                <button
                  className={`media-tab ${mediaTab === "Property" ? "active" : ""}`}
                  onClick={() => setMediaTab("Property")}
                >
                  Property ({allImageUrls.length})
                </button>
              </div>

              {/* Media Content - images like before; hover shows "Click to view", click opens modal */}
              <div className="media-content property-media-content-with-hover">
                {mediaTab === "Property" && allImageUrls.length > 0 ? (
                  <>
                    <Swiper
                      modules={[Navigation, Pagination, Zoom]}
                      spaceBetween={0}
                      slidesPerView={1}
                      navigation={allImageUrls.length > 1}
                      pagination={{
                        clickable: true,
                        type: "fraction",
                      }}
                      zoom={true}
                      className="main-property-swiper"
                      onSlideChange={(swiper) =>
                        setImageIndex(swiper.activeIndex)
                      }
                    >
                      {allImageUrls.map((imageUrl, index) => (
                        <SwiperSlide key={index}>
                          <div
                            className="swiper-zoom-container property-image-click-to-open"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxImageIndex(index);
                              setLightboxZoom(1);
                              setShowImageLightbox(true);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setLightboxImageIndex(index);
                                setLightboxZoom(1);
                                setShowImageLightbox(true);
                              }
                            }}
                            title="Click to view full size with zoom"
                          >
                            <Image
                              src={imageUrl}
                              alt={`${property.title || "Property"} - Image ${index + 1}`}
                              fill
                              className="property-main-image"
                              style={{ objectFit: "cover" }}
                              unoptimized
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div className="property-image-hover-hint" aria-hidden>
                      Click to view
                    </div>
                  </>
                ) : mediaTab === "Videos" ? (
                  <div className="video-placeholder">
                    <div className="placeholder-content">
                      <p>No Videos Available</p>
                    </div>
                  </div>
                ) : (
                  <div className="property-image-placeholder">
                    <div className="placeholder-content">
                      <p>No Image Available</p>
                    </div>
                  </div>
                )}
                {/* Mute Icon for Videos */}
                {mediaTab === "Videos" && (
                  <div className="mute-icon">
                    <FontAwesomeIcon icon={faVolumeMute} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Property Details (60%) - Redesigned */}
          <div className="col-lg-7 col-md-12">
            <div className="property-details-hero-v2">
              <h3 className="details-hero-title-v2">Property Details</h3>

              {/* Price block - prominent */}
              <div className="pd-price-block">
                <div className="pd-price-label">Price</div>
                <div className="pd-price-amount">
                  {formatPrice(property.totalPrice)}
                  {property.totalPrice && property.totalPrice >= 10000000 && "+"}
                </div>
                {property.pricePerSqft && (
                  <div className="pd-price-per-sqft">
                    {formatPricePerSqft(property.pricePerSqft, true)} per sq.m.
                  </div>
                )}
              </div>

              {/* Key specs grid */}
              <div className="pd-specs-grid">
                <div className="pd-spec-card">
                  <span className="pd-spec-label">Area</span>
                  <span className="pd-spec-value">
                    {property.plotArea
                      ? `Plot ${formatArea(property.plotArea, true)}`
                      : property.superBuiltUpArea
                        ? formatArea(property.superBuiltUpArea, true)
                        : property.builtUpArea
                          ? formatArea(property.builtUpArea, true)
                          : property.carpetArea
                            ? formatArea(property.carpetArea, true)
                            : "—"}
                  </span>
                </div>
                <div className="pd-spec-card">
                  <span className="pd-spec-label">Configuration</span>
                  <span className="pd-spec-value">
                    {property.bedrooms || 0} Beds · {property.bathrooms || 0} Bath
                    {property.balconies ? ` · ${property.balconies} Balcony` : ""}
                  </span>
                </div>
                {(property.floorNumber || property.totalFloors) && (
                  <div className="pd-spec-card">
                    <span className="pd-spec-label">Floor</span>
                    <span className="pd-spec-value">
                      {property.floorNumber || "—"}
                      {property.totalFloors ? ` of ${property.totalFloors}` : ""}
                    </span>
                  </div>
                )}
                {property.facing && (
                  <div className="pd-spec-card">
                    <span className="pd-spec-label">Facing</span>
                    <span className="pd-spec-value">{property.facing}</span>
                  </div>
                )}
              </div>

              {/* More details list */}
              <div className="pd-more-details">
                {property.parking && (
                  <div className="pd-detail-row">
                    <span className="pd-detail-label">
                      <FontAwesomeIcon icon={faBuilding} className="pd-detail-icon" />
                      Parking
                    </span>
                    <span className="pd-detail-value">{property.parking}</span>
                  </div>
                )}
                {property.status && (
                  <div className="pd-detail-row">
                    <span className="pd-detail-label">
                      <FontAwesomeIcon icon={faBirthdayCake} className="pd-detail-icon" />
                      Property Status
                    </span>
                    <span className="pd-detail-value">
                      {property.ageOfConstruction !== null &&
                      property.ageOfConstruction !== undefined
                        ? `${property.ageOfConstruction} to ${property.ageOfConstruction + 1} Year Old`
                        : property.status}
                    </span>
                  </div>
                )}
                {property.possession && (
                  <div className="pd-detail-row">
                    <span className="pd-detail-label">
                      <FontAwesomeIcon icon={faHome} className="pd-detail-icon" />
                      Possession
                    </span>
                    <span className="pd-detail-value">{property.possession}</span>
                  </div>
                )}
                {property.occupancy && (
                  <div className="pd-detail-row">
                    <span className="pd-detail-label">
                      <FontAwesomeIcon icon={faHome} className="pd-detail-icon" />
                      Occupancy
                    </span>
                    <span className="pd-detail-value">{property.occupancy}</span>
                  </div>
                )}
                {property.transaction && (
                  <div className="pd-detail-row">
                    <span className="pd-detail-label">
                      <FontAwesomeIcon icon={faRocket} className="pd-detail-icon" />
                      Transaction Type
                    </span>
                    <span className="pd-detail-value">{property.transaction}</span>
                  </div>
                )}
                {property.listingType && (
                  <div className="pd-detail-row">
                    <span className="pd-detail-label">
                      <FontAwesomeIcon icon={faBuilding} className="pd-detail-icon" />
                      Property Type
                    </span>
                    <span className="pd-detail-value">
                      {property.listingType}
                      {property.subType ? ` · ${property.subType}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="row">
          <div className="col-12">
            {/* About Property Section - Overview */}
            <div id="overview-section" className="property-section mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="section-title mb-0">About Property</h3>
              </div>
              {property.title && (
                <div className="mb-3">
                  <h5 className="mb-2">{property.title}</h5>
                </div>
              )}
              <div className="property-description">
                <p>{property.description || "No description available."}</p>
              </div>
              {property.additionalNotes && (
                <div className="mt-3">
                  <h5 className="mb-2 h6">Additional Notes:</h5>
                  <p className="text-muted">{property.additionalNotes}</p>
                </div>
              )}
            </div>

            {/* Property Details Grid */}
            <div className="property-section mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="section-subtitle mb-0">Property Details</h4>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="property-details-grid">
                    {property.listingType && (
                      <div className="detail-item">
                        <strong>Property Type:</strong>
                        <span>
                          {property.listingType}{" "}
                          {property.subType ? `- ${property.subType}` : ""}
                        </span>
                      </div>
                    )}
                    {property.transaction && (
                      <div className="detail-item">
                        <strong>Transaction Type:</strong>
                        <span>{property.transaction}</span>
                      </div>
                    )}
                    {property.status && (
                      <div className="detail-item">
                        <strong>Status:</strong>
                        <span>{property.status}</span>
                      </div>
                    )}
                    {property.possession && (
                      <div className="detail-item">
                        <strong>Possession:</strong>
                        <span>{property.possession}</span>
                      </div>
                    )}
                    {property.occupancy && (
                      <div className="detail-item">
                        <strong>Occupancy:</strong>
                        <span>{property.occupancy}</span>
                      </div>
                    )}
                    {property.ownershipType && (
                      <div className="detail-item">
                        <strong>Ownership Type:</strong>
                        <span>{property.ownershipType}</span>
                      </div>
                    )}
                    {property.furnished && (
                      <div className="detail-item">
                        <strong>Furnishing:</strong>
                        <span>{property.furnished}</span>
                      </div>
                    )}
                    {property.parking && (
                      <div className="detail-item">
                        <strong>Parking:</strong>
                        <span>{property.parking}</span>
                      </div>
                    )}
                    {property.noticePeriod !== null &&
                      property.noticePeriod !== undefined && (
                        <div className="detail-item">
                          <strong>Notice Period:</strong>
                          <span>
                            {property.noticePeriod}{" "}
                            {property.noticePeriod === 1 ? "Month" : "Months"}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="property-details-grid">
                    {property.floorNumber && (
                      <div className="detail-item">
                        <strong>Floor Number:</strong>
                        <span>
                          {property.floorNumber}{" "}
                          {property.totalFloors
                            ? `of ${property.totalFloors}`
                            : ""}
                        </span>
                      </div>
                    )}
                    {property.facing && (
                      <div className="detail-item">
                        <strong>Facing:</strong>
                        <span>{property.facing}</span>
                      </div>
                    )}
                    {property.ageOfConstruction !== null &&
                      property.ageOfConstruction !== undefined && (
                        <div className="detail-item">
                          <strong>Property Age:</strong>
                          <span>
                            {property.ageOfConstruction} to{" "}
                            {property.ageOfConstruction + 1} Year Old
                          </span>
                        </div>
                      )}
                    {property.maintenanceCharges && (
                      <div className="detail-item">
                        <strong>Maintenance Charges:</strong>
                        <span>{formatPrice(property.maintenanceCharges)}</span>
                      </div>
                    )}
                    {property.bookingAmount && (
                      <div className="detail-item">
                        <strong>Booking Amount:</strong>
                        <span>{formatPrice(property.bookingAmount)}</span>
                      </div>
                    )}
                    {property.pricePerSqft && (
                      <div className="detail-item">
                        <strong>Price per Sq.ft:</strong>
                        <span>{formatPricePerSqft(property.pricePerSqft)}</span>
                      </div>
                    )}
                    {property.virtualTour && (
                      <div className="detail-item">
                        <strong>Virtual Tour:</strong>
                        <a
                          href={property.virtualTour}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          View Virtual Tour
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            {(() => {
              const propertyAmenities = getPropertyAmenities();
              return propertyAmenities.length > 0 ||
                (property.amenityNames && property.amenityNames.length > 0) ? (
                <div className="property-section mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="section-subtitle mb-0">Amenities</h4>
                    <OverlayTrigger placement="top" overlay={AmenitiesTooltip}>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="info-icon-section"
                        style={{
                          cursor: "help",
                          color: "#6c757d",
                          fontSize: "0.85rem",
                        }}
                      />
                    </OverlayTrigger>
                  </div>
                  <div className="amenities-grid">
                    {propertyAmenities.length > 0
                      ? propertyAmenities.map((amenity, index) => {
                          const imageUrl = getAmenityImageUrl(
                            amenity.amenityImageUrl,
                          );
                          return (
                            <div
                              key={amenity.id || index}
                              className="amenity-item"
                            >
                              {imageUrl ? (
                                <div className="amenity-image-wrapper">
                                  <Image
                                    src={imageUrl}
                                    alt={
                                      amenity.altTag ||
                                      amenity.title ||
                                      "Amenity"
                                    }
                                    width={30}
                                    height={30}
                                    className="amenity-image"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="amenity-icon-wrapper">
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="amenity-icon"
                                  />
                                </div>
                              )}
                              <span className="amenity-title">
                                {amenity.title ||
                                  property.amenityNames?.[index]}
                              </span>
                            </div>
                          );
                        })
                      : property.amenityNames.map((amenity, index) => (
                          <div key={index} className="amenity-item">
                            <div className="amenity-icon-wrapper">
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="amenity-icon"
                              />
                            </div>
                            <span className="amenity-title">{amenity}</span>
                          </div>
                        ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Features Section */}
            {(() => {
              const propertyFeatures = getPropertyFeatures();
              return propertyFeatures.length > 0 ||
                (property.featureNames && property.featureNames.length > 0) ? (
                <div className="property-section mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="section-subtitle mb-0">
                      Residential Features
                    </h4>
                    <OverlayTrigger placement="top" overlay={FeaturesTooltip}>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="info-icon-section"
                        style={{
                          cursor: "help",
                          color: "#6c757d",
                          fontSize: "0.85rem",
                        }}
                      />
                    </OverlayTrigger>
                  </div>
                  <div className="amenities-grid">
                    {propertyFeatures.length > 0
                      ? propertyFeatures.map((feature, index) => {
                          const imageUrl = getFeatureImageUrl(
                            feature.iconImageUrl,
                          );
                          return (
                            <div
                              key={feature.id || index}
                              className="amenity-item"
                            >
                              {imageUrl ? (
                                <div className="amenity-image-wrapper">
                                  <Image
                                    src={imageUrl}
                                    alt={
                                      feature.altTag ||
                                      feature.title ||
                                      "Feature"
                                    }
                                    width={60}
                                    height={60}
                                    className="amenity-image"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="amenity-icon-wrapper">
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="amenity-icon"
                                  />
                                </div>
                              )}
                              <span className="amenity-title">
                                {feature.title ||
                                  property.featureNames?.[index]}
                              </span>
                            </div>
                          );
                        })
                      : property.featureNames.map((feature, index) => (
                          <div key={index} className="amenity-item">
                            <div className="amenity-icon-wrapper">
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="amenity-icon"
                              />
                            </div>
                            <span className="amenity-title">{feature}</span>
                          </div>
                        ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Nearby Benefits Section */}
            {(() => {
              const propertyNearbyBenefits = getPropertyNearbyBenefits();
              return propertyNearbyBenefits.length > 0 ? (
                <div className="property-section mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="section-subtitle mb-0">Nearby Benefits</h4>
                    <OverlayTrigger
                      placement="top"
                      overlay={NearbyBenefitsTooltip}
                    >
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="info-icon-section"
                        style={{
                          cursor: "help",
                          color: "#6c757d",
                          fontSize: "0.85rem",
                        }}
                      />
                    </OverlayTrigger>
                  </div>
                  <div className="amenities-grid">
                    {propertyNearbyBenefits.map((benefit, index) => {
                      // Get the full benefit details from allNearbyBenefits
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
                        "Nearby Benefit";
                      const distance = benefit.distance
                        ? `~ ${benefit.distance} KM`
                        : "";
                      const altTag =
                        benefit.altTag || fullBenefit?.altTag || benefitName;

                      return (
                        <div key={benefit.id || index} className="amenity-item">
                          {imageUrl ? (
                            <div className="amenity-image-wrapper">
                              <Image
                                src={imageUrl}
                                alt={altTag}
                                width={60}
                                height={60}
                                className="amenity-image"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="amenity-icon-wrapper">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="amenity-icon"
                              />
                            </div>
                          )}
                          <div className="d-flex flex-column align-items-center">
                            <span className="amenity-title">{benefitName}</span>
                            {distance && (
                              <span
                                className="text-muted small mt-1"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {distance}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Society / Project Section */}
            {property.projectName && (
              <div id="society-section" className="property-section mt-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="section-subtitle mb-0">Society / Project</h4>
                </div>
                <div className="society-info">
                  <h5 className="society-name">{property.projectName}</h5>
                  <div className="society-details">
                    {property.bedrooms && (
                      <span>{getBedroomLabel(property.bedrooms)}</span>
                    )}
                    {/* Display builder from project details if available, otherwise from property */}
                    {(projectDetails?.builderName || property.builderName) && (
                      <span className="ms-2">
                        Developed / built by{" "}
                        {projectDetails?.builderName || property.builderName}
                      </span>
                    )}
                    {/* Display builder details if available from project */}
                    {projectDetails?.builderDetails && (
                      <div className="mt-2">
                        <p className="text-muted small mb-1">
                          <strong>Builder:</strong>{" "}
                          {projectDetails.builderDetails.builderName ||
                            projectDetails.builderName}
                        </p>
                        {projectDetails.builderDetails.builderDescription && (
                          <p className="text-muted small mb-0">
                            {projectDetails.builderDetails.builderDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Display project description if available */}
                  {projectDetails?.projectDescription && (
                    <div className="mt-3">
                      <h5 className="mb-2 h6">About Project</h5>
                      <p className="text-muted">
                        {projectDetails.projectDescription}
                      </p>
                    </div>
                  )}
                  {/* Display additional project details if available */}
                  {projectDetails && (
                    <div className="mt-3">
                      {projectDetails.projectType && (
                        <p className="text-muted small mb-1">
                          <strong>Project Type:</strong>{" "}
                          {projectDetails.projectType}
                        </p>
                      )}
                      {projectDetails.totalUnits && (
                        <p className="text-muted small mb-1">
                          <strong>Total Units:</strong>{" "}
                          {projectDetails.totalUnits}
                        </p>
                      )}
                      {projectDetails.constructionStatus && (
                        <p className="text-muted small mb-1">
                          <strong>Construction Status:</strong>{" "}
                          {projectDetails.constructionStatus}
                        </p>
                      )}
                      {projectDetails.possessionDate && (
                        <p className="text-muted small mb-1">
                          <strong>Possession Date:</strong>{" "}
                          {new Date(
                            projectDetails.possessionDate,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  {loadingProject && (
                    <div className="mt-2">
                      <Spinner size="sm" animation="border" />
                      <span className="ms-2 text-muted small">
                        Loading project details...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Virtual Tour Section */}
            {/* <div className="property-section mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="section-subtitle mb-0">Virtual Tour</h4>
              </div>
              <VirtualTour />
            </div> */}

            {/* Contact Information Section */}

            {/* Sponsored Properties Section */}
            {relatedProperties.length > 0 && (
              <div className="property-section mt-4">
                <h4 className="section-subtitle">Sponsored Properties</h4>
                <div className="sponsored-properties">
                  {relatedProperties.slice(0, 2).map((related) => {
                    const relatedImageUrl =
                      related.imageUrls && related.imageUrls.length > 0
                        ? getImageUrl(related.imageUrls[0])
                        : null;
                    return (
                      <div key={related.id} className="sponsored-property-card">
                        {relatedImageUrl && (
                          <Image
                            src={relatedImageUrl}
                            alt={related.title || "Property"}
                            width={200}
                            height={150}
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                            unoptimized
                          />
                        )}
                        <div className="sponsored-property-info">
                          <h5 className="h6 mb-1">{related.title || "Property"}</h5>
                          <p className="text-muted small">
                            {related.locality || ""} {related.city || ""}
                          </p>
                          <p className="text-muted small">
                            {getBedroomLabel(related.bedrooms)} Flats
                          </p>
                          <p className="price-text">
                            {formatPrice(related.totalPrice)} onwards
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Trends Section */}
            <div id="price-trends-section" className="property-section mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="section-subtitle mb-0">Price Trends</h4>
              </div>
              <div className="price-trends-info">
                <p className="text-muted">
                  Price trends and market analysis for this property will be
                  displayed here.
                </p>
                {property.totalPrice && property.pricePerSqft && (
                  <div className="price-info-card mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Current Price:</span>
                      <strong className="text-primary">
                        {formatPrice(property.totalPrice)}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Price per sq.ft:</span>
                      <strong>
                        {formatPricePerSqft(property.pricePerSqft)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Explore Locality Section */}
            <div id="locality-section" className="property-section mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="section-subtitle mb-0">Explore Locality</h4>
              </div>
              <div className="locality-info">
                {locationParts.filter(Boolean).length > 0 && (
                  <div className="locality-details mb-3">
                    <p className="mb-2">
                      <strong>Location:</strong>{" "}
                      {locationParts.filter(Boolean).join(", ")}
                    </p>
                    {property.latitude && property.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="me-2"
                        />
                        View on Map
                      </a>
                    )}
                  </div>
                )}
                <p className="text-muted">
                  Explore the locality, nearby amenities, schools, hospitals,
                  and other facilities in this area.
                </p>
              </div>
            </div>

            {/* Owner Properties Section - Recommendation (Slider) */}
            {relatedProperties.length > 0 && (
              <div
                id="recommendation-section"
                className="property-section mt-4"
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="section-subtitle mb-0">
                    Owner Properties Available Only on MPF
                  </h4>
                </div>
                <div className="owner-properties-slider-wrap">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{
                      576: { slidesPerView: 2 },
                      768: { slidesPerView: 2 },
                      992: { slidesPerView: 3 },
                      1200: { slidesPerView: 3 },
                    }}
                    navigation={{
                      prevEl: ".owner-properties-slider-prev",
                      nextEl: ".owner-properties-slider-next",
                    }}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    className="owner-properties-swiper"
                    loop={relatedProperties.length >= 4}
                  >
                    {relatedProperties.map((related) => {
                      const relatedImageUrl =
                        related.imageUrls && related.imageUrls.length > 0
                          ? getImageUrl(related.imageUrls[0])
                          : null;
                      const relatedSlug = related.title
                        ? related.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "") +
                          "-" +
                          related.id
                        : related.id.toString();
                      return (
                        <SwiperSlide key={related.id}>
                          <Link
                            href={`/properties/${relatedSlug}`}
                            className="owner-property-card"
                          >
                            <div className="owner-property-image">
                              {relatedImageUrl ? (
                                <Image
                                  src={relatedImageUrl}
                                  alt={related.title || "Property"}
                                  fill
                                  style={{ objectFit: "cover" }}
                                  unoptimized
                                />
                              ) : (
                                <div className="placeholder-image-small">
                                  No Image
                                </div>
                              )}
                              {related.imageUrls &&
                                related.imageUrls.length > 0 && (
                                  <div className="image-count-badge">
                                    {related.imageUrls.length}+ Photos
                                  </div>
                                )}
                            </div>
                            <div className="owner-property-details">
                              <p className="price-text mb-1">
                                {formatPrice(related.totalPrice)} |{" "}
                                {formatArea(
                                  related.carpetArea || related.builtUpArea,
                                )}
                              </p>
                              <p className="location-text small">
                                {related.locality || ""} {related.city || ""}
                              </p>
                              {related.status && (
                                <Badge bg="success" className="mt-1">
                                  {related.status}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                  <button
                    type="button"
                    className="owner-properties-slider-prev owner-properties-slider-btn"
                    aria-label="Previous properties"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <button
                    type="button"
                    className="owner-properties-slider-next owner-properties-slider-btn"
                    aria-label="Next properties"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
            Contact Owner
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
