"use client";

import { useState, useEffect, useRef } from "react";
import bg from "../assets/hero_bg.webp";
import { useRouter } from "next/navigation";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

export default function PopUpForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [buttonText, setButtonText] = useState("Submit");
  const [phone, setPhone] = useState("");
  const leadOtp = useLeadOtp(phone);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    }, 1000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  const hidePopup = () => {
    if (overlayRef.current && containerRef.current) {
      containerRef.current.classList.add("fade-out");
      overlayRef.current.classList.remove("show");

      setTimeout(() => {
        setIsOpen(false);
        document.body.style.overflow = "";
        containerRef.current.classList.remove("fade-out");
      }, 300);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      hidePopup();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: phone.trim(),
      message: form.message.value.trim(),
    };

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const verified = await verifyLandingLeadOtp(leadOtp, phone);
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
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.result === "success") {
        form.reset();
        hidePopup();
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
    <>
      {isOpen && (
        <div
          ref={overlayRef}
          id="popupOverlay"
          onClick={handleOverlayClick}
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75 z-1050 show"
        >
          <div
            ref={containerRef}
            id="popupContainer"
            className="bg-white rounded shadow-lg w-100 mx-3 mx-md-0"
            style={{ maxWidth: "800px", transition: "all 0.3s ease" }}
          >
            <div className="row g-0">
              {/* Left Image */}
              <div className="col-md-6 d-none d-md-block">
                <img
                  src={bg.src}
                  alt="Popup Visual"
                  className="img-fluid h-100 w-100 object-fit-cover"
                  style={{ objectFit: "cover", height: "100%" }}
                />
              </div>

              {/* Right Form */}
              <div className="col-md-6 p-4 position-relative">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={hidePopup}
                  className="btn-close position-absolute top-0 end-0 m-3"
                  aria-label="Close"
                ></button>

                <h2 className="h4 mb-4">Get in Touch</h2>

                <form ref={formRef} id="popupForm" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      htmlFor="popupName"
                      className="form-label fw-semibold"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="popupName"
                      name="name"
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="popupEmail"
                      className="form-label fw-semibold"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="popupEmail"
                      name="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="popupPhone"
                      className="form-label fw-semibold"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="popupPhone"
                      name="phone"
                      placeholder="10-digit phone number"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <LeadOtpFields
                      phone={phone}
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
                    <label
                      htmlFor="popupMessage"
                      className="form-label fw-semibold"
                    >
                      Message
                    </label>
                    <textarea
                      className="form-control"
                      id="popupMessage"
                      name="message"
                      placeholder="Your message"
                      rows="4"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-bold"
                    disabled={isSubmiting}
                  >
                    {buttonText}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .fade-out {
          opacity: 0 !important;
          transform: scale(0.95);
          transition: all 0.3s ease;
        }
        .z-1050 {
          z-index: 1050;
        }
        .show {
          opacity: 1;
          transition: opacity 0.3s ease;
        }
      `}</style>
    </>
  );
}
