import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { usePathname } from "next/navigation";
import {
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import "./popupform.css";

/** End of headline: “Start Your Journey to the …” — typewriter cycles these in the enquiry popup (split layout). */
const ENQUIRY_JOURNEY_PHRASES = [
  "Perfect Space!",
  "Ideal Property",
  "Perfect Investment!",
  "Perfect Workspace!",
  "Perfect Location!",
  "Ideal Space!",
  "Perfect Office!",
  "Ideal Residence!",
  "Perfect Property!",
];

const ENQUIRY_JOURNEY_TYPE_MS = 68;
const ENQUIRY_JOURNEY_DELETE_MS = 42;
/** Pause when a phrase is fully typed, before backspacing. */
const ENQUIRY_JOURNEY_PAUSE_END_MS = 2200;
/** Short pause after clearing before typing the next phrase. */
const ENQUIRY_JOURNEY_GAP_MS = 380;

function getProjectImageSrc(data) {
  if (!data?.slugURL) return DEFAULT_PROJECT_CARD_IMAGE;

  const desktopHero = data.desktopImages?.[0]?.desktopImage;
  if (desktopHero) {
    const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
    if (/^https?:\/\//i.test(desktopHero) || desktopHero.startsWith("/")) {
      return desktopHero;
    }
    return `${imageBase}properties/${data.slugURL}/${desktopHero}`;
  }

  return buildProjectImageUrl(data, { preferThumbnail: true });
}

export default function CommonPopUpform({
  show,
  handleClose,
  from,
  data,
  /** When true with `from="Project Detail"`, uses the simple enquiry modal (no animated headline). */
  skipAnimatedHeadline = false,
}) {
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
  const [journeyTypedText, setJourneyTypedText] = useState("");
  const journeyTypeTimerRef = useRef(null);

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
      // Build payload metadata based on source page
      const submitData = {
        ...formData,
        enquiryFrom: from === "Project Detail" ? (data?.projectName || "Project Detail") : "Home Page",
        projectLink: from === "Project Detail" ? `${process.env.NEXT_PUBLIC_UI_URL}${pathname}` : `${process.env.NEXT_PUBLIC_UI_URL}`,
        pageName: from === "Project Detail" ? "Project Detail" : "Home",
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}enquiry/post`,
        submitData
      );
      // Check if response is successful
      if (response.data.isSuccess === 1) {
        // onSuccess();
        closeModal();
        setValidated(false); // Reset validation state
        setFormData(intitalData);
        setErrors({ name: "", email: "", phone: "" });
        toast.success("Enquiry sent successfully");
      } else {
        toast.error(response.data.message || "Failed to send enquiry. Please try again.");
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
  const useSplitLayout =
    (isProjectDetail && !skipAnimatedHeadline) || from === "Home Page";
  const isHomeSplit = !isProjectDetail && useSplitLayout;

  useEffect(() => {
    const clearTimer = () => {
      if (journeyTypeTimerRef.current) {
        clearTimeout(journeyTypeTimerRef.current);
        journeyTypeTimerRef.current = null;
      }
    };

    if (!show || !useSplitLayout) {
      clearTimer();
      setJourneyTypedText("");
      return undefined;
    }

    let phraseIdx = 0;
    let pos = 0;
    let deleting = false;

    const runTick = () => {
      const full = ENQUIRY_JOURNEY_PHRASES[phraseIdx];
      if (!deleting) {
        if (pos < full.length) {
          pos += 1;
          setJourneyTypedText(full.slice(0, pos));
          journeyTypeTimerRef.current = setTimeout(
            runTick,
            ENQUIRY_JOURNEY_TYPE_MS,
          );
        } else {
          journeyTypeTimerRef.current = setTimeout(() => {
            deleting = true;
            runTick();
          }, ENQUIRY_JOURNEY_PAUSE_END_MS);
        }
      } else if (pos > 0) {
        pos -= 1;
        setJourneyTypedText(full.slice(0, pos));
        journeyTypeTimerRef.current = setTimeout(
          runTick,
          ENQUIRY_JOURNEY_DELETE_MS,
        );
      } else {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % ENQUIRY_JOURNEY_PHRASES.length;
        journeyTypeTimerRef.current = setTimeout(
          runTick,
          ENQUIRY_JOURNEY_GAP_MS,
        );
      }
    };

    setJourneyTypedText("");
    journeyTypeTimerRef.current = setTimeout(runTick, ENQUIRY_JOURNEY_GAP_MS);

    return () => {
      clearTimer();
    };
  }, [show, useSplitLayout]);
  const popupImageSrc = isProjectDetail
    ? getProjectImageSrc(data)
    : "/static/icon/enquiry.png";
  const popupImageAlt = isProjectDetail ? data?.projectName || "Project" : "Enquiry";

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
    <>
      <Modal
        show={show}
        onHide={closeModal}
        centered
        restoreFocus={false}
        backdropClassName="enquiry-popup-backdrop"
        className={`enquiry-popup ${useSplitLayout ? "enquiry-popup--split" : "enquiry-popup--home"}`}
        dialogClassName={`enquiry-popup-dialog ${!useSplitLayout ? "enquiry-popup-dialog--home" : ""}`}
      >
        {useSplitLayout ? (
          <>
        <button
          type="button"
          className="btn-close enquiry-popup-close"
          aria-label="Close"
          onClick={closeModal}
        />
          <div className={`enquiry-popup-split ${isHomeSplit ? "enquiry-popup-split--home" : ""}`}>
            <div className={`enquiry-popup-image ${isHomeSplit ? "enquiry-popup-image--home" : ""}`}>
              <img
                src={popupImageSrc}
                alt={popupImageAlt}
                className={`enquiry-popup-image-img ${isHomeSplit ? "enquiry-popup-image-img--home" : ""}`}
               style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
            </div>
            <div className="enquiry-popup-form-wrap">
              <p className="enquiry-popup-intro">
                We offer various property listings for you to explore.
              </p>
              <h2 className="enquiry-popup-title-main">
                <span className="enquiry-popup-title-regular">Start Your Journey to the </span>
                <span className="enquiry-popup-title-accent-wrap">
                  <span className="enquiry-popup-title-accent">
                    {journeyTypedText}
                  </span>
                  <span
                    className="enquiry-popup-title-cursor"
                    aria-hidden="true"
                  />
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
          </>
        ) : (
          <div className="enquiry-popup-home">
            <button
              type="button"
              className="btn-close enquiry-popup-home__close"
              aria-label="Close"
              onClick={closeModal}
            />
            <div className="enquiry-popup-home__header">
              <span className="enquiry-popup-home__eyebrow">We&apos;re here to help</span>
              <h2 id="enquiry-popup-home-title" className="enquiry-popup-home__title">
                Tell us how we can reach you
              </h2>
              <p className="enquiry-popup-home__lead">
                A quick note is enough — our team usually responds within one business day.
              </p>
            </div>
            <div className="enquiry-popup-home__body">
              <Form
                noValidate
                validated={validated}
                onSubmit={handleSubmit}
                className="enquiry-popup-form enquiry-popup-home__form"
                aria-labelledby="enquiry-popup-home-title"
              >
                <div className="enquiry-popup-home__grid">
                  <Form.Group className="enquiry-popup-home__field" controlId="full_name_home">
                    <Form.Label className="enquiry-popup-home__label">Full name</Form.Label>
                    <Form.Control
                      className="enquiry-popup-input enquiry-popup-input--home"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => handleChange(e)}
                      onBlur={handleBlur}
                      name="name"
                      isInvalid={!!errors.name || (validated && !formData.name.trim())}
                      required
                      autoComplete="name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name || "Please provide a valid name."}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="enquiry-popup-home__field" controlId="email_id_home">
                    <Form.Label className="enquiry-popup-home__label">Email</Form.Label>
                    <Form.Control
                      className="enquiry-popup-input enquiry-popup-input--home"
                      type="email"
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange(e)}
                      onBlur={handleBlur}
                      name="email"
                      isInvalid={!!errors.email || (validated && !formData.email.trim())}
                      required
                      autoComplete="email"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email || "Please provide a valid email."}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    className="enquiry-popup-home__field enquiry-popup-home__field--full"
                    controlId="phone_number_home"
                  >
                    <Form.Label className="enquiry-popup-home__label">Mobile number</Form.Label>
                    <Form.Control
                      className="enquiry-popup-input enquiry-popup-input--home"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => handleChange(e)}
                      onBlur={handleBlur}
                      name="phone"
                      isInvalid={!!errors.phone || (validated && !formData.phone.trim())}
                      required
                      autoComplete="tel"
                      inputMode="numeric"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone || "Please provide a valid phone number."}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group
                    className="enquiry-popup-home__field enquiry-popup-home__field--full"
                    controlId="message_home"
                  >
                    <Form.Label className="enquiry-popup-home__label">
                      Message <span className="enquiry-popup-home__optional">(optional)</span>
                    </Form.Label>
                    <Form.Control
                      className="enquiry-popup-input enquiry-popup-input--home enquiry-popup-input--textarea"
                      as="textarea"
                      rows={3}
                      placeholder="Budget, location, or anything we should know…"
                      value={formData.message}
                      onChange={(e) => handleChange(e)}
                      name="message"
                    />
                  </Form.Group>
                </div>
                <Button
                  type="submit"
                  className="enquiry-popup-submit enquiry-popup-submit--home"
                  disabled={showLoading}
                >
                  <span className="enquiry-popup-submit__text">{buttonName}</span>
                  <LoadingSpinner show={showLoading} />
                </Button>
                <p className="enquiry-popup-home__trust" role="status">
                  Your details are used only to respond to this enquiry.
                </p>
              </Form>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
