"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import "./newfooter.css";

export default function NewFooterDesign({ compactTop = false, cityList: cityListProp }) {
  const { cityList: contextCityList = [] } = useSiteData();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use prop when provided (e.g. property page) - else context (e.g. home page with SiteDataProvider)
  const cityList = cityListProp ?? contextCityList;

  // Helper function to generate URL slug from prefix
  const generateSlug = (prefix) => {
    return `/${prefix.replace(/ /g, "-").toLowerCase().trim()}`;
  };

  // Delhi NCR cities to show first (order preserved)
  const DELHI_NCR_CITY_NAMES = [
    "Delhi",
    "Noida",
    "Gurugram",
    "Faridabad",
    "Ghaziabad",
    "Greater Noida",
    "Noida Extension",
    "Sonipat",
  ];

  const sortCitiesDelhiNCRFirst = (cities) => {
    if (!Array.isArray(cities) || cities.length === 0) return cities;
    const ncrSet = new Set(DELHI_NCR_CITY_NAMES.map((n) => n.toLowerCase().trim()));
    return [...cities].sort((a, b) => {
      const aName = (a?.cityName || "").trim();
      const bName = (b?.cityName || "").trim();
      const aNCR = ncrSet.has(aName.toLowerCase());
      const bNCR = ncrSet.has(bName.toLowerCase());
      if (aNCR && !bNCR) return -1;
      if (!aNCR && bNCR) return 1;
      if (aNCR && bNCR) {
        const aIdx = DELHI_NCR_CITY_NAMES.findIndex((n) => n.toLowerCase() === aName.toLowerCase());
        const bIdx = DELHI_NCR_CITY_NAMES.findIndex((n) => n.toLowerCase() === bName.toLowerCase());
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      }
      return aName.localeCompare(bName);
    });
  };

  // Filter cities based on category (same logic as old footer), then sort Delhi NCR first
  // Prop from server (property page): use immediately. Context (home): defer until mounted to avoid hydration mismatch.
  const safeCityList = Array.isArray(cityListProp)
    ? cityListProp
    : isMounted && Array.isArray(cityList)
      ? cityList
      : [];
  const apartmentsCities = sortCitiesDelhiNCRFirst(safeCityList);
  const newProjectsCities = sortCitiesDelhiNCRFirst(
    safeCityList.filter((item) => item?.cityName && !["Agra"].includes(item.cityName))
  );
  const flatsCities = sortCitiesDelhiNCRFirst(safeCityList);
  const commercialCities = sortCitiesDelhiNCRFirst(
    safeCityList.filter((item) => item?.cityName && !["Agra", "Bareilly", "Chennai", "Dehradun", "Kochi", "Thiruvananthapuram", "Vrindavan"].includes(item.cityName))
  );

  const SCROLL_HINT_MIN_CITIES = 6;

  // City lists: scrollable region + pulse hint (no Load More button)
  const renderCityList = (cities, category, prefix, generateSlugFn) => {
    const useScroll = cities.length >= SCROLL_HINT_MIN_CITIES;

    return (
      <>
        <div className={useScroll ? "footer-links-scroll" : undefined}>
          <ul className="footer-links">
            {cities.map((city, index) => (
              <li key={`${category}-${city.id || index}`}>
                <Link
                  href={`${generateSlugFn(prefix)}${city.slugURL}`}
                  prefetch={false}
                  className="footer-link"
                  title={`${prefix}${city.cityName}`}
                >
                  {prefix}{city.cityName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {useScroll && (
          <div
            className="footer-scroll-hint"
            role="status"
            aria-label="Scroll the list above to view more links"
          >
            <span className="footer-scroll-hint__pulse" aria-hidden>
              <span className="footer-scroll-hint__pulse-dot" />
            </span>
            <span className="footer-scroll-hint__text">Scroll to view more</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`new-footer-design-container-fluid${compactTop ? " compact-top" : ""}`}>
      <div className="new-design-container">
        {/* Top Section */}
        <div className="new-design-footer-top">
          {/* Left Section - Company Info */}
          <div className="new-design-footer-top-left">
            <div className="new-design-footer-top-left-content">
              <div className="new-design-footer-top-left-logo">
                <Image
                  src="/logo.webp"
                  alt="My Property Fact logo — site footer"
                  title="My Property Fact logo — site footer"
                  width={113}
                  height={103}
                  sizes="113px"
                />
              </div>
              <p className="company-description">
                My Property Fact is your trusted platform for discovering the perfect real estate opportunities across India. We bring together verified properties, transparent data,smart tools to help you make informed decisions whether you&apos;re buying or investing.
              </p>
            </div>
            <div className="contact-details">
              <div className="contact-item-footer contact-item-full">
                <span className="contact-label">ADDRESS:</span>
                <span className="contact-value">
                  Unit no: 603, 6th Floor, Corporate Park Tower A1, Sector 142 Noida
                </span>
              </div>
              <div className="contact-item-row">
                <div className="contact-item-phone">
                  <span className="contact-label">PHONE: </span>
                  <span className="contact-value"> +91 8920024793</span>
                </div>
                <div className="contact-item-phone">
                  <span className="contact-label">EMAIL: </span>
                  <span className="contact-value">
                    social@mypropertyfact.com
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Right Section - Newsletter */}
          <div className="new-design-footer-top-right">
            <div className="new-design-footer-top-right-newsletter">
              <div className="newsletter-heading plus-jakarta-sans-semi-bold h3">Newsletter Signup</div>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="newsletter-input"
                />
                <button className="newsletter-button btn-normal-color">Send</button>
              </div>
            </div>
            <div className="new-design-footer-top-right-content">
              <div className="new-design-footer-top-right-left">
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
              <div className="new-design-footer-top-right-right">
                <div className="footer-section-heading h4">Resources</div>
                <ul className="footer-links">
                  <li>
                    <Link href="/career" className="footer-link" title="Careers at My Property Fact">Careers</Link>
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
            </div>
          </div>
        </div>

        {/* Middle Section */}
        {/* <div className="new-design-footer-middle"></div> */}

        {/* Bottom Section - Property Categories */}
        <div className="new-design-footer-bottom">
          <div className="footer-bottom-column">
            <div className="footer-section-heading h4">Apartments in India</div>
            {renderCityList(apartmentsCities, "apartments", "Apartments in ", generateSlug)}
          </div>
          <div className="footer-bottom-column">
            <div className="footer-section-heading h4">New Projects in India</div>
            {renderCityList(newProjectsCities, "newProjects", "New Projects in ", generateSlug)}
          </div>
          <div className="footer-bottom-column">
            <div className="footer-section-heading h4">
              Commercial Property in India
            </div>
            {renderCityList(commercialCities, "commercial", "Commercial Property in ", generateSlug)}
          </div>
          <div className="footer-bottom-column">
            <div className="footer-section-heading h4">Flats in India</div>
            {renderCityList(flatsCities, "flats", "Flats in ", generateSlug)}
          </div>
        </div>

        {/* Stay Updated Section */}
        <div className="footer-stay-updated">
          <div className="stay-updated-heading m-0 p-0 h4">Stay Updated With Us</div>
          <div className="social-media-icons">
            <a
              href="https://www.facebook.com/mypropertyfact1/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              title="My Property Fact on Facebook"
              aria-label="My Property Fact on Facebook"
            >
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a
              href="https://x.com/my_propertyfact"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              title="My Property Fact on X"
              aria-label="My Property Fact on X"
            >
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
            <a
              href="https://www.instagram.com/my.property.fact/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              title="My Property Fact on Instagram"
              aria-label="My Property Fact on Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://www.linkedin.com/company/my-property-fact/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              title="My Property Fact on LinkedIn"
              aria-label="My Property Fact on LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a
              href="https://www.youtube.com/@my.propertyfact/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              title="My Property Fact on YouTube"
              aria-label="My Property Fact on YouTube"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>
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
  );
}