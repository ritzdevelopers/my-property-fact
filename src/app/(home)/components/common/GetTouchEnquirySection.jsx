"use client";

import { useId, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import "./getTouchEnquirySection.css";

const GET_IN_TOUCH_POINTS = [
  "Book a Site Visit",
  "Ask For a Brochure",
  "Speak to a Representative",
  "Ask for a Quotation",
];

const DEFAULT_HOME_COPY =
  "If you have any queries about listings, LOCATE scores, or expert guidance on buying or investing, fill out this form and our team will get back to you shortly.";

const DEFAULT_PROJECT_COPY =
  "If you have any additional queries regarding the project or would like to take the next step in your investment journey, you can fill out this query form and our team will be happy to assist you with what you need.";

function validateName(name) {
  if (!name.trim()) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name.trim())) {
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  }
  return "";
}

function validateEmail(email) {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address";
  return "";
}

function validatePhone(phone) {
  if (!phone.trim()) return "Phone number is required";
  const cleaned = phone.toString().replace(/[\s\-\(\)]/g, "");
  if (!/^\d+$/.test(cleaned)) {
    return "Phone number can only contain digits, spaces, dashes, and parentheses";
  }
  if (cleaned.length !== 10) return "Phone number must be exactly 10 digits";
  if (!/^[6-9]/.test(cleaned)) return "Phone number must start with 6, 7, 8, or 9";
  if (/^(\d)\1{9}$/.test(cleaned)) return "Please enter a valid phone number";
  return "";
}

/**
 * V2-style “Get in Touch” enquiry block (propertyV2 / propertypageV2).
 * @param {Object} [props.projectDetail] — When set, copy + metadata follow project page.
 * @param {boolean} [props.embeddedInParallax] — Render inner only (parent is `.parallax-strip-overlay`).
 * @param {string} [props.title]
 * @param {string} [props.bodyCopy]
 */
export default function GetTouchEnquirySection({
  projectDetail = null,
  embeddedInParallax = false,
  title = "Get in Touch",
  bodyCopy,
}) {
  const pathname = usePathname();
  const uid = useId();
  const copy =
    bodyCopy ??
    (projectDetail ? DEFAULT_PROJECT_COPY : DEFAULT_HOME_COPY);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    enquiryFrom: "",
    projectLink: "",
    pageName: "",
  });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });
  const [validated1, setValidated1] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((pre) => ({ ...pre, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";
    if (name === "name") error = validateName(value);
    else if (name === "email") error = validateEmail(value);
    else if (name === "phone") error = validatePhone(value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const newErrors = { name: nameError, email: emailError, phone: phoneError };
    setErrors(newErrors);

    const isFormValid =
      form.checkValidity() &&
      !nameError &&
      !emailError &&
      !phoneError &&
      formData.message.trim() !== "";

    if (!isFormValid) {
      e.stopPropagation();
      setValidated1(true);
      toast.error("Please fill all fields correctly!");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_UI_URL || "";
    const enquiryFrom =
      projectDetail?.projectName || "Home Page";

    try {
      setShowLoading(true);
      const submitData = {
        ...formData,
        enquiryFrom,
        projectLink: `${baseUrl}${pathname || "/"}`,
        pageName: projectDetail ? "Project Detail" : "Home",
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}enquiry/post`,
        submitData,
      );

      if (response.data.isSuccess === 1) {
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          enquiryFrom: "",
          projectLink: "",
          pageName: "",
        });
        setErrors({ name: "", email: "", phone: "" });
        setValidated1(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setShowLoading(false);
    }
  };

  const inner = (
    <div className="get-touch-overlay-inner">
      <h2 className="get-touch-title" id={`mpf-get-touch-title${uid}`}>
        {title}
      </h2>
      <p className="get-touch-copy">{copy}</p>

      <div className="get-touch-point-list">
        {GET_IN_TOUCH_POINTS.map((point) => (
          <span key={point} className="get-touch-point-item">
            <span className="get-touch-point-icon">
              <Image src="/icon/verify.svg" alt="" width={12} height={12} />
            </span>
            <span>{point}</span>
          </span>
        ))}
      </div>

      <div className="project-detail-contact-form get-touch-form-wrap">
        <Form
          noValidate
          validated={validated1}
          className="w-100"
          onSubmit={handleSubmit}
        >
          <Row className="g-2">
            <Col md={4}>
              <Form.Group className="mb-2" controlId={`${uid}-name`}>
                <Form.Control
                  type="text"
                  placeholder="Full Name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="name"
                  isInvalid={!!errors.name || (validated1 && !formData.name.trim())}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name || "Please provide a valid name."}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-2" controlId={`${uid}-email`}>
                <Form.Control
                  type="email"
                  placeholder="Email Id"
                  value={formData.email || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="email"
                  isInvalid={!!errors.email || (validated1 && !formData.email.trim())}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email || "Please provide a valid email."}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-2" controlId={`${uid}-phone`}>
                <Form.Control
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="phone"
                  isInvalid={!!errors.phone || (validated1 && !formData.phone.trim())}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone || "Please provide a valid phone number."}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2" controlId={`${uid}-message`}>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Message"
              value={formData.message || ""}
              onChange={handleChange}
              name="message"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid message.
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            className="btn btn-background text-white border-0 w-100 py-3 text-capitalize get-touch-submit-btn"
            type="submit"
            disabled={showLoading}
          >
            Submit
            <LoadingSpinner show={showLoading} />
          </Button>
        </Form>
      </div>
    </div>
  );

  if (embeddedInParallax) {
    return inner;
  }

  return (
    <section className="mpf-get-touch-enquiry" aria-labelledby={`mpf-get-touch-title${uid}`}>
      {inner}
    </section>
  );
}
