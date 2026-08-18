"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

const MainSection = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const leadOtp = useLeadOtp(formData.phone);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verified = await verifyLandingLeadOtp(leadOtp, formData.phone);
    if (!verified) {
      setStatus(getLandingOtpErrorMessage(leadOtp));
      return;
    }

    setStatus("Submitting...");

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx4BfR6EITWPi0bnFPKlwLknP8vz2bdNiIv3mRHNklGeyfaaQyuNKGocZWSd738CrUy/exec",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.result === "success") {
        setStatus("Form submitted successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
        router.push("landing-page/thankyou");
      } else {
        setStatus("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="main-section container-fluid d-flex flex-column flex-md-row">
      {/* Left: About Section */}
      <div className="left-section d-flex flex-column justify-content-center px-3 px-md-5 w-100 w-md-50 mb-4 mb-md-0">
        <h2 className="mb-3">About Shubh Anandam</h2>
        <p>
          A Legacy of Harmony, A Future of Fulfillment Shubh Anandam is more
          than a housing project — it’s a thoughtfully built ecosystem where
          comfort, culture, and community come together. With integrated
          townships across different parts of India, we offer spaces that go
          beyond just living — they inspire a way of life that’s rooted in
          values and designed for tomorrow. Every detail — from Vastu-compliant
          planning to lush green environments and holistic amenities — reflects
          our belief in creating not just homes, but experiences that nurture
          body, mind, and soul. Whether it’s your first home or a generational
          gift, Shubh Anandam brings together spiritual serenity, modern
          infrastructure, and community harmony — all under one timeless vision.
          <br />
        </p>
        <span className="tagline" style={{ fontWeight: "bold" }}>
          Crafted with Purpose. Designed for Generations.
        </span>
      </div>

      {/* Right: Form Section */}
      <div className="right-section d-flex justify-content-center align-items-start align-items-md-center w-100 w-md-50 px-3 px-md-5">
        <div className="form-container bg-white shadow p-4" id="form-container">
          <h5 className="mb-3">Contact Us</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Name"
                style={{ padding: "15px 30px" }}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="Phone"
                style={{ padding: "15px 30px" }}
                required
              />
            </div>
            <div className="mb-3">
              <LeadOtpFields
                phone={formData.phone}
                otp={leadOtp.otp}
                onOtpChange={leadOtp.setOtp}
                otpSent={leadOtp.otpSent}
                isVerified={leadOtp.isVerified}
                sending={leadOtp.sending}
                verifying={leadOtp.verifying}
                error={leadOtp.error}
                resendSeconds={leadOtp.resendSeconds}
                onSendOtp={leadOtp.sendOtp}
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Email"
                style={{ padding: "15px 30px" }}
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-control"
                placeholder="Message"
                rows="3"
                style={{ padding: "15px 30px", resize: "none" }}
                required
              />
            </div>
            <button type="submit" className="w-100">
              Submit Enquiry
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .main-section {
          min-height: 60vh;
          background-color: #f8f9fa;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 3rem;
          padding-bottom: 3rem;
        }

        h2 {
          font-size: 2.25rem;
          font-weight: 600;
        }

        h5 {
          font-size: 2.25rem;
          font-weight: 600;
        }

        p {
          font-size: 1.125rem;
          line-height: 2rem;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
          border-radius: 30px;
          height: auto;
        }

        button {
          background-color: #f0d21f;
          border: none;
          padding: 15px 30px;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
        }

        @media (max-width: 767.98px) {
          h2 {
            font-size: 1.75rem;
          }
          p {
            font-size: 1rem;
            line-height: 1.75rem;
          }
          h5 {
            font-size: 1.75rem;
          }
          .form-container {
            max-width: 100%;
            border-radius: 20px;
            padding: 20px;
          }
          button {
            padding: 12px 24px;
            font-size: 1rem;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .main-section {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MainSection;
