"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShare,
  faArrowLeft,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getPropertyById } from "../../../(home)/properties/propertyData";
import "./projectDetail.css";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.["project-slug"]) {
      const propertyData = getPropertyById(params["project-slug"]);
      setProperty(propertyData);
      setLoading(false);
    }
  }, [params]);

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <h2>Property Not Found</h2>
          <p className="text-muted">The property you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/properties" title="Back to Properties" className="btn btn-primary mt-3">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const generatePrice = (price) => {
    if (!price) return "Price on request";
    if (price.includes("Cr")) {
      return `₹${price.replace("Cr", "")} Crore`;
    } else if (price.includes("Lakh")) {
      return `₹${price.replace("₹", "").replace("Lakh", "")} Lakh`;
    }
    return price;
  };

  return (
    <div className="project-detail-page">
      {/* Header with Back Button */}
      <div className="container-fluid bg-white border-bottom sticky-top" style={{ zIndex: 1000 }}>
        <div className="container py-1">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => router.back()}
              className="btn btn-outline-secondary"
              style={{ borderRadius: "50%", width: "40px", height: "40px", padding: 0 }}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h4 className="mb-0">Project Details</h4>
            {property.verified && (
              <span className="badge bg-success">
                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container my-4">
        <div className="row">
          {/* Left Column - Image Gallery */}
          <div className="col-lg-8 mb-4">
            {/* Main Image */}
            <div className="main-image-container position-relative mb-3">
              <Image
                src={property.image}
                alt={property.title}
                width={800}
                height={600}
                className="main-image"
                style={{ objectFit: "cover", width: "100%", height: "auto", borderRadius: "12px" }}
              />
              {property.imageLabel && (
                <div className="image-badge">{property.imageLabel}</div>
              )}
              {property.postedDate && (
                <div className="posted-badge">Posted: {property.postedDate}</div>
              )}
            </div>

            {/* Property Title and Developer */}
            <div className="property-header mb-4">
              <h2 className="property-title-main">{property.title}</h2>
              {/* <p className="property-developer-main text-muted mb-3">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                {property.developer}
              </p> */}
            </div>

            {/* Key Details Grid */}
            <div className="key-details-grid mb-4">
              {property.superArea && (
                <div className="detail-item">
                  <strong>Super Area</strong>
                  <span>{property.superArea}</span>
                </div>
              )}
              {property.status && (
                <div className="detail-item">
                  <strong>Status</strong>
                  <span>{property.status}</span>
                </div>
              )}
              {property.possession && (
                <div className="detail-item">
                  <strong>Possession</strong>
                  <span>{property.possession}</span>
                </div>
              )}
              {property.transaction && (
                <div className="detail-item">
                  <strong>Transaction</strong>
                  <span>{property.transaction}</span>
                </div>
              )}
              {property.furnishing && (
                <div className="detail-item">
                  <strong>Furnishing</strong>
                  <span>{property.furnishing}</span>
                </div>
              )}
              {property.bathroom && (
                <div className="detail-item">
                  <strong>Bathrooms</strong>
                  <span>{property.bathroom}</span>
                </div>
              )}
              {property.balcony && (
                <div className="detail-item">
                  <strong>Balcony</strong>
                  <span>{property.balcony}</span>
                </div>
              )}
              {property.propertyTypeCategory && (
                <div className="detail-item">
                  <strong>Property Type</strong>
                  <span>{property.propertyTypeCategory}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="property-description-section mb-4">
              <h4 className="section-title">About This Property</h4>
              <p className="property-description-full">{property.description}</p>
            </div>

            {/* Additional Information */}
            <div className="additional-info-section mb-4">
              <h4 className="section-title">Additional Information</h4>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Price per sqft:</span>
                  <span className="info-value">{property.pricePerSqft}</span>
                </div>
                {property.photos && (
                  <div className="info-item">
                    <span className="info-label">Photos:</span>
                    <span className="info-value">{property.photos}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Price & Contact */}
          <div className="col-lg-4">
            <div className="sticky-sidebar">
              {/* Price Card */}
              <div className="price-card mb-4">
                <div className="price-section">
                  <h3 className="price-main">{generatePrice(property.price)}</h3>
                  <p className="price-per-sqft">{property.pricePerSqft}</p>
                </div>
                <hr />
                <div className="action-buttons">
                  {property.buttonType === "phone" ? (
                    <>
                      <button className="btn btn-outline-primary w-100 mb-2">
                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                        Get Phone No.
                      </button>
                      <button className="btn btn-danger w-100">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        Contact Agent
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-danger w-100 mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        Contact Agent
                      </button>
                      <button className="btn btn-outline-primary w-100">
                        Enquire Now
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card mb-4">
                <h5 className="card-title">Quick Actions</h5>
                <div className="quick-actions">
                  <button className="action-btn">
                    <FontAwesomeIcon icon={faHeart} className="me-2" />
                    Save Property
                  </button>
                  <button className="action-btn">
                    <FontAwesomeIcon icon={faShare} className="me-2" />
                    Share Property
                  </button>
                </div>
              </div>

              {/* Contact Agent Card */}
              <div className="contact-agent-card">
                <h5 className="card-title">Contact Agent</h5>
                <p className="text-muted small">
                  Get in touch with our property experts for more information about this property.
                </p>
                <button className="btn btn-primary w-100">
                  Schedule a Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
