"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import NextImage from "next/image";
import axios from "axios";
import "./property-approvals.css";

//variable for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PropertyApprovalsPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(null);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}admin/property-listings/pending`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access Denied: Super admin role required");
        }
        const errorResult = await response.json();
        throw new Error(
          errorResult.message ||
            `Failed to fetch properties: ${response.status}`,
        );
      }

      const result = await response.json();

      if (result.success && result.properties) {
        setProperties(result.properties);
      } else {
        setError(result.message || "Failed to load properties");
      }
    } catch (err) {
      console.error("Error fetching pending properties:", err);
      setError(err.message || "Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (propertyId) => {
    if (
      !window.confirm("Are you sure you want to approve this property listing?")
    ) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}admin/property-listings/${propertyId}/approve`,
        {},
        { withCredentials: true },
      );

      if (response.status === 200) {
        alert("Property approved successfully!");
        fetchPendingProperties(); // Refresh the list
      }
    } catch (err) {
      console.error("Error approving property:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to approve property. Please try again.",
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProperty) return;

    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessing(selectedProperty.id);
      const response = await axios.post(
        `${API_BASE_URL}admin/property-listings/${selectedProperty.id}/reject`,
        { reason: rejectReason },
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        alert("Property rejected successfully!");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedProperty(null);
        fetchPendingProperties(); // Refresh the list
      }
    } catch (err) {
      console.error("Error rejecting property:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject property. Please try again.",
      );
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const openRejectModal = (property) => {
    setSelectedProperty(property);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    let cleanImageUrl = imageUrl;

    if (
      cleanImageUrl.match(/^[A-Za-z]:[\/\\]/) ||
      (cleanImageUrl.startsWith("/") &&
        !cleanImageUrl.startsWith(`${API_BASE_URL}get/`))
    ) {
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
    return `${API_BASE_URL}get/images/${cleanImageUrl}`;
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading pending properties...</p>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Error Loading Properties</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchPendingProperties}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="container-fluid py-4 property-approvals-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="mb-0">Property Approvals</h2>
        <Button variant="outline-primary" onClick={fetchPendingProperties}>
          Refresh
        </Button>
      </div>

      {properties.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No Pending Properties</Alert.Heading>
          <p>There are no properties waiting for approval at the moment.</p>
        </Alert>
      ) : (
        <div className="row">
          {properties.map((property) => (
            <div
              key={property.id}
              className="col-12 col-sm-6 col-md-6 col-lg-4 mb-4"
            >
              <Card style={{ width: "100%" }}>
                {property.imageUrls && property.imageUrls.length > 0 && (
                  <div
                    style={{
                      height: "200px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <NextImage
                      src={
                        getImageUrl(property.imageUrls[0]) || "/placeholder.jpg"
                      }
                      alt={property.title || "Property"}
                      fill
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>
                )}
                <Card.Body>
                  <Card.Title>
                    {property.title || "Untitled Property"}
                  </Card.Title>
                  <Card.Text className="text-muted small">
                    {property.city || "N/A"} • {property.locality || "N/A"}
                  </Card.Text>
                  <div className="mb-2">
                    <strong>{formatPrice(property.totalPrice)}</strong>
                    {property.pricePerSqft && (
                      <span className="text-muted ms-2">
                        ({formatPrice(property.pricePerSqft)}/sqft)
                      </span>
                    )}
                  </div>
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-1">
                      {property.bedrooms || "N/A"} BHK
                    </Badge>
                    {property.listingType && (
                      <Badge bg="info" className="me-1">
                        {property.listingType}
                      </Badge>
                    )}
                    {property.transaction && (
                      <Badge bg="warning" className="me-1">
                        {property.transaction}
                      </Badge>
                    )}
                  </div>
                  {property.description && (
                    <Card.Text
                      className="small text-muted"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {property.description}
                    </Card.Text>
                  )}
                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(property.id)}
                      disabled={processing === property.id}
                      className="flex-fill flex-sm-grow-0"
                    >
                      {processing === property.id ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openRejectModal(property)}
                      disabled={processing === property.id}
                      className="flex-fill flex-sm-grow-0"
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/admin/dashboard/property-approvals/${property.id}`,
                        )
                      }
                      className="flex-fill flex-sm-grow-0"
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Property Listing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to reject this property listing?</p>
          {selectedProperty && (
            <p>
              <strong>{selectedProperty.title || "Untitled Property"}</strong>
            </p>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Rejection Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
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
            disabled={
              !rejectReason.trim() || processing === selectedProperty?.id
            }
          >
            {processing === selectedProperty?.id ? (
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
