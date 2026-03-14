"use client";
import Image from "next/image";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import CommonBreadCrum from "../components/common/breadcrum";
import CommonHeaderBanner from "../components/common/commonheaderbanner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./page.module.css";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export default function Career({ jobsArr }) {
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [longDescription, setLongDescription] = useState("");
  const [jobApplicationFormVisible, setJobApplicationFormVisible] =
    useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    phoneNumber: "",
    resume: null,
    // message: "",
  });

  const [errors, setErrors] = useState({});
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Validate form
  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName.trim())
      tempErrors.firstName = "First name is required";
    if (!formData.lastName.trim())
      tempErrors.lastName = "Last name is required";
    if (!formData.emailId) {
      tempErrors.emailId = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      tempErrors.emailId = "Enter a valid email";
    }
    if (!formData.phoneNumber)
      tempErrors.phoneNumber = "Phone number is required";
    if (!formData.resume) tempErrors.resume = "Please upload your resume";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("emailId", formData.emailId);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("resume", formData.resume);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}career`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.isSuccess === 1) {
          toast.success(
            response?.data?.message || "Application submitted successfully!"
          );
          setJobApplicationFormVisible(false);
          setFormData({
            firstName: "",
            lastName: "",
            emailId: "",
            phoneNumber: "",
            resume: null,
            // message: "",
          });
          setErrors({});
          setShowJobDescription(false);
        } else {
          toast.error(response?.data?.message || "Something went wrong!");
        }
      } catch (error) {
        const backendErrors = error?.response?.data || {};
        setErrors(backendErrors);
        toast.error(
          error?.response?.data?.message || "Something went wrong!"
        );
        console.error("Error submitting application:", error);
      }
      // You can now send `formData` to API using fetch/axios
    }
  };
  const applyForJob = () => {
    setJobApplicationFormVisible(true);
    setShowJobDescription(false);
    setErrors({});
  };
  const openJobDescription = (data) => {
    setJobTitle(data.postName);
    setShowJobDescription(true);
    setLongDescription(
      data.longDescription ||
        "This is where the detailed job description will be displayed."
    );
  };
  return (
    <>
      <CommonHeaderBanner image={"career.jpg"} headerText={"Career"} />
      <CommonBreadCrum pageName={"Career"} />
      <section className="container mt-3 mb-5">
        <h1 className="text-center mb-3">Your next career move starts here.</h1>
        <p className="text-center mb-3">
          At My Property Fact, we’re building the future of real estate
          intelligence with innovation, creativity, and data-driven insights.
          Join a passionate team where your skills fuel meaningful projects,
          growth opportunities, and lasting impact. Your career success starts
          here.
        </p>
        {/* <div className="text-center">
          <Button className="btn btn-background border-0 custom-shadow">
            Find more jobs...
          </Button>
        </div> */}
      </section>
      <section style={{ backgroundColor: "#68AC78" }} className="py-5 px-3">
        <div className="container">
          <span className="text-light fs-2 mb-3">
            Showing {jobsArr.length} positions
          </span>
          <div className="mt-3 row justify-content-center">
            {jobsArr.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="col-12 col-md-6 col-lg-4 col-xl-4"
              >
                <div
                  className={`bg-white text-center job-post-container rounded-3 p-5 ${styles.jobPostContainer} p-4 mb-4`}
                >
                  <div className="d-flex justify-content-center align-items-center mb-3 position-relative">
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center self-align-center mb-3"
                      style={{
                        backgroundColor: "#FDDAD8",
                        width: "80px",
                        height: "80px",
                      }}
                    >
                      <Image
                        src={`/vector_icon.png`}
                        alt={item.postName}
                        width={50}
                        height={50}
                        className="img-fluid mb-3 position-absolute"
                        style={{ top: "12px" }}
                      />
                    </div>
                  </div>
                  <h3 className="mt-3">{item.postName}</h3>
                  <p>{item.shortDescription}</p>
                  <div className="d-flex justify-content-around mt-4">
                    <Button
                      className="btn-background border-0"
                      onClick={() => openJobDescription(item)}
                    >
                      View Job Description
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-6 col-xl-6 d-flex justify-content-center align-items-center order-2">
              <div>
                <div className="container ms-4">
                  <span className="fs-1">Interpretation & Outlook</span>
                  <div className="mt-4">
                    <span className="fs-5">
                      <FontAwesomeIcon icon={faCheckCircle} fontSize={20} className="pe-2"/>
                      Shape India’s property future by driving technology, creativity, and real estate expertise into one impactful career path.
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="fs-5">
                      <FontAwesomeIcon icon={faCheckCircle} fontSize={20} className="pe-2"/>
                      Grow in a culture that rewards ideas, innovation, and results while nurturing personal and professional development.
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="fs-5">
                      <FontAwesomeIcon icon={faCheckCircle} fontSize={20} className="pe-2"/>
                      Be part of a visionary brand transforming property decisions into smarter, transparent, and trustworthy experiences for all.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-12 col-lg-6 col-xl-6 my-3 order-1">
              <Image
                src="/career.jpg"
                alt="Career Opportunities"
                width={679}
                height={495}
                className="img-fluid rounded-3"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="d-none d-md-block container position-relative py-5">
        <Image
          src="/career_bottom_image.jpg"
          alt="Career Opportunities"
          width={679}
          height={495}
          className="img-fluid rounded-3"
          style={{ width: "100%", height: "auto" }}
        />
        <div className="position-absolute top-50 start-50 translate-middle text-center bg-white p-4 rounded-3 shadow">
          <h2 className="mb-3">Join Our Team</h2>
          <p className="mb-4">
            We are always looking for talented individuals to join our team. If
            you are passionate about real estate and technology, we would love
            to hear from you.
          </p>
          <Button className="btn-background border-0" onClick={applyForJob}>Apply Now</Button>
        </div>
      </section>

      <Modal
        show={showJobDescription}
        onHide={() => setShowJobDescription(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Job Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div dangerouslySetInnerHTML={{ __html: longDescription }} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowJobDescription(false)}
          >
            Close
          </Button>
          <Button variant="success" onClick={applyForJob}>
            Apply Now
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={jobApplicationFormVisible}
        onHide={() => setJobApplicationFormVisible(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Application for{" "}
            <i>
              <b className="text-success">{jobTitle}</b>
            </i>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSubmit}
            validated={Object.keys(errors).length === 0}
          >
            {/* First + Last Name */}
            <Row>
              <Col>
                <Form.Group controlId="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    isInvalid={!!errors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="lastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    isInvalid={!!errors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Email */}
            <Form.Group controlId="applicantEmail" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="emailId"
                placeholder="Enter your email"
                value={formData.emailId}
                onChange={handleChange}
                isInvalid={!!errors.emailId}
              />
              <Form.Control.Feedback type="invalid">
                {errors.emailId}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Phone */}
            <Form.Group controlId="phoneNumber" className="mt-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                isInvalid={!!errors.phoneNumber}
              />
              <Form.Control.Feedback type="invalid">
                {errors.phoneNumber}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Resume */}
            <Form.Group controlId="applicantResume" className="mt-3">
              <Form.Label>Resume</Form.Label>
              <Form.Control
                type="file"
                name="resume"
                onChange={handleChange}
                isInvalid={!!errors.resume}
              />
              <Form.Control.Feedback type="invalid">
                {errors.resume}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Message */}
            {/* <Form.Group controlId="applicantMessage" className="mt-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="message"
                placeholder="Write a brief message or cover letter"
                value={formData.message}
                onChange={handleChange}
              />
            </Form.Group> */}

            <Button variant="success" type="submit" className="mt-4">
              Submit Application
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
