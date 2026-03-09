"use client";
import axios from "axios";
import CommonHeaderBanner from "../../components/common/commonheaderbanner";
import { useState, useMemo } from "react";
import Image from "next/image";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { usePathname } from "next/navigation";
import BlogSidebar from "../../components/common/BlogSidebar";
import BlogFaqSection from "../../components/common/BlogFaqSection";
import "../../components/common/common.css";
import styles from "../page.module.css";
import detailStyles from "./blogpage.module.css";

/**
 * Splits blog HTML into intro + sections by H2/H3 without DOMParser,
 * so server (Node) and client (browser) produce identical output and avoid hydration mismatch.
 */
function getContentSections(htmlString) {
  if (!htmlString || typeof htmlString !== "string") return null;
  const trimmed = htmlString.trim();
  if (!trimmed) return null;

  // Split before any <h2 or <h3 (case-insensitive), keeping content before first heading and between headings
  const hasHeading = /<\s*h[23](?:\s|>)/i;
  const parts = trimmed.split(/(?=<\s*h[23](?:\s|>))/i).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  // No heading in content: single part with no H2/H3 → return null so fallback single div is used
  if (parts.length === 1 && !hasHeading.test(parts[0])) return null;

  const sections = [];
  let isFirst = true;
  for (const part of parts) {
    const isIntro = isFirst && !/^<\s*h[23](?:\s|>)/i.test(part);
    if (isIntro) {
      sections.push({ html: part, isIntro: true });
      isFirst = false;
    } else {
      sections.push({ html: part, isIntro: false });
      isFirst = false;
    }
  }
  return sections.length ? sections : null;
}

export default function BlogDetail({ blogDetail }) {
  const [showLoading, setShowLoading] = useState(false);
  const [buttonName, setButtonName] = useState("Submit Enquiry");
  const initialFormData = {
    name: "",
    email: "",
    phone: "",
    message: "",
    enquiryFrom: "",
    projectLink: "",
    pageName: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [validated, setValidated] = useState(false);
  const pathname = usePathname();

  //Validation errors state
  const [errors, setErrors] = useState({
    phone: "",
  });
  const [showAllCategories, setShowAllCategories] = useState(false);

  
  const rawFaqList =
    blogDetail?.blogFaqList ??
    blogDetail?.faqs ??
    blogDetail?.faqList ??
    blogDetail?.data?.blogFaqList ??
    blogDetail?.data?.faqs ??
    blogDetail?.blogFaqList?.list ??
    [];
  const faqItems = (Array.isArray(rawFaqList) ? rawFaqList : []).map((item) => ({
    q: item.question ?? item.q ?? item.faqQuestion ?? "",
    a: item.answer ?? item.a ?? item.faqAnswer ?? "",
  })).filter((item) => (item.q || "").trim() && (item.a || "").trim());

  const categoriesList = (blogDetail.blogKeywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const initialCategoriesCount = 6;
  const visibleCategories = showAllCategories
    ? categoriesList
    : categoriesList.slice(0, initialCategoriesCount);
  const hasMoreCategories = categoriesList.length > initialCategoriesCount;

  const contentSections = useMemo(
    () => getContentSections(blogDetail.blogDescription),
    [blogDetail.blogDescription]
  );

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
      setValidated(true);
      event.stopPropagation();
      return;
    }

    try {
      setShowLoading(true);
      setButtonName("");
      // Make API request
      formData.enquiryFrom = blogDetail.blogTitle.replace(/\u00A0/g, " ")
      formData.projectLink = process.env.NEXT_PUBLIC_UI_URL + pathname;
      formData.pageName = "Blog Page";
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "enquiry/post",
        formData
      );
      // Check if response is successful
      if (response.data.isSuccess === 1) {
        setFormData(initialFormData); // Reset form data
        setValidated(false); // Reset validation state
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

  //handle form input change
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

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

  const blogTitle = blogDetail.blogTitle.replace(/\u00A0/g, " ");
  return (
    <div className={detailStyles.blogDetailWrap}>
      <CommonHeaderBanner
        image={"builder-banner.jp"}
        headerText={"Blog-Detail"}
        pageName={blogTitle}
        firstPage={"Blog"}
      />
      <div className={`container py-5 ${detailStyles.blogDetailContainer}`}>
        <div className={`row g-5 ${detailStyles.blogDetailRow}`}>
          {/* Blog Content */}
          <article className={`col-lg-8 ${detailStyles.articleCol}`}>
            {blogDetail.blogImage && (
              <div className={detailStyles.articleImageWrap}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${blogDetail.blogImage}`}
                  alt={blogTitle || ""}
                  className="img-fluid"
                  width={1200}
                  height={648}  
                />
              </div>
            )}

            <h1 className={detailStyles.articleTitle}>
              {blogDetail.blogTitle.replace(/\u00A0/g, " ")}
            </h1>

            <div className={detailStyles.articleContent}>
              {contentSections ? (
                contentSections.map((section, idx) => (
                  <div
                    key={idx}
                    className={`${detailStyles.contentCard} ${section.isIntro ? detailStyles.contentCardIntro : ""}`}
                    dangerouslySetInnerHTML={{ __html: section.html }}
                  />
                ))
              ) : (
                <div
                  className={detailStyles.contentCard}
                  dangerouslySetInnerHTML={{
                    __html: blogDetail.blogDescription || "",
                  }}
                />
              )}
            </div>
          </article>

          {/* Sidebar: Get in Touch, Recent Posts, Blog Categories */}
          <aside className="col-lg-4">
            <div className={detailStyles.formCard}>
              <h4 className={detailStyles.formCardTitle}>Get in Touch</h4>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Control
                    type="text"
                    placeholder="Your name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter your name.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Control
                    type="email"
                    placeholder="Your email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="phone">
                  <Form.Control
                    type="tel"
                    placeholder="Your phone number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!errors.phone || (validated && !formData.phone.trim())}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone || "Please enter a valid phone number."}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="message">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Write your message here..."
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className={detailStyles.blogDetailSubmitBtn}
                  disabled={showLoading}
                >
                  {buttonName} <LoadingSpinner show={showLoading} />
                </Button>
              </Form>
            </div>

            <div className={detailStyles.sidebarCard}>
              <BlogSidebar
                showSearch={false}
                showRecentPosts={true}
                showLatestProperty={false}
              />
            </div>

            {categoriesList.length > 0 && (
              <div className={detailStyles.sidebarCard}>
                <h4 className={detailStyles.sidebarCardTitle}>Blog Tags</h4>
                <div className={detailStyles.sidebarCategoriesWrap}>
                  {visibleCategories.map((keyword, index) => (
                    <span key={index} className={detailStyles.sidebarCategoryTag}>
                      {keyword}
                    </span>
                  ))}
                </div>
                {hasMoreCategories && (
                  <button
                    type="button"
                    className={detailStyles.readMoreCategoriesBtn}
                    onClick={() => setShowAllCategories((prev) => !prev)}
                  >
                    {showAllCategories ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      <BlogFaqSection
        faqItems={faqItems}
        subtitle="Find answers to common questions about property types, filters, and coverage on My Property Fact across India."
      />
    </div>
  );
}
