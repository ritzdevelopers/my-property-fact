"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

export default function Contact() {
  const formRef = useRef(null);
  const nameInputRef = useRef(null);
  const sectionRef = useRef(null);
  const router = useRouter();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [buttonText, setButtonText] = useState("Enquire Now");
  const [phone, setPhone] = useState("");
  const leadOtp = useLeadOtp(phone);

  const handleDownloadClick = (e) => {
    e.preventDefault();

    if (sectionRef.current && formRef.current && nameInputRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      formRef.current.classList.add("highlight");

      setTimeout(() => {
        nameInputRef.current.focus();
      }, 600);

      setTimeout(() => {
        formRef.current.classList.remove("highlight");
      }, 1600);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;

    const formData = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: phone.trim(),
      message: form.message.value.trim(),
    };

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Phone number format (Indian 10-digit)
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
        router.push("onyx/thankyou");
      } else {
        alert("Submission failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed. Please try again.");
    }finally {
      setIsSubmiting(false);
      setButtonText("Enquire Now");
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-5 px-3"
      style={{ backgroundColor: "#1C2C2B", color: "#fff" }}
    >
      <div className="container">
        <div className="row align-items-center gy-5">
          {/* Left Content */}
          <div className="col-md-6">
            <h2 className="fw-bold mb-4" style={{ fontSize: "2rem" }}>
              Ready to Take the Lead?
            </h2>
            <p className="mb-4 lead">
              Whether you are a visionary brand, an ambitious startup, or a
              high-end dining concept, <strong>ONYX by Splendor</strong> is your
              stage to grow, impress, and lead.
            </p>
            <ul className="list-unstyled mb-4">
              <li className="mb-2">
                <span className="text-success me-2">•</span> 📞{" "}
                <strong>Schedule a Private Walkthrough</strong>
              </li>
              <li className="mb-2">
                <span className="text-success me-2">•</span> 📩{" "}
                <strong>Enquire Now for Pre-Leasing Opportunities</strong>
              </li>
              <li className="mb-2">
                <span className="text-success me-2">•</span> 📄{" "}
                <strong>Download the Brochure</strong>
              </li>
              <li className="mb-2">
                <span className="text-success me-2">•</span> Spaces are limited.
                <em> The future belongs to those who act first.</em>
              </li>
            </ul>
            <a
              href="#contact"
              id="downloadBtn"
              onClick={handleDownloadClick}
              className="btn btn-outline-success fw-semibold"
            >
              Download Brochure
            </a>
          </div>

          {/* Right Form */}
          <div className="col-md-6">
            <form
              id="contactForm"
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white text-dark p-4 rounded shadow"
              style={{ maxWidth: "500px", margin: "0 auto" }}
            >
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-semibold">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  ref={nameInputRef}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label fw-semibold">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="10-digit mobile number"
                  required
                  className="form-control"
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
                <label htmlFor="message" className="form-label fw-semibold">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  className="form-control"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-success w-100 fw-bold" disabled={isSubmiting}>
                {buttonText || "Enquire Now"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Highlight animation style */}
      <style jsx>{`
        .highlight {
          animation: pulse-border 1s ease-in-out;
        }

        @keyframes pulse-border {
          0% {
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.5);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
          }
        }
      `}</style>
    </section>
  );
}
