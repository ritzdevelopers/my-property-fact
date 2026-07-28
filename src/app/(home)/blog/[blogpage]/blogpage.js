"use client";
import CommonHeaderBanner from "../../components/common/commonheaderbanner";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { usePathname } from "next/navigation";
import BlogSidebar from "../../components/common/BlogSidebar";
import { getBlogAuthorDisplayName } from "../../components/common/blogAuthor";
import BlogFaqSection from "../../components/common/BlogFaqSection";
import LeadFormPopupTrigger from "../../components/_homecomponents/LeadFormPopupTrigger";
import "../../components/common/common.css";
import detailStyles from "./blogpage.module.css";
import { submitBlogEnquiryAction } from "../actions";

const RELATED_BLOGS_SOCIAL = [
  {
    id: "fb",
    href: "https://www.facebook.com/mypropertyfact1/",
    label: "My Property Fact on Facebook",
    Icon: FaFacebookF,
  },
  {
    id: "ig",
    href: "https://www.instagram.com/my.property.fact/",
    label: "My Property Fact on Instagram",
    Icon: FaInstagram,
  },
  {
    id: "li",
    href: "https://www.linkedin.com/company/my-property-fact/",
    label: "My Property Fact on LinkedIn",
    Icon: FaLinkedinIn,
  },
  {
    id: "yt",
    href: "https://www.youtube.com/@my.propertyfact/",
    label: "My Property Fact on YouTube",
    Icon: FaYoutube,
  },
];

/**
 * Rich-text bodies often repeat the article title as <h1>. We already render one
 * <h1> above the body; demoting embedded h1 → h2 fixes duplicate-H1 SEO issues.
 */
function demoteBodyH1ToH2(html) {
  if (html == null || typeof html !== "string" || html === "") return html;
  return html
    .replace(/<h1\b([^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");
}

function decodeHeadingEntities(value) {
  const entities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
    "#39": "'",
    "#x27": "'",
  };
  return value.replace(/&([a-z]+|#\d+|#x[0-9a-f]+);/gi, (entity, key) =>
    entities[key.toLowerCase()] ?? entity,
  );
}

/**
 * Parse the CMS HTML, assign a stable slug `id` to every <h2>, and return the
 * transformed HTML plus an ordered Table-of-Contents list `{ id, text }[]`.
 * If a heading already has an id, we preserve it.
 */
function buildToc(html) {
  if (!html || typeof html !== "string") return { html: html || "", toc: [] };
  const toc = [];
  const usedIds = new Set();

  const baseSlug = (text) => {
    const raw = text
      .toLowerCase()
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return raw || "section";
  };

  const uniqueSlug = (text) => {
    const base = baseSlug(text);
    let id = base;
    let i = 2;
    while (usedIds.has(id)) {
      id = `${base}-${i++}`;
    }
    usedIds.add(id);
    return id;
  };

  const transformed = html.replace(
    /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs, inner) => {
      const plain = inner
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      const headingText = decodeHeadingEntities(plain);
      if (!headingText) return match;

      const existingId = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs);
      let id;
      if (existingId) {
        id = existingId[1];
        usedIds.add(id);
        toc.push({ id, text: headingText });
        return match;
      }
      id = uniqueSlug(headingText);
      toc.push({ id, text: headingText });
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    },
  );

  return { html: transformed, toc };
}

/**
 * Wrap each <table> in a scroll shell in the HTML string (runs in useMemo).
 * This matches the old 2-column behaviour: wide tables scroll horizontally
 * inside the article and never paint over the sidebars. Nested <table> in HTML
 * is rare; the non-greedy match pairs with the first </table> (same as a simple
 * CMS one-level table).
 */
function wrapTablesInHtml(html) {
  if (html == null || typeof html !== "string" || html === "") return html;
  return html.replace(
    /<table\b[^>]*>[\s\S]*?<\/\s*table\s*>/gi,
    (...args) => {
      const match = args[0];
      const full = args[args.length - 1];
      const offset = args[args.length - 2];
      const before = full.slice(Math.max(0, offset - 200), offset);
      if (/<div[^>]*\bblogDetailTableScroll\b[^>]*>\s*$/i.test(before)) {
        return match;
      }
      return `<div class="blogDetailTableScroll" data-btw="1">${match}</div>`;
    },
  );
}

export default function BlogDetail({
  blogDetail,
  sidebarRecentPosts = [],
}) {
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
  const contentCardRef = useRef(null);
  const tocNavRef = useRef(null);
  const [activeTocId, setActiveTocId] = useState("");
  /** True only when the in-article ToC is fully *above* the viewport (user scrolled down past it). */
  const [mainTocScrolledPast, setMainTocScrolledPast] = useState(false);
  const [floatingTocDismissed, setFloatingTocDismissed] = useState(false);
  /** Suppress float on first paint / reload / scroll-restore; real scroll must occur. */
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  const blogTitle = blogDetail.blogTitle.replace(/\u00A0/g, " ");
  const rawBodyHtml = demoteBodyH1ToH2(blogDetail.blogDescription || "");

  /* --- TOC + table scroll wrapper (string) in one pass per body --- */
  const { html: safeBodyHtml, toc } = useMemo(() => {
    const { html: withToc, toc: t } = buildToc(rawBodyHtml);
    return { html: wrapTablesInHtml(withToc), toc: t };
  }, [rawBodyHtml]);

  /* Require an actual user scroll (after mount) — not the initial load / scroll-restore. */
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let acceptScrolls = false;
    const t = window.setTimeout(() => {
      acceptScrolls = true;
    }, 200);
    const onScroll = () => {
      if (acceptScrolls) setUserHasScrolled(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* Floating ToC only when user has scrolled *down* past the real ToC (it sits above the viewport), not when it is still below the fold. */
  useEffect(() => {
    if (!toc.length) return undefined;
    const el = tocNavRef.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        const { bottom } = entry.boundingClientRect;
        const pastDown = !inView && bottom < 0;
        setMainTocScrolledPast(pastDown);
        if (inView) setFloatingTocDismissed(false);
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [toc.length, safeBodyHtml]);

  /* --- Scroll-spy for TOC: highlight the heading currently in view --- */
  useEffect(() => {
    if (!toc.length) return undefined;
    const els = toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (!els.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveTocId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc, safeBodyHtml]);

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
      const response = await submitBlogEnquiryAction(formData);
      if (response.ok) {
        setFormData(initialFormData); // Reset form data
        setValidated(false); // Reset validation state
        setErrors({ phone: "" });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
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

  /* --- Smooth scroll with sticky-header offset when a TOC link is clicked --- */
  const handleTocClick = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const offset = 100; // leave space for site header
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    if (typeof window.history?.replaceState === "function") {
      window.history.replaceState(null, "", `#${id}`);
    }
    setActiveTocId(id);
  };

  const blogHeroImageAlt = blogTitle?.trim()
    ? `${blogTitle.trim()} — blog featured image on My Property Fact`
    : "Blog featured image on My Property Fact";
  const authorLine = getBlogAuthorDisplayName(blogDetail, "My Property Fact");
  const publishedLine = blogDetail.createdAt
    ? new Date(blogDetail.createdAt).toLocaleString("en-US", { dateStyle: "long" })
    : "";
  return (
    <div className={detailStyles.blogDetailWrap}>
      <CommonHeaderBanner
        image={"builder-banner.jp"}
        headerText={"Blog-Detail"}
        pageName={blogTitle}
        firstPage={"Blog"}
      />
      <div
        className={`container ${detailStyles.blogDetailContainer} ${detailStyles.blogDetailMainPad}`}
      >
        <div className={`row g-4 ${detailStyles.blogDetailRow}`}>
          {/* CENTER first in DOM so <h1> is the first heading; flex order places column visually in the middle on desktop */}
          <article
            className={`col-12 col-lg-6 order-1 order-lg-2 ${detailStyles.articleCol}`}
          >
            {blogDetail.blogImage && (
              <div className={detailStyles.articleImageWrap}>
                <img
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${blogDetail.blogImage}`}
                  alt={blogHeroImageAlt}
                  title={blogHeroImageAlt}
                  className="img-fluid"
                  width={1200}
                  height={648}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}

            <h1 className={detailStyles.articleTitle}>
              {blogDetail.blogTitle.replace(/\u00A0/g, " ")}
            </h1>
            <p className={detailStyles.articleByline}>
              By <span className={detailStyles.articleBylineName}>{authorLine}</span>
              {publishedLine ? (
                <>
                  <span className={detailStyles.articleBylineSep} aria-hidden>
                    {" "}
                    ·{" "}
                  </span>
                  <time dateTime={blogDetail.createdAt ? new Date(blogDetail.createdAt).toISOString() : undefined}>
                    {publishedLine}
                  </time>
                </>
              ) : null}
            </p>

            {toc.length > 0 && (
              <nav
                ref={tocNavRef}
                className={detailStyles.tocCard}
                aria-label="Table of contents"
              >
                <div className={detailStyles.tocTitle}>Table of Contents</div>
                <ol className={detailStyles.tocList}>
                  {toc.map((item, idx) => (
                    <li key={item.id} className={detailStyles.tocItem}>
                      <a
                        href={`#${item.id}`}
                        title={`Go to: ${item.text}`}
                        onClick={(e) => handleTocClick(e, item.id)}
                        className={`${detailStyles.tocLink} ${activeTocId === item.id ? detailStyles.tocLinkActive : ""
                          }`}
                      >
                        <span className={detailStyles.tocIndex}>{idx + 1}.</span>
                        <span className={detailStyles.tocText}>{item.text}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className={detailStyles.articleContent}>
              <div
                ref={contentCardRef}
                className={detailStyles.contentCard}
                dangerouslySetInnerHTML={{
                  __html: safeBodyHtml,
                }}
              />
            </div>
          </article>

          {/* LEFT rail — Related Blogs (sticky on desktop) */}
          <aside
            className={`col-12 col-lg-3 order-2 order-lg-1 ${detailStyles.leftRailCol}`}
          >
            <div className={detailStyles.stickyRail}>
              <div className={`${detailStyles.sidebarCard} ${detailStyles.relatedBlogsCard}`}>
                <div className={detailStyles.sidebarCardTitle}>Related Blogs</div>
                <BlogSidebar
                  showSearch={false}
                  showRecentPosts={true}
                  showRecentTitle={false}
                  showLatestProperty={false}
                  initialRecentPosts={sidebarRecentPosts}
                />

                <div
                  className={detailStyles.relatedBlogsSocial}
                  role="navigation"
                  aria-label="My Property Fact on social media"
                >
                  {RELATED_BLOGS_SOCIAL.map(({ id, href, label, Icon }) => (
                    <Link
                      key={id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={detailStyles.relatedBlogsSocialLink}
                      title={label}
                      aria-label={label}
                    >
                      <Icon aria-hidden className={detailStyles.relatedBlogsSocialIcon} />
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* RIGHT rail — Lead form + tags (sticky on desktop) */}
          <aside
            className={`col-12 col-lg-3 order-3 order-lg-3 ${detailStyles.rightRailCol}`}
          >
            <div className={detailStyles.stickyRail}>
              <div className={detailStyles.formCard}>
                <div className={detailStyles.formCardTitle} id="blog-detail-get-in-touch">
                  Get in Touch
                </div>
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={handleSubmit}
                  aria-labelledby="blog-detail-get-in-touch"
                >
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

              {categoriesList.length > 0 && (
                <div className={detailStyles.sidebarCard}>
                  <div className={detailStyles.sidebarCardTitle}>Blog Tags</div>
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
            </div>
          </aside>
        </div>
      </div>

      {toc.length > 0 &&
        userHasScrolled &&
        mainTocScrolledPast &&
        !floatingTocDismissed && (
          <div
            className={detailStyles.tocFloat}
            role="complementary"
            aria-label="On this page — jump to a section"
          >
            <div className={detailStyles.tocFloatHeader}>
              <span className={detailStyles.tocFloatHeaderTitle}>Table Of Content</span>
              <button
                type="button"
                className={detailStyles.tocFloatClose}
                onClick={() => setFloatingTocDismissed(true)}
                aria-label="Hide section navigation"
              >
                ×
              </button>
            </div>
            <ol className={detailStyles.tocFloatList}>
              {toc.map((item, idx) => (
                <li key={item.id} className={detailStyles.tocFloatItem}>
                  <a
                    href={`#${item.id}`}
                    title={`Go to: ${item.text}`}
                    onClick={(e) => handleTocClick(e, item.id)}
                    className={`${detailStyles.tocFloatLink} ${activeTocId === item.id ? detailStyles.tocFloatLinkActive : ""
                      }`}
                  >
                    <span className={detailStyles.tocFloatIndex}>{idx + 1}.</span>
                    <span className={detailStyles.tocFloatText}>{item.text}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}

      <BlogFaqSection
        faqItems={faqItems}
        subtitle="Find answers to common questions about property types, filters, and coverage on My Property Fact across India."
      />
      <LeadFormPopupTrigger />
    </div>
  );
}
