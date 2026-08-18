"use client";

import { useState } from "react";
import bgImage from "../assets/hero_bg.webp";
import { useRouter } from "next/navigation";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

export default function Hero() {
  const [buttonText, setButtonText] = useState("Submit");
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const leadOtp = useLeadOtp(formData.phone);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, message } = formData;

    // Basic validation
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Phone number validation (10-digit Indian format starting with 6–9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const verified = await verifyLandingLeadOtp(leadOtp, formData.phone);
    if (!verified) {
      alert(getLandingOtpErrorMessage(leadOtp));
      return;
    }

    try {
      setIsSubmiting(true);
      setButtonText("Submitting...");
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbwFUrsuEzkLUjc07z9MXmKwKSb1zGNo8gCJrmNLI0mCqkhopIjdHYqzvT2zcTKMpqL7Xg/exec",
        {
          method: "POST",
          body: JSON.stringify({ name, email, phone, message }),
        }
      );

      const data = await res.json();

      if (data.result === "success") {
        setFormData({ name: "", email: "", phone: "", message: "" });
        router.push("onyx/thankyou");
      } else {
        alert("Submission failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Submission failed. Please try again.");
    }finally {
      setIsSubmiting(false);
      setButtonText("Submit");
    }
  };

  return (
    <section
      id="home"
      className="position-relative d-flex align-items-center"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "4rem 1.25rem",
      }}
      data-aos="fade-in"
    >
      {/* Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
          zIndex: 0,
        }}
      ></div>

      {/* Main Content */}
      <div
        className="container position-relative"
        style={{ zIndex: 1, marginTop: "3rem" }}
      >
        <div className="row align-items-center gy-5">
          {/* Left Text */}
          <div className="col-lg-6 text-center text-lg-start text-white">
            <p
              className="text-uppercase fw-bold"
              style={{ color: "#3AB24B", fontSize: "25px" }}
            >
              Welcome to ONYX by Splendor
            </p>

            <h1
              className="fw-bold"
              style={{ fontSize: "45px", lineHeight: "1.3" }}
            >
              The Landmark of Business, Retail & Culinary Luxury
            </h1>

            <p className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 fs-5 text-light">
              <i className="ri-map-pin-2-fill" style={{ color: "#3AB24B" }}></i>{" "}
              At Sector 142, Noida
            </p>

            <p className="fs-5 text-light">
              NOIDA’s upcoming premium address in the Noida-Greater Noida
              Expressway, ONYX, is the innovative amalgamation of global
              business standards, modern design, and lifestyle experience. This
              project is crafted for visionary brands and businesses to thrive
              with future-forward enterprises and culinary experiences that
              await them.
            </p>

            <div className="mt-4">
              <div
                className="rounded text-white px-4 py-2 fw-medium"
                style={{
                  width: "200px",
                  backgroundColor: "#324F43",
                  animation: "bounce 1.5s infinite",
                  fontSize: "18px",
                }}
              >
                Limited-Time Offer!
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="col-lg-6">
            <div
              className="bg-[#324F43] text-white rounded shadow-lg p-4 p-sm-5 mx-auto"
              style={{
                maxWidth: "420px",
                backgroundColor: "#324F43",
                opacity: 0.9,
              }}
              data-aos="fade-right"
            >
              <h3
                className="text-center text-lg-start fw-bold"
                style={{ color: "#3AB24B" }}
              >
                Schedule A Site Visit
              </h3>
              <p>
                Please fill out the form below, our expert will get back to you
                soon.
              </p>

              <form className="mt-4" onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="form-control"
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
                  <textarea
                    name="message"
                    placeholder="Your message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="form-control"
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 text-white"
                  style={{
                    background:
                      "linear-gradient(to right, #324F43, #3AB24B, #324F43)",
                    transition: "0.3s ease",
                  }}
                  disabled={isSubmiting}
                >
                  {buttonText || "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Style */}
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </section>
  );
}
