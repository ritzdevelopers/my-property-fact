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

function S1() {
  const router = useRouter();
  const { openModal } = useModal();
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const leadOtp = useLeadOtp(formData.Phone);

  // Refs for animation elements
  const formCardRef = useRef(null);
  const absoluteInfoRef = useRef(null);
  const absoluteInfoInnerRef = useRef(null); // Inner wrapper for animation
  const formInputsRef = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    // Wait for elements to be rendered
    if (
      !formCardRef.current ||
      !absoluteInfoRef.current ||
      !absoluteInfoInnerRef.current
    )
      return;

    // Set initial states - form card animation (matching S9 style)
    gsap.set(formCardRef.current, { opacity: 1, y: 40 });

    // Animate inner wrapper instead of the positioned div to preserve transform: translateY(-50%)
    gsap.set(absoluteInfoInnerRef.current, {
      opacity: 0,
      x: 100,
      scale: 0.8,
    });

    // Get form inputs and set initial state
    const formElement = formCardRef.current?.querySelector("form");
    const inputs = formElement?.querySelectorAll("input, textarea");
    if (inputs && inputs.length > 0) {
      gsap.set(inputs, { opacity: 0, y: 20 });
    }

    // Create separate immediate animation for form inputs (runs on mount, not scroll)
    // This ensures form inputs appear right away when form card is visible
    const formInputsTl = gsap.timeline({ delay: 0.2 });
    if (inputs && inputs.length > 0) {
      formInputsTl.to(inputs, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }

    // Create timeline with ScrollTrigger (matching S9 pattern)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    // Animate form card (matching S9 form animation)
    tl.to(formCardRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
    })
      // Animate inner wrapper of absolute info div (preserves outer div positioning)
      .to(
        absoluteInfoInnerRef.current,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.2,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.5"
      );

    // Animate images inside absolute info div
    const images = absoluteInfoInnerRef.current?.querySelectorAll("img");
    if (images && images.length > 0) {
      gsap.set(images, { opacity: 0, y: 30 });
      tl.to(
        images,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }

    // Animate list items
    const listItems = absoluteInfoInnerRef.current?.querySelectorAll("li");
    if (listItems && listItems.length > 0) {
      gsap.set(listItems, { opacity: 0, x: -20 });
      tl.to(
        listItems,
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.3"
      );
    }

    // Cleanup
    return () => {
      formInputsTl.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

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
    <section
      ref={sectionRef}
      id="home"
      className="dolera-hero-section"
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage: "url(/dolera/s1/dol-s1-i1.png)",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        marginTop: "40px",
        paddingLeft: "60px",
        paddingRight: "60px",
      }}
    >
      {/* Overlay for better text readability */}

      {/* Form Card Container */}
      <div
        ref={formCardRef}
        className="form-card-container glass-card"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Outer White Card */}
        <div
          className="form-card-outer"
          style={{
            width: "100%",
            minHeight: "472px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // backgroundColor: "white",
            padding: "clamp(20px, 4vw, 32px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Inner Form Container */}
          <div
            className="form-card-inner"
            style={{
              width: "100%",
              maxWidth: "376px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
              minHeight: "408px",
            }}
          >
            {/* Top Heading */}
            <div
              style={{
                borderBottom: "1px solid white",
                paddingBottom: "10px",
                width: "334px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  padding: 0,
                  fontSize: "clamp(24px, 4vw, 32px)",
                  fontWeight: 600,
                  color: "#ffffff",
                  lineHeight: "1.2",
                }}
              >
                Get In Touch With Us
              </h1>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
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
                  ref={(el) => (formInputsRef.current[0] = el)}
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
                  ref={(el) => (formInputsRef.current[1] = el)}
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
              <div style={{ width: "100%" }}>
                <input
                  ref={(el) => (formInputsRef.current[2] = el)}
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
              <div style={{ width: "100%", flex: 1 }}>
                <textarea
                  ref={(el) => (formInputsRef.current[3] = el)}
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
                className="enquire-btn"
                style={{
                  width: "164px",
                  height: "52px",
                  color: "white",
                  borderRadius: "4px",
                  backgroundColor: "rgba(14, 76, 144, 1)",
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
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = "rgba(231, 73, 52, 0.9)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(14, 76, 144, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = "rgba(14, 76, 144, 1)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                {isSubmitting ? "Submitting..." : "Enquire Now"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Absolute Position Div  */}
      <div
        ref={absoluteInfoRef}
        className="absolute-info-div"
        style={{
          width: "534px",
          height: "500px",
          backgroundColor: "rgba(231, 73, 52, 0.7)",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          right: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(241, 147, 130, 1)",
            width: "514.32px",
            height: "485px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            ref={absoluteInfoInnerRef}
            style={{
              width: "450px",
              height: "373px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* 1st Image  */}
            <div>
              <img src="/dolera/s1/dolera-txt.png" alt="" />
            </div>

            {/* 2nd Image  */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img src="/dolera/s1/dolera-txt-2.png" alt="" />
            </div>

            {/* List  */}
            <ul
              style={{
                fontWeight: 400,
                fontSize: "22px",
                color: "white",
              }}
            >
              <li>Plan, build, modeling, publish</li>
              <li>Complete Legality (N.A, N.O.C, Plan pass)</li>
              <li>Efficient Governance</li>
              <li>RERA Approved Project</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Desktop - Above lg (1025px+) */
        @media (min-width: 1025px) {
          .dolera-hero-section {
            padding-left: 60px !important;
            padding-right: 60px !important;
            justify-content: flex-start !important;
          }
        }

        /* Large screens - Exactly lg (1024px) */

        /* Tablet - Between md and lg (769px to 1023px) */
        @media (min-width: 769px) and (max-width: 1023px) {
          .form-card-container {
            display: none !important;
          }
          .dolera-hero-section {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .absolute-info-div {
            position: relative !important;
            margin: auto !important;
            height: 100% !important;
            width: 100% !important;
            inset: 0 !important;
            transform: translateY(0) !important;
          }
        }

        /* Small tablets and large phones (481px to 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .form-card-container {
            display: none !important;
          }
          .dolera-hero-section {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .absolute-info-div {
            position: relative !important;
            margin: auto !important;
            height: 100% !important;
            width: 100% !important;
            inset: 0 !important;
            transform: translateY(0) !important;
          }
        }

        /* Mobile phones (up to 480px) */
        @media (max-width: 480px) {
          .form-card-container {
            display: none !important;
          }
          .dolera-hero-section {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .absolute-info-div {
            position: relative !important;
            margin: auto !important;
            height: 500px !important;
            width: 100% !important;
            inset: 0 !important;
            transform: translateY(0) !important;
          }
          .absolute-info-div div {
            height: 95% !important;
            width: 95% !important;
          }
        }

        /* Extra large screens (1440px+) */
        @media (min-width: 1440px) {
          .dolera-hero-section {
            padding-left: 80px !important;
            padding-right: 80px !important;
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

        /* Smooth transitions */
        * {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Responsive image sizing in absolute div */
        @media (max-width: 1200px) {
          .absolute-info-div {
            width: 450px !important;
            height: 420px !important;
            right: 30px !important;
          }

          .absolute-info-div > div {
            width: auto !important;
            height: 405px !important;
          }

          .absolute-info-div > div > div {
            height: 320px !important;
          }

          .absolute-info-div ul {
            font-size: 18px !important;
          }
        }

        // @media (max-width: 1100px) {
        //   .absolute-info-div {
        //     width: 400px !important;
        //     height: 380px !important;
        //     right: 20px !important;
        //   }

        //   .absolute-info-div > div {
        //     width: 380px !important;
        //     height: 365px !important;
        //   }

        //   .absolute-info-div > div > div {
        //     width: 340px !important;
        //     height: 280px !important;
        //   }

        //   .absolute-info-div ul {
        //     font-size: 16px !important;
        //   }

        //   .absolute-info-div img {
        //     max-width: 100% !important;
        //     height: auto !important;
        //   }
        // }
      `}</style>
    </section>
  );
}

export default S1;
