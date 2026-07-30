"use client";
import { adminApiWithAuth, adminFetchHeaders } from "../../_lib/adminApiAuth";
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
import axios from "axios";
import Cookies from "js-cookie";
import { getPublicApiBase } from "@/lib/publicApiBase";
import DashboardHeader from "../common-model/dashboardHeader";
import { useAdminConfirm } from "../../_contexts/AdminConfirmContext";
import { toast } from "../../_lib/adminToast";
import "./property-approvals.css";



function adminAxiosConfig() {
  const token =
    typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    withCredentials: true,
    headers: {
    },
  };
}

export default function PropertyApprovalsPage() {
  const router = useRouter();
  const { confirm, alert } = useAdminConfirm();
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
    const ok = await confirm({
      title: "Approve this listing?",
      description:
        "The property will go live on the public website. Make sure details, images, and pricing are correct before approving.",
      confirmText: "Approve listing",
      cancelText: "Review again",
      variant: "default",
    });
    if (!ok) return;

    try {
      setProcessing(propertyId);
      const response = await axios.post(
        `${getPublicApiBase()}admin/property-listings/${propertyId}/approve`,
        {},
        adminAxiosConfig(),
      );

      if (response.status === 200) {
        toast.success("Property approved and published successfully.");
        fetchPendingProperties();
      }
    } catch (err) {
      console.error("Error approving property:", err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Could not approve this property. Please try again.",
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProperty) return;

    if (!rejectReason.trim()) {
      await alert({
        title: "Rejection reason required",
        description: "Please tell the listing owner why this property was rejected so they can fix and resubmit.",
        confirmText: "Understood",
        variant: "warning",
      });
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
        toast.success("Property rejected. The owner will be notified.");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedProperty(null);
        fetchPendingProperties();
      }
    } catch (err) {
      console.error("Error rejecting property:", err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Could not reject this property. Please try again.",
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
                    <img
                      src={
                        getImageUrl(property.imageUrls[0]) || "/placeholder.jpg"
                      }
                      alt={property.title || "Property"}
                      className="approval-card__image"
                     style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
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
