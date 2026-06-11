"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import ContactForm from "./_components/ContactForm";
import ContactModal from "./_components/ContactModal";
import Footer from "./_components/Footer";
import Navbar from "./_components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import NotFoundPage from "../not-found";
import Script from "next/script";
export default function EldecoCamelotPage() {
  const params = useParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathParam = params?.path;
  const [isNotFound, setIsNotFound] = useState(false);

  // Validate path parameter - only allow "1" or "2"
  useEffect(() => {
    if (
      pathParam &&
      pathParam !== "1" &&
      pathParam !== "2" &&
      pathParam !== "3" &&
      pathParam !== "4" &&
      pathParam !== "5" &&
      pathParam !== "6" &&
      pathParam !== "7" &&
      pathParam !== "8" &&
      pathParam !== "9"
    ) {
      // Redirect to 404 or show not found
      setIsNotFound(true);
    }
  }, [pathParam, router]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    // Add Owl Carousel CSS
    const link1 = document.createElement("link");
    link1.rel = "stylesheet";
    link1.href =
      "https://cdn.jsdelivr.net/npm/owl.carousel@2.3.4/dist/assets/owl.carousel.min.css";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href =
      "https://cdn.jsdelivr.net/npm/owl.carousel@2.3.4/dist/assets/owl.theme.default.min.css";
    document.head.appendChild(link2);

    let checkInterval = null;
    let timeout = null;

    // Wait for jQuery and scripts to load
    const initScripts = () => {
      if (
        typeof window === "undefined" ||
        !window.jQuery ||
        !window.jQuery.fn.owlCarousel
      ) {
        return false;
      }

      const $ = window.jQuery;

      // Enquiry Box Toggle Functionality
      const enquiryBox = document.querySelector(".enquiry-box");
      const toggleIcon = document.querySelector(".toggle-form");
      const header = document.querySelector(".enquiry-header");

      if (enquiryBox && toggleIcon && header) {
        // Manual toggle on header click
        header.onclick = () => {
          enquiryBox.classList.toggle("collapsed");
          toggleIcon.classList.toggle("fa-chevron-down");
          toggleIcon.classList.toggle("fa-chevron-up");
        };

        let lastScroll = window.scrollY;

        const handleScroll = () => {
          let currentScroll = window.scrollY;

          // Scroll Down → Collapse form
          if (currentScroll > lastScroll) {
            enquiryBox.classList.add("collapsed");
            toggleIcon.classList.remove("fa-chevron-down");
            toggleIcon.classList.add("fa-chevron-up");
          }

          // Only when near top → Expand form
          if (currentScroll < 100) {
            enquiryBox.classList.remove("collapsed");
            toggleIcon.classList.remove("fa-chevron-up");
            toggleIcon.classList.add("fa-chevron-down");
          }

          lastScroll = currentScroll;
        };

        window.addEventListener("scroll", handleScroll);
      }

      // Banner Slider
      const bannerSlider = $(".banner-slider");
      if (bannerSlider.length) {
        const owl = bannerSlider.owlCarousel({
          loop: true,
          margin: 20,
          autoplay: true,
          autoplayTimeout: 2500,
          autoplayHoverPause: false,
          center: true,
          smartSpeed: 700,
          responsive: {
            0: { items: 1 },
            768: { items: 2 },
            1200: { items: 3 },
          },
        });

        $(".left-nav").on("click", function () {
          owl.trigger("prev.owl.carousel");
        });

        $(".right-nav").on("click", function () {
          owl.trigger("next.owl.carousel");
        });
      }

      // Gallery Slider
      const gallerySlider = $(".gallery-slider");
      if (gallerySlider.length) {
        const gallery = gallerySlider.owlCarousel({
          items: 3,
          margin: 20,
          loop: true,
          autoplay: true,
          autoplayTimeout: 2000,
          autoplayHoverPause: true,
          smartSpeed: 800,
          dots: false,
          nav: false,
          responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 3 },
          },
        });

        // Custom Navigation
        $(".gallery-nav-prev").on("click", function () {
          gallery.trigger("prev.owl.carousel");
        });

        $(".gallery-nav-next").on("click", function () {
          gallery.trigger("next.owl.carousel");
        });
      }

      // Amenities Carousel
      const amenitiesCarousel = $(".amenities-carousel");
      if (amenitiesCarousel.length) {
        amenitiesCarousel.owlCarousel({
          loop: true,
          margin: 20,
          autoplay: true,
          autoplayTimeout: 3000,
          smartSpeed: 700,
          dots: false,
          nav: false,
          responsive: {
            0: { items: 1 },
            576: { items: 1 },
            768: { items: 2 },
            992: { items: 2 },
          },
        });
      }

      return true;
    };

    // Try to initialize immediately
    if (initScripts()) {
      return () => {
        // Cleanup CSS links
        try {
          if (link1 && document.head.contains(link1))
            document.head.removeChild(link1);
          if (link2 && document.head.contains(link2))
            document.head.removeChild(link2);
        } catch (e) {
          // Ignore cleanup errors
        }
      };
    }

    // If scripts not loaded, wait for them
    checkInterval = setInterval(() => {
      if (initScripts()) {
        if (checkInterval) clearInterval(checkInterval);
      }
    }, 100);

    // Cleanup after 10 seconds
    timeout = setTimeout(() => {
      if (checkInterval) clearInterval(checkInterval);
    }, 10000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeout) clearTimeout(timeout);
      // Cleanup CSS links
      try {
        if (link1 && document.head.contains(link1))
          document.head.removeChild(link1);
        if (link2 && document.head.contains(link2))
          document.head.removeChild(link2);
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Auto-show modal after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isNotFound) {
    notFound();
    return null;
  }

  return (
    <>
      {(pathParam === "4" ||
        pathParam === "5" ||
        pathParam === "6" ||
        pathParam === "7") && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-17892647835"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-17892647835');
              `}
          </Script>
        </>
      )}
      <Navbar onEnquireClick={openModal} />
      <ContactModal
        isOpen={isModalOpen}
        onClose={closeModal}
        pathParam={pathParam}
      />

      {/* Hero Section */}
      <section id="hero-section">
        <div className="hero-overlay"></div>
        <div className="container-fluid px-0">
          <div className="hero-wrapper">
            <div className="hero-content-area">
              <div className="hero-title-block">
                <h1 className="hero-main-title">Eldeco Camelot</h1>
                <div className="hero-location-tag">
                  <i className="fa-solid fa-location-dot"></i> At Sector 17,
                  Dwarka Delhi
                </div>
                <p className="hero-description">
                  Where Living Rises Into Legend <br />3 & 4 BR Luxury
                  Residences
                </p>
                <div className="hero-cta-wrapper">
                  <a
                    href="#"
                    className="cta-primary-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal();
                    }}
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            </div>
            <ContactForm formType="hero" pathParam={pathParam} />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section">
        <div className="container">
          <div className="hero-form-wrapper d-block d-lg-none mb-4">
            <ContactForm formType="hero" pathParam={pathParam} />
          </div>
          <div className="row align-items-center flex-row-reverse">
            <div className="col-lg-6">
              <div className="about-image-wrapper">
                <img
                  src="/landing-pages/eldeco-camelot/img/s2nimg.jpg"
                  alt="Overview Image"
                  width={800}
                  height={600}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-text-content text-start text-lg-start p-lg-4">
                <h2 className="about-main-heading">
                  Live the Legend At Eldeco Camelot
                </h2>
                <div className="location-tag">
                  <i className="fa-solid fa-location-dot"></i> At Sector 17,
                  Dwarka Delhi
                </div>
                <p className="about-description">
                  Eldeco Camelot, is an ultra-luxurious residential development
                  by the renowned Eldeco Group in Sector 17, Dwarka, Delhi. The
                  project offers well-designed 3 & 4 BR Luxury Residences with a
                  three-side open area, sitout, and scenic views of the large
                  lush green area and sports complex to the high-class
                  homebuyers of Delhi and around the location. <br />
                  Strategically located near the Dwarka Expressway, IGI Airport,
                  and key business hubs, Eldeco Camelot perfectly blends the
                  essence of luxury living with everyday necessities, making it
                  a highly prestigious residential location within Dwarka.
                </p>
                <div className="cta-button-wrapper">
                  <a
                    href="#"
                    className="cta-primary-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal();
                    }}
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="section-main-title">Price List</h2>
            <p className="section-subtitle">
              Proposed Area & Pricing Of Luxury Launch
            </p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-10 col-md-12">
              <div className="price-box-container">
                <div className="price-boxes-grid">
                  <div className="price-box price-box-upper">
                    <h3 className="unit-type">3 BHK + Servant</h3>
                    <p className="project-name-text">Eldeco Camelot</p>
                    <div className="divider-line"></div>
                    <p className="price-amount">₹ 8.26 CR* Onwards</p>
                    <p className="unit-size">Size: 2,800 Sq.Ft</p>
                  </div>
                  <div className="price-box price-box-upper">
                    <h3 className="unit-type">4 BHK + Servant</h3>
                    <p className="project-name-text">Eldeco Camelot</p>
                    <div className="divider-line"></div>
                    <p className="price-amount">₹ On Request</p>
                    <p className="unit-size">Size: 3,600 Sq.Ft</p>
                  </div>
                  {/* <div className="price-box price-box-lower">
                                        <h3 className="unit-type">3 BHK + Servant</h3>
                                        <p className="project-name-text">Eldeco Camelot</p>
                                        <div className="divider-line"></div>
                                        <p className="price-amount">₹ 7.42 CR* Onwards</p>
                                        <p className="unit-size">Size: 2,800 Sq.Ft</p>
                                    </div>
                                    <div className="price-box price-box-lower">
                                        <h3 className="unit-type">4 BHK + Servant</h3>
                                        <p className="project-name-text">Eldeco Camelot</p>
                                        <div className="divider-line"></div>
                                        <p className="price-amount">₹ On Request</p>
                                        <p className="unit-size">Size: 3,600 Sq.Ft</p>
                                    </div> */}
                </div>
                <div
                  className="price-box-footer"
                  style={{ cursor: "pointer" }}
                  onClick={openModal}
                >
                  <a
                    href="#"
                    className="enquiry-link-btn"
                    onClick={(e) => e.preventDefault()}
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Features Section */}
      <section id="project-features-section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6 order-lg-2">
              <div className="features-image-wrapper">
                <div className="image-overlay-effect"></div>
                <img
                  src="/landing-pages/eldeco-camelot/img/s3nimg.jpg"
                  alt="Project Features"
                  className="features-image"
                  width={800}
                  height={600}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="image-border-accent"></div>
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="features-content-area">
                <div className="section-label">Location Benefits</div>
                <h2 className="features-heading">Why Choose Eldeco Camelot?</h2>
                <p className="features-intro-text">
                  Discover the exceptional advantages of our prime location
                </p>
                <div className="features-list-container">
                  <div className="feature-item-wrapper">
                    <div className="feature-icon-container">
                      <div className="icon-bg-circle"></div>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className="feature-text-wrapper">
                      <span className="feature-text">
                        95 exclusive units in just two iconic towers
                      </span>
                    </div>
                  </div>
                  <div className="feature-item-wrapper">
                    <div className="feature-icon-container">
                      <div className="icon-bg-circle"></div>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className="feature-text-wrapper">
                      <span className="feature-text">
                        Large apartments with three sides that are open and
                        corners
                      </span>
                    </div>
                  </div>
                  <div className="feature-item-wrapper">
                    <div className="feature-icon-container">
                      <div className="icon-bg-circle"></div>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className="feature-text-wrapper">
                      <span className="feature-text">
                        Wrap-around balconies with 270-degree green views
                      </span>
                    </div>
                  </div>
                  <div className="feature-item-wrapper">
                    <div className="feature-icon-container">
                      <div className="icon-bg-circle"></div>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className="feature-text-wrapper">
                      <span className="feature-text">
                        Sun facing central courtyard for ventilation & natural
                        light
                      </span>
                    </div>
                  </div>
                  <div className="feature-item-wrapper">
                    <div className="feature-icon-container">
                      <div className="icon-bg-circle"></div>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div className="feature-text-wrapper">
                      <span className="feature-text">
                        Low-density living with just 2 or 3 apartments per floor
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery-section">
        <div className="container">
          <div className="gallery-header-section">
            <div className="gallery-label-badge">Visual Showcase</div>
            <h2 className="gallery-main-heading">Our Gallery</h2>
            <p className="gallery-subtitle-text">
              Explore the beauty and elegance of our premium residential project
            </p>
          </div>
          <div className="gallery-carousel-container">
            <div className="owl-carousel gallery-slider">
              <div className="gallery-image-item">
                <div className="gallery-image-wrapper">
                  <img
                    src="/landing-pages/eldeco-camelot/img/eldeco-g-1.webp"
                    alt="Gallery Image 1"
                    className="gallery-img"
                    width={800}
                    height={600}
                    style={{
                      width: "100%",
                      height: "480px !important",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              <div className="gallery-image-item">
                <div className="gallery-image-wrapper">
                  <img
                    src="/landing-pages/eldeco-camelot/img/eldeco-g-2.webp"
                    alt="Gallery Image 2"
                    className="gallery-img"
                    width={800}
                    height={600}
                    style={{
                      width: "100%",
                      height: "480px !important",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              <div className="gallery-image-item">
                <div className="gallery-image-wrapper">
                  <img
                    src="/landing-pages/eldeco-camelot/img/eldeco-g-3.webp"
                    alt="Gallery Image 3"
                    className="gallery-img"
                    width={800}
                    height={600}
                    style={{
                      width: "100%",
                      height: "480px !important",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              <div className="gallery-image-item">
                <div className="gallery-image-wrapper">
                  <img
                    src="/landing-pages/eldeco-camelot/img/eldeco-g-4.webp"
                    alt="Gallery Image 4"
                    className="gallery-img"
                    width={800}
                    height={600}
                    style={{
                      width: "100%",
                      height: "480px !important",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              <div className="gallery-image-item">
                <div className="gallery-image-wrapper">
                  <img
                    src="/landing-pages/eldeco-camelot/img/eldeco-g-5.webp"
                    alt="Gallery Image 5"
                    className="gallery-img"
                    width={800}
                    height={600}
                    style={{
                      width: "100%",
                      height: "480px !important",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              <div className="gallery-image-item">
                <div className="gallery-image-wrapper">
                  <img
                    src="/landing-pages/eldeco-camelot/img/eldeco-g-6.webp"
                    alt="Gallery Image 6"
                    className="gallery-img"
                    width={800}
                    height={600}
                    style={{
                      width: "100%",
                      height: "480px !important",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="gallery-nav-button gallery-nav-prev">
              <FontAwesomeIcon icon={faChevronLeft} />
            </div>
            <div className="gallery-nav-button gallery-nav-next">
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location-section" className="location-section-area">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6 order-lg-1">
              <div className="location-map-container">
                <div className="map-image-wrapper">
                  <img
                    src="/landing-pages/eldeco-camelot/img/MAP.webp"
                    alt="Location Map"
                    className="location-map-img"
                    width={800}
                    height={600}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="map-overlay-effect"></div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-lg-2">
              <div className="location-content-block">
                <div className="location-section-label">Connectivity</div>
                <h2 className="location-main-heading">
                  Prime Location Advantage
                </h2>
                <p className="location-description-text">
                  Experience the perfect balance of spiritual serenity and
                  modern convenience.
                </p>
                <div className="location-benefits-list">
                  <div className="benefit-item-card">
                    <div className="benefit-icon-wrapper">
                      <i className="fa fa-check-circle"></i>
                    </div>
                    <div className="benefit-text-wrapper">
                      <span className="benefit-text">
                        Dwarka Sector 13 Metro Station - 1.9 km
                      </span>
                    </div>
                  </div>
                  <div className="benefit-item-card">
                    <div className="benefit-icon-wrapper">
                      <i className="fa fa-check-circle"></i>
                    </div>
                    <div className="benefit-text-wrapper">
                      <span className="benefit-text">
                        Dwarka Expressway – 6.3
                      </span>
                    </div>
                  </div>
                  <div className="benefit-item-card">
                    <div className="benefit-icon-wrapper">
                      <i className="fa fa-check-circle"></i>
                    </div>
                    <div className="benefit-text-wrapper">
                      <span className="benefit-text">
                        IGI Airport & Aerocity - 12 km
                      </span>
                    </div>
                  </div>
                  <div className="benefit-item-card">
                    <div className="benefit-icon-wrapper">
                      <i className="fa fa-check-circle"></i>
                    </div>
                    <div className="benefit-text-wrapper">
                      <span className="benefit-text">
                        Yashobhoomi Convention Centre - 6 km
                      </span>
                    </div>
                  </div>
                  <div className="benefit-item-card">
                    <div className="benefit-icon-wrapper">
                      <i className="fa fa-check-circle"></i>
                    </div>
                    <div className="benefit-text-wrapper">
                      <span className="benefit-text">
                        DDA Golf Course, Dwarka – 4 km
                      </span>
                    </div>
                  </div>
                </div>
                <div className="location-cta-wrapper mt-4">
                  <a
                    href="#"
                    className="cta-primary-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal();
                    }}
                  >
                    <i className="fa-solid fa-map-location-dot me-2"></i> View
                    Location
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
