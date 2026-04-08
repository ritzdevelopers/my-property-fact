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
import Cookies from "js-cookie";
import { getPublicApiBase } from "@/lib/publicApiBase";
import DashboardHeader from "../common-model/dashboardHeader";
import "./property-approvals.css";

function adminFetchHeaders() {
  const token =
    typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function adminAxiosConfig() {
  const token =
    typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    withCredentials: true,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

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
      const apiBase = getPublicApiBase();
      const response = await fetch(
        `${apiBase}admin/property-listings/pending`,
        {
          credentials: "include",
          headers: adminFetchHeaders(),
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "Access denied: Property approvals permission required.",
          );
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
        `${getPublicApiBase()}admin/property-listings/${propertyId}/approve`,
        {},
        adminAxiosConfig(),
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
        `${getPublicApiBase()}admin/property-listings/${selectedProperty.id}/reject`,
        { reason: rejectReason },
        adminAxiosConfig(),
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
    const apiBase = getPublicApiBase();
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    let cleanImageUrl = imageUrl;

    if (
      cleanImageUrl.match(/^[A-Za-z]:[\/\\]/) ||
      (cleanImageUrl.startsWith("/") &&
        !cleanImageUrl.startsWith(`${apiBase}get/`))
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
      return `${apiBase}get/images/property-listings/${listingId}/${filename}`;
    }
    return `${apiBase}get/images/${cleanImageUrl}`;
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
    <div className="admin-page-surface property-approvals-page">
      <DashboardHeader
        heading="Property Approvals"
        pageStyle="executivePlain"
      />

      <div className="container-fluid px-0">

        {properties.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>No Pending Properties</Alert.Heading>
            <p>There are no properties waiting for approval at the moment.</p>
          </Alert>
        ) : (
          <div className="row g-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="col-12 col-md-6 col-xl-4"
              >
                <article className="approval-card">
                  <div className="approval-card__image-container">
                    <NextImage
                      src={
                        getImageUrl(property.imageUrls[0]) || "/placeholder.jpg"
                      }
                      alt={property.title || "Property"}
                      fill
                      className="approval-card__image"
                      unoptimized
                    />
                    {property.listingType && (
                      <span className="approval-card__badge-type">
                        {property.listingType}
                      </span>
                    )}
                  </div>

                  <div className="approval-card__content">
                    <div className="approval-card__meta">
                      <span className="approval-card__location">
                        {property.city || "N/A"} • {property.locality || "N/A"}
                      </span>
                    </div>

                    <h3 className="approval-card__title">
                      {property.title || "Untitled Property"}
                    </h3>

                    <div className="approval-card__price-row">
                      <span className="approval-card__price">{formatPrice(property.totalPrice)}</span>
                      {property.pricePerSqft && (
                        <span className="approval-card__price-sqft">
                          ({formatPrice(property.pricePerSqft)}/sqft)
                        </span>
                      )}
                    </div>

                    <div className="approval-card__specs">
                      <span className="admin-chip-role-muted">
                        {property.bedrooms || "N/A"} BHK
                      </span>
                      {property.transaction && (
                        <span className="admin-chip-warn">
                          {property.transaction}
                        </span>
                      )}
                    </div>

                    <p className="approval-card__description">
                      {property.description || "No description provided."}
                    </p>

                    <div className="approval-card__actions">
                      <button
                        type="button"
                        className="approval-btn approval-btn--approve"
                        onClick={() => handleApprove(property.id)}
                        disabled={processing === property.id}
                      >
                        {processing === property.id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Approve"
                        )}
                      </button>
                      <button
                        type="button"
                        className="approval-btn approval-btn--reject"
                        onClick={() => openRejectModal(property)}
                        disabled={processing === property.id}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="approval-btn approval-btn--details"
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/property-approvals/${property.id}`,
                          )
                        }
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>

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
