"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  faInstagram,
  faLinkedin,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import FooterCityLinksSection from "./FooterCityLinksSection";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";

export default function NewFooterDesign({
  compactTop = false,
  cityList: cityListProp,
  showNewsletter = true,
}) {
  useDeferredStylesheet(() => import("./newfooter.css"));
  const { cityList: contextCityList = [] } = useSiteData();
  const cityList = cityListProp ?? contextCityList;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await fetch(
        "https://script.google.com/macros/s/AKfycby8ZetPUFIP_lYQ_Fhs_A8mAWu0o5UQwOkhffb3jG8ZjOrImDW9W_W2z-H115PRfRBa/exec",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );

      setEmail("");
      setShowThankYouModal(true);
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className={`new-footer-design${showNewsletter ? "" : " no-newsletter"}`}>
        {/* Newsletter Section */}
        {showNewsletter ? (
          <div className="container newslettermaxwidth">
            <div className="new-design-footer-top newsletter-background">
              <div className="new-design-footer-top-left newsletterbox-left newsletter-text">
                <div className="newlatter-heading">
                  Join My Newsletter
                </div>
                <p className="newsletter-paragraph">
                  Receive fresh articles straight in your inbox, every Friday morning.
                  I also share interesting finds from the internet!
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="newsletter-form">
                    <input type="email" placeholder="Your email address…"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="newsletter-input" />
                    <button className="newsletter-button btn-normal-color newletterbutton"
                      type="submit" disabled={loading}
                     >
                      {loading ? "Subscribing..." : "Subscribe"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="new-design-footer-top-right newsletterbox-right" style={{ marginTop: "-6%" }}>
                <img src="/static/footer/newsletter1.png" title="Corporate park" alt="Corporate park" className="center-img" />
              </div>
            </div>
          </div>
        ) : null}
        <div className="footer-city-links-container">
          <FooterCityLinksSection cityList={cityList} />
        </div>
      </div>
      <div className={`new-footer-design-container-fluid${compactTop ? " compact-top" : ""}`}>
        <div className="new-design-container">
          {/* Top Section */}
          <div className="new-design-footer-top">
            {/* Left Section - Company Info */}
            <div className="new-design-footer-top-new-left"  >
              <div className="new-design-footer-top-left-content">
                <div className="new-design-footer-top-left-logo">
                  <img
                    src="/logo_flag_color_dark.png"
                    alt="My Property Fact logo — site footer"
                    title="My Property Fact logo — site footer"
                    width={113}
                    height={103}
                  />
                </div>
                <p className="company-description">
                  My Property Fact is your trusted platform for discovering the perfect real estate opportunities across India. We bring together verified properties, transparent data,smart tools to help you make informed decisions whether you&apos;re buying or investing.
                </p>
                <div className="social-media-icons" style={{ justifyContent: "left" }}>
                  <a
                    href="https://www.facebook.com/mypropertyfact1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    title="My Property Fact on Facebook"
                    aria-label="My Property Fact on Facebook"
                  >
                    <img
                      src="/static/icon/facebook.png"
                      alt="Facebook"
                      title="Facebook"
                      width={24}
                      height={24}
                    />
                  </a>
                  <a
                    href="https://x.com/my_propertyfact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    title="My Property Fact on X"
                    aria-label="My Property Fact on X"
                  >
                    <img
                      src="/static/icon/twitter (1).png"
                      alt="X (Twitter)"
                      title="X (Twitter)"
                      width={20}
                      height={20}
                    />
                  </a>
                  <a
                    href="https://www.instagram.com/my.property.fact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    title="My Property Fact on Instagram"
                    aria-label="My Property Fact on Instagram"
                  >
                    <img
                      src="/static/icon/instagram.png"
                      alt="Instagram"
                      title="Instagram"
                      width={24}
                      height={24}
                    />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/my-property-fact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    title="My Property Fact on LinkedIn"
                    aria-label="My Property Fact on LinkedIn"
                  >
                    <img
                      src="/static/icon/linkedin.png"
                      alt="LinkedIn"
                      title="LinkedIn"
                      width={24}
                      height={24}
                    />
                  </a>
                  <a
                    href="https://www.youtube.com/@my.propertyfact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    title="My Property Fact on YouTube"
                    aria-label="My Property Fact on YouTube"
                  >
                    <img
                      src="/static/icon/youtube.png"
                      alt="YouTube"
                      title="YouTube"
                      width={24}
                      height={24}
                    />
                  </a>
                </div>
              </div>
            </div>
            {/* Right Section - Newsletter */}
            <div className="new-design-footer-top-new-right">
              {/* <div className="new-design-footer-top-right-newsletter">
              <div className="newsletter-heading plus-jakarta-sans-semi-bold h3">Newsletter Signup</div>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="newsletter-input"
                />
                <button className="newsletter-button btn-normal-color">Send</button>
              </div>
            </div> */}
              <div className="new-design-footer-bottom container">
                <div className="footer-bottom-column">
                  <div className="footer-section-heading h4">Company info</div>
                  <ul className="footer-links">
                    <li>
                      <Link href="/about-us" className="footer-link" title="About MPF">About MPF</Link>
                    </li>
                    <li>
                      <Link href="/projects/commercial" className="footer-link" prefetch={true} title="Commercial Projects">Commercial</Link>
                    </li>
                    <li>
                      <Link href="/projects/new-launches" className="footer-link" prefetch={true} title="New Launch Projects">New Launches</Link>
                    </li>
                    <li>
                      <Link href="/projects/residential" className="footer-link" prefetch={true} title="Residential Projects">Residential</Link>
                    </li>
                  </ul>
                </div>
                <div className="footer-bottom-column" >
                  <div className="footer-section-heading h4">Resources</div>
                  <ul className="footer-links">
                    <li>
                      <Link href="/join-our-team" className="footer-link" title="Join our team — careers at My Property Fact">Join Our Team</Link>
                    </li>
                    <li>
                      <Link href="/blog" className="footer-link" title="My Property Fact Blog">Blog</Link>
                    </li>
                    <li>
                      <Link href="/web-stories" className="footer-link" title="My Property Fact Web Stories">Web Stories</Link>
                    </li>
                    <li>
                      <Link href="/contact-us" className="footer-link" title="Contact My Property Fact">Contact Us</Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="footer-link" title="Privacy Policy">
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="footer-bottom-column" >
                  <div className="footer-section-heading h4">Address</div>
                  <ul className="footer-links">
                    <li className="contact-value">
                      Unit no: 603, 6th Floor, Corporate Park Tower A1, Sector 142 Noida
                    </li>
                    <li className="contact-value">
                      <div className="contact-item-phone">
                        <span className="contact-label">PHONE: </span>
                        <span className="contact-value"> +91 8920024793</span>
                      </div>
                    </li>
                    <li className="contact-value">
                      <div className="contact-item-phone">
                        <span className="contact-label">EMAIL: </span>
                        <span className="contact-value">
                          social@mypropertyfact.com
                        </span>
                      </div>
                    </li>
                  </ul>
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
          <p className="disclaimer-text">
            The content and data are for informative purposes only and may be
            prone to inaccuracy and inconsistency. We do not take any
            responsibility for data mismatches and strongly advise the viewers to
            conduct their detailed research before making any investment or
            purchase-related decisions.
          </p>
          <p className="copyright-text">
            © 2026 – mypropertyfact. All rights reserved.
          </p>
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

      {showThankYouModal &&
        createPortal(
          <div
            className="newsletter-thankyou-overlay"
            onClick={() => setShowThankYouModal(false)}
            role="presentation"
          >
            <div
              className="newsletter-thankyou-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="newsletter-thankyou-title"
            >
              <button
                type="button"
                className="newsletter-thankyou-close"
                onClick={() => setShowThankYouModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 id="newsletter-thankyou-title" className="newsletter-thankyou-title">
                Thank You for Subscribing
              </h3>
              <p className="newsletter-thankyou-text">
                You&apos;re all set! Look out for fresh articles in your inbox every Friday morning.
              </p>
              <button
                type="button"
                className="newsletter-thankyou-btn btn-normal-color"
                onClick={() => setShowThankYouModal(false)}
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}