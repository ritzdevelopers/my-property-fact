"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "./career.css";

const PERKS = [
  {
    icon: "✦",
    title: "Innovation at Scale",
    text: "Build products that simplify real estate decisions for millions of property seekers across India.",
  },
  {
    icon: "◎",
    title: "Real Impact",
    text: "Your work directly shapes how buyers compare homes, verify projects, and make confident investments.",
  },
  {
    icon: "↑",
    title: "Growth Culture",
    text: "Learn fast in a team that values ideas, ownership, and continuous improvement over hierarchy.",
  },
  {
    icon: "◈",
    title: "Collaborative Environment",
    text: "Work closely with design, data, content, and tech teams on meaningful, cross-functional projects.",
  },
];

const HIRING_STEPS = [
  {
    id: 1,
    title: "Explore & Apply",
    description:
      "Browse open roles, pick the one that matches your skills, and submit your application with resume through our form.",
  },
  {
    id: 2,
    title: "Profile Review",
    description:
      "Our hiring team reviews your experience, portfolio, and background to assess fit for the role and team.",
  },
  {
    id: 3,
    title: "Role Interview",
    description:
      "Meet with the hiring manager and team leads for a focused discussion on your skills, approach, and problem-solving.",
  },
  {
    id: 4,
    title: "Culture & HR Round",
    description:
      "We align on team fit, communication style, and growth expectations so both sides know what success looks like.",
  },
  {
    id: 5,
    title: "Offer & Onboarding",
    description:
      "Selected candidates receive a formal offer with role details and a smooth onboarding experience at MPF.",
  },
];

const FORM_BENEFITS = [
  "Fast-track review for relevant experience",
  "Transparent communication at every stage",
  "Opportunity to work on India’s leading proptech platform",
  "Growth paths across product, tech, content, and sales",
];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getJobType(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("intern")) return "Internship";
  return "Full-Time";
}

export default function Career({ jobsArr = [] }) {
  const [openJobId, setOpenJobId] = useState(jobsArr[0]?.id ?? null);
  const [activeStep, setActiveStep] = useState(0);
  const [jobTitle, setJobTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    phoneNumber: "",
    resume: null,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.firstName.trim()) tempErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) tempErrors.lastName = "Last name is required";
    if (!formData.emailId) {
      tempErrors.emailId = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      tempErrors.emailId = "Enter a valid email";
    }
    if (!formData.phoneNumber) tempErrors.phoneNumber = "Phone number is required";
    if (!formData.resume) tempErrors.resume = "Please upload your resume";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("emailId", formData.emailId);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("resume", formData.resume);

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}career`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.isSuccess === 1) {
        toast.success(response?.data?.message || "Application submitted successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          emailId: "",
          phoneNumber: "",
          resume: null,
        });
        setJobTitle("");
        setErrors({});
      } else {
        toast.error(response?.data?.message || "Something went wrong!");
      }
    } catch (error) {
      const backendErrors = error?.response?.data || {};
      setErrors(backendErrors);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = (title) => {
    setJobTitle(title);
    setErrors({});
    scrollToSection("career-form");
  };

  const toggleJob = (id) => {
    setOpenJobId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="career-v2">
      {/* Hero */}
      <section className="career-v2-hero" aria-label="Join Our Team">
        <div className="career-v2-hero__bg" aria-hidden="true" />
        <div className="container position-relative">
          <div className="row gy-4 align-items-end">
            <div className="col-lg-7">
              <p className="career-v2-eyebrow plus-jakarta-sans-regular">Careers at My Property Fact</p>
              <h1 id="mpf-page-heading" className="career-v2-hero__title plus-jakarta-sans-bold">
                Build the Future of Real Estate Intelligence
              </h1>
              <p className="career-v2-hero__subtitle plus-jakarta-sans-regular">
                Join a passionate team where technology, data, and creativity come together to help millions
                make smarter property decisions across India.
              </p>
              <div className="career-v2-hero__actions">
                <button
                  type="button"
                  className="career-v2-btn career-v2-btn--primary plus-jakarta-sans-semi-bold"
                  onClick={() => scrollToSection("career-openings")}
                >
                  View Open Roles
                </button>
                <button
                  type="button"
                  className="career-v2-btn career-v2-btn--ghost plus-jakarta-sans-semi-bold"
                  onClick={() => scrollToSection("career-form")}
                >
                  Apply Now
                </button>
              </div>
              <nav className="career-v2-breadcrumb" aria-label="Breadcrumb">
                <ol className="plus-jakarta-sans-regular">
                  <li>
                    <Link href="/" title="Home">
                      Home
                    </Link>
                    <span aria-hidden="true"> &gt; </span>
                  </li>
                  <li>
                    <span aria-current="page">Join Our Team</span>
                  </li>
                </ol>
              </nav>
            </div>
          
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="career-v2-intro">
        <div className="container">
          <div className="career-v2-section-head">
            <h2 className="career-v2-section-title plus-jakarta-sans-semi-bold">
              Your Next Career Move Starts Here
            </h2>
            <p className="career-v2-section-subtitle plus-jakarta-sans-regular">
              At My Property Fact, we&apos;re building the future of real estate intelligence with innovation,
              creativity, and data-driven insights. Join a team where your skills fuel meaningful projects,
              growth opportunities, and lasting impact.
            </p>
          </div>
        </div>
      </section>

    

      {/* Openings */}
      <section id="career-openings" className="career-v2-openings" aria-label="Current openings">
        <div className="container">
          <div className="career-v2-section-head">
            <h2 className="career-v2-section-title plus-jakarta-sans-semi-bold">Current Openings</h2>
            <p className="career-v2-section-subtitle plus-jakarta-sans-regular">
              Explore roles across technology, content, and sales, and apply directly from this page.
            </p>
          </div>

          {jobsArr.length > 0 ? (
            <>
              <div className="career-v2-openings__count plus-jakarta-sans-semi-bold">
                {jobsArr.length} {jobsArr.length === 1 ? "position" : "positions"} available
              </div>
              <div className="career-v2-job-list">
                {jobsArr.map((job, index) => {
                  const isOpen = openJobId === job.id;
                  const roleLabel = job.postName?.trim() || "Open position";
                  return (
                    <article
                      key={job.id}
                      className={`career-v2-job${isOpen ? " career-v2-job--open" : ""}`}
                    >
                      <button
                        type="button"
                        className="career-v2-job__header"
                        onClick={() => toggleJob(job.id)}
                        aria-expanded={isOpen}
                      >
                        <div className="d-flex gap-3 flex-grow-1">
                          <span className="career-v2-job__index">
                            {String(index + 1).padStart(2, "0")}.
                          </span>
                          <div>
                            <h3 className="career-v2-job__title plus-jakarta-sans-semi-bold">{roleLabel}</h3>
                            <div className="career-v2-job__meta plus-jakarta-sans-regular">
                              <span className="career-v2-job__badge">{getJobType(job.postName)}</span>
                              {job.location && (
                                <span className="career-v2-job__meta-item">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path
                                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                                  </svg>
                                  {job.location}
                                </span>
                              )}
                              {job.noOfVacencies > 0 && (
                                <span className="career-v2-job__meta-item">
                                  {job.noOfVacencies}{" "}
                                  {job.noOfVacencies === 1 ? "opening" : "openings"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="career-v2-job__toggle" aria-hidden="true">
                          {isOpen ? "×" : "+"}
                        </span>
                      </button>

                      <div className="career-v2-job__body">
                        <div className="career-v2-job__content">
                          {job.longDescription ? (
                            <div
                              className="career-v2-job__description plus-jakarta-sans-regular"
                              dangerouslySetInnerHTML={{ __html: job.longDescription }}
                            />
                          ) : (
                            job.shortDescription && (
                              <>
                                <h4 className="career-v2-job__subheading plus-jakarta-sans-semi-bold">
                                  Job Description
                                </h4>
                                <p className="career-v2-job__summary plus-jakarta-sans-regular">
                                  {job.shortDescription}
                                </p>
                              </>
                            )
                          )}
                          <div className="career-v2-job__actions">
                            <button
                              type="button"
                              className="career-v2-btn career-v2-btn--green plus-jakarta-sans-semi-bold"
                              onClick={() => handleApply(roleLabel)}
                            >
                              Apply for this role
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="career-v2-empty">
              <p className="career-v2-empty__title plus-jakarta-sans-semi-bold">No open positions right now</p>
              <p className="career-v2-empty__text plus-jakarta-sans-regular">
                We&apos;re not actively hiring at the moment, but you can still send us your resume for future
                opportunities.
              </p>
              <button
                type="button"
                className="career-v2-btn career-v2-btn--green plus-jakarta-sans-semi-bold mt-4"
                onClick={() => scrollToSection("career-form")}
              >
                Submit General Application
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Hiring process */}
      {/* <section className="career-v2-process" aria-label="Hiring process">
        <div className="container">
          <div className="career-v2-section-head">
            <h2 className="career-v2-section-title plus-jakarta-sans-semi-bold">Our Hiring Process</h2>
            <p className="career-v2-section-subtitle plus-jakarta-sans-regular">
              Putting people first starts from the very first conversation. Here&apos;s what to expect when
              you apply.
            </p>
          </div>

          <div className="career-v2-process__steps">
            {HIRING_STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`career-v2-process__step${
                  activeStep === index ? " career-v2-process__step--active" : ""
                }`}
                onClick={() => setActiveStep(index)}
                aria-pressed={activeStep === index}
              >
                <span className="career-v2-process__step-num plus-jakarta-sans-bold">{step.id}</span>
                <span className="career-v2-process__step-title plus-jakarta-sans-semi-bold">{step.title}</span>
              </button>
            ))}
          </div>

          <p className="career-v2-process__detail plus-jakarta-sans-regular" key={HIRING_STEPS[activeStep].id}>
            {HIRING_STEPS[activeStep].description}
          </p>
        </div>
      </section> */}

      {/* Life at MPF */}
      {/* <section className="career-v2-life" aria-label="Life at My Property Fact">
        <div className="container">
          <div className="career-v2-life__card">
            <div className="career-v2-life__content">
              <p className="career-v2-life__eyebrow plus-jakarta-sans-regular">Life @</p>
              <h2 className="career-v2-life__heading plus-jakarta-sans-bold">My Property Fact</h2>
              <p className="career-v2-life__text plus-jakarta-sans-regular">
                Explore a workplace where ideas move fast, teams collaborate openly, and every role connects to
                real impact in India&apos;s property ecosystem.
              </p>
              <button
                type="button"
                className="career-v2-btn career-v2-btn--green plus-jakarta-sans-semi-bold align-self-start"
                onClick={() => scrollToSection("career-openings")}
              >
                View Open Roles
              </button>
            </div>
            <div className="career-v2-life__image-wrap">
              <img
                src="/career_bottom_image.jpg"
                alt="Team collaboration at My Property Fact — careers and workplace culture"
                title="Team collaboration at My Property Fact"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* Application form */}
      <section id="career-form" className="career-v2-form-section" aria-label="Career application form">
        <div className="container">
          <div className="career-v2-form-grid">
            <div>
              <h2 className="career-v2-form__intro-title plus-jakarta-sans-bold">Ready to Join Us?</h2>
              <p className="career-v2-form__intro-text plus-jakarta-sans-regular">
                Take the next step in your career with a team that values growth, passion, and performance.
                Fill in your details and we&apos;ll get back to you.
              </p>
              <ul className="career-v2-form__list plus-jakarta-sans-regular">
                {FORM_BENEFITS.map((item) => (
                  <li key={item}>
                    <span className="career-v2-form__check" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="career-v2-form-card">
              <h3 className="career-v2-form-card__title plus-jakarta-sans-bold">Application Form</h3>
              <p className="career-v2-form-card__subtitle plus-jakarta-sans-regular">
                All fields marked with * are required
              </p>

              {jobTitle && (
                <span className="career-v2-form-card__role plus-jakarta-sans-semi-bold">
                  Applying for: {jobTitle}
                </span>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="career-v2-field-row">
                  <div className="career-v2-field">
                    <label htmlFor="firstName" className="plus-jakarta-sans-semi-bold">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "is-invalid" : ""}
                    />
                    {errors.firstName && (
                      <p className="career-v2-field__error">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="career-v2-field">
                    <label htmlFor="lastName" className="plus-jakarta-sans-semi-bold">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "is-invalid" : ""}
                    />
                    {errors.lastName && (
                      <p className="career-v2-field__error">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="career-v2-field">
                  <label htmlFor="emailId" className="plus-jakarta-sans-semi-bold">
                    Email *
                  </label>
                  <input
                    id="emailId"
                    type="email"
                    name="emailId"
                    placeholder="Enter your email"
                    value={formData.emailId}
                    onChange={handleChange}
                    className={errors.emailId ? "is-invalid" : ""}
                  />
                  {errors.emailId && (
                    <p className="career-v2-field__error">{errors.emailId}</p>
                  )}
                </div>

                <div className="career-v2-field">
                  <label htmlFor="phoneNumber" className="plus-jakarta-sans-semi-bold">
                    Phone Number *
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={errors.phoneNumber ? "is-invalid" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="career-v2-field__error">{errors.phoneNumber}</p>
                  )}
                </div>

                {jobsArr.length > 0 && (
                  <div className="career-v2-field">
                    <label htmlFor="roleSelect" className="plus-jakarta-sans-semi-bold">
                      Role
                    </label>
                    <select
                      id="roleSelect"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    >
                      <option value="">Select a role (optional)</option>
                      {jobsArr.map((job) => (
                        <option key={job.id} value={job.postName}>
                          {job.postName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="career-v2-field">
                  <label htmlFor="resume" className="plus-jakarta-sans-semi-bold">
                    Resume *
                  </label>
                  <label htmlFor="resume" className="career-v2-file-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {formData.resume ? formData.resume.name : "Upload resume (PDF, DOC, DOCX)"}
                    <input
                      id="resume"
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={handleChange}
                    />
                  </label>
                  {errors.resume && (
                    <p className="career-v2-field__error">{errors.resume}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="career-v2-form-submit plus-jakarta-sans-semi-bold"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
