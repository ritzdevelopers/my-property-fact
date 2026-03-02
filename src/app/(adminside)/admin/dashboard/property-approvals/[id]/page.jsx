"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faArrowLeft,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import "../property-approvals.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allAmenities, setAllAmenities] = useState([]);
  const [allFeatures, setAllFeatures] = useState([]);
  const [allNearbyBenefits, setAllNearbyBenefits] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchPropertyDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}admin/property-listings/${propertyId}`,
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        setProperty(response.data.property);
      } else {
        setError(response.data.message || "Property not found");
      }
    } catch (err) {
      console.error("Error fetching property details:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load property details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
      fetchAllAmenities();
      fetchAllFeatures();
      fetchAllNearbyBenefits();
    }
  }, [propertyId, fetchPropertyDetails]);

  const fetchAllAmenities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}amenity/get-all`);
      if (Array.isArray(response.data)) {
        setAllAmenities(response.data);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
    }
  };

  const fetchAllFeatures = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}feature/get-all`);
      if (Array.isArray(response.data)) {
        setAllFeatures(response.data);
      }
    } catch (err) {
      console.error("Error fetching features:", err);
    }
  };

  const fetchAllNearbyBenefits = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}nearby-benefit/get-all`);
      if (Array.isArray(response.data)) {
        setAllNearbyBenefits(response.data);
      }
    } catch (err) {
      console.error("Error fetching nearby benefits:", err);
    }
  };

  const handleApprove = async () => {
    if (
      !window.confirm("Are you sure you want to approve this property listing?")
    ) {
      return;
    }

    try {
      setProcessing(true);
      const response = await axios.post(
        `${API_BASE_URL}admin/property-listings/${propertyId}/approve`,
        {},
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        toast.success("Property approved successfully!");
        router.push("/admin/dashboard/property-approvals");
      } else {
        throw new Error("Failed to approve property. Please try again.");
      }
    } catch (err) {
      console.error("Error approving property:", err);
      toast.error("Failed to approve property. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessing(true);
      const response = await axios.post(
        `${API_BASE_URL}admin/property-listings/${propertyId}/reject`,
        { reason: rejectReason },
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        toast.success("Property rejected successfully!");
        router.push("/admin/dashboard/property-approvals");
      } else {
        throw new Error("Failed to reject property. Please try again.");
      }
    } catch (err) {
      console.error("Error rejecting property:", err);
      toast.error("Failed to reject property. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

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

  const getAmenityImageUrl = (amenityImageUrl) => {
    if (!amenityImageUrl) return null;
    if (
      amenityImageUrl.startsWith("http://") ||
      amenityImageUrl.startsWith("https://")
    ) {
      return amenityImageUrl;
    }
    let cleanImageUrl = amenityImageUrl;

    if (cleanImageUrl.match(/^[A-Za-z]:[\/\\]/)) {
      const amenityIndex = cleanImageUrl.toLowerCase().indexOf("amenity");
      if (amenityIndex !== -1) {
        cleanImageUrl = cleanImageUrl.substring(amenityIndex);
      }
    }

    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }

    const pathParts = cleanImageUrl.split("/");
    const filename = pathParts[pathParts.length - 1];
    return `${API_BASE_URL}fetch-image/amenity/${filename}`;
  };

  const getFeatureImageUrl = (featureImageUrl) => {
    if (!featureImageUrl) return null;
    if (
      featureImageUrl.startsWith("http://") ||
      featureImageUrl.startsWith("https://")
    ) {
      return featureImageUrl;
    }
    let cleanImageUrl = featureImageUrl;

    if (cleanImageUrl.match(/^[A-Za-z]:[\/\\]/)) {
      const featureIndex = cleanImageUrl.toLowerCase().indexOf("feature");
      if (featureIndex !== -1) {
        cleanImageUrl = cleanImageUrl.substring(featureIndex);
      }
    }

    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }

    const pathParts = cleanImageUrl.split("/");
    const filename = pathParts[pathParts.length - 1];
    return `${API_BASE_URL}fetch-image/feature/${filename}`;
  };

  const getNearbyBenefitImageUrl = (benefitImageUrl) => {
    if (!benefitImageUrl) return null;
    if (
      benefitImageUrl.startsWith("http://") ||
      benefitImageUrl.startsWith("https://")
    ) {
      return benefitImageUrl;
    }
    let cleanImageUrl = benefitImageUrl;

    if (cleanImageUrl.match(/^[A-Za-z]:[\/\\]/)) {
      const benefitIndex = cleanImageUrl
        .toLowerCase()
        .indexOf("nearby-benefit");
      if (benefitIndex !== -1) {
        cleanImageUrl = cleanImageUrl.substring(benefitIndex);
      }
    }

    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }

    const pathParts = cleanImageUrl.split("/");
    const filename = pathParts[pathParts.length - 1];
    return `${API_BASE_URL}fetch-image/nearby-benefit/${filename}`;
  };

  const getPropertyAmenities = () => {
    if (!property || !allAmenities.length) return [];

    if (property.amenityIds && property.amenityIds.length > 0) {
      return allAmenities.filter((amenity) =>
        property.amenityIds.includes(amenity.id),
      );
    }

    if (property.amenityNames && property.amenityNames.length > 0) {
      return allAmenities.filter((amenity) =>
        property.amenityNames.some(
          (name) => name.toLowerCase() === amenity.title?.toLowerCase(),
        ),
      );
    }

    return [];
  };

  const getPropertyFeatures = () => {
    if (!property || !allFeatures.length) return [];

    if (property.featureIds && property.featureIds.length > 0) {
      return allFeatures.filter((feature) =>
        property.featureIds.includes(feature.id),
      );
    }

    if (property.featureNames && property.featureNames.length > 0) {
      return allFeatures.filter((feature) =>
        property.featureNames.some(
          (name) => name.toLowerCase() === feature.title?.toLowerCase(),
        ),
      );
    }

    return [];
  };

  const getPropertyNearbyBenefits = () => {
    if (!property || !property.nearbyBenefits) return [];
    return property.nearbyBenefits;
  };

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

  const formatPricePerSqft = (price) => {
    if (!price) return null;
    return `₹${Math.round(price).toLocaleString("en-IN")} per sq.ft.`;
  };

  const formatArea = (area) => {
    if (!area) return null;
    return `${area.toLocaleString("en-IN")} sq.ft.`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { bg: "warning", text: "Pending" },
      APPROVED: { bg: "success", text: "Approved" },
      REJECTED: { bg: "danger", text: "Rejected" },
      DRAFT: { bg: "secondary", text: "Draft" },
      REQUIRES_CHANGES: { bg: "info", text: "Requires Changes" },
    };
    const statusInfo = statusMap[status] || { bg: "secondary", text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="container-fluid py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Property</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <Button
              variant="outline-danger"
              onClick={() => router.push("/admin/dashboard/property-approvals")}
            >
              Back to Approvals
            </Button>
            <Button variant="outline-secondary" onClick={fetchPropertyDetails}>
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container-fluid py-5">
        <Alert variant="warning">
          <Alert.Heading>Property Not Found</Alert.Heading>
          <p>
            The property you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button
            variant="outline-primary"
            onClick={() => router.push("/admin/dashboard/property-approvals")}
          >
            Back to Approvals
          </Button>
        </Alert>
      </div>
    );
  }

  const propertyAmenities = getPropertyAmenities();
  const propertyFeatures = getPropertyFeatures();
  const propertyNearbyBenefits = getPropertyNearbyBenefits();

  return (
    <div className="container-fluid py-4 admin-property-detail-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="outline-secondary"
            onClick={() => router.push("/admin/dashboard/property-approvals")}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back
          </Button>
          <div>
            <h2 className="mb-0">Property Details</h2>
            <div className="d-flex align-items-center gap-2 mt-2">
              {getStatusBadge(property.approvalStatus)}
              <span className="text-muted small">ID: {property.id}</span>
            </div>
          </div>
        </div>
        {property.approvalStatus === "PENDING" && (
          <div className="d-flex gap-2">
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Approve
                </>
              )}
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              disabled={processing}
            >
              <FontAwesomeIcon icon={faXmark} className="me-2" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Property Images */}
      {property.imageUrls && property.imageUrls.length > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">Property Images</h5>
            <Swiper
              modules={[Navigation, Pagination, Autoplay, Zoom]}
              spaceBetween={10}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              className="property-images-swiper"
            >
              {property.imageUrls.map((imageUrl, index) => {
                const url = getImageUrl(imageUrl);
                return url ? (
                  <SwiperSlide key={index}>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "500px",
                      }}
                    >
                      <Image
                        src={url}
                        alt={`Property image ${index + 1}`}
                        fill
                        style={{ objectFit: "contain" }}
                        unoptimized
                      />
                    </div>
                  </SwiperSlide>
                ) : null;
              })}
            </Swiper>
          </Card.Body>
        </Card>
      )}

      <Row>
        {/* Left Column - Main Details */}
        <Col lg={8}>
          {/* Basic Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Basic Information</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <td style={{ width: "30%", fontWeight: "600" }}>Title</td>
                    <td>{property.title || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Description</td>
                    <td>{property.description || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Listing Type</td>
                    <td>
                      <Badge bg="info" className="me-2">
                        {property.listingType || "N/A"}
                      </Badge>
                      {property.subType && (
                        <Badge bg="secondary">{property.subType}</Badge>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Transaction</td>
                    <td>
                      <Badge bg="warning">
                        {property.transaction || "N/A"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Status</td>
                    <td>{property.status || "N/A"}</td>
                  </tr>
                  {property.projectName && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Project/Building</td>
                      <td>{property.projectName}</td>
                    </tr>
                  )}
                  {property.builderName && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Builder/Developer</td>
                      <td>{property.builderName}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Location & Area */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Location & Area Details</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <td style={{ width: "30%", fontWeight: "600" }}>Address</td>
                    <td>{property.address || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Locality</td>
                    <td>{property.locality || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>City</td>
                    <td>{property.city || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Pincode</td>
                    <td>{property.pincode || "N/A"}</td>
                  </tr>
                  {property.latitude && property.longitude && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Coordinates</td>
                      <td>
                        {property.latitude}, {property.longitude}
                        <a
                          href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ms-2"
                        >
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-1"
                          />
                          View on Map
                        </a>
                      </td>
                    </tr>
                  )}
                  {property.carpetArea && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Carpet Area</td>
                      <td>{formatArea(property.carpetArea)}</td>
                    </tr>
                  )}
                  {property.builtUpArea && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Built-up Area</td>
                      <td>{formatArea(property.builtUpArea)}</td>
                    </tr>
                  )}
                  {property.superBuiltUpArea && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Super Built-up Area</td>
                      <td>{formatArea(property.superBuiltUpArea)}</td>
                    </tr>
                  )}
                  {property.plotArea && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Plot Area</td>
                      <td>{formatArea(property.plotArea)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Property Configuration */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Property Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  {property.bedrooms && (
                    <tr>
                      <td style={{ width: "30%", fontWeight: "600" }}>
                        Bedrooms
                      </td>
                      <td>{property.bedrooms} BHK</td>
                    </tr>
                  )}
                  {property.bathrooms && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Bathrooms</td>
                      <td>{property.bathrooms}</td>
                    </tr>
                  )}
                  {property.balconies && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Balconies</td>
                      <td>{property.balconies}</td>
                    </tr>
                  )}
                  {property.parking && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Parking</td>
                      <td>{property.parking}</td>
                    </tr>
                  )}
                  {property.furnished && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Furnishing</td>
                      <td>{property.furnished}</td>
                    </tr>
                  )}
                  {property.floorNumber && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Floor</td>
                      <td>
                        {property.floorNumber}
                        {property.totalFloors && ` of ${property.totalFloors}`}
                      </td>
                    </tr>
                  )}
                  {property.facing && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Facing</td>
                      <td>{property.facing}</td>
                    </tr>
                  )}
                  {property.ageOfConstruction !== null &&
                    property.ageOfConstruction !== undefined && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>Property Age</td>
                        <td>
                          {property.ageOfConstruction} to{" "}
                          {property.ageOfConstruction + 1} Year Old
                        </td>
                      </tr>
                    )}
                  {property.ownershipType && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Ownership Type</td>
                      <td>{property.ownershipType}</td>
                    </tr>
                  )}
                  {property.noticePeriod !== null &&
                    property.noticePeriod !== undefined && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>Notice Period</td>
                        <td>
                          {property.noticePeriod}{" "}
                          {property.noticePeriod === 1 ? "Month" : "Months"}
                        </td>
                      </tr>
                    )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Pricing */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Pricing Details</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <td style={{ width: "30%", fontWeight: "600" }}>
                      Total Price
                    </td>
                    <td>
                      <strong className="text-success">
                        {formatPrice(property.totalPrice)}
                      </strong>
                    </td>
                  </tr>
                  {property.pricePerSqft && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Price per Sq.ft</td>
                      <td>{formatPricePerSqft(property.pricePerSqft)}</td>
                    </tr>
                  )}
                  {property.maintenanceCharges && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Maintenance Charges</td>
                      <td>{formatPrice(property.maintenanceCharges)}</td>
                    </tr>
                  )}
                  {property.bookingAmount && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Booking Amount</td>
                      <td>{formatPrice(property.bookingAmount)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Amenities */}
          {propertyAmenities.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Amenities</h5>
              </Card.Header>
              <Card.Body>
                <div className="amenities-grid">
                  {propertyAmenities.map((amenity, index) => {
                    const imageUrl = getAmenityImageUrl(
                      amenity.amenityImageUrl,
                    );
                    return (
                      <div key={amenity.id || index} className="amenity-item">
                        {imageUrl ? (
                          <div className="amenity-image-wrapper">
                            <Image
                              src={imageUrl}
                              alt={amenity.altTag || amenity.title || "Amenity"}
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
                          {amenity.title || property.amenityNames?.[index]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Features */}
          {propertyFeatures.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Residential Features</h5>
              </Card.Header>
              <Card.Body>
                <div className="amenities-grid">
                  {propertyFeatures.map((feature, index) => {
                    const imageUrl = getFeatureImageUrl(feature.iconImageUrl);
                    return (
                      <div key={feature.id || index} className="amenity-item">
                        {imageUrl ? (
                          <div className="amenity-image-wrapper">
                            <Image
                              src={imageUrl}
                              alt={feature.altTag || feature.title || "Feature"}
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
                          {feature.title || property.featureNames?.[index]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Nearby Benefits */}
          {propertyNearbyBenefits.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Nearby Benefits</h5>
              </Card.Header>
              <Card.Body>
                <div className="amenities-grid">
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
                      "Nearby Benefit";
                    const distance = benefit.distance
                      ? `${benefit.distance} KM`
                      : "";

                    return (
                      <div key={benefit.id || index} className="amenity-item">
                        {imageUrl ? (
                          <div className="amenity-image-wrapper">
                            <Image
                              src={imageUrl}
                              alt={
                                benefit.altTag ||
                                fullBenefit?.altTag ||
                                benefitName
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
              </Card.Body>
            </Card>
          )}

          {/* Additional Information */}
          {(property.virtualTour ||
            property.reraId ||
            property.reraState ||
            property.possession ||
            property.occupancy) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Additional Information</h5>
              </Card.Header>
              <Card.Body>
                <Table bordered>
                  <tbody>
                    {property.virtualTour && (
                      <tr>
                        <td style={{ width: "30%", fontWeight: "600" }}>
                          Virtual Tour
                        </td>
                        <td>
                          <a
                            href={property.virtualTour}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {property.virtualTour}
                          </a>
                        </td>
                      </tr>
                    )}
                    {property.reraId && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>RERA ID</td>
                        <td>{property.reraId}</td>
                      </tr>
                    )}
                    {property.reraState && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>RERA State</td>
                        <td>{property.reraState}</td>
                      </tr>
                    )}
                    {property.possession && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>Possession</td>
                        <td>{property.possession}</td>
                      </tr>
                    )}
                    {property.occupancy && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>Occupancy</td>
                        <td>{property.occupancy}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Column - Contact & Approval Info */}
        <Col lg={4}>
          {/* Contact Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Contact Information</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  {property.contactName && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Name</td>
                      <td>{property.contactName}</td>
                    </tr>
                  )}
                  {property.contactPhone && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>
                        <FontAwesomeIcon icon={faPhone} className="me-1" />
                        Phone
                      </td>
                      <td>
                        <a href={`tel:${property.contactPhone}`}>
                          {property.contactPhone}
                        </a>
                      </td>
                    </tr>
                  )}
                  {property.contactEmail && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>
                        <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                        Email
                      </td>
                      <td>
                        <a href={`mailto:${property.contactEmail}`}>
                          {property.contactEmail}
                        </a>
                      </td>
                    </tr>
                  )}
                  {property.contactPreference && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Contact Preference</td>
                      <td>{property.contactPreference}</td>
                    </tr>
                  )}
                  {property.preferredTime && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Preferred Time</td>
                      <td>{property.preferredTime}</td>
                    </tr>
                  )}
                  {property.additionalNotes && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Additional Notes</td>
                      <td>{property.additionalNotes}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Approval Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Approval Information</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Status</td>
                    <td>{getStatusBadge(property.approvalStatus)}</td>
                  </tr>
                  {property.approvedBy && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Approved By</td>
                      <td>
                        {property.approvedBy.email ||
                          property.approvedBy.username ||
                          "N/A"}
                      </td>
                    </tr>
                  )}
                  {property.approvedAt && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Approved At</td>
                      <td>{new Date(property.approvedAt).toLocaleString()}</td>
                    </tr>
                  )}
                  {property.rejectionReason && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Rejection Reason</td>
                      <td className="text-danger">
                        {property.rejectionReason}
                      </td>
                    </tr>
                  )}
                  {property.createdAt && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Created At</td>
                      <td>{new Date(property.createdAt).toLocaleString()}</td>
                    </tr>
                  )}
                  {property.updatedAt && (
                    <tr>
                      <td style={{ fontWeight: "600" }}>Last Updated</td>
                      <td>{new Date(property.updatedAt).toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* User Information */}
          {(property.userEmail || property.userName) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Submitted By</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  {property.userAvatar && (
                    <Image
                      src={property.userAvatar}
                      alt={property.userName || "User"}
                      width={60}
                      height={60}
                      className="rounded-circle me-3"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  )}
                  <div>
                    <h6 className="mb-0">{property.userName || "N/A"}</h6>
                    {property.userVerified && (
                      <Badge bg="success" className="mt-1">
                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <Table bordered>
                  <tbody>
                    {property.userEmail && (
                      <tr>
                        <td style={{ width: "40%", fontWeight: "600" }}>
                          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                          Email
                        </td>
                        <td>
                          <a href={`mailto:${property.userEmail}`}>
                            {property.userEmail}
                          </a>
                        </td>
                      </tr>
                    )}
                    {property.userPhone && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Phone
                        </td>
                        <td>
                          <a href={`tel:${property.userPhone}`}>
                            {property.userPhone}
                          </a>
                        </td>
                      </tr>
                    )}
                    {property.userId && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>User ID</td>
                        <td>{property.userId}</td>
                      </tr>
                    )}
                    {property.userLocation && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2"
                          />
                          Location
                        </td>
                        <td>{property.userLocation}</td>
                      </tr>
                    )}
                    {property.userExperience && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>Experience</td>
                        <td>{property.userExperience}</td>
                      </tr>
                    )}
                    {property.userRating !== null &&
                      property.userRating !== undefined && (
                        <tr>
                          <td style={{ fontWeight: "600" }}>Rating</td>
                          <td>
                            <span className="me-2">
                              {property.userRating.toFixed(1)}
                            </span>
                            <FontAwesomeIcon
                              icon={faStar}
                              className="text-warning"
                            />
                          </td>
                        </tr>
                      )}
                    {property.userTotalDeals !== null &&
                      property.userTotalDeals !== undefined && (
                        <tr>
                          <td style={{ fontWeight: "600" }}>Total Deals</td>
                          <td>{property.userTotalDeals}</td>
                        </tr>
                      )}
                    {property.userBio && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>Bio</td>
                        <td>{property.userBio}</td>
                      </tr>
                    )}
                    {property.userCreatedAt && (
                      <tr>
                        <td style={{ fontWeight: "600" }}>Member Since</td>
                        <td>
                          {new Date(
                            property.userCreatedAt,
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Property Listing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to reject this property listing?</p>
          {property && (
            <p>
              <strong>{property.title || "Untitled Property"}</strong>
            </p>
          )}
          <Form.Group className="mb-3">
            <Form.Label>
              Rejection Reason <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={!rejectReason.trim() || processing}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              "Reject Property"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
