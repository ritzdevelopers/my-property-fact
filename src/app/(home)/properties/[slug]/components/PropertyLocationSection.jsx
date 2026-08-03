"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import "./style/PropertyLocationSection.css";

const PropertyLocationSection = ({ property }) => {
  if (!property) return null;

  // Use the same address shown in Overview
  const address =
    property.title ||
    [
      property.address,
      property.locality,
      property.city,
      property.state,
      property.pincode,
    ]
      .filter(Boolean)
      .join(", ");

  const hasAddress = Boolean(address);

  return (
    <section
      id="location-section"
      className="property-location-section"
    >
      <h2 className="location-title">
        Location
      </h2>

      <div className="location-address-card">

        <div className="location-icon">
          <FontAwesomeIcon icon={faLocationDot} />
        </div>

        <div className="location-content">
          <h5>Property Address</h5>

          <p>
            {address || "Address not available"}
          </p>
        </div>

      </div>

      <div className="location-map-card">

        {hasAddress ? (
          <iframe
            title="Property Map"
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              address
            )}&z=15&output=embed`}
          />
        ) : (
          <div className="map-placeholder">

            <FontAwesomeIcon
              icon={faMapLocationDot}
              className="map-placeholder-icon"
            />

            <h5>
              Map not available
            </h5>

            <p>
              Property address is not available.
            </p>

          </div>
        )}

      </div>

    </section>
  );
};

export default PropertyLocationSection;