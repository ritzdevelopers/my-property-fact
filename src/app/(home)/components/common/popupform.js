import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import Image from "next/image";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { usePathname } from "next/navigation";
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
    }
  }, [show]);

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
      toast.error("Please fill all fields correctly!");
      return;
    }

    try {
      setShowLoading(true);
      setButtonName("");
      // Make API request
      if (from === "Project Detail") {
        formData.enquiryFrom = data.projectName;
        formData.projectLink = process.env.NEXT_PUBLIC_UI_URL + pathname;
        formData.pageName = "Project Detail";
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}enquiry/post`,
        formData
      );
      // Check if response is successful
      if (response.data.isSuccess === 1) {
        // onSuccess();
        handleClose(false);
        setValidated(false); // Reset validation state
        setFormData(intitalData);
        setErrors({ name: "", email: "", phone: "" });
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.data.message);
      console.error("Error submitting form:", error);
    } finally {
      setShowLoading(false);
      setButtonName("Submit Enquiry");
    }
  };

  const isProjectDetail = from === "Project Detail" && data?.slugURL;
  const projectImageSrc = isProjectDetail ? getProjectImageSrc(data) : null;

  return (
    <>
      <Modal
        show={show}
        onHide={() => handleClose(false)}
        centered
        className={`enquiry-popup ${isProjectDetail ? "enquiry-popup--split" : ""}`}
        dialogClassName="enquiry-popup-dialog"
      >
        <button
          type="button"
          className="btn-close enquiry-popup-close"
          aria-label="Close"
          onClick={() => handleClose(false)}
        />
        {isProjectDetail ? (
          <div className="enquiry-popup-split">
            <div className="enquiry-popup-image">
              <Image
                src={projectImageSrc}
                alt={data?.projectName || "Project"}
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
                <Form.Group className="mb-3" controlId="full_name">
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
                <Form.Group className="mb-3" controlId="email_id">
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
                <Form.Group className="mb-3" controlId="phone_number">
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
                <Form.Group className="mb-3" controlId="message">
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
                  disabled={showLoading}
                >
                  Request a Callback <LoadingSpinner show={showLoading} />
                </Button>
              </Form>
              <p className="enquiry-popup-footer">Ready to help! Fill the form, and we&apos;ll call soon.</p>
            </div>
          </div>
        ) : (
          <>
            <p className="enquiry-popup-subtitle px-6 px-md-4 mb-0">
              Share your details and our team will contact you shortly.
            </p>
            <Form
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
              className="enquiry-popup-form p-3 p-md-4 pt-3"
            >
              <Form.Group className="mb-3" controlId="full_name">
                <Form.Control
                  className="enquiry-popup-input"
                  type="text"
                  placeholder="Full name"
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
              <Form.Group className="mb-3" controlId="email_id">
                <Form.Control
                  className="enquiry-popup-input"
                  type="email"
                  placeholder="Email id"
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
              <Form.Group className="mb-3" controlId="phone_number">
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
              <Form.Group className="mb-3" controlId="message">
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
                className="fw-bold border-0 enquiry-popup-submit"
                disabled={showLoading}
              >
                {buttonName} <LoadingSpinner show={showLoading} />
              </Button>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}
