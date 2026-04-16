import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Image from "next/image";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { usePathname } from "next/navigation";
import LeadEmailOtpSection from "./LeadEmailOtpSection";
import "./popupform.css";

function getProjectImageSrc(data) {
  if (!data?.slugURL) return "/static/no_image.png";
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const slug = data.slugURL;
  const filename =
    data.desktopImages?.[0]?.desktopImage ||
    data.projectThumbnail ||
    data.projectBannerImage ||
    data.projectLogo ||
    "";
  if (!filename) return "/static/no_image.png";
  if (/^https?:\/\//i.test(filename) || filename.startsWith("/")) return filename;
  return `${imageBase}properties/${slug}/${filename}`;
}

export default function CommonPopUpform({ show, handleClose, from, data }) {
  const [validated, setValidated] = useState(false);
  const pathname = usePathname();
  const intitalData = {
    id: 0,
    name: "",
    email: "",
    phone: "",
    message: "",
    enquiryFrom: "",
    projectLink: "",
    pageName: "",
  };
  const [formData, setFormData] = useState(intitalData);
  const [showLoading, setShowLoading] = useState(false);
  const [buttonName, setButtonName] = useState("Submit Enquiry");
  const [emailVerificationToken, setEmailVerificationToken] = useState(null);
  /** Inline banner at top of form (Sonner sits behind this modal’s z-index). */
  const [formNotice, setFormNotice] = useState(null);

  //Validation errors state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  //Validation functions (aligned with contact us page)
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
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
    const cleanedPhone = phone.toString().replace(/[\s\-\(\)]/g, "");
    if (!/^\d+$/.test(cleanedPhone)) {
      return "Phone number can only contain digits, spaces, dashes, and parentheses";
    }
    if (cleanedPhone.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    if (!/^[6-9]/.test(cleanedPhone)) {
      return "Phone number must start with 6, 7, 8, or 9";
    }

    if (/^(\d)\1{9}$/.test(cleanedPhone)) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  //Handlechanging input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
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
    if (name === "name" || name === "email" || name === "phone") {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setFormData(intitalData);
      setValidated(false);
      setErrors({ name: "", email: "", phone: "" });
      setEmailVerificationToken(null);
      setFormNotice(null);
    } else {
      setFormNotice(null);
    }
  }, [show]);

  useEffect(() => {
    setEmailVerificationToken(null);
  }, [formData.email]);

  //handle form submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Validate all fields (aligned with contact us page)
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

    const isFormValid =
      form.checkValidity() &&
      !nameError &&
      !emailError &&
      !phoneError;

    if (!isFormValid) {
      event.stopPropagation();
      setFormNotice({
        type: "error",
        message: "Please fill all fields correctly before submitting.",
      });
      return;
    }

    if (!emailVerificationToken) {
      event.stopPropagation();
      setFormNotice({
        type: "error",
        message: "Please verify your email with the code we sent before submitting.",
      });
      return;
    }

    try {
      setShowLoading(true);
      setButtonName("");
      // Build payload metadata based on source page
      const submitData = {
        ...formData,
        enquiryFrom: from === "Project Detail" ? (data?.projectName || "Project Detail") : "Home Page",
        projectLink: from === "Project Detail" ? `${process.env.NEXT_PUBLIC_UI_URL}${pathname}` : `${process.env.NEXT_PUBLIC_UI_URL}`,
        pageName: from === "Project Detail" ? "Project Detail" : "Home",
        emailVerificationToken,
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}enquiry/post`,
        submitData
      );
      // Check if response is successful
      if (response.data.isSuccess === 1) {
        setFormNotice({
          type: "success",
          message:
            response.data.message ||
            "Thank you — we’ll contact you shortly.",
        });
        setValidated(false);
        setFormData(intitalData);
        setErrors({ name: "", email: "", phone: "" });
        setEmailVerificationToken(null);
        window.setTimeout(() => {
          handleClose(false);
          setFormNotice(null);
        }, 950);
      } else {
        setFormNotice({
          type: "error",
          message: response.data.message || "Submission was not successful.",
        });
      }
    } catch (error) {
      setFormNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      });
      console.error("Error submitting form:", error);
    } finally {
      setShowLoading(false);
      setButtonName("Submit Enquiry");
    }
  };

  const isProjectDetail = from === "Project Detail" && data?.slugURL;
  const HOME_ENQUIRY_SIDE_IMAGE = "/static/icon/enquiry_home_image.png";
  const splitImageSrc = isProjectDetail ? getProjectImageSrc(data) : HOME_ENQUIRY_SIDE_IMAGE;
  const splitImageAlt = isProjectDetail
    ? data?.projectName || "Project"
    : "Premium homes — My Property Fact";

  return (
    <>
      <Modal
        show={show}
        onHide={() => handleClose(false)}
        centered

        backdropClassName="enquiry-popup-backdrop"
        className="enquiry-popup enquiry-popup--split"
        dialogClassName="enquiry-popup-dialog"
      >
        <>
          <button
            type="button"
            className="btn-close enquiry-popup-close"
            aria-label="Close"
            onClick={() => handleClose(false)}
          />
          <div className="enquiry-popup-split">
            <div className="enquiry-popup-image">
              <Image
                src={splitImageSrc}
                alt={splitImageAlt}
                fill
                className="enquiry-popup-image-img"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="enquiry-popup-form-wrap">
              <p className="enquiry-popup-intro">
                We offer various property listings for you to explore.
              </p>
              <h2 className="enquiry-popup-title-main">
                <span className="enquiry-popup-title-regular">Start Your Journey to the </span>
                <span className="enquiry-popup-title-accent-wrap">
                  <span className="enquiry-popup-title-accent">Perfect Home.</span>
                  <div className="enquiry-popup-title-highlight" aria-hidden="true" />
                </span>
              </h2>
              <Form
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
                className="enquiry-popup-form"
              >
                {formNotice ? (
                  <div
                    className={`enquiry-form-notice enquiry-form-notice--${formNotice.type}`}
                    role="status"
                  >
                    <span className="enquiry-form-notice-text">
                      {formNotice.message}
                    </span>
                    <button
                      type="button"
                      className="enquiry-form-notice-dismiss"
                      aria-label="Dismiss"
                      onClick={() => setFormNotice(null)}
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <Form.Group className="mb-3" controlId="enquiry_full_name">
                  <Form.Control
                    className="enquiry-popup-input"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => handleChange(e)}
                    onBlur={handleBlur}
                    name="name"
                    isInvalid={!!errors.name || (validated && !formData.name.trim())}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name || "Please provide a valid name."}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="enquiry_email_id">
                  <Form.Control
                    className="enquiry-popup-input"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleChange(e)}
                    onBlur={handleBlur}
                    name="email"
                    isInvalid={!!errors.email || (validated && !formData.email.trim())}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email || "Please provide a valid email."}
                  </Form.Control.Feedback>
                </Form.Group>
                <LeadEmailOtpSection
                  email={formData.email}
                  emailFieldValid={
                    !errors.email &&
                    validateEmail(formData.email) === ""
                  }
                  verificationToken={emailVerificationToken}
                  onVerified={setEmailVerificationToken}
                  onClearVerification={() => setEmailVerificationToken(null)}
                  className="enquiry-popup-otp"
                  feedbackMode="inline"
                />
                <Form.Group className="mb-3" controlId="enquiry_phone_number">
                  <Form.Control
                    className="enquiry-popup-input"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleChange(e)}
                    onBlur={handleBlur}
                    name="phone"
                    isInvalid={!!errors.phone || (validated && !formData.phone.trim())}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone || "Please provide a valid phone number."}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="enquiry_message">
                  <Form.Control
                    className="enquiry-popup-input"
                    as="textarea"
                    rows={3}
                    placeholder="Message"
                    value={formData.message}
                    onChange={(e) => handleChange(e)}
                    name="message"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid message.
                  </Form.Control.Feedback>
                </Form.Group>
                <Button
                  type="submit"
                  className="fw-bold border-0 enquiry-popup-submit enquiry-popup-submit--callback"
                  disabled={showLoading || !emailVerificationToken}
                >
                  Request a Callback <LoadingSpinner show={showLoading} />
                </Button>
              </Form>
              <p className="enquiry-popup-footer">Ready to help! Fill the form, and we&apos;ll call soon.</p>
            </div>
          </div>

        </>
      </Modal>
    </>
  );
}
