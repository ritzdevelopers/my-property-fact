"use client";

import "./style/PropertyContactBanner.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

export default function PropertyContactBanner({
  phone,
  onCallClick,
  onEnquiryClick,
}) {
  return (
    <section className="property-contact-banner">

      <div className="property-contact-container">

        <div className="banner-left">

          <img
            src="/property/site-visit-left.webp"
            alt="Site Visit"
          />

        </div>

        <div className="banner-center">

          <h2>
            Contact Us Now To Schedule A Site Visit Or
            <br />
            Get More Information
          </h2>

          <div className="banner-buttons">

            <button
              className="call-btn"
              onClick={onCallClick}
            >
              <FontAwesomeIcon icon={faPhone} />
              <span>Call Now: {phone}</span>
            </button>

            <button
              className="enquiry-btn"
              onClick={onEnquiryClick}
            >
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Send Enquiry</span>
            </button>

          </div>

          <p>
            Interested in This Property?
          </p>

        </div>

        <div className="banner-right">

          <img
            src="/property/site-visit-right.webp"
            alt="Property"
          />

        </div>

      </div>

    </section>
  );
}