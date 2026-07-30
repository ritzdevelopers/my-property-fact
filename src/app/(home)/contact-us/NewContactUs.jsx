"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import "./contact.css";
import axios from "axios";
import { toast } from "react-toastify";
import SocialFeedsOfMPF from "../components/_homecomponents/SocialFeedsOfMPF";

/** Static spotlight card (no projects API on contact page). */
const CONTACT_SPOTLIGHT = {
  title: "Ansal Corporate Park, Noida",

  imageSrc:
    "/static/banners/Ansal%20Corporate%20Park-%20Noida__1556971966.jpg",
  imageAlt:
    "Ansal Corporate Park, Noida — commercial building featured on My Property Fact contact page",
};

const INTEREST_OPTIONS = [
  "Commercial Property",
  "Residential Property",
  "Plot / Land",
  "Investment / Advisory",
  "Other",
];

export default function NewContactUs() {
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interestedIn: "Commercial Property",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);

  //Validation errors state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  //Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    let cleanedPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanedPhone.startsWith("+91")) {
      cleanedPhone = cleanedPhone.slice(3);
    } else if (cleanedPhone.startsWith("91") && cleanedPhone.length >= 12) {
      cleanedPhone = cleanedPhone.slice(2);
    }
    // Check if it's all digits
    if (!/^\d+$/.test(cleanedPhone)) {
      return "Phone number can only contain digits, spaces, dashes, parentheses, or +91";
    }
    // Check length (exactly 10 digits)
    if (cleanedPhone.length !== 10) {
      return "Phone number must be exactly 10 digits (after country code)";
    }
    // Check if first digit is between 6-9
    if (!/^[6-9]/.test(cleanedPhone)) {
      return "Phone number must start with 6, 7, 8, or 9";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  //Handle blur validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "name") {
      error = validateName(value);
    } else if (name === "email") {
      error = validateEmail(value);
    } else if (name === "phone") {
      error = validatePhone(value);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    const newErrors = {
      name: nameError,
      email: emailError,
      phone: phoneError,
    };

    setErrors(newErrors);
    setValidated(true);

    // Check if form is valid
    const isFormValid =
      form.checkValidity() &&
      !nameError &&
      !emailError &&
      !phoneError &&
      formData.message.trim() !== "" &&
      formData.interestedIn.trim() !== "";

    if (!isFormValid) {
      e.stopPropagation();
      toast.error("Please fill all fields correctly!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare enquiry data
      const enquiryData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        interestedIn: formData.interestedIn,
        message: formData.interestedIn
          ? `Interested In: ${formData.interestedIn}\n\nMessage: ${formData.message}`
          : formData.message,
        pageName: "Contact Us - Get A Quote",
        enquiryFrom: "Contact Us Page",
        projectLink: `${process.env.NEXT_PUBLIC_ROOT_URL || window.location.origin
          }${pathname}`,
        status: "PENDING",
        id: 0, // Required for new enquiry
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}enquiry/post`,
        enquiryData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.isSuccess === 1) {
        toast.success(
          response.data.message || "Enquiry submitted successfully!"
        );
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          interestedIn: "Commercial Property",
          message: "",
        });
        setErrors({
          name: "",
          email: "",
          phone: "",
        });
        setValidated(false);
      } else {
        toast.error(
          response.data.message || "Failed to submit enquiry. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "An error occurred. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Contact inforamtion of MPF here  */}
      {/* <div className="container-fluid">
        <div className="container">
          <div className="row py-5 contact-cards-row">
            <div className="col-lg-4 col-md-6 col-sm-12 p-2">
              <div className="contact-info-container border">
                <div className="contact-info-container-child">
                  <div>
                    <img
                      src="/static/contact-us/location_pin.png"
                      alt="Location icon — My Property Fact contact page"
                      title="Location icon — My Property Fact contact page"
                      width={27}
                      height={36}
                    />
                  </div>
                  <h2 className="plus-jakarta-sans-semi-bold h3">Address</h2>
                  <p className="contact-address-text">
                    Unit no: 603, 6th Floor, Corporate Park Tower A1, Sector 142 Noida
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12 p-2">
              <div className="contact-info-container border">
                <div className="contact-info-container-child">
                  <div>
                    <img
                      src="/static/contact-us/phone.png"
                      alt="Phone icon — My Property Fact contact page"
                      title="Phone icon — My Property Fact contact page"
                      width={31}
                      height={31}
                    />
                  </div>
                  <h2 className="plus-jakarta-sans-semi-bold h3">Phone Number</h2>
                  <p>8920024793</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-12 col-sm-12 p-2">
              <div className="contact-info-container border">
                <div className="contact-info-container-child">
                  <div>
                    <img
                      src="/static/contact-us/email.png"
                      alt="Email icon — My Property Fact contact page"
                      title="Email icon — My Property Fact contact page"
                      width={34}
                      height={27}
                    />
                  </div>
                  <h2 className="plus-jakarta-sans-semi-bold h3">Email Address</h2>
                  <p>social@mypropertyfact.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="container-fluid contact-expert-section g-0">
        <div className="container contact-expert-inner py-5">
          <header className="contact-expert-header text-center mx-auto px-2 px-sm-0">
            <h2 className="contact-expert-title">
              Talk To A Property Expert
            </h2>
            <p className="contact-expert-subtitle">
              Tell Us What You&apos;re Looking For, And We&apos;ll Help You Find
              The Right Property Faster.
            </p>
          </header>

          <div className="row contact-expert-main-row g-0 align-items-start mt-2 mt-lg-3">
            <div className="col-12 col-lg-4">
              <div className="contact-expert-cards-column">
                <div className="contact-expert-address-card-wrap">
                  <div className="contact-expert-address-card">
                    <div className="contact-expert-address-icon">
                      <img
                        src="/icon/location.svg"
                        alt="Location pin — office address on My Property Fact contact page"
                        title="Location pin — office address"
                        width={16}
                        height={20}
                      />
                    </div>
                    <div className="contact-expert-address-body">
                      <p className="contact-expert-address-title">Our Office</p>
                      <p className="contact-expert-address-text mb-0">
                        Unit no: 603, 6th Floor, Corporate
                        <br />
                        Park Tower A1,
                        <br />
                        Sector 142 Noida, Uttar Pradesh
                      </p>
                    </div>
                  </div>
                </div>

                <div className="contact-expert-phone-card-wrap">
                  <a
                    href="https://wa.me/918920024793"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-expert-phone-card"
                    aria-label="Chat with My Property Fact on WhatsApp"
                    title="Chat with My Property Fact on WhatsApp"
                  >
                    <div className="contact-expert-phone-icon">
                      <img
                        src="/static/icon/phone_call.svg"
                        alt="WhatsApp contact icon"
                        width={18}
                        height={18}
                      />
                    </div>
                    <div className="contact-expert-phone-body">
                      <p className="contact-expert-phone-title">Call Us</p>
                      <span className="contact-expert-phone-number">
                        +91 8920024793
                      </span>
                      <p className="contact-expert-phone-hours mb-0">
                        Mon-Sat, 10am - 7pm
                      </p>
                    </div>
                  </a>
                </div>

                <div className="contact-expert-email-card-wrap">
                  <a
                    href="mailto:social@mypropertyfact.com"
                    className="contact-expert-email-card"
                    aria-label="Email My Property Fact at social@mypropertyfact.com"
                    title="Email My Property Fact — social@mypropertyfact.com"
                  >
                    <div className="contact-expert-email-icon">
                      <img
                        src="/static/icon/email.svg"
                        alt="Email icon — My Property Fact contact page"
                        title="Email icon — tap to compose email"
                        width={20}
                        height={16}
                      />
                    </div>
                    <div className="contact-expert-email-body">
                      <p className="contact-expert-email-title">Email Us</p>
                      <span className="contact-expert-email-address">
                        social@mypropertyfact.com
                      </span>
                    </div>
                  </a>
                </div>

                <div className="contact-expert-image-card">
                  <div className="contact-expert-image-slide">
                    <img
                      src={CONTACT_SPOTLIGHT.imageSrc}
                      alt={CONTACT_SPOTLIGHT.imageAlt}
                      title={CONTACT_SPOTLIGHT.imageAlt}
                      className="contact-expert-image-cover"
                      loading="lazy"
                      decoding="async"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    <div
                      className="contact-expert-image-gradient"
                      aria-hidden
                    />
                    <span className="contact-expert-image-label">
                      {CONTACT_SPOTLIGHT.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-8 contact-expert-form-column">
              <div className="contact-expert-form-shell">
                <div className="contact-expert-form-card">
                  <p className="contact-expert-form-heading">Send a Message</p>
                  <p className="contact-expert-form-lead">
                    Fill out the form below and one of our property consultants
                    will reach out shortly.
                  </p>
                  <form
                    className="contact-expert-form"
                    onSubmit={handleSubmit}
                    noValidate
                  >
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label
                          className="contact-expert-label"
                          htmlFor="contact-expert-name"
                        >
                          Full Name
                        </label>
                        <input
                          id="contact-expert-name"
                          type="text"
                          name="name"
                          className={`contact-expert-input contact-expert-input--body ${errors.name ? "is-invalid" : ""
                            }`}
                          placeholder="Enter Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        {errors.name && (
                          <span className="contact-expert-error">{errors.name}</span>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label
                          className="contact-expert-label"
                          htmlFor="contact-expert-phone"
                        >
                          Phone Number
                        </label>
                        <input
                          id="contact-expert-phone"
                          type="tel"
                          name="phone"
                          className={`contact-expert-input contact-expert-input--body ${errors.phone ? "is-invalid" : ""
                            }`}
                          placeholder="+91 00000 00000"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        {errors.phone && (
                          <span className="contact-expert-error">{errors.phone}</span>
                        )}
                      </div>
                      <div className="col-12">
                        <label
                          className="contact-expert-label"
                          htmlFor="contact-expert-email"
                        >
                          Email Address
                        </label>
                        <input
                          id="contact-expert-email"
                          type="email"
                          name="email"
                          className={`contact-expert-input ${errors.email ? "is-invalid" : ""
                            }`}
                          placeholder="Enter Your Email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                        />
                        {errors.email && (
                          <span className="contact-expert-error">{errors.email}</span>
                        )}
                      </div>
                      <div className="col-12">
                        <fieldset className="contact-expert-interest-fieldset">
                          <legend className="contact-expert-label contact-expert-interest-legend">
                            Interested In
                          </legend>
                          <div className="contact-expert-radio-group">
                            {INTEREST_OPTIONS.map((opt, i) => {
                              const inputId = `contact-expert-interest-${i}`;
                              return (
                                <label
                                  key={opt}
                                  className="contact-expert-radio"
                                  htmlFor={inputId}
                                  title={opt}
                                >
                                  <input
                                    type="radio"
                                    id={inputId}
                                    name="interestedIn"
                                    value={opt}
                                    checked={formData.interestedIn === opt}
                                    onChange={handleChange}
                                    className="contact-expert-radio-input"
                                  />
                                  <span className="contact-expert-radio-text">
                                    {opt}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      </div>
                      <div className="col-12">
                        <label
                          className="contact-expert-label"
                          htmlFor="contact-expert-message"
                        >
                          Your Message
                        </label>
                        <textarea
                          id="contact-expert-message"
                          name="message"
                          className="contact-expert-textarea"
                          placeholder="How can we help you?"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="contact-expert-submit"
                      disabled={isSubmitting}
                      title="Submit your inquiry — sends this form to My Property Fact"
                    >
                      <span>{isSubmitting ? "Sending…" : "Send Inquiry"}</span>
                      <img
                        src="/static/icon/enquiry.svg"
                        alt="Enquiry icon — submits this form"
                        title="Enquiry icon — submits this form"
                        width={19}
                        height={16}
                        className="contact-expert-submit-icon"
                        aria-hidden
                      />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* get a quote section here  */}
      {/* <div
        className="container-fluid get-quote-section"
        style={{ background: "#000000D9" }}
      >
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <h2 className="get-quote-heading plus-jakarta-sans-semi-bold text-center mb-4">
                Get A Quote
              </h2>
              <form
                className="get-quote-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <input
                      type="text"
                      name="name"
                      className={`form-control get-quote-input ${
                        errors.name ? "error" : ""
                      }`}
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>
                  <div className="col-md-6">
                    <input
                      type="email"
                      name="email"
                      className={`form-control get-quote-input ${
                        errors.email ? "error" : ""
                      }`}
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control get-quote-input ${
                        errors.phone ? "error" : ""
                      }`}
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone}</span>
                    )}
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="preferredTime"
                      className="form-control get-quote-input"
                      placeholder="Preferred Time"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-12">
                    <textarea
                      name="message"
                      className="form-control get-quote-input get-quote-textarea"
                      placeholder="Message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn get-quote-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div> */}

      {/* Looking for a dream home section  */}
      <div className="container-fluid looking-for-dream-home-section">
        <div className="looking-for-dream-home-section-image1">
          <img
            src="/static/contact-us/looking_for_Dream_home_bg.png"
            alt="Dream home — background graphic for Looking for a dream home on My Property Fact contact page"
            title="Dream home — background graphic for Looking for a dream home on My Property Fact contact page"
            width={414}
            height={603}
          />
        </div>
        <div className="looking-for-dream-home-section-content">
          <h2 className="plus-jakarta-sans-semi-bold">Looking For A Dream Home?</h2>
          <p>We can help you realize your dream of a new home</p>
          <div>
            <button
              onClick={() => {
                window.location.href = "/projects";
              }}
            >
              View Projects
            </button>
          </div>
        </div>
        <div className="looking-for-dream-home-section-image2">
          <img
            src="/static/contact-us/looking_for_dream_home.png"
            alt="Dream home — illustration for Looking for a dream home on My Property Fact contact page"
            title="Dream home — illustration for Looking for a dream home on My Property Fact contact page"
            width={480}
            height={500}
          />
        </div>
      </div>

      {/* social media feeds section  */}
      <SocialFeedsOfMPF />

      {/* Location map section with full width  */}
      <div className="container-fluid mt-3 mb-2 p-0 map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.2218239019567!2d77.4114103!3d28.502973100000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce9cc1ae0ebad%3A0xc60e4de11898150c!2sMy%20Property%20Fact!5e0!3m2!1sen!2sin!4v1777278399978!5m2!1sen!2sin"
          className="contact-map-iframe"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
        ></iframe>
      </div>
    </>
  );
}
