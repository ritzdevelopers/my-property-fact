"use client";

import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faEnvelope,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import "./style/PropertyContactCard.css";

const PropertyContactCard = ({
  contactForm,
  handleContactFormChange,
  handleContactSubmit,
  submitting,
  submitSuccess,
  submitError,
  setSubmitError,
}) => {
  return (
    <div className="property-contact-card">
      {submitSuccess ? (
        <div className="contact-success-wrapper">
          <div className="success-circle">
            <FontAwesomeIcon icon={faCheck} />
          </div>

          <h4>Thank You!</h4>

          <p>
            Your enquiry has been submitted successfully.
            <br />
            We&apos;ll contact you shortly.
          </p>
        </div>
      ) : (
        <>
          <h3 className="contact-card-title">
            Contact Property Owner
          </h3>

          <p className="contact-card-subtitle">
            Fill out the form and we&apos;ll get back to you shortly
          </p>

          {submitError && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setSubmitError(null)}
              className="mb-3"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="me-2"
              />
              {submitError}
            </Alert>
          )}

          <Form onSubmit={handleContactSubmit}>
            {/* Name */}

            <Form.Group className="contact-form-group">

              <Form.Label>
                Full Name <span>*</span>
              </Form.Label>

              <div className="contact-input">

                <div className="input-icon">
                  <FontAwesomeIcon icon={faUser} />
                </div>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={contactForm.name}
                  onChange={handleContactFormChange}
                  required
                />

              </div>

            </Form.Group>

            {/* Phone */}

            <Form.Group className="contact-form-group">

              <Form.Label>
                Phone Number <span>*</span>
              </Form.Label>

              <div className="contact-input">

                <div className="input-icon">
                  <FontAwesomeIcon icon={faPhone} />
                </div>

                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={contactForm.phone}
                  onChange={handleContactFormChange}
                  required
                />

              </div>

            </Form.Group>

            {/* Email */}

            <Form.Group className="contact-form-group">

              <Form.Label>Email Address</Form.Label>

              <div className="contact-input">

                <div className="input-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>

                <Form.Control
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={contactForm.email}
                  onChange={handleContactFormChange}
                />

              </div>

            </Form.Group>

            {/* Message */}

            <Form.Group className="contact-form-group">

              <Form.Label>
                Message (Optional)
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={5}
                name="message"
                placeholder="I am interested in this property..."
                value={contactForm.message}
                onChange={handleContactFormChange}
                className="contact-textarea"
              />

            </Form.Group>

            <Button
              type="submit"
              className="contact-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Sending...
                </>
              ) : (
                "Get Contact Details"
              )}
            </Button>

            <div className="contact-privacy">
              By submitting, you agree to our{" "}
              <a href="#">terms</a> and{" "}
              <a href="#">privacy policy</a>.
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default PropertyContactCard;