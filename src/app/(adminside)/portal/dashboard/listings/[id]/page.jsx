"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ModernPropertyListing from "../../../_components/ModernPropertyListing";
import { Card, Button, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import NextImage from "next/image";
import Cookies from "js-cookie";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ListingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = params.id;
  const action = searchParams.get("action");
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (action === "edit") {
      // For edit, we'll use the ModernPropertyListing component with edit mode
      setLoading(false);
      return;
    }

    // For view, fetch the listing details
    fetchListingDetails();
  }, [listingId, action]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get("token");

      if (!token) {
        setError("Please login to view property details");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}user/property-listings/${listingId}`,
        {
          withCredentials: true,
        },
      );

      if (!response.status === 200) {
        throw new Error(`Failed to fetch property: ${response.status}`);
      }

      const result = await response.data;

      if (result.success && result.property) {
        setListing(result.property);
      } else {
        setError(result.message || "Failed to fetch property details");
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      setError(
        err.message || "Failed to load property details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // If edit mode, show the ModernPropertyListing component
  if (action === "edit") {
    return <ModernPropertyListing listingId={listingId} />;
  }

  // View mode - show property details
  if (loading) {
    return (
      <div className="portal-content">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-content">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Property</Alert.Heading>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => router.push("/portal/dashboard/listings")}
          >
            Back to Listings
          </Button>
        </Alert>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="portal-content">
        <Alert variant="warning">
          <Alert.Heading>Property Not Found</Alert.Heading>
          <p>
            The property you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => router.push("/portal/dashboard/listings")}
          >
            Back to Listings
          </Button>
        </Alert>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Price not set";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "Price not set";
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(numPrice).toLocaleString("en-IN")}`;
  };

  const formatArea = (area) => {
    if (area === null || area === undefined || area === "")
      return "Not specified";
    const numericArea = typeof area === "string" ? parseFloat(area) : area;
    if (Number.isNaN(numericArea)) return "Not specified";
    return `${numericArea.toLocaleString("en-IN")} sq ft`;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If already a full URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    const apiUrl = API_BASE_URL;

    let cleanImageUrl = imageUrl;

    // Handle absolute paths (Windows: D:/path or D:\path, Unix: /path)
    // Check for Windows drive letter or absolute Unix path
    if (
      cleanImageUrl.match(/^[A-Za-z]:[\/\\]/) ||
      (cleanImageUrl.startsWith("/") && !cleanImageUrl.startsWith("/get/"))
    ) {
      // Extract relative path from absolute path
      // Look for "property-listings" in the path
      const propertyListingsIndex = cleanImageUrl
        .toLowerCase()
        .indexOf("property-listings");
      if (propertyListingsIndex !== -1) {
        // Extract everything from "property-listings" onwards
        cleanImageUrl = cleanImageUrl.substring(propertyListingsIndex);
      } else {
        // If no "property-listings" found, try to extract from common patterns
        // This handles cases where path might be different
        console.warn("Could not find property-listings in path:", imageUrl);
        return null;
      }
    }

    // Normalize path separators (convert backslashes to forward slashes)
    cleanImageUrl = cleanImageUrl.replace(/\\/g, "/");

    // Remove leading slash if present
    if (cleanImageUrl.startsWith("/")) {
      cleanImageUrl = cleanImageUrl.slice(1);
    }

    // Remove "uploads/" prefix if present
    if (cleanImageUrl.startsWith("uploads/")) {
      cleanImageUrl = cleanImageUrl.replace("uploads/", "");
    }

    // Split the path: property-listings/{id}/{filename}
    const pathParts = cleanImageUrl.split("/");
    if (pathParts.length >= 3 && pathParts[0] === "property-listings") {
      const listingId = pathParts[1];
      const filename = pathParts.slice(2).join("/");
      return `${apiUrl}get/images/property-listings/${listingId}/${filename}`;
    } else if (pathParts.length === 2) {
      // Use the 2-level endpoint: /get/images/{blogFolder}/{filename}
      return `${apiUrl}get/images/${pathParts[0]}/${pathParts[1]}`;
    }
    // Fallback: try direct path
    return `${apiUrl}get/images/${cleanImageUrl}`;
  };

  const getStatusBadge = (status) => {
    if (!status) return "secondary";
    switch (status.toUpperCase()) {
      case "DRAFT":
        return "warning";
      case "PENDING":
        return "info";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="portal-content">
      <div className="portal-card">
        <div className="portal-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Property Details</h2>
              <p className="text-muted mb-0">
                View your property listing information
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => router.push("/portal/dashboard/listings")}
              >
                Back to Listings
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  router.push(
                    `/portal/dashboard/listings/${listingId}?action=edit`,
                  )
                }
              >
                Edit Property
              </Button>
            </div>
          </div>
        </div>

        <div className="portal-card-body">
          {/* Rejection Reason Alert */}
          {listing.approvalStatus &&
            listing.approvalStatus.toUpperCase() === "REJECTED" &&
            listing.rejectionReason && (
              <Alert variant="danger" className="mb-4">
                <Alert.Heading>
                  <strong>Property Rejected</strong>
                </Alert.Heading>
                <p className="mb-0">
                  <strong>Rejection Reason:</strong> {listing.rejectionReason}
                </p>
              </Alert>
            )}

          {/* Image Gallery */}
          {listing.imageUrls && listing.imageUrls.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Property Images</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {listing.imageUrls.map((imageUrl, index) => {
                    const fullImageUrl = getImageUrl(imageUrl);
                    return fullImageUrl ? (
                      <Col key={index} md={4} sm={6} className="mb-3">
                        <div
                          className="position-relative"
                          style={{
                            height: "200px",
                            overflow: "hidden",
                            borderRadius: "8px",
                          }}
                        >
                          <NextImage
                            src={fullImageUrl}
                            alt={`Property image ${index + 1}`}
                            fill
                            style={{ objectFit: "cover" }}
                            unoptimized
                            onError={(e) => {
                              console.error("Image load error:", fullImageUrl);
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      </Col>
                    ) : null;
                  })}
                </Row>
              </Card.Body>
            </Card>
          )}

          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Basic Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Title:</strong>
                    </Col>
                    <Col sm={8}>{listing.title || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Listing Type:</strong>
                    </Col>
                    <Col sm={8}>{listing.listingType || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Transaction Type:</strong>
                    </Col>
                    <Col sm={8}>{listing.transaction || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Sub Type:</strong>
                    </Col>
                    <Col sm={8}>{listing.subType || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Status:</strong>
                    </Col>
                    <Col sm={8}>
                      <Badge bg={getStatusBadge(listing.approvalStatus)}>
                        {listing.approvalStatus || "N/A"}
                      </Badge>
                    </Col>
                  </Row>
                  {listing.approvalStatus &&
                    listing.approvalStatus.toUpperCase() === "REJECTED" &&
                    listing.rejectionReason && (
                      <Row className="mb-3">
                        <Col sm={4}>
                          <strong>Rejection Reason:</strong>
                        </Col>
                        <Col sm={8}>
                          <div className="text-danger">
                            <strong>{listing.rejectionReason}</strong>
                          </div>
                        </Col>
                      </Row>
                    )}
                  {listing.description && (
                    <Row className="mb-3">
                      <Col sm={4}>
                        <strong>Description:</strong>
                      </Col>
                      <Col sm={8}>{listing.description}</Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Location & Area</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Project Name:</strong>
                    </Col>
                    <Col sm={8}>{listing.projectName || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Builder:</strong>
                    </Col>
                    <Col sm={8}>{listing.builderName || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Address:</strong>
                    </Col>
                    <Col sm={8}>{listing.address || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Locality:</strong>
                    </Col>
                    <Col sm={8}>{listing.locality || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>City:</strong>
                    </Col>
                    <Col sm={8}>{listing.city || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Pincode:</strong>
                    </Col>
                    <Col sm={8}>{listing.pincode || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Carpet Area:</strong>
                    </Col>
                    <Col sm={8}>{formatArea(listing.carpetArea)}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Built-up Area:</strong>
                    </Col>
                    <Col sm={8}>{formatArea(listing.builtUpArea)}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Super Built-up Area:</strong>
                    </Col>
                    <Col sm={8}>{formatArea(listing.superBuiltUpArea)}</Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Property Configuration</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Bedrooms:</strong>
                    </Col>
                    <Col sm={8}>{listing.bedrooms || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Bathrooms:</strong>
                    </Col>
                    <Col sm={8}>{listing.bathrooms || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Balconies:</strong>
                    </Col>
                    <Col sm={8}>{listing.balconies || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Floor Number:</strong>
                    </Col>
                    <Col sm={8}>{listing.floorNumber || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Total Floors:</strong>
                    </Col>
                    <Col sm={8}>{listing.totalFloors || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Facing:</strong>
                    </Col>
                    <Col sm={8}>{listing.facing || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Furnished:</strong>
                    </Col>
                    <Col sm={8}>{listing.furnished || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Parking:</strong>
                    </Col>
                    <Col sm={8}>{listing.parking || "N/A"}</Col>
                  </Row>
                  {listing.features && listing.features.length > 0 && (
                    <Row className="mb-3">
                      <Col sm={4}>
                        <strong>Features:</strong>
                      </Col>
                      <Col sm={8}>
                        <ul>
                          {listing.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Pricing</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Total Price:</strong>
                    </Col>
                    <Col sm={6} className="text-primary">
                      <strong>{formatPrice(listing.totalPrice)}</strong>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Price per Sqft:</strong>
                    </Col>
                    <Col sm={6}>
                      {listing.pricePerSqft
                        ? `₹${listing.pricePerSqft.toLocaleString("en-IN")}`
                        : "N/A"}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Maintenance:</strong>
                    </Col>
                    <Col sm={6}>
                      {listing.maintenanceCharges
                        ? `₹${listing.maintenanceCharges.toLocaleString("en-IN")}`
                        : "N/A"}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Booking Amount:</strong>
                    </Col>
                    <Col sm={6}>
                      {listing.bookingAmount
                        ? `₹${listing.bookingAmount.toLocaleString("en-IN")}`
                        : "N/A"}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Contact Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Contact Name:</strong>
                    </Col>
                    <Col sm={6}>{listing.contactName || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Phone:</strong>
                    </Col>
                    <Col sm={6}>{listing.contactPhone || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Email:</strong>
                    </Col>
                    <Col sm={6}>{listing.contactEmail || "N/A"}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Preferred Time:</strong>
                    </Col>
                    <Col sm={6}>{listing.preferredTime || "N/A"}</Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Additional Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Created:</strong>
                    </Col>
                    <Col sm={6}>
                      {listing.createdAt
                        ? new Date(listing.createdAt).toLocaleDateString()
                        : "N/A"}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <strong>Last Updated:</strong>
                    </Col>
                    <Col sm={6}>
                      {listing.updatedAt
                        ? new Date(listing.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </Col>
                  </Row>
                  {listing.additionalNotes && (
                    <Row className="mb-3">
                      <Col sm={12}>
                        <strong>Notes:</strong>
                        <p className="mt-2">{listing.additionalNotes}</p>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}
