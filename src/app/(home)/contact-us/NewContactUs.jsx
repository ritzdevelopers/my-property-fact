"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import "./contact.css";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-toastify";
import SocialFeedsOfMPF from "../components/_homecomponents/SocialFeedsOfMPF";

export default function NewContactUs() {
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredTime: "",
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
    // Remove spaces, dashes, and parentheses for validation
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "");
    // Check if it's all digits
    if (!/^\d+$/.test(cleanedPhone)) {
      return "Phone number can only contain digits, spaces, dashes, and parentheses";
    }
    // Check length (exactly 10 digits)
    if (cleanedPhone.length !== 10) {
      return "Phone number must be exactly 10 digits";
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
      formData.preferredTime.trim() !== "";

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
        message: formData.preferredTime
          ? `Preferred Time: ${formData.preferredTime}\n\nMessage: ${formData.message}`
          : formData.message,
        pageName: "Contact Us - Get A Quote",
        enquiryFrom: "Contact Us Page",
        projectLink: `${
          process.env.NEXT_PUBLIC_ROOT_URL || window.location.origin
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
          preferredTime: "",
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
      <div className="container-fluid">
        <div className="container">
          <div className="row py-5 contact-cards-row">
            <div className="col-lg-4 col-md-6 col-sm-12 p-2">
              <div className="contact-info-container border">
                <div className="contact-info-container-child">
                  <div>
                    <Image
                      src="/static/contact-us/location_pin.png"
                      alt="Location_icon"
                      width={27}
                      height={36}
                    />
                  </div>
                  <h3 className="plus-jakarta-sans-semi-bold">Address</h3>
                  <p className="contact-address-text">
                    6th Floor, Unit No.603, Corporate Park Tower A, Plot No. 7A/1, Near Advant Building, Sector 142, Gautam Buddha Nagar, Noida, Pin-201305.(UP)
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12 p-2">
              <div className="contact-info-container border">
                <div className="contact-info-container-child">
                  <div>
                    <Image
                      src="/static/contact-us/phone.png"
                      alt="Phone_icon"
                      width={31}
                      height={31}
                    />
                  </div>
                  <h3 className="plus-jakarta-sans-semi-bold">Phone Number</h3>
                  <p>8920024793</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-12 col-sm-12 p-2">
              <div className="contact-info-container border">
                <div className="contact-info-container-child">
                  <div>
                    <Image
                      src="/static/contact-us/email.png"
                      alt="Email_icon"
                      width={34}
                      height={27}
                    />
                  </div>
                  <h3 className="plus-jakarta-sans-semi-bold">Email Address</h3>
                  <p>social@mypropertyfact.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* get a quote section here  */}
      <div
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
      </div>

      {/* Looking for a dream home section  */}
      <div className="container-fluid looking-for-dream-home-section">
        <div className="looking-for-dream-home-section-image1">
          <Image
            src="/static/contact-us/looking_for_Dream_home_bg.png"
            alt="Dream Home"
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
          <Image
            src="/static/contact-us/looking_for_dream_home.png"
            alt="Dream Home"
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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.221511536636!2d77.41139419999999!3d28.502982499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce530165cc6c1%3A0x9ea28df462e9945e!2sRitz%20Media%20World!5e0!3m2!1sen!2sin!4v1764832099403!5m2!1sen!2sin"
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
