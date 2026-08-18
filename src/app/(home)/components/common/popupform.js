import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { usePathname } from "next/navigation";
import { buildEnquirySubmitData, warmUpLiveLocation } from "@/lib/leadTracker";
import {
  validateLeadEmail,
  validateLeadName,
  validateLeadPhone,
} from "@/lib/leadValidation";
import {
  getLeadFormHeroAlt,
  getLeadFormHeroImage,
} from "@/lib/leadFormImages";
import LeadFormOtpStep from "@/components/LeadFormOtpStep";
import LeadFormSplitLayout from "@/components/LeadFormSplitLayout";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import { gateLeadFormOtp } from "@/lib/leadFormOtpGate";
import {
  leadFormOtpActiveClass,
  leadFormSplitOtpActiveClass,
} from "@/lib/leadFormOtpUi";
import "./popupform.css";

export default function CommonPopUpform({
  show,
  handleClose,
  from,
  data,
}) {
  const [validated, setValidated] = useState(false);
  const pathname = usePathname();
  const intitalData = {
    id: 0,
    name: "",
    email: "",
    phone: "",
    message: "",
    userLocation: "",
    enquiryFrom: "",
    projectLink: "",
    pageName: "",
  };
  const [formData, setFormData] = useState(intitalData);
  const [showLoading, setShowLoading] = useState(false);
  const formRef = useRef(null);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const validateName = validateLeadName;
  const validateEmail = validateLeadEmail;
  const validatePhone = validateLeadPhone;
  const leadOtp = useLeadOtp(formData.phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

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

  useEffect(() => {
    if (!show) {
      setFormData(intitalData);
      setValidated(false);
      setErrors({ name: "", email: "", phone: "" });
      leadOtp.reset();
    }
  }, [show]);

  useEffect(() => {
    if (show) warmUpLiveLocation();
  }, [show]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

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
      toast.error("Please fill all fields correctly!");
      return;
    }

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
          enquiryFrom: from === "Project Detail" ? (data?.projectName || "Project Detail") : "Home Page",
          projectLink: from === "Project Detail" ? `${process.env.NEXT_PUBLIC_UI_URL}${pathname}` : `${process.env.NEXT_PUBLIC_UI_URL}`,
          pageName: from === "Project Detail" ? "Project Detail" : "Home",
        },
        from === "Project Detail"
          ? {
              property: {
                property_name: data?.projectName ?? null,
                project: data?.projectName ?? null,
                builder: data?.builderName ?? null,
                city: data?.cityName ?? null,
                locality: data?.location ?? null,
              },
              userLocation: formData.userLocation?.trim() || null,
            }
          : { userLocation: formData.userLocation?.trim() || null },
      );
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}enquiry/post`,
        submitData
      );
      if (response.data.isSuccess === 1) {
        closeModal();
        setValidated(false);
        setFormData(intitalData);
        setErrors({ name: "", email: "", phone: "" });
        leadOtp.reset();
        toast.success("Enquiry sent successfully");
      } else {
        toast.error(response.data.message || "Failed to send enquiry. Please try again.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "An error occurred. Please try again.";
      toast.error(message);
      console.error("Error submitting form:", error);
    } finally {
      setShowLoading(false);
    }
  };

  const isProjectDetail = from === "Project Detail" && data?.slugURL;
  const heroImageSrc = getLeadFormHeroImage({
    projectDetail: isProjectDetail ? data : null,
  });
  const heroImageAlt = getLeadFormHeroAlt({
    projectDetail: isProjectDetail ? data : null,
  });
  const heroBadge = isProjectDetail ? data?.projectName : null;
  const heroTitle = isProjectDetail
    ? "Enquire About This Property"
    : "Start Your Property Journey";
  const heroSubtitle = isProjectDetail
    ? "Share your details and our expert will call you with pricing, floor plans, and site visit slots."
    : "Tell us what you need , residential, commercial, or investment , and we will call you back shortly.";

  const closeModal = () => {
    handleClose(false);
    window.requestAnimationFrame(() => {
      const active = document.activeElement;
      if (active instanceof HTMLElement) {
        active.blur();
      }
    });
  };

  return (
    <Modal
      show={show}
      onHide={closeModal}
      centered
      restoreFocus={false}
      backdropClassName="enquiry-popup-backdrop"
      className="enquiry-popup enquiry-popup--split-v2"
      dialogClassName="enquiry-popup-dialog enquiry-popup-dialog--split-v2"
    >
      <LeadFormSplitLayout
        variant="modal"
        imageSrc={heroImageSrc}
        imageAlt={heroImageAlt}
        badge={heroBadge}
        eyebrow={isProjectDetail ? "Project enquiry" : "My Property Fact"}
        title={heroTitle}
        subtitle={heroSubtitle}
        onClose={closeModal}
        className={leadFormSplitOtpActiveClass(leadOtp)}
      >
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
          className={`lead-form-fields ${leadFormOtpActiveClass(leadOtp)}`.trim()}
        >
          <Form.Group className="lead-form-field--full" controlId="phone_number">
            <Form.Control
              className="lead-form-input"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              name="phone"
              isInvalid={!!errors.phone || (validated && !formData.phone.trim())}
              disabled={leadOtp.isVerified}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone || "Please provide a valid phone number."}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="full_name">
            <Form.Control
              className="lead-form-input"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              name="name"
              isInvalid={!!errors.name || (validated && !formData.name.trim())}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.name || "Please provide a valid name."}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="email_id">
            <Form.Control
              className="lead-form-input"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              name="email"
              isInvalid={!!errors.email || (validated && !formData.email.trim())}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.email || "Please provide a valid email."}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="lead-form-field--full" controlId="message">
            <Form.Control
              className="lead-form-input lead-form-textarea"
              as="textarea"
              rows={2}
              placeholder="Message (optional)"
              value={formData.message}
              onChange={handleChange}
              name="message"
            />
          </Form.Group>

          <Form.Group className="lead-form-field--full" controlId="user_location">
            <Form.Control
              className="lead-form-input"
              type="text"
              placeholder="Your location (optional)"
              value={formData.userLocation}
              onChange={handleChange}
              name="userLocation"
              autoComplete="street-address"
            />
          </Form.Group>

          <LeadFormOtpStep
            phone={formData.phone}
            leadOtp={leadOtp}
            variant="bootstrap"
            inputClassName="lead-form-input"
            className="lead-form-field--full"
            autoSubmitFormRef={formRef}
          />

          <Button
            type="submit"
            className="lead-form-submit lead-form-field--full"
            disabled={showLoading || leadOtp.verifying}
          >
            Request a Callback <LoadingSpinner show={showLoading} />
          </Button>
        </Form>
        {!leadOtp.otpSent ? (
          <p className="lead-form-footer">Ready to help — we usually respond within one business day.</p>
        ) : null}
      </LeadFormSplitLayout>
    </Modal>
  );
}
