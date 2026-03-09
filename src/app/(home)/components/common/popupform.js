import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../contact-us/page";
import { usePathname } from "next/navigation";
import "./popupform.css";

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
    phone: "",
  });

  //Validation function for phone
  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    // Remove spaces, dashes, and parentheses for validation
    const cleanedPhone = phone.toString().replace(/[\s\-\(\)]/g, "");
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
    if (name === "phone") {
      const error = validatePhone(value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setFormData(intitalData);
      setValidated(false);
      setErrors({ phone: "" });
    }
  }, [show]);

  //handle form submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Validate phone
    const phoneError = validatePhone(formData.phone);
    const newErrors = {
      phone: phoneError,
    };
    setErrors(newErrors);

    // Check if form is valid
    const isFormValid =
      form.checkValidity() &&
      !phoneError;

    if (!isFormValid) {
      event.stopPropagation();
      setValidated(true);
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
        setErrors({ phone: "" });
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

  return (
    <>
      <Modal
        show={show}
        onHide={() => handleClose(false)}
        centered
        className="enquiry-popup"
        dialogClassName="enquiry-popup-dialog"
      >
        {/* <Modal.Header closeButton className="enquiry-popup-header border-0 pb-0">
          <Modal.Title className="enquiry-popup-title">
            We will connect you soon.
          </Modal.Title>
        </Modal.Header> */}
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
              name="name"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid name.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="email_id">
            <Form.Control
              className="enquiry-popup-input"
              type="email"
              placeholder="Email id"
              value={formData.email}
              onChange={(e) => handleChange(e)}
              name="email"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid email.
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
      </Modal>
    </>
  );
}
