"use client";

import React from "react";
import logo from "../assets/newLogo.png";
import bgImage from "../assets/image.png";

const HeroSection = () => {
  const handleScrollToForm = () => {
    const formEl = document.getElementById("form-container");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="hero-section position-relative text-white">
      {/* Background Image */}
      <img loading="eager"
        src={bgImage}
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-n1"
      />

      {/* Dark Overlay */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overlay z-0"></div>

      <div className="head">
        {/* Top Bar: Logo + CTA */}
        <div className="top-bar position-relative z-1 px-3 px-sm-4 py-3 d-flex justify-content-between align-items-center">
          <img src={logo} alt="Logo" />
          <button className="cta-btn" onClick={handleScrollToForm}>
            Enquire now
          </button>
        </div>

        {/* Centered Heading */}
        <div
          className="d-flex justify-content-center align-items-center h-100 z-1 position-relative px-3"
          style={{ marginTop: "7.5rem" }}
        >
          <h1 className="display-5 display-sm-4 fw-bold text-center">
            Coming Soon...
          </h1>
        </div>
      </div>

      {/* Component Styles */}
      <style jsx>{`
        .hero-section {
          height: 60vh;
          overflow: hidden;
        }

        .head {
          width: 75%;
          margin: auto;
        }

        .overlay {
          background-color: rgba(0, 0, 0, 0.25);
        }
        .cta-btn {
          background-color: white;
          color: black;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
          font-size: 0.9rem;
        }
        .cta-btn:hover {
          background-color: #f1f1f1;
        }
        @media (min-width: 576px) {
          .hero-section {
            height: 70vh;
          }
          .cta-btn {
            padding: 10px 20px;
            font-size: 1rem;
          }
        }
        @media (max-width: 575.98px) {
          h1 {
            font-size: 1.75rem !important;
          }
          .head {
            width: 100%;
            margin: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
