"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
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
  const SCROLL_HINT_MIN_CITIES = 4;
  // City lists: scrollable region + pulse hint (no Load More button)
  const renderCityList = (cities, category, prefix, generateSlugFn) => {
    const useScroll = cities.length >= SCROLL_HINT_MIN_CITIES;

    return (
      <>
        <div className={useScroll ? "footer-new-links-scroll" : undefined}>
          <ul className="footer-new-links">
            {cities.map((city, index) => (
              <li key={`${category}-${city.id || index}`}>
                <Link
                  href={`${generateSlugFn(prefix)}${city.slugURL}`}
                  prefetch={false}
                  className="footer-new-link"

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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("https://script.google.com/macros/s/AKfycby8ZetPUFIP_lYQ_Fhs_A8mAWu0o5UQwOkhffb3jG8ZjOrImDW9W_W2z-H115PRfRBa/exec",
        {
          method: "POST",
          body: JSON.stringify({
            email,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("You have subscribed successfully!");
        setEmail("");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="new-footer-design">
        {/* Newsletter Section */}
        <div className="container">
          <div className="new-design-footer-top" style={{ backgroundColor: "#FAFAFA", borderRadius: "12px" }}>
            <div className="new-design-footer-top-left newsletter-text" style={{ padding: "30px" }}>
              <div className="newlatter-heading">
                Join My Newsletter
              </div>
              <p className="newsletter-paragraph">
                Receive fresh articles straight in your inbox, every Friday morning.
                <br />
                I also share interesting finds from the internet!
              </p>
              <form onSubmit={handleSubmit}>
                <div className="newsletter-form">
                  <input type="email" placeholder="Your Email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input" />
                  <button className="newsletter-button btn-normal-color"
                    type="submit" disabled={loading}
                    style={{ backgroundColor: "#0D5834", width: "120px", height: "45px" }}>
                    {loading ? "Saving..." : "Subscribe"}
                  </button>
                </div>
              </form>
            </div>
            <div className="new-design-footer-top-right" style={{ padding: "0px" }}>
              <img src="/static/footer/newsletter.png" alt="Building" />
            </div>
          </div>
        </div>
        <div className="new-design-footer-bottom container " style={{ paddingBottom: "40px" }}>
          <div className="footer-bottom-column">
            <div className="footer-new-heading">Apartments in India</div>
            {renderCityList(apartmentsCities, "apartments", "Apartments in ", generateSlug)}
          </div>
          <div className="footer-bottom-column">
            <div className="footer-new-heading">New Projects in India</div>
            {renderCityList(newProjectsCities, "newProjects", "New Projects in ", generateSlug)}
          </div>
          <div className="footer-bottom-column">
            <div className="footer-new-heading">
              Commercial Property in India
            </div>
            {renderCityList(commercialCities, "commercial", "Commercial Property in ", generateSlug)}
          </div>
          <div className="footer-bottom-column">
            <div className="footer-new-heading">Flats in India</div>
            {renderCityList(flatsCities, "flats", "Flats in ", generateSlug)}
          </div>
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
                <div className="social-media-icons" style={{ justifyContent: "left" }}>
                  <a
                    href="https://www.facebook.com/mypropertyfact1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    title="My Property Fact on Facebook"
                    aria-label="My Property Fact on Facebook"
                  >
                    <Image
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
                    <Image
                      src="/static/icon/twitter (1).png"
                      alt="X (Twitter)"
                      title="X (Twitter)"
                      width={24}
                      height={24}
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
                    <Image
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
                    <Image
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
                    <Image
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
                <div className="footer-bottom-column">
                  <div className="footer-section-heading h4">Our Partners</div>
                  <ul className="footer-links">
                    <li>
                      <Link href="https://creativethinksmedia.com/" className="footer-link" title="Creative Thinks Media">Creative Thinks Media</Link>
                    </li>
                    <li>
                      <Link href="https://ritzmediaworld.com/" className="footer-link" title="Ritz Media World">Ritz Media World</Link>
                    </li>
                    <li>
                      <Link href="https://www.contenaissance.com/" className="footer-link" title="Contenaissance">Contenaissance</Link>
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
    </div>
  );
}