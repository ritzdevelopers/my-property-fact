"use client";
import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useModal } from "../layout";
import { useRouter } from "next/navigation";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

gsap.registerPlugin(ScrollTrigger);

function S9() {
  const router = useRouter();
  const { openModal } = useModal();
  const sectionRef = useRef(null);
  const topContentRef = useRef(null);
  const formRef = useRef(null);
  const formInputsRef = useRef([]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    gsap.set(topContentRef.current, { opacity: 0, y: -40 });
    gsap.set(formRef.current, { opacity: 0, y: 40 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(topContentRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    }).to(
      formRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
      },
      "-=0.5"
    );

    // Animate form inputs
    const inputs = formRef.current?.querySelectorAll("input, textarea");
    if (inputs && inputs.length > 0) {
      gsap.set(inputs, { opacity: 0, y: 20 });
      tl.to(
        inputs,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.8"
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
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
        // setSubmitMessage("✅ Thank you! We'll get back to you soon.");
        
        // Redirect to thank you page after 1.5 seconds
        setTimeout(() => {
          router.push("/landing-pages/dholera/thankyou");
        }, 1500);
      } else {
        throw new Error(result.error?.message || "Submission failed");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      // setSubmitMessage("❌ Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="dolera-s9-section"
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: "30px",
      }}
    >
      {/* Center Align Div  */}
      <div
        className="s9-main-container"
        style={{
          width: "1247px",
          minHeight: "648px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          gap: "50px",
        }}
      >
        {/* Row 1  */}
        <div
          ref={topContentRef}
          className="s9-top-content"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: "20px",
            width: "80%",
          }}
        >
          <h1
            className="s9-about-title"
            style={{
              fontWeight: 600,
              fontSize: "36px",
              color: "black",
            }}
          >
            About Developer
          </h1>
          <p
            className="s9-about-text"
            style={{
              fontWeight: 400,
              fontSize: "16px",
              color: "rgba(0, 0, 0, 0.6)",
            }}
          >
            We are the leading developer of India&apos;s First Greenfield Smart City
            Dholera Smart City in India, with a focus on developing sustainable
            and modern residential and commercial, and industrial projects. we
            aim to develop dholera&apos;s first green township..
          </p>
        </div>

        {/* Row 2  */}
        <div
          className="s9-content-row"
          style={{
            width: "100%",
            height: "624px",
            display: "flex",
            position: "relative",
            alignItems: "center",
          }}
        >
          <div
            className="s9-left-image"
            style={{
              width: "670px",
              height: "446px",
              zIndex: 10,
            }}
          >
            <img
              src="/dolera/s9/dol-s9-i2.png"
              className="s9-developer-image"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
              }}
              alt="Developer Image"
            />
          </div>

          {/* Absolute Center Right Align Div  */}
          <div
            className="s9-form-card"
            style={{
              width: "649px",
              minHeight: "557px",
              backgroundColor: "rgba(14, 76, 144, 1)",
              zIndex: 10,
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Inner Form Container */}
            <div
              className="form-card-inner s9-form-inner"
              style={{
                width: "545px",
                height: "419px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "28px",
              }}
            >
              {/* Top Heading */}
              <div>
                <h1
                  className="s9-form-title"
                  style={{
                    margin: 0,
                    padding: 0,
                    fontSize: "36px",
                    fontWeight: 600,
                    color: "#ffffff",
                    lineHeight: "1.2",
                    fontFamily: "inherit",
                  }}
                >
                  Get In Touch With Us
                </h1>
              </div>

              {/* Form */}
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="s9-form"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  gap: "16px",
                  flex: 1,
                }}
              >
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
                      height: "46px",
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
                      height: "46px",
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
                      height: "46px",
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
                <div style={{ width: "100%", flex: 1 }}>
                  <textarea
                    name="Message"
                    value={formData.Message}
                    onChange={handleChange}
                    placeholder="Enter Message (Optional)"
                    style={{
                      width: "100%",
                      minHeight: "149px",
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
                  className="enquire-btn s9-enquire-btn"
                  style={{
                    width: "175px",
                    height: "52px",
                    color: "#000000",
                    borderRadius: "4px",
                    backgroundColor: "#ffffff",
                    fontWeight: 600,
                    fontSize: "16px",
                    border: "none",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    alignSelf: "flex-start",
                    fontFamily: "inherit",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(231, 73, 52, 0.9)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(14, 76, 144, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Enquire Now"}
                </button>
              </form>
            </div>
          </div>

          {/* Absolute Position Left Bottom Div  */}
          <img
            src="/dolera/s9/dol-s9-bg-2.png"
            className="s9-decorative-image"
            style={{
              width: "447px",
              height: "181px",
              position: "absolute",
              left: 0,
              bottom: 0,
              zIndex: 0,
            }}
            alt="Decorative Image"
          />
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Desktop - Above lg (1025px+) - Keep original design */
        @media (min-width: 1025px) {
          .dolera-s9-section {
            padding-top: 30px !important;
          }

          .s9-main-container {
            width: 1247px !important;
            min-height: 648px !important;
          }

          .s9-content-row {
            height: 624px !important;
            flex-direction: row !important;
          }

          .s9-left-image {
            width: 670px !important;
            height: 446px !important;
          }

          .s9-form-card {
            width: 649px !important;
            height: 557px !important;
            position: absolute !important;
            top: 50% !important;
            right: 0 !important;
            transform: translateY(-50%) !important;
          }

          .s9-decorative-image {
            display: block !important;
          }
        }

        /* Large screens - Exactly lg (1024px) */
        @media (min-width: 1024px) and (max-width: 1024px) {
          .dolera-s9-section {
            padding: 40px 20px !important;
            padding-top: 10px !important;
            padding-bottom: 0px !important;
          }

          .s9-main-container {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            gap: 40px !important;
            padding-top: 48px !important;
          }

          .s9-top-content {
            width: 100% !important;
            max-width: 800px !important;
          }

          .s9-about-title {
            font-size: 32px !important;
          }

          .s9-about-text {
            font-size: 15px !important;
            line-height: 1.6 !important;
          }

          .s9-content-row {
            flex-direction: column !important;
            height: auto !important;
            position: relative !important;
            padding-bottom: 40px !important;
          }

          .s9-left-image {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            aspect-ratio: 670/446 !important;
            position: relative !important;
            z-index: 10 !important;
          }

          .s9-form-card {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            transform: none !important;
            margin-top: 30px !important;
            padding: 30px 20px !important;
          }

          .s9-form-inner {
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
          }

          .s9-form-title {
            font-size: 28px !important;
          }

          .s9-decorative-image {
            display: none !important;
          }

          .s9-enquire-btn {
            width: 100% !important;
            max-width: 200px !important;
          }
        }

        /* Tablet - Between md and lg (769px to 1023px) */
        @media (min-width: 769px) and (max-width: 1023px) {
          .dolera-s9-section {
            padding: 40px 30px !important;
            padding-top: 40px !important;
            padding-bottom: 0px !important;
          }

          .s9-main-container {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            gap: 40px !important;
          }

          .s9-top-content {
            width: 100% !important;
            max-width: 800px !important;
          }

          .s9-about-title {
            font-size: 30px !important;
          }

          .s9-about-text {
            font-size: 15px !important;
            line-height: 1.6 !important;
          }

          .s9-content-row {
            flex-direction: column !important;
            height: auto !important;
            position: relative !important;
            padding-bottom: 40px !important;
          }

          .s9-left-image {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            aspect-ratio: 670/446 !important;
            position: relative !important;
            z-index: 10 !important;
          }

          .s9-form-card {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            transform: none !important;
            margin-top: 30px !important;
            padding: 30px 20px !important;
          }

          .s9-form-inner {
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
          }

          .s9-form-title {
            font-size: 26px !important;
          }

          .s9-decorative-image {
            display: none !important;
          }

          .s9-enquire-btn {
            width: 100% !important;
            max-width: 200px !important;
          }
        }

        /* Small tablets and large phones (481px to 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .dolera-s9-section {
            padding: 30px 20px !important;
           
            padding-bottom: 50px !important;
          }

          .s9-main-container {
            width: 100% !important;
            min-height: auto !important;
            gap: 30px !important;
          }

          .s9-top-content {
            width: 100% !important;
            gap: 15px !important;
          }

          .s9-about-title {
            font-size: 28px !important;
          }

          .s9-about-text {
            font-size: 14px !important;
            line-height: 1.6 !important;
          }

          .s9-content-row {
            flex-direction: column !important;
            height: auto !important;
            position: relative !important;
            padding-bottom: 30px !important;
          }

          .s9-left-image {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 670/446 !important;
            position: relative !important;
            z-index: 10 !important;
          }

          .s9-form-card {
            width: 100% !important;
            height: auto !important;
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            transform: none !important;
            margin-top: 25px !important;
            padding: 25px 18px !important;
          }

          .s9-form-inner {
            width: 100% !important;
            height: auto !important;
            gap: 22px !important;
          }

          .s9-form-title {
            font-size: 24px !important;
          }

          .s9-form {
            gap: 14px !important;
          }

          .s9-decorative-image {
            display: none !important;
          }

          .s9-enquire-btn {
            width: 100% !important;
            max-width: 180px !important;
            font-size: 15px !important;
          }
        }

        /* Mobile phones (up to 480px) */
        @media (max-width: 480px) {
          .dolera-s9-section {
            padding: 20px 16px !important;
           
          }

          .s9-main-container {
            width: 100% !important;
            min-height: auto !important;
            gap: 25px !important;
          }

          .s9-top-content {
            width: 100% !important;
            gap: 12px !important;
          }

          .s9-about-title {
            font-size: 24px !important;
          }

          .s9-about-text {
            font-size: 13px !important;
            line-height: 1.6 !important;
          }

          .s9-content-row {
            flex-direction: column !important;
            height: auto !important;
            position: relative !important;
            padding-bottom: 25px !important;
          }

          .s9-left-image {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 670/446 !important;
            position: relative !important;
            z-index: 10 !important;
          }

          .s9-form-card {
            width: 100% !important;
            height: auto !important;
            position: relative !important;
            top: 0 !important;
            right: 0 !important;
            transform: none !important;
            margin-top: 20px !important;
            padding: 25px 16px !important;
          }

          .s9-form-inner {
            width: 100% !important;
            height: auto !important;
            gap: 20px !important;
          }

          .s9-form-title {
            font-size: 20px !important;
          }

          .s9-form {
            gap: 12px !important;
          }

          .s9-form input,
          .s9-form textarea {
            font-size: 14px !important;
          }

          .s9-decorative-image {
            display: none !important;
          }

          .s9-enquire-btn {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
          }
        }

        /* Extra large screens (1440px+) */
        @media (min-width: 1440px) {
          .dolera-s9-section {
            padding-left: 60px !important;
            padding-right: 60px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default S9;
