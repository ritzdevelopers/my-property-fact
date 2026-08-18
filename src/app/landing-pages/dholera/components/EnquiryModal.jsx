"use client";
import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import { FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

export default function EnquiryModal({ isOpen, onClose, formType = "Enquiry" }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const leadOtp = useLeadOtp(formData.Phone);

  const modalRef = React.useRef(null);
  const overlayRef = React.useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ Name: "", Email: "", Phone: "", Message: "" });
      setErrors({});
      setSubmitMessage("");
    }
  }, [isOpen]);

  // Animate modal
  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.Name.trim()) {
      newErrors.Name = "Name is required";
    } else if (formData.Name.trim().length < 2) {
      newErrors.Name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.Email.trim()) {
      newErrors.Email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.Email)) {
        newErrors.Email = "Please enter a valid email address";
      }
    }

    // Phone validation
    if (!formData.Phone.trim()) {
      newErrors.Phone = "Phone number is required";
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.Phone.replace(/\D/g, ""))) {
        newErrors.Phone = "Please enter a valid 10-digit phone number";
      }
    }

    // Message is optional, no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number (only digits)
    if (name === "Phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const verified = await verifyLandingLeadOtp(leadOtp, formData.Phone);
    if (!verified) {
      setSubmitMessage(`❌ ${getLandingOtpErrorMessage(leadOtp)}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const date = new Date();
      const params = new URLSearchParams();
      params.append("Name", formData.Name.trim());
      params.append("Email", formData.Email.trim());
      params.append("Phone", formData.Phone.trim());
      params.append("Message", formData.Message.trim() || "");
      params.append("Date", date.toLocaleDateString("en-US"));
      params.append(
        "Time",
        date.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      params.append("sheetName", "Sheet1");

      const scriptURL =
        "https://script.google.com/macros/s/AKfycbyd1PSlLhfYvS3edEz4m-rp2AQ6tI_hUy0ThtB4SazDjN3whnYrQTWg0i9kJm8UDhNF/exec";

      const res = await fetch(scriptURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const result = await res.json();
      
      if (result.result === "success") {
        setFormData({ Name: "", Email: "", Phone: "", Message: "" });
        setSubmitMessage("✅ Thank you! We'll get back to you soon.");
        
        // Close modal and redirect to thank you page after 1.5 seconds
        setTimeout(() => {
          onClose();
          router.push("/landing-pages/dholera/thankyou");
        }, 1500);
      } else {
        throw new Error(result.error?.message || "Submission failed");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitMessage("❌ Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 999999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "85vh",
            overflow: "auto",
            position: "relative",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            zIndex: 999999,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "transparent",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "#666",
              zIndex: 10,
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(231, 73, 52, 0.1)";
              e.target.style.color = "rgba(231, 73, 52, 1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#666";
            }}
          >
            <FaTimes />
          </button>

          {/* Modal Content */}
          <div style={{ padding: "28px 24px" }}>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 600,
                color: "rgba(14, 76, 144, 1)",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              {formType === "Enquiry" ? "Get In Touch With Us" : "Download Brochure"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* First Row: Name and Email */}
              <div className="modal-form-row" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {/* Name Field */}
                <div className="modal-form-field" style={{ flex: "1", minWidth: "200px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#333",
                    }}
                  >
                    Name <span style={{ color: "rgba(231, 73, 52, 1)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      fontSize: "15px",
                      border: `2px solid ${errors.Name ? "rgba(231, 73, 52, 1)" : "#e0e0e0"}`,
                      borderRadius: "6px",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(14, 76, 144, 1)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(14, 76, 144, 0.1)";
                    }}
                    onBlur={(e) => {
                      if (!errors.Name) {
                        e.target.style.borderColor = "#e0e0e0";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  {errors.Name && (
                    <span style={{ color: "rgba(231, 73, 52, 1)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                      {errors.Name}
                    </span>
                  )}
                </div>

                {/* Email Field */}
                <div className="modal-form-field" style={{ flex: "1", minWidth: "200px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#333",
                    }}
                  >
                    Email <span style={{ color: "rgba(231, 73, 52, 1)" }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      fontSize: "15px",
                      border: `2px solid ${errors.Email ? "rgba(231, 73, 52, 1)" : "#e0e0e0"}`,
                      borderRadius: "6px",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(14, 76, 144, 1)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(14, 76, 144, 0.1)";
                    }}
                    onBlur={(e) => {
                      if (!errors.Email) {
                        e.target.style.borderColor = "#e0e0e0";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                  {errors.Email && (
                    <span style={{ color: "rgba(231, 73, 52, 1)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                      {errors.Email}
                    </span>
                  )}
                </div>
              </div>

              {/* Second Row: Phone Field */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#333",
                  }}
                >
                  Phone <span style={{ color: "rgba(231, 73, 52, 1)" }}>*</span>
                </label>
                <input
                  type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  maxLength="10"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    fontSize: "15px",
                    border: `2px solid ${errors.Phone ? "rgba(231, 73, 52, 1)" : "#e0e0e0"}`,
                    borderRadius: "6px",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(14, 76, 144, 1)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(14, 76, 144, 0.1)";
                  }}
                  onBlur={(e) => {
                    if (!errors.Phone) {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                />
                {errors.Phone && (
                  <span style={{ color: "rgba(231, 73, 52, 1)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                    {errors.Phone}
                  </span>
                )}
              </div>

              <div>
                <LeadOtpFields
                  phone={formData.Phone}
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

              {/* Third Row: Message Field (Optional) */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#333",
                  }}
                >
                  Message <span style={{ color: "#999", fontSize: "11px", fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  name="Message"
                  value={formData.Message}
                  onChange={handleChange}
                  placeholder="Enter your message"
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    fontSize: "15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "6px",
                    outline: "none",
                    resize: "vertical",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    minHeight: "80px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(14, 76, 144, 1)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(14, 76, 144, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Submit Message */}
              {submitMessage && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: submitMessage.includes("✅")
                      ? "rgba(76, 175, 80, 0.1)"
                      : "rgba(231, 73, 52, 0.1)",
                    color: submitMessage.includes("✅")
                      ? "rgba(76, 175, 80, 1)"
                      : "rgba(231, 73, 52, 1)",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  {submitMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "13px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "white",
                  backgroundColor: isSubmitting
                    ? "rgba(14, 76, 144, 0.7)"
                    : "rgba(14, 76, 144, 1)",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  marginTop: "4px",
                  boxShadow: isSubmitting ? "none" : "0 4px 12px rgba(14, 76, 144, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = "rgba(14, 76, 144, 0.9)";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 6px 16px rgba(14, 76, 144, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = "rgba(14, 76, 144, 1)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(14, 76, 144, 0.2)";
                  }
                }}
              >
                {isSubmitting ? "Submitting..." : formType === "Enquiry" ? "Submit Enquiry" : "Download Brochure"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .modal-form-row {
            flex-direction: column !important;
          }
          
          .modal-form-field {
            flex: 1 1 100% !important;
            min-width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}

