"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiYoutube } from "react-icons/fi";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import FooterCityLinksSection from "./FooterCityLinksSection";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";
import {
  isFooterNavScrollPending,
  markFooterNavScrollTop,
  peekListingReturnState,
  scrollWindowToTop,
} from "@/lib/listingScrollRestore";

const FOOTER_IN_VIEW_CLASS = "mpf-footer-in-view";
const FOOTER_PHONE_HREF = "tel:+918920024793";
const FOOTER_EMAIL_HREF = "mailto:social@mypropertyfact.com";
const GOOGLE_PREFERRED_SOURCE_HREF =
  "https://www.google.com/preferences/source?q=mypropertyfact.in";

const contentSnapTransition = {
  duration: 0.45,
  times: [0, 0.55, 0.78, 1],
  ease: [0.16, 1.2, 0.3, 1],
  repeat: Infinity,
  repeatDelay: 2.1,
};

export default function NewFooterDesign({
  compactTop = false,
  cityList: cityListProp,
}) {
  useDeferredStylesheet(() => import("./newfooter.css"));
  const reduceMotion = useReducedMotion();
  const { cityList: contextCityList = [] } = useSiteData();
  const cityList = cityListProp ?? contextCityList;
  const footerRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isFooterNavScrollPending()) return undefined;

    const saved = peekListingReturnState();
    if (saved?.pathname === pathname) return undefined;

    scrollWindowToTop();
    const frame = window.requestAnimationFrame(() => {
      scrollWindowToTop();
      window.requestAnimationFrame(scrollWindowToTop);
    });
    const timer = window.setTimeout(scrollWindowToTop, 80);
    const lateTimer = window.setTimeout(scrollWindowToTop, 220);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.clearTimeout(lateTimer);
    };
  }, [pathname]);

  useEffect(() => {
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;

    const root = document.documentElement;
    const observer = new IntersectionObserver(
      ([entry]) => {
        root.classList.toggle(
          FOOTER_IN_VIEW_CLASS,
          Boolean(entry?.isIntersecting),
        );
      },
      { threshold: 0.02, rootMargin: "0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.classList.remove(FOOTER_IN_VIEW_CLASS);
    };
  }, []);

  return (
    <div>
      <div className="new-footer-design no-newsletter">
        <div className="footer-city-links-container">
          <FooterCityLinksSection cityList={cityList} />
        </div>
      </div>
      <div
        ref={footerRef}
        className={`new-footer-design-container-fluid${compactTop ? " compact-top" : ""}`}
      >
        <div className="new-design-container">
          {/* Top Section */}
          <div className="new-design-footer-top">
            <div className="new-design-footer-bottom container">
              <div className="footer-bottom-column footer-brand-column">
                <div className="new-design-footer-top-left-logo">
                  <Link
                    href="/"
                    className="footer-logo-link"
                    title="My Property Fact"
                    aria-label="Go to My Property Fact home"
                    prefetch
                    onClick={markFooterNavScrollTop}
                  >
                    <img
                      src="/mpf_new_footer_logo.png"
                      alt="My Property Fact"
                      title="My Property Fact"
                      width={113}
                      height={103}
                    />
                  </Link>
                </div>
                <p className="company-description">
                  My Property Fact is your trusted platform for discovering the
                  perfect real estate opportunities across India. We bring
                  together verified properties, transparent data, smart tools to
                  help you make informed decisions whether you&apos;re buying or
                  investing.
                </p>
                <div className="footer-brand-google">
                  <a
                    href={GOOGLE_PREFERRED_SOURCE_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-preferred-source-btn google-preferred-source-btn--breathe"
                    title="Add My Property Fact as a preferred source on Google"
                    aria-label="Add My Property Fact as a preferred source on Google"
                  >
                    <motion.span
                      className="google-preferred-source-btn__icon"
                      aria-hidden="true"
                      initial={false}
                      animate={
                        reduceMotion
                          ? { x: 0, opacity: 1 }
                          : { x: [-40, 6, -2, 0], opacity: [0, 1, 1, 1] }
                      }
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : contentSnapTransition
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        width="24"
                        height="24"
                        role="img"
                        aria-hidden="true"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.59 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                    </motion.span>
                    <motion.span
                      className="google-preferred-source-btn__text"
                      initial={false}
                      animate={
                        reduceMotion
                          ? { x: 0, opacity: 1 }
                          : { x: [-40, 6, -2, 0], opacity: [0, 1, 1, 1] }
                      }
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { ...contentSnapTransition, delay: 0.06 }
                      }
                    >
                      <span>Add as a preferred</span>
                      <span>source on Google</span>
                    </motion.span>
                  </a>
                </div>
              </div>
              <div className="footer-bottom-column footer-company-info-column">
                  <div className="footer-section-heading h4">Company info</div>
                  <ul className="footer-links">
                    <li>
                      <Link
                        href="/about-us"
                        className="footer-link"
                        title="About MPF"
                        onClick={markFooterNavScrollTop}
                      >
                        About MPF
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects/commercial"
                        className="footer-link"
                        prefetch={true}
                        title="Commercial Projects"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Commercial
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects/new-launches"
                        className="footer-link"
                        prefetch={true}
                        title="New Launch Projects"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        New Launches
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects/residential"
                        className="footer-link"
                        prefetch={true}
                        title="Residential Projects"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Residential
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="footer-link"
                        title="Privacy Policy"
                        onClick={markFooterNavScrollTop}
                      >
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="footer-bottom-column">
                  <div className="footer-section-heading h4">Resources</div>
                  <ul className="footer-links">
                    <li>
                      <Link
                        href="/join-our-team"
                        className="footer-link"
                        title="Join our team — careers at My Property Fact"
                        onClick={markFooterNavScrollTop}
                      >
                        Join Our Team
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/blog"
                        className="footer-link"
                        title="My Property Fact Blog"
                        onClick={markFooterNavScrollTop}
                      >
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/blog"
                        className="footer-link"
                        title="Web Stories"
                        onClick={markFooterNavScrollTop}
                      >
                        Web Stories
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact-us"
                        className="footer-link"
                        title="Contact My Property Fact"
                        onClick={markFooterNavScrollTop}
                      >
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <a
                        href={FOOTER_PHONE_HREF}
                        className="footer-link"
                        title="Sales Enquiry — +91 8920024793"
                        aria-label="Sales Enquiry — call +91 8920024793"
                      >
                        Sales Enquiry
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="footer-bottom-column footer-contact-column">
                  <div className="footer-contact-block">
                    <div className="footer-contact-item">
                      <div className="footer-section-heading h4 footer-contact-label">
                        Address
                      </div>
                      <p className="footer-contact-detail footer-contact-address">
                        6th Floor Tower A1, Corporate Park Noida-142, India
                      </p>
                    </div>
                    <div className="footer-contact-item">
                      <div className="footer-section-heading h4 footer-contact-label">
                        Email
                      </div>
                      <p className="footer-contact-line">
                        <a
                          href={FOOTER_EMAIL_HREF}
                          className="footer-contact-detail footer-contact-link"
                          aria-label="Email My Property Fact at social@mypropertyfact.com"
                          title="social@mypropertyfact.com"
                        >
                          social@mypropertyfact.com
                        </a>
                      </p>
                    </div>
                    <div className="footer-contact-item">
                      <div className="footer-section-heading h4 footer-contact-label">
                        Phone
                      </div>
                      <p className="footer-contact-line">
                        <a
                          href={FOOTER_PHONE_HREF}
                          className="footer-contact-detail footer-contact-link"
                          aria-label="Call My Property Fact at +91 8920024793"
                          title="+91 8920024793"
                        >
                          +(91)8920024793
                        </a>
                      </p>
                    </div>
                  </div>

          
                  <div className="social-media-icons footer-brand-social">
                    <a
                      href="https://www.facebook.com/mypropertyfact1/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-icon"
                      title="My Property Fact on Facebook"
                      aria-label="My Property Fact on Facebook"
                    >
                      <FaFacebookF aria-hidden="true" />
                    </a>
                    <a
                      href="https://x.com/my_propertyfact"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-icon"
                      title="My Property Fact on X"
                      aria-label="My Property Fact on X"
                    >
                      <FaXTwitter aria-hidden="true" />
                    </a>
                    <a
                      href="https://www.instagram.com/my.property.fact/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-icon"
                      title="My Property Fact on Instagram"
                      aria-label="My Property Fact on Instagram"
                    >
                      <FaInstagram aria-hidden="true" />
                    </a>
                    <a
                      href="https://www.linkedin.com/company/my-property-fact/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-icon"
                      title="My Property Fact on LinkedIn"
                      aria-label="My Property Fact on LinkedIn"
                    >
                      <FaLinkedinIn aria-hidden="true" />
                    </a>
                    <a
                      href="https://www.youtube.com/@my.propertyfact/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-icon"
                      title="My Property Fact on YouTube"
                      aria-label="My Property Fact on YouTube"
                    >
                      <FiYoutube aria-hidden="true" />
                    </a>
                  </div>
                </div>
            </div>
          </div>
          {/* Middle Section */}
          {/* <div className="new-design-footer-middle"></div> */}
          {/* Bottom Section - Property Categories */}
          {/* Stay Updated Section */}
          {/* <div className="footer-stay-updated">
          <div className="stay-updated-heading m-0 p-0 h4">Stay Updated With Us</div>
        </div> */}
        </div>
        {/* Disclaimer and Copyright */}
        <div className="footer-disclaimer-copyright">
          <div className="footer-disclaimer-block">
            <p className="disclaimer-text">
              The content and data are for informative purposes only and may be
              prone to inaccuracy and inconsistency. We do not take any
              responsibility for data mismatches and strongly advise the viewers
              to conduct their detailed research before making any investment or
              purchase-related decisions.
            </p>
          </div>
          <div className="footer-copyright-block">
            <p className="copyright-text">
              © 2026 – mypropertyfact. All rights reserved.
            </p>
          </div>
        </div>
        {/* Scroll to Top Button */}
        {/* {showScrollTop && (
        <button
          className="scroll-to-top-button btn-normal-color"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )} */}
      </div>
    </div>
  );
}
