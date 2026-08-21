"use client";
import Link from "next/link";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import FooterCityLinksSection from "./FooterCityLinksSection";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";

export default function NewFooterDesign({
  compactTop = false,
  cityList: cityListProp,
}) {
  useDeferredStylesheet(() => import("./newfooter.css"));
  const { cityList: contextCityList = [] } = useSiteData();
  const cityList = cityListProp ?? contextCityList;

  return (
    <div>
      <div className="new-footer-design no-newsletter">
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
                  <Link
                    href="/"
                    className="footer-logo-link"
                    title="My Property Fact Home"
                    aria-label="Go to My Property Fact home"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                      }
                    }}
                  >
                    <img
                      src="/logo.webp"
                      alt="My Property Fact logo — site footer"
                      title="My Property Fact Home"
                      width={113}
                      height={103}
                    />
                  </Link>
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
                        <a
                          href="tel:+918920024793"
                          className="footer-contact-link"
                          aria-label="Call My Property Fact at +91 8920024793"
                          title="Call +91 8920024793"
                        >
                          +91 8920024793
                        </a>
                      </div>
                    </li>
                    <li className="contact-value">
                      <div className="contact-item-phone">
                        <span className="contact-label">EMAIL: </span>
                        <a
                          href="mailto:social@mypropertyfact.com"
                          className="footer-contact-link"
                          aria-label="Email My Property Fact at social@mypropertyfact.com"
                          title="Email social@mypropertyfact.com"
                        >
                          social@mypropertyfact.com
                        </a>
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
    </div>
  );
}