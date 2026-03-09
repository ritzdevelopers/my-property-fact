"use client";
import Link from "next/link";
import "./contact.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faPhone,
  faUser,
  faVoicemail,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { LoadingSpinner } from "./page";
import { usePathname } from "next/navigation";
export default function ContactUs() {
  const [validated, setValidated] = useState(false);
  const [buttonName, setButtonName] = useState("Get a free service");
  const [showLoading, setShowLoading] = useState(false);
  const pathName = usePathname();
  //Defining form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    enquiryFrom: "",
    projectLink: "",
    pageName: "",
  });

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

    if (cleanedPhone.length < 8 || cleanedPhone.length > 10) {
      return "Phone number must be between 8 to 10 digits"
    }
    // If number is 10 digits then check Indian mobile rule
    if (cleanedPhone.length === 10 && !/^[6-9]/.test(cleanedPhone)) {
      return "Phone number must start with 6, 7, 8, or 9";
    }
    return "";
  };

  //Handling form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setShowLoading(true);
    setButtonName("");

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
      formData.message.trim() !== "";

    if (!isFormValid) {
      e.stopPropagation();
      toast.error("Please fill all fields correctly!");
      setShowLoading(false);
      setButtonName("Get a free service");
      return;
    }

    try {
      const submitData = {
        ...formData,
        pageName: "Contact us",
        projectLink: `${process.env.NEXT_PUBLIC_ROOT_URL}${pathName}`,
        enquiryFrom: `Contact us page`,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}enquiry/post`,
        submitData
      );
      if (response.data.isSuccess === 1) {
        toast.success(response.data.message);
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          enquiryFrom: "",
          projectLink: "",
        });
        setErrors({
          name: "",
          email: "",
          phone: "",
        });
        setValidated(false);
        setButtonName("Get a free service");
        setShowLoading(false);
      } else {
        toast.error(response.data.message);
        setShowLoading(false);
        setButtonName("Get a free service");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
      setShowLoading(false);
      setButtonName("Get a free service");
    }
  };

  //Handle setting all form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((item) => ({
      ...item,
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

  return (
    <div className="my-5">
      <div className="container d-flex justify-content-center gap-4 flex-wrap">
        <div className="info-container-child">
          <p>Email Address</p>
          <p>social@mypropertyfact.com</p>
        </div>
        <div className="info-container-child">
          <p>Phone Number</p>
          <p>8920024793</p>
        </div>
        <div className="info-container-child">
          <p>Office Address</p>
          <p>6th Floor, Unit No.603, Corporate Park Tower A,</p>
          <p>Plot No. 7A/1, Near Advant Building, Sector 142,</p>
          <p>Gautam Buddha Nagar, Noida, Pin-201305.(UP)</p>
        </div>
      </div>
      <div className="contact-form-section">
        <form noValidate validated={validated + ""} onSubmit={handleSubmit}>
          <p className="fw-bold h5 mb-3">Get a quote</p>
          <div className="input-item">
            <input
              placeholder="Enter your name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange(e)}
              onBlur={(e) => handleBlur(e)}
              className={errors.name ? "error" : ""}
            />
            <FontAwesomeIcon icon={faUser} width={20} />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          <div className="input-item">
            <input
              placeholder="Enter your email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange(e)}
              onBlur={(e) => handleBlur(e)}
              required
              className={errors.email ? "error" : ""}
            />
            <FontAwesomeIcon icon={faVoicemail} width={20} />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="input-item">
            <input
              placeholder="Enter your phone number"
              name="phone"
              type="tel"
              maxLength={10}
              value={formData.phone}
              onChange={(e) => handleChange(e)}
              onBlur={(e) => handleBlur(e)}
              required
              className={errors.phone ? "error" : ""}
            />
            <FontAwesomeIcon icon={faPhone} width={20} />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>
          <div className="input-item">
            <textarea
              placeholder="Enter your message"
              name="message"
              className="custom-textarea"
              value={formData.message}
              onChange={(e) => handleChange(e)}
              required
            />
            <FontAwesomeIcon icon={faPencil} width={20} />
          </div>
          <button type="submit" disabled={showLoading}>
            {buttonName}
            <LoadingSpinner show={showLoading} />
          </button>
        </form>
      </div>
      <div>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.2212431770063!2d77.40866827528409!3d28.50299057573584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce530165cc6c1%3A0x9ea28df462e9945e!2sRitz%20Media%20World-Digital%20Marketing%20Agency%20in%20Noida%20%7C%20Social%20Media%20Agency%20in%20Noida%20%7C%20Newspaper%20%26%20Radio%20Ad%20Agency%20in%20Noida!5e0!3m2!1sen!2sin!4v1738666960929!5m2!1sen!2sin"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ width: "100%", height: "500px" }}
        ></iframe>
      </div>
      <div className="looking-for-home">
        <div className="looking-for-home-child">
          <div className="looking-for-home-child-text">
            <p>Looking for a dream home?</p>
            <p>We can help you realize your dream of a new home</p>
          </div>
          <Link href="/projects">View Projects</Link>
        </div>
      </div>
    </div>
  );
}
