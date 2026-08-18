"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

function ResForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const leadOtp = useLeadOtp(formData.Phone);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Format phone number (only digits)
    if (name === "Phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.Name.trim() ||
      !formData.Email.trim() ||
      !formData.Phone.trim()
    ) {
      setSubmitMessage("❌ Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      setSubmitMessage("❌ Please enter a valid email address.");
      return;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.Phone.replace(/\D/g, ""))) {
      setSubmitMessage("❌ Please enter a valid 10-digit phone number.");
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
        
        // Redirect to thank you page after 1.5 seconds
        setTimeout(() => {
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

  return (
    <div
      className="res-form-container"
      style={{
        width: "100vw",
        minHeight: "80vh",
        backgroundColor: "rgba(14, 76, 144, 1)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "rgba(199, 226, 255, 0.1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid white",
              paddingBottom: "10px",
            }}
          >
            <h2
              style={{
                margin: 0,
                padding: 0,
                fontWeight: 600,
                fontSize: "29px",
                color: "white",
                lineHeight: "1.2",
              }}
            >
              Get In Touch With Us
            </h2>
          </div>

          {/* Name Input */}
          <div style={{ width: "100%" }}>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="Enter Name"
              required
              style={{
                width: "100%",
                height: "48px",
                padding: "0 16px",
                fontSize: "16px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                outline: "none",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(14, 76, 144, 1)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(14, 76, 144, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Email Input */}
          <div style={{ width: "100%" }}>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              placeholder="Enter Email"
              required
              style={{
                width: "100%",
                height: "48px",
                padding: "0 16px",
                fontSize: "16px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                outline: "none",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(14, 76, 144, 1)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(14, 76, 144, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Phone Input */}
          <div style={{ width: "100%" }}>
            <input
              type="tel"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              placeholder="Enter Phone"
              maxLength="10"
              required
              style={{
                width: "100%",
                height: "48px",
                padding: "0 16px",
                fontSize: "16px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                outline: "none",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(14, 76, 144, 1)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(14, 76, 144, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ width: "100%" }}>
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

          {/* Message Textarea */}
          <div style={{ width: "100%" }}>
            <textarea
              name="Message"
              value={formData.Message}
              onChange={handleChange}
              placeholder="Enter Message (Optional)"
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px 16px",
                fontSize: "16px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                outline: "none",
                resize: "vertical",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(14, 76, 144, 1)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(14, 76, 144, 0.1)";
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
              width: "164px",
              height: "48px",
              color: "white",
              borderRadius: "4px",
              backgroundColor: "rgba(14, 76, 144, 1)",
              fontWeight: 600,
              fontSize: "16px",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              fontFamily: "inherit",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          
          >
            {isSubmitting ? "Submitting..." : "Enquire Now"}
          </button>
        </form>
      </div>

      {/* Responsive Styles - Only show on screens <= 768px */}
      <style jsx>{`
        .res-form-container {
          display: none !important;
        }

        @media (max-width: 768px) {
          .res-form-container {
            display: flex !important;
          }
        }

        /* Ensure form inputs are accessible */
        input::placeholder,
        textarea::placeholder {
          color: #999;
          opacity: 1;
        }

        input:focus,
        textarea:focus {
          border-color: rgba(14, 76, 144, 1) !important;
        }
      `}</style>
    </div>
  );
}

export default ResForm;
