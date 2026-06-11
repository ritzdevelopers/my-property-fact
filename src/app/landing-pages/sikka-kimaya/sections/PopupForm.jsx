"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/Kimaya_Greens_Hero_Image.jpg";
import ReCAPTCHA from "react-google-recaptcha";
import { useRouter } from "next/navigation";

export default function PopupForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef();
  const nameInputRef = useRef();

  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 1000);
    const handleOpenPopup = () => setIsOpen(true);
    window.addEventListener("openPopup", handleOpenPopup);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("openPopup", handleOpenPopup);
    };
  }, []);

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => e.key === "Escape" && closeModal();
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    setStatus("");
  };

  const handleCaptchaChange = (token) => setCaptchaToken(token);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setStatus("Please verify you're not a robot.");
      return;
    }

    // Phone number validation (10 digits starting with 6-9)
    const cleanedPhone = formData.phone.replace(/[\s\-\(\)]/g, "");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      setStatus("Phone number must be exactly 10 digits starting with 6, 7, 8, or 9.");
      return;
    }

    setStatus("Submitting...");

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwFUrsuEzkLUjc07z9MXmKwKSb1zGNo8gCJrmNLI0mCqkhopIjdHYqzvT2zcTKMpqL7Xg/exec",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (result.result === "success") {
        setStatus("Form submitted successfully!");
        router.push("sikka-kimaya/thankyou");
        setFormData({ name: "", email: "", phone: "", message: "" });
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
      } else {
        setStatus("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("Submission error. Please try again later.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ backdropFilter: "blur(4px)", zIndex: 1040 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            className="position-fixed top-50 start-50 translate-middle px-3 w-100"
            style={{ maxWidth: "900px", zIndex: 1050 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-white rounded-4 shadow-lg overflow-hidden d-flex flex-column flex-md-row position-relative">
              {/* Close */}
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3"
                aria-label="Close"
                onClick={closeModal}
              />

              {/* Image */}
              <div className="d-none d-md-block w-50 overflow-hidden">
                <img
                  src={logo}
                  alt="Kimaya Greens"
                  width={600}
                  height={600}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              {/* Form */}
              <div className="w-80 w-md-50 p-4 p-md-5 overflow-auto" style={{ maxHeight: "90vh" }}>
                <h2 id="popup-title" className="h5 fw-bold mb-4 text-dark">
                  Book a Visit
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      ref={nameInputRef}
                      type="text"
                      name="name"
                      required
                      placeholder="Your Name"
                      className="form-control rounded-3"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email"
                      className="form-control rounded-3"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Phone Number"
                      className="form-control rounded-3"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <textarea
                      name="message"
                      rows="3"
                      placeholder="Write Your Message Here"
                      className="form-control rounded-3"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  {/* reCAPTCHA */}
                  <div
                    className="mb-4"
                    style={{
                      maxWidth: "304px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        transformOrigin: "top left",
                        transform: "scale(0.85)",
                        width: "304px",
                        height: "78px",
                      }}
                      className="mx-auto"
                    >
                      <ReCAPTCHA
                        sitekey="6Lf-XVYrAAAAAMFeejFKY1OquTf-BrCgHV3l3w55"
                        onChange={handleCaptchaChange}
                      />
                    </div>
                  </div>


                  <button
                    type="submit"
                    className="btn w-100 text-white fw-semibold"
                    style={{
                      backgroundColor: "#A8BE04",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#94a503")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#A8BE04")}
                  >
                    Submit
                  </button>

                  {status && (
                    <p className="text-muted small mt-3 mb-0 text-center">{status}</p>
                  )}
                </form>
              </div>
            </div>
            {/* Scoped CSS for responsive recaptcha */}
            <style jsx>{`
        @media (max-width: 576px) {
          div > div.mx-auto {
            transform: scale(0.65) !important;
            height: 50px !important;
          }
        }
      `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
