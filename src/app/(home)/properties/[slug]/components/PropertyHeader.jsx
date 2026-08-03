"use client";

import "./style/PropertyHeader.css";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faBuilding,
  faPhone,
  faHeart,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";

export default function PropertyHeader({
  property,
  locationParts,
  formatPrice,
  activeTab,
  setActiveTab,
  scrollToSection,
  setShowContactModal,
}) {

  return (
    <section className="property-header">

      <div className="container">

        {/* Breadcrumb */}

        <div className="property-breadcrumb">

          <Link href="/">Home</Link>

          <span>/</span>

          <Link href="/properties">
            {property.city}
          </Link>

          <span>/</span>

          <span>{property.listingType}</span>

          <span>/</span>

          <span className="active">
            {property.locality}
          </span>

        </div>

        {/* Top Section */}

        <div className="property-header-top">

          {/* Left */}

          <div className="property-header-left">

            <h1 className="property-title">
              {property.title}
            </h1>

            <div className="property-meta">

              <div className="meta-item">

                <FontAwesomeIcon icon={faLocationDot} />

                <span>
                  {locationParts.filter(Boolean).join(", ")}
                </span>

              </div>

              <div className="meta-item">

                <FontAwesomeIcon icon={faBuilding} />

                <span>
                  {property.listingType}
                </span>

              </div>

            </div>

            <div className="property-price-row">

              <div className="property-price">

                {formatPrice(property.totalPrice)}

              </div>

              {property.pricePerSqft && (
                <div className="price-per-sqft">

                  ₹
                  {Math.round(
                    property.pricePerSqft
                  ).toLocaleString("en-IN")}
                  /sq ft

                </div>
              )}

            </div>

          </div>

          {/* Right */}

          <div className="property-header-right">

            <button
              className="contact-btn"
              onClick={() =>
                setShowContactModal(true)
              }
            >
              {/* <FontAwesomeIcon icon={faPhone} /> */}

              Contact Dealer
            </button>

            <div className="action-icons">

              <button className="icon-btn">

                <FontAwesomeIcon icon={faHeart} />

              </button>

              <button className="icon-btn">

                <FontAwesomeIcon
                  icon={faShareNodes}
                />

              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}