"use client";

import { useId, useRef, useState } from "react";
import axios from "axios";
import { buildEnquirySubmitData } from "@/lib/leadTracker";
import { usePathname } from "next/navigation";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import {
  validateLeadEmail as validateEmail,
  validateLeadName as validateName,
  validateLeadPhone as validatePhone,
} from "@/lib/leadValidation";
import {
  getLeadFormHeroAlt,
  getLeadFormHeroImage,
} from "@/lib/leadFormImages";
import LeadFormOtpStep from "@/components/LeadFormOtpStep";
import LeadFormSplitLayout from "@/components/LeadFormSplitLayout";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import { gateLeadFormOtp } from "@/lib/leadFormOtpGate";
import { leadFormOtpActiveClass, leadFormSplitOtpActiveClass } from "@/lib/leadFormOtpUi";
import "@/components/leadFormSplitLayout.css";
import "./getTouchEnquirySection.css";

const GET_IN_TOUCH_POINTS = [
  "Book a Site Visit",
  "Ask For a Brochure",
  "Speak to a Representative",
  "Ask for a Quotation",
];

const DEFAULT_HOME_COPY =
  "Queries about listings, LOCATE scores, or expert guidance on buying or investing.";

const DEFAULT_PROJECT_COPY =
  "Get pricing, floor plans, payment plans, and site visit slots from our property expert.";

/**
 * “Get in Touch” enquiry block — split hero + compact single-view form.
 * @param {Object} [props.projectDetail] — When set, uses project image + metadata.
 * @param {boolean} [props.embeddedInParallax] — Render inside property parallax overlay.
 */
export default function GetTouchEnquirySection({
  projectDetail = null,
  embeddedInParallax = false,
  variant = "v2",
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
  const formRef = useRef(null);
  const leadOtp = useLeadOtp(formData.phone);

  const heroImageSrc = getLeadFormHeroImage({ projectDetail });
  const heroImageAlt = getLeadFormHeroAlt({ projectDetail });
  const layoutVariant = embeddedInParallax ? "embedded" : "inline";

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

      const otpGate = await gateLeadFormOtp(leadOtp, formData.phone);
      if (!otpGate.ok) {
        if (otpGate.tone === "info") {
          toast.info(otpGate.message);
        } else {
          toast.error(otpGate.message);
        }
        return;
      }

      const submitData = await buildEnquirySubmitData(
        {
          ...formData,
          enquiryFrom,
          projectLink: `${baseUrl}${pathname || "/"}`,
          pageName: projectDetail ? "Project Detail" : "Home",
        },
        projectDetail
          ? {
              property: {
                property_name: projectDetail.projectName ?? null,
                project: projectDetail.projectName ?? null,
                builder: projectDetail.builderName ?? null,
                city: projectDetail.cityName ?? null,
              },
            }
          : undefined,
      );

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
        leadOtp.reset();
        toast.success("Enquiry sent successfully");
      } else {
        toast.error(response.data.message || "Failed to send enquiry. Please try again.");
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

  const formContent = (
    <>
      {!leadOtp.otpSent ? (
        <div className="get-touch-point-list" role="list">
          {GET_IN_TOUCH_POINTS.map((point) => (
            <span key={point} className="get-touch-point-item" role="listitem">
              <span className="get-touch-point-icon">
                <img
                  src="/icon/verify.svg"
                  alt=""
                  width={12}
                  height={12}
                  aria-hidden
                />
              </span>
              <span>{point}</span>
            </span>
          ))}
        </div>
      ) : null}

      <Form
        ref={formRef}
        noValidate
        validated={validated1}
        className={`lead-form-fields ${leadFormOtpActiveClass(leadOtp)}`.trim()}
        onSubmit={handleSubmit}
        aria-labelledby={`mpf-get-touch-title${uid}`}
      >
        <Form.Group className="lead-form-field--full" controlId={`${uid}-phone`}>
          <Form.Control
            className="lead-form-input"
            type="tel"
            placeholder="Phone Number"
            value={formData.phone || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            name="phone"
            isInvalid={!!errors.phone || (validated1 && !formData.phone.trim())}
            disabled={leadOtp.isVerified}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone || "Please provide a valid phone number."}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId={`${uid}-name`}>
          <Form.Control
            className="lead-form-input"
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

        <Form.Group controlId={`${uid}-email`}>
          <Form.Control
            className="lead-form-input"
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

        <Form.Group className="lead-form-field--full" controlId={`${uid}-message`}>
          <Form.Control
            className="lead-form-input lead-form-textarea"
            as="textarea"
            rows={2}
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

        <div className="lead-form-field--full">
          <LeadFormOtpStep
            phone={formData.phone}
            leadOtp={leadOtp}
            variant="bootstrap"
            inputClassName="lead-form-input"
            autoSubmitFormRef={formRef}
          />
        </div>

        <Button
          className="lead-form-submit"
          type="submit"
          disabled={showLoading || leadOtp.verifying}
        >
          Submit Enquiry
          <LoadingSpinner show={showLoading} />
        </Button>
      </Form>
    </>
  );

  const splitLayout = (
    <LeadFormSplitLayout
      variant={layoutVariant}
      imageSrc={heroImageSrc}
      imageAlt={heroImageAlt}
      badge={projectDetail?.projectName || null}
      eyebrow={projectDetail ? "Project enquiry" : "My Property Fact"}
      title={title}
      subtitle={copy}
      mediaOverlay
      className={leadFormSplitOtpActiveClass(leadOtp)}
    >
      {formContent}
    </LeadFormSplitLayout>
  );

  if (embeddedInParallax) {
    return (
      <div className="get-touch-parallax-shell">
        {splitLayout}
      </div>
    );
  }

  return (
    <section
      className="mpf-get-touch-enquiry mpf-get-touch-enquiry--split"
      aria-labelledby={`mpf-get-touch-title${uid}`}
    >
      <div className="get-touch-section-inner">{splitLayout}</div>
    </section>
  );
}
