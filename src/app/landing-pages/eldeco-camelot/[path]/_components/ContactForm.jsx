"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { number } from "framer-motion";
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzPGcu-_n28K8ZrRudpWfoZJ6a2F2EtvDq_Vlnin9RCTfw_A6lx986V-66fE-VyVRDZ7A/exec";

export default function ContactForm({ formType = "hero", className = "" }) {
  const router = useRouter();
  const params = useParams();
  const pathParam = params?.path || "1";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    FIRSTNAME: "",
    EMAIL: "",
    PHONE: "",
    MESSAGE: "",
  });

  const validateNumber = (number) => {
    if (!number.trim()) {
      return "Phone number is required";
    }
    if (number.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    if (!/^[6-9]/.test(number)) {
      return "Phone number must start with 6, 7, 8, or 9";
    }
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use pathParam to set sheet name dynamically (Sheet1, Sheet2, Sheet3, Sheet4)
      const sheetNameMap = {
        1: "1-TOI",
        2: "2-NDTV",
        3: "3-HT",
        4: "4-DISPLAY",
        5: "5-P-MAX",
        6: "6-YOU-TUBE",
        7: "7-PPC",
        8: "8-TABOOLA",
        9: "9",
      };
      const sheetName = sheetNameMap[pathParam];
      console.log("Path Param:", pathParam, "Sheet Name:", sheetName); // Debug log
      const phoneError = validateNumber(formData.PHONE);
      if (phoneError) {
        setIsSubmitting(false);
        alert(phoneError);
        return;
      }
      const emailError = validateEmail(formData.EMAIL);
      if (emailError) {
        setIsSubmitting(false);
        alert(emailError);
        return;
      }
      const submitData = {
        sheetName: sheetName,
        Name: formData.FIRSTNAME,
        Email: formData.EMAIL,
        Phone: formData.PHONE,
        Message: formData.MESSAGE || "No Message",
      };

      const formDataToSend = new FormData();
      Object.entries(submitData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value ?? ""));
      });

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.result === "success") {
        // Close modal if it's modal form
        if (formType === "modal") {
          const modalElement = document.getElementById("contactModal");
          if (modalElement) {
            const modal = window.bootstrap?.Modal?.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
        }
        router.push(`/landing-pages/eldeco-camelot/${pathParam}/thankyou`);
      } else {
        alert("Error: " + (result.error?.message || "Failed to submit form"));
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (formType === "hero") {
    return (
      <div className={`hero-form-wrapper d-none d-lg-block ${className}`}>
        <div className="contact-form-container">
          <div className="form-wrapper-card">
            <div className="form-title-section">
              <h4>Send Us a Message</h4>
            </div>
            <div className="form-content-area">
              <form className="form1" onSubmit={handleSubmit}>
                <div className="form-fields-container p-0">
                  <input type="hidden" name="PROJECT" value="Eldeco Camelot" />
                  <input
                    type="hidden"
                    name="LOCATION"
                    value="Sector 17, Dwarka"
                  />
                  <input type="hidden" name="CLIENT" value="Polaris" />
                  <input type="hidden" name="USER_MESSAGE" value="" />

                  <div className="form-field-wrapper mb-3">
                    <div className="field-icon-wrapper">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <input
                      type="text"
                      name="FIRSTNAME"
                      className="form-input-field username"
                      placeholder="Your Full Name"
                      pattern="[a-zA-Z ]{4,35}"
                      required
                      value={formData.FIRSTNAME}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field-wrapper mb-3">
                    <div className="field-icon-wrapper">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                    <input
                      type="email"
                      name="EMAIL"
                      className="form-input-field useremail"
                      placeholder="Email Address"
                      pattern="\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+"
                      required
                      value={formData.EMAIL}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field-wrapper mb-3">
                    <div className="field-icon-wrapper">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                    <input
                      type="tel"
                      name="PHONE"
                      className="form-input-field userphone"
                      placeholder="Phone Number"
                      pattern="[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}"
                      required
                      value={formData.PHONE}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field-wrapper mb-3">
                    <div className="field-icon-wrapper">
                      <FontAwesomeIcon icon={faMessage} />
                    </div>
                    <textarea
                      name="MESSAGE"
                      className="form-input-field user-message"
                      placeholder="Message"
                      required
                      value={formData.MESSAGE}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="form-action-area border-0 p-0 mt-3">
                  <button
                    type="submit"
                    className="primary-action-btn form1-submit-btn w-100 py-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "GET CALL BACK"}
                  </button>
                </div>
                <div className="mt-2 phone-link-section">
                  <a
                    href="tel:+91-8920100741"
                    className="text-decoration-none text-white"
                  >
                    <FontAwesomeIcon icon={faPhone} /> +91-8920100741
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (formType === "footer") {
    return (
      <form className="footer-form" onSubmit={handleSubmit}>
        <input type="hidden" name="PROJECT" value="Eldeco Camelot" />
        <input type="hidden" name="LOCATION" value="Sector 17, Dwarka" />
        <input type="hidden" name="CLIENT" value="Polaris" />
        <input type="hidden" name="USER_MESSAGE" value="" />

        <div className="form-group">
          <input
            type="text"
            name="FIRSTNAME"
            className="form-control username"
            placeholder="Your Full Name"
            pattern="[a-zA-Z ]{4,35}"
            required
            value={formData.FIRSTNAME}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="EMAIL"
            className="form-control useremail"
            placeholder="Email Address"
            pattern="\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+"
            required
            value={formData.EMAIL}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="PHONE"
            className="form-control userphone"
            placeholder="Phone Number"
            pattern="[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}"
            required
            value={formData.PHONE}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <textarea
            name="MESSAGE"
            className="form-control user-message"
            placeholder="Message"
            required
            value={formData.MESSAGE}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Get Call Back"}
        </button>
      </form>
    );
  }

  // Modal form
  return (
    <form className="contact-modal-form" onSubmit={handleSubmit}>
      <input type="hidden" name="PROJECT" value="Eldeco Camelot" />
      <input type="hidden" name="LOCATION" value="Sector 17, Dwarka" />
      <input type="hidden" name="CLIENT" value="Polaris" />
      <input type="hidden" name="USER_MESSAGE" value="" />

      <div className="modal-form-group">
        <label className="form-field-label">
          <FontAwesomeIcon icon={faUser} className="form-field-icon" />
          <input
            type="text"
            name="FIRSTNAME"
            className="form-field-input username"
            placeholder="Your Full Name"
            pattern="[a-zA-Z ]{4,35}"
            required
            value={formData.FIRSTNAME}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="modal-form-group">
        <label className="form-field-label">
          <FontAwesomeIcon icon={faEnvelope} className="form-field-icon" />
          <input
            type="email"
            name="EMAIL"
            className="form-field-input useremail"
            placeholder="Email Address"
            pattern="\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+"
            required
            value={formData.EMAIL}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="modal-form-group">
        <label className="form-field-label">
          <FontAwesomeIcon icon={faPhone} className="form-field-icon" />
          <input
            type="tel"
            name="PHONE"
            className="form-field-input userphone"
            placeholder="Phone Number"
            pattern="[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}"
            required
            value={formData.PHONE}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="modal-form-group">
        <label className="form-field-label">
          <FontAwesomeIcon icon={faMessage} className="form-field-icon" />
          <textarea
            name="MESSAGE"
            className="form-input-field model-text-area"
            placeholder="Message"
            required
            value={formData.MESSAGE}
            onChange={handleChange}
            rows={3}
          />
        </label>
      </div>

      <button
        type="submit"
        className="modal-submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Get Call Back"}
      </button>
    </form>
  );
}
