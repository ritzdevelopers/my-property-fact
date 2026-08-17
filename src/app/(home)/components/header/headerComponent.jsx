"use client";
import Link from "next/link";
import "./header.css";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "react-bootstrap";
import BrokerLoginModal from "../_homecomponents/BrokerLoginModal";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronDown,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  buildProjectImageUrl,
  DEFAULT_PROJECT_CARD_IMAGE,
} from "@/lib/projectImageUrl";
import { useRouter } from "next/navigation";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import { motion } from "framer-motion";

const LOGO_ON_LIGHT = "/logo.webp";
const LOGO_ON_DARK = "/logo.webp";

const NewBadge = ({ isVisible }) => (
  <span className="city-dropdown-badge">
    {["N", "e", "w"].map((char, i) => (
      <motion.span
        key={i}
        className="new-char"
        initial={{ opacity: 0, y: 6, scale: 0.8 }}
        animate={
          isVisible
            ? {
              opacity: [0, 1, 1, 0],
              y: [6, 0, 0, 6],
              scale: [0.8, 1, 1, 0.8],
            }
            : { opacity: 0, y: 6, scale: 0.8 }
        }
        transition={
          isVisible
            ? {
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 0.5,
              delay: i * 0.15,
              times: [0, 0.12, 0.75, 0.9],
              ease: "easeInOut",
            }
            : { duration: 0.2 }
        }
      >
        {char}
      </motion.span>
    ))}
  </span>
);

const HeaderComponent = () => {
  const { cityList = [], projectTypes = [], builderList = [], projectList = [], searchProjects } = useSiteData();
  const [isMounted, setIsMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [isNavDropdownDismissed, setIsNavDropdownDismissed] = useState(false);
  const [showBrokerLoginModal, setShowBrokerLoginModal] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");
  const pathname = usePathname();
  const router = useRouter();

  // Defer dropdown content until after mount to avoid hydration mismatch (data + motion)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if the pathname starts with /city/
  const isCityRoute = pathname.startsWith("/city");
  const isBuilderRoute = pathname.startsWith("/builder");
  const isProjectTypeRoute =
    pathname.startsWith("/projects") ||
    // Any internal listing URL like /food-court-in-delhi, /3-bhk-in-noida, etc.
    pathname.includes("-in-") ||
    pathname.startsWith("/apartments-in-") ||
    pathname.startsWith("/flats-in-") ||
    pathname.startsWith("/new-projects-in-") ||
    pathname.startsWith("/commercial-property-in-") ||
    pathname.startsWith("/offices-and-shop-in-");
  const isBlogTypeRoute = pathname.startsWith("/blog");
  const isPropertiesRoute = pathname === "/properties";
  const isAboutUsRoute = pathname === "/about-us";
  const isHomePage = pathname === "/";
  const logoOpensInNewTab = !isHomePage;
  //Defining scroll variable
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverLightSection, setIsOverLightSection] = useState(false);
  const [isConditionalHeader, setIsConditionalHeader] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true); // hide on scroll down, show on scroll up
  // Project search state
  const [projectSearchInput, setProjectSearchInput] = useState("");
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [projectSearchResults, setProjectSearchResults] = useState([]);
  const [isSearchingProjects, setIsSearchingProjects] = useState(false);
  const [imageErrors, setImageErrors] = useState({}); // Track image errors per project
  const [searchResultsSlideIndex, setSearchResultsSlideIndex] = useState(0);
  const [mobileSearchSlideIndex, setMobileSearchSlideIndex] = useState(0);
  const projectsDropdownRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const projectSearchInputRef = useRef(null);
  const mobileProjectSearchInputRef = useRef(null);

  // Format price for display (lakh/cr) - same as PropertyContainer
  const formatProjectPrice = (price) => {
    if (price == null || price === "") return "";
    if (/[a-zA-Z]/.test(String(price))) return price;
    const num = parseFloat(price);
    return num < 1
      ? "₹ " + Math.round(num * 100) + " Lakh*"
      : "₹ " + num + " Cr+*";
  };

  // Get image URL for a project (using project banner image)
  const getProjectImageSrc = (project) => {
    const projectId = project.id || project.slugURL;
    if (imageErrors[projectId]) {
      return DEFAULT_PROJECT_CARD_IMAGE;
    }
    return buildProjectImageUrl(project, { preferThumbnail: true });
  };

  // Handle image error
  const handleImageError = (projectId) => {
    setImageErrors((prev) => ({ ...prev, [projectId]: true }));
  };
  const openMenuMobile = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleNavDropdownLinkClick = () => {
    setIsNavDropdownDismissed(true);
    setIsDropdownHovered(false);
  };

  const handleNavDropdownMouseLeave = () => {
    setIsNavDropdownDismissed(false);
    setIsDropdownHovered(false);
  };

  useEffect(() => {
    setIsNavDropdownDismissed(true);
    setIsDropdownHovered(false);
  }, [pathname]);

  //Hadling header fixed - only when mobile menu is not open
  useEffect(() => {
    const handleScroll = () => {
      // Check if mobile menu is open
      const menu = document.getElementById("mbdiv");
      const isMenuOpen = menu && menu.classList.contains("active");

      // Prevent scrolling when menu is open
      if (isMenuOpen) {
        // Restore scroll position if it changed
        window.scrollTo(0, scrollPositionRef.current);
        return;
      }

      // Only update scroll state if menu is not open
      if (!isMenuOpen) {
        const currentY = window.scrollY;
        if (currentY > 100) {
          setIsScrolled(true);
          // Hide header when scrolling down, show when scrolling up
          const scrollDelta = 60; // min px moved to trigger
          if (currentY > lastScrollYRef.current + scrollDelta) {
            setHeaderVisible(false);
            lastScrollYRef.current = currentY;
          } else if (currentY < lastScrollYRef.current - scrollDelta) {
            setHeaderVisible(true);
            lastScrollYRef.current = currentY;
          }
        } else {
          setIsScrolled(false);
          setHeaderVisible(true);
          lastScrollYRef.current = currentY;
        }
      }
    };

    // Also prevent scroll events on touch devices - but allow scrolling in dropdowns
    const preventScroll = (e) => {
      const menu = document.getElementById("mbdiv");
      const isMenuOpen = menu && menu.classList.contains("active");
      if (isMenuOpen) {
        // Check if the touch is inside a scrollable dropdown menu
        const target = e.target;
        const dropdownUl = target.closest(
          ".bigMenuList .dropdown.activeHeader ul",
        );
        const dropdownContainer = target.closest(
          ".bigMenuList .dropdown.activeHeader",
        );

        // Allow scrolling inside dropdown menus - don't prevent default
        if (dropdownUl || dropdownContainer) {
          // Don't prevent default - allow natural scrolling
          return; // Exit early without preventing
        }

        // Check if touch is inside the main menu scroller or any menu content
        const isInsideMenu = target.closest(".mbMenuContainer .mbMenu");
        if (isInsideMenu) {
          // Allow scrolling in main menu container and all its children
          return; // Don't prevent - allow scrolling
        }

        // Only prevent scrolling on backdrop/container (outside menu)
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Handle resize to close mobile menu on desktop
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        const menu = document.getElementById("mbdiv");
        const menuButtons = document.getElementsByClassName("menuBtn");
        if (menu && menu.classList.contains("active")) {
          // Close the menu
          for (let i = 0; i < menuButtons.length; i++) {
            menuButtons[i].classList.remove("closeMenuBtn");
          }
          menu.style.display = "none";
          menu.classList.remove("active");
          document.body.classList.remove("menu-open");

          // Remove notfixed class from header
          const header = document.querySelector(".header");
          if (header) {
            header.classList.remove("notfixed");
          }

          // Restore body scroll
          document.body.style.overflow = "";
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          document.body.style.height = "";
          document.documentElement.style.overflow = "";
          document.documentElement.style.height = "";

          // Restore scroll position
          window.scrollTo(0, scrollPositionRef.current);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: false });
    window.addEventListener("wheel", preventScroll, { passive: false });
    // Use capture phase to check before other handlers
    window.addEventListener("touchmove", preventScroll, {
      passive: false,
      capture: true,
    });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Dark header once the white "Property Search" band reaches it.
  useEffect(() => {
    if (!isHomePage) {
      setIsOverLightSection(false);
      return undefined;
    }

    let raf = 0;
    const update = () => {
      const section = document.querySelector(".transform-home-section");
      const header = document.querySelector(".header");
      if (!section || !header) {
        setIsOverLightSection(false);
        return;
      }
      const expectedBottom = header.offsetHeight;
      const sectionTop = section.getBoundingClientRect().top;
      setIsOverLightSection(sectionTop <= expectedBottom + 8);
    };
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [isHomePage]);

  const openMenu = () => {
    const menuButtons = document.getElementsByClassName("menuBtn");
    const menu = document.getElementById("mbdiv");
    // Check if the menu is already open
    const isMenuOpen = menu.classList.contains("active");

    if (isMenuOpen) {
      // Close the menu
      for (let i = 0; i < menuButtons.length; i++) {
        menuButtons[i].classList.remove("closeMenuBtn");
      }
      menu.style.display = "none";
      menu.classList.remove("active");
      document.body.classList.remove("menu-open");

      // Toggle className for .header
      const header = document.querySelector(".header");
      if (header) {
        header.classList.remove("notfixed");
      }

      // Restore body scroll
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";

      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
    } else {
      // Open the menu
      for (let i = 0; i < menuButtons.length; i++) {
        menuButtons[i].classList.add("closeMenuBtn");
      }
      menu.style.display = "block";
      menu.classList.add("active");
      document.body.classList.add("menu-open");

      // Toggle className for .header
      const header = document.querySelector(".header");
      if (header) {
        header.classList.add("notfixed");
      }

      // Prevent body scroll - save current scroll position
      scrollPositionRef.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100%";
    }
  };

  const openBrokerLoginModal = () => {
    setShowBrokerLoginModal(true);
  };

  // Handle Project Search - keep typing responsive by debouncing actual search work
  useEffect(() => {
    const query = projectSearchInput.trim();
    if (query.length < 2) {
      setProjectSearchQuery("");
      setProjectSearchResults([]);
      setIsSearchingProjects(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      const q = projectSearchInput.trim();
      if (q.length < 2) {
        setProjectSearchQuery("");
        setProjectSearchResults([]);
        setIsSearchingProjects(false);
        return;
      }
      setProjectSearchQuery(q);
      setIsSearchingProjects(true);
      Promise.resolve(searchProjects(q)).then((filtered) => {
        setProjectSearchResults(filtered || []);
        setIsSearchingProjects(false);
      }).catch(() => {
        setProjectSearchResults([]);
        setIsSearchingProjects(false);
      });
    }, 280);
    return () => clearTimeout(timeoutId);
  }, [projectSearchInput, searchProjects]);

  /** Open project detail in a new tab (header search bar). */
  const openProjectInNewTab = (project) => {
    if (!project?.slugURL || typeof window === "undefined") return;
    window.open(`/${project.slugURL}`, "_blank", "noopener,noreferrer");
    setProjectSearchInput("");
    setProjectSearchQuery("");
    setProjectSearchResults([]);
  };

  const handleProjectClick = (project) => {
    openProjectInNewTab(project);
  };

  // Handle Explore button click
  const handleExploreClick = () => {
    const searchValue = projectSearchInput.trim();
    if (projectSearchResults.length > 0 && projectSearchResults[0]?.slugURL) {
      openProjectInNewTab(projectSearchResults[0]);
    } else if (searchValue.length >= 2) {
      // Navigate to projects page with search query
      router.push(`/projects?search=${encodeURIComponent(searchValue)}`);
      setProjectSearchInput("");
      setProjectSearchQuery("");
      setProjectSearchResults([]);
    }
  };

  // Reset search results slide when results change
  useEffect(() => {
    setSearchResultsSlideIndex(0);
    setMobileSearchSlideIndex(0);
  }, [projectSearchResults]);

  // Back to search (desktop focuses desktop input; mobile caller can focus mobile input)
  const handleBackToSearch = () => {
    setProjectSearchInput("");
    setProjectSearchQuery("");
    setProjectSearchResults([]);
    setSearchResultsSlideIndex(0);
    setMobileSearchSlideIndex(0);
    const isMobileMenuOpen = typeof document !== "undefined" && document.getElementById("mbdiv")?.classList.contains("active");
    setTimeout(() => {
      if (isMobileMenuOpen && mobileProjectSearchInputRef.current) {
        mobileProjectSearchInputRef.current.focus();
      } else {
        projectSearchInputRef.current?.focus();
      }
    }, 100);
  };

  // Reset search when dropdown closes
  useEffect(() => {
    const handleMouseLeave = () => {
      // Reset search when mouse leaves the projects dropdown area
      setTimeout(() => {
        const projectsLi = document.querySelector(
          ".hasChild:has(.projects-dropdown)",
        );
        const isHovering =
          projectsLi?.matches(":hover") ||
          projectsDropdownRef.current?.matches(":hover");
        if (!isHovering) {
          setProjectSearchInput("");
          setProjectSearchQuery("");
          setProjectSearchResults([]);
        }
      }, 200);
    };

    const projectsLi = document.querySelector(
      ".hasChild:has(.projects-dropdown)",
    );
    if (projectsLi) {
      projectsLi.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        projectsLi.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mpf_header_city");
      if (saved) setSelectedCity(saved);
    } catch {
      /* ignore */
    }

    if (!navigator.geolocation) {
      setSelectedCity((current) => current || "Delhi NCR");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          console.log("Coordinates:", coords.latitude, coords.longitude);

          const response = await fetch(
            `/api/home/recommended-by-location?lat=${coords.latitude}&lon=${coords.longitude}&intent=projects`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch location");
          }

          const data = await response.json();

          if (data.success && data.region?.city) {
            setSelectedCity(data.region.city);
            try {
              window.localStorage.setItem("mpf_header_city", data.region.city);
            } catch {
              /* ignore */
            }
          } else {
            setSelectedCity("Delhi NCR");
          }
        } catch (error) {
          console.error("Location Error:", error);
          setSelectedCity("Delhi NCR");
        }
      },
      (error) => {
        console.error("Geolocation Error:", error);
        setSelectedCity("Delhi NCR");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowLocationDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowLocationDropdown(false);
    }, 200);
  };

  const handleCityClick = (city) => {
    console.log("Clicked city:", city);

    setSelectedCity(city.cityName);
    setShowLocationDropdown(false);

    window.dispatchEvent(
      new CustomEvent("cityChanged", {
        detail: city,
      })
    );

    document
      .getElementById("recommended-projects")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <>
      <div
        className={`d-flex justify-content-between align-items-center px-2 px-lg-4 header ${isHomePage ? "header--home-ss" : ""} ${isScrolled ? "fixed-header" : ""
          } ${isOverLightSection ? "header--on-light" : ""} ${isPropertiesRoute ? "properties-header" : ""} ${isProjectTypeRoute || isCityRoute || isBuilderRoute ? "projects-header" : ""} ${isAboutUsRoute ? "about-us-header" : ""} ${pathname.includes("/properties/") ? "conditional-header" : ""} ${!headerVisible ? "header-hidden" : ""}`}
      >
        <div className={`container d-flex justify-content-between align-items-center${isHomePage ? " header-home-ss__container" : ""}`}>
          <div className="mpf-logo d-flex align-items-center gap-3">
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
              title="My Property Fact Home"
              aria-label="My Property Fact Home"
              className={isHomePage ? "mpf-header-brand" : undefined}
              {...(logoOpensInNewTab
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {isHomePage ? (
                <span className="mpf-header-logo-swap">
                  <img
                    loading="eager"
                    src={LOGO_ON_LIGHT}
                    alt="My Property Fact logo — main site header"
                    title="My Property Fact logo — main site header"
                    className="mpf-header-logo-img mpf-header-logo-img--black-text"
                    height={58}
                    width={62}
                    fetchPriority="high"
                    decoding="async"
                  />
                  <img
                    loading="eager"
                    src={LOGO_ON_DARK}
                    alt=""
                    aria-hidden="true"
                    className="mpf-header-logo-img mpf-header-logo-img--color-text"
                    height={58}
                    width={62}
                    decoding="async"
                  />
                </span>
              ) : (
                <img loading="eager"
                  src={LOGO_ON_DARK}
                  alt="My Property Fact logo — main site header"
                  title="My Property Fact logo — main site header"
                  height={74}
                  width={80}
                  fetchPriority="low"
                  decoding="async"
                />
              )}
            </Link>
            {isHomePage ? (
              <div
                className="mpf-header-location-dropdown"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className="mpf-header-location-pill"
                  title="Browse Cities"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle
                      cx="12"
                      cy="10"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>

                  <span>{selectedCity}</span>

                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {showLocationDropdown && (
                  <div className="mpf-location-dropdown-menu">
                    {cityList?.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        className="mpf-location-dropdown-item"
                        onClick={() => handleCityClick(city)}
                      >
                        {city.cityName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <nav className="d-none d-lg-flex flex-grow-1 justify-content-end align-items-center">
            <div className={`menu position-relative${isHomePage ? " header-home-ss__menu" : ""}`}>
              <ul className="d-flex gap-5 m-0 align-items-center header-links list-unstyled fw-bold">
                <li
                  className={`hasChild header-nav-cities${isNavDropdownDismissed ? " nav-dropdown-dismissed" : ""}`}
                  onMouseEnter={() => {
                    setIsDropdownHovered(true);
                    setIsNavDropdownDismissed(false);
                  }}
                  onMouseLeave={handleNavDropdownMouseLeave}
                >
                  <button
                    type="button"
                    className={`text-light text-decoration-none py-3 plus-jakarta-sans-semi-bold header-nav-dropdown-trigger${isCityRoute ? " header-link-active" : ""
                      }`}
                    title="Browse cities — open city menu"
                    aria-haspopup="true"
                  >
                    Cities
                  </button>
                  <div className="dropdown dropdown-lg z-3 city-dropdown">
                    {!isMounted || !cityList?.length ? (
                      <div className="d-flex align-items-center justify-content-center p-3">
                        <Spinner animation="border" variant="light" />
                      </div>
                    ) : (
                      <>
                        <div className="city-dropdown-content">
                          <div className="city-dropdown-left">
                            <Link
                              href="/projects/commercial"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                              title="Commercial projects"
                            >
                              Commercial
                            </Link>
                            <Link
                              href="/projects/residential"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                              title="Residential projects"
                            >
                              Residential
                            </Link>
                            <Link
                              href="/projects/new-launches"
                              className="city-dropdown-item with-badge plus-jakarta-sans-semi-bold"
                              title="New launch projects"
                            >
                              New Launches{" "}
                              <NewBadge isVisible={isDropdownHovered} />
                            </Link>
                            <Link
                              href="/blog"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                              title="Articles and news"
                            >
                              Articles &amp; News
                            </Link>
                          </div>
                          <ul className="list-inline city-dropdown-right">
                            {cityList?.map((city) => (
                              <li key={city.id}>
                                <Link
                                  href={`/city/${city.slugURL}`}
                                  prefetch={false}
                                  onClick={handleNavDropdownLinkClick}
                                  className={`text-light text-decoration-none plus-jakarta-sans-semi-bold ${pathname === "/city/" + city.slugURL
                                    ? "header-link-active"
                                    : ""
                                    }`}
                                  title={`${city.cityName} properties`}
                                >
                                  {city.cityName}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="dropdown-footer-bar city-dropdown-footer-bar">
                          <div className="dropdown-footer-left">
                            <span className="dropdown-footer-label">Contact Us</span>
                            <span className="dropdown-footer-phone">
                              <img src="/static/icon/Vector (1).svg" alt="Phone Icon" title="Phone Icon" className="dropdown-footer-phone-icon" />
                              8920024793
                            </span>
                          </div>
                          <div className="dropdown-footer-right-wrapper">

                            <p className="dropdown-footer-right">
                              Email us at social@mypropertyfact.com
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </li>
                <li
                  className={`hasChild header-nav-builders${isNavDropdownDismissed ? " nav-dropdown-dismissed" : ""}`}
                  onMouseEnter={() => {
                    setIsDropdownHovered(true);
                    setIsNavDropdownDismissed(false);
                  }}
                  onMouseLeave={handleNavDropdownMouseLeave}
                >
                  <button
                    type="button"
                    className={`text-light py-3 text-decoration-none plus-jakarta-sans-semi-bold header-nav-dropdown-trigger ${isBuilderRoute ? "header-link-active" : ""
                      }`}
                    title="Browse builders — open builder menu"
                    aria-haspopup="true"
                  >
                    Builders
                  </button>
                  <div className="dropdown dropdown-lg z-3 builder-dropdown">
                    {!isMounted || builderList.length === 0 ? (
                      <div className="d-flex align-items-center justify-content-center p-3">
                        <Spinner animation="border" variant="light" />
                      </div>
                    ) : (
                      <>
                        <div className="city-dropdown-content">
                          <div className="city-dropdown-left">
                            <Link
                              href="/projects/commercial"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                              prefetch={true}
                              title="Commercial projects"
                            >
                              Commercial
                            </Link>
                            <Link
                              href="/projects/residential"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                              prefetch={true}
                              title="Residential projects"
                            >
                              Residential
                            </Link>
                            <Link
                              href="/projects/new-launches"
                              className="city-dropdown-item with-badge plus-jakarta-sans-semi-bold"
                              prefetch={true}
                              title="New launch projects"
                            >
                              New Launches{" "}
                              <NewBadge isVisible={isDropdownHovered} />
                            </Link>
                            <Link
                              href="/blog"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                              title="Articles and news"
                            >
                              Articles &amp; News
                            </Link>
                          </div>
                          <ul className="list-inline city-dropdown-right">
                            {builderList?.map((builder) => (
                              <li key={builder.id}>
                                <Link
                                  href={`/builder/${builder.slugUrl}`}
                                  onClick={handleNavDropdownLinkClick}
                                  className={`text-light text-decoration-none plus-jakarta-sans-semi-bold ${pathname === "/builder/" + builder.slugUrl
                                    ? "header-link-active"
                                    : ""
                                    }`}
                                  title={`${builder.builderName} projects`}
                                >
                                  {builder.builderName.toLowerCase()}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="dropdown-footer-bar">
                          <div className="dropdown-footer-left">
                            <span className="dropdown-footer-label">Contact Us</span>
                            <span className="dropdown-footer-phone">
                              <img src="/static/icon/Vector (1).svg" alt="Phone Icon" title="Phone Icon" className="dropdown-footer-phone-icon" />
                              8920024793
                            </span>
                          </div>
                          <div className="dropdown-footer-right-wrapper">
                            <p className="dropdown-footer-right">
                              Email us at social@mypropertyfact.com
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </li>
                <li className="hasChild header-nav-about">
                  <Link
                    href="/about-us"
                    className={`text-light py-3  text-decoration-none plus-jakarta-sans-semi-bold${pathname === "/about-us" ? "header-link-active" : ""
                      }`}
                    title="About Us"
                  >
                    About Us
                  </Link>
                </li>
                {/* {isHomePage ? (
                  <li className="hasChild header-nav-resources">
                    <Link
                      href="/blog"
                      className={`text-light py-3 text-decoration-none plus-jakarta-sans-semi-bold d-inline-flex align-items-center gap-1${isBlogTypeRoute ? " header-link-active" : ""}`}
                      title="Resources"
                    >
                      Resources
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </Link>
                  </li>
                ) : null} */}
                <li className="hasChild header-nav-blog">
                  <Link
                    href="/blog"
                    className={`text-light py-3  text-decoration-none plus-jakarta-sans-semi-bold${isBlogTypeRoute ? "header-link-active" : ""
                      }`}
                    title="Blog"
                  >
                    Blog
                  </Link>
                </li>
                <li className={`hasChild header-nav-join${isHomePage ? " header-nav-hide-home" : ""}`}>
                  <Link
                    href="/join-our-team"
                    className={`text-light py-3 text-decoration-none plus-jakarta-sans-semi-bold${pathname === "/join-our-team" ? "header-link-active" : ""
                      }`}
                    title="Join Our Team"
                  >
                    Join Our Team
                  </Link>
                </li>
                <li className="hasChild header-nav-contact">
                  <Link
                    href="/contact-us"
                    className={`text-light py-3 text-decoration-none plus-jakarta-sans-semi-bold${pathname === "/contact-us" ? "header-link-active" : ""
                      }`}
                    title={isHomePage ? "Contact" : "Contact Us"}
                  >
                    {isHomePage ? "Contact" : "Contact Us"}
                  </Link>
                </li>
              </ul>
            </div>
            {isHomePage ? (
              <div className="mpf-header-home-actions d-none d-lg-flex align-items-center">
                <a href="tel:+918920024793" className="mpf-header-phone" title="Sales enquiry">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.89.32 1.76.6 2.6a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.48-1.17a2 2 0 012.11-.45c.84.28 1.71.48 2.6.6A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="mpf-header-phone__copy">
                    <strong>+91 8920 024 793</strong>
                    <small>Sales Enquiry</small>
                  </span>
                </a>
                <Link href="/contact-us" className="mpf-header-callback-btn" title="Request callback">
                  Request Callback
                </Link>
              </div>
            ) : null}
            {/* Hidden until portal launch (next month)
            <button
              type="button"
              className="header-post-property-cta"
              onClick={openBrokerLoginModal}
              title="Post a property for free — broker login"
            >
              <span className="header-post-property-cta__text">Post a Property</span>
              <span className="header-post-property-cta__badge">FREE</span>
            </button>
            */}
          </nav>
          <div className="menuBtn d-flex d-lg-none " onClick={openMenu}>
            <span id="menuLine1"></span>
            <span id="menuLine2"></span>
            <span id="menuLine3"></span>
          </div>
        </div>
      </div>
      <div
        className="mbMenuContainer"
        id="mbdiv"
        onClick={(e) => {
          // Close menu if clicking on the backdrop (container), not on the menu panel
          if (e.target.id === "mbdiv") {
            openMenu();
          }
        }}
      >
        <div className="mbMenu" onClick={(e) => e.stopPropagation()}>
          {/* Mobile Menu Header with Logo and Close Button */}
          <div className="mobile-menu-header">
            <Link
              href="/"
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                openMenu();
              }}
              className="mobile-menu-logo"
              title="My Property Fact Home"
              aria-label="My Property Fact Home"
              {...(logoOpensInNewTab
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <img
                src="/logo.webp"
                alt="My Property Fact logo — site header mobile menu"
                title="My Property Fact logo — site header mobile menu"
                height={50}
                width={55}
              />
            </Link>
            <button
              className="mobile-menu-close-btn"
              onClick={openMenu}
              aria-label="Close menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <div className="h-100 scroller">
            {/* Mobile Projects Search - aligned with desktop */}
            <div className="mobile-projects-search">
              {!(projectSearchQuery.trim().length >= 2 && projectSearchResults.length > 0 && !isSearchingProjects) && (
                <>
                  <p className="mobile-projects-search-title plus-jakarta-sans-semi-bold">
                    Search Your Dream Home
                  </p>
                  <div className="mobile-projects-search-container">
                    <div className="mobile-projects-search-input-wrapper">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="mobile-projects-search-icon"
                      />
                      <input
                        ref={mobileProjectSearchInputRef}
                        type="text"
                        placeholder="Search"
                        className="mobile-projects-search-input"
                        value={projectSearchInput}
                        onChange={(e) => setProjectSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleExploreClick();
                            openMenu();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="mobile-projects-explore-btn"
                        onClick={() => {
                          handleExploreClick();
                          openMenu();
                        }}
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </>
              )}
              {projectSearchQuery.trim().length >= 2 && (
                <div className="mobile-projects-search-results">
                  {isSearchingProjects ? (
                    <div className="mobile-projects-search-loader-box">
                      <Spinner
                        animation="border"
                        variant="dark"
                        className="mobile-projects-search-loader-spinner"
                      />
                      <span className="mobile-projects-search-loader-text">
                        Searching projects...
                      </span>
                    </div>
                  ) : projectSearchResults.length > 0 ? (
                    <div className="mobile-projects-search-results-inner">
                      <div className="mobile-projects-search-results-header">
                        <span className="mobile-projects-search-results-label">
                          Projects
                        </span>
                        <div className="mobile-projects-search-results-header-search">
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="mobile-projects-search-results-header-search-icon"
                          />
                          <input
                            type="text"
                            className="mobile-projects-search-results-header-input"
                            value={projectSearchInput}
                            onChange={(e) =>
                              setProjectSearchInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleExploreClick();
                                openMenu();
                              }
                            }}
                            placeholder="Search"
                            aria-label="Edit search"
                          />
                          <button
                            type="button"
                            className="mobile-projects-search-back-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBackToSearch();
                            }}
                            title="Clear and start new search"
                          >
                            New search
                          </button>
                        </div>
                      </div>
                      <div className="mobile-projects-search-cards">
                        {(() => {
                          const PER_SLIDE = 2;
                          const start = mobileSearchSlideIndex * PER_SLIDE;
                          const visible = projectSearchResults.slice(
                            start,
                            start + PER_SLIDE
                          );
                          return visible.map((project) => {
                            const projectId = project.id || project.slugURL;
                            const searchProjectLabel =
                              project.projectName || project.name || "Project";
                            const searchProjectImgMeta = `${searchProjectLabel} — project banner preview, My Property Fact search`;
                            return (
                              <div
                                key={projectId}
                                className="mobile-project-search-card"
                                onClick={() => {
                                  handleProjectClick(project);
                                  openMenu();
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleProjectClick(project);
                                    openMenu();
                                  }

                                }}
                                aria-label={`View ${searchProjectLabel} (opens in new tab)`}
                              >
                                <div className="mobile-project-search-card-image">
                                  <img
                                    src={getProjectImageSrc(project)}
                                    alt={searchProjectImgMeta}
                                    title={searchProjectImgMeta}
                                    width={100}
                                    height={80}
                                    loading="lazy"
                                    decoding="async"
                                    onError={() => handleImageError(projectId)}
                                  />
                                </div>
                                <div className="mobile-project-search-card-body">
                                  <div className="mobile-project-search-card-title plus-jakarta-sans-semi-bold">
                                    {[project.projectName || project.name, project.cityName]
                                      .filter(Boolean)
                                      .join(" ")}
                                  </div>
                                  {(project.projectAddress || project.cityName) && (
                                    <div className="mobile-project-search-card-location">
                                      {project.projectAddress || project.cityName}
                                    </div>
                                  )}
                                  {project.projectPrice != null && project.projectPrice !== "" && (
                                    <div className="mobile-project-search-card-price text-success plus-jakarta-sans-semi-bold">
                                      {formatProjectPrice(project.projectPrice)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      {projectSearchResults.length > 2 && (
                        <div className="mobile-projects-search-slider-controls">
                          <button
                            type="button"
                            className="mobile-projects-search-slider-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileSearchSlideIndex((i) => Math.max(0, i - 1));
                            }}
                            disabled={mobileSearchSlideIndex === 0}
                            aria-label="Previous"
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                          <span className="mobile-projects-search-slider-dots">
                            {mobileSearchSlideIndex + 1} / {Math.ceil(projectSearchResults.length / 2)}
                          </span>
                          <button
                            type="button"
                            className="mobile-projects-search-slider-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const maxSlide = Math.ceil(projectSearchResults.length / 2) - 1;
                              setMobileSearchSlideIndex((i) => Math.min(maxSlide, i + 1));
                            }}
                            disabled={
                              mobileSearchSlideIndex >=
                              Math.ceil(projectSearchResults.length / 2) - 1
                            }
                            aria-label="Next"
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mobile-projects-no-results">
                      No projects found matching &quot;{projectSearchQuery}
                      &quot;
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bigMenuList">
              <ul className="list-inline active list-unstyled">
                <li
                  className={`mb-hasChild ${activeDropdown === "city" ? "active" : ""
                    }`}
                >
                  <button
                    type="button"
                    className="text-decoration-none mobile-menu-item"
                    onClick={() => openMenuMobile("city")}
                    title="Browse cities — expand menu"
                    aria-expanded={activeDropdown === "city"}
                    aria-controls="mobile-city-submenu"
                  >
                    Cities
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`mobile-dropdown-icon ${activeDropdown === "city" ? "rotate" : ""}`}
                    />
                  </button>
                  <div
                    id="mobile-city-submenu"
                    className={`dropdown mobile-dropdown ${activeDropdown === "city" ? "activeHeader" : ""
                      }`}
                  >
                    <ul className="list-inline list-unstyled">
                      {(isMounted ? cityList : [])?.map((city) => (
                        <li key={city.id}>
                          <Link
                            href={`/city/${city.slugURL}`}
                            prefetch={false}
                            onClick={openMenu}
                            className={`text-decoration-none${pathname === `/city/${city.slugURL}` ? " header-link-active" : ""}`}
                            title={`${city.cityName} properties`}
                          >
                            {city.cityName}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li
                  className={`mb-hasChild ${activeDropdown === "builder" ? "active" : ""
                    }`}
                >
                  <button
                    type="button"
                    className="text-decoration-none mobile-menu-item"
                    onClick={() => openMenuMobile("builder")}
                    title="Browse builders — expand menu"
                    aria-expanded={activeDropdown === "builder"}
                    aria-controls="mobile-builder-submenu"
                  >
                    Builders
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`mobile-dropdown-icon ${activeDropdown === "builder" ? "rotate" : ""}`}
                    />
                  </button>
                  <div
                    id="mobile-builder-submenu"
                    className={`dropdown mobile-dropdown ${activeDropdown === "builder" ? "activeHeader" : ""
                      }`}
                  >
                    <ul className="list-inline list-unstyled">
                      {(isMounted ? builderList : [])?.map((builder) => (
                        <li key={builder.id}>
                          <Link
                            className={`text-decoration-none builder-link${pathname === `/builder/${builder.slugUrl}` ? " header-link-active" : ""}`}
                            href={`/builder/${builder.slugUrl}`}
                            onClick={openMenu}
                            title={`${builder.builderName} projects`}
                          >
                            {builder.builderName}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="/about-us"
                    onClick={openMenu}
                    title="About Us"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div className="smallMenuList">
              <ul className="list-inline list-unstyled">
                <li>
                  <Link
                    className="text-decoration-none"
                    href="/blog"
                    onClick={openMenu}
                    title="Blog"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="/join-our-team"
                    onClick={openMenu}
                    title="Join Our Team"
                  >
                    Join Our Team
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="/contact-us"
                    onClick={openMenu}
                    title="Contact Us"
                  >
                    Contact us
                  </Link>
                </li>
                {/* Hidden until portal launch (next month)
                <li>
                  <button
                    type="button"
                    className="mobile-post-property-cta"
                    onClick={() => {
                      const menu = document.getElementById("mbdiv");
                      if (menu?.classList.contains("active")) {
                        openMenu();
                      }
                      openBrokerLoginModal();
                    }}
                    title="Post a property for free"
                  >
                    Post a Property <span className="mobile-post-property-cta__free">FREE</span>
                  </button>
                </li>
                */}
                {/* <li>
                  <div className="bg-white rounded rounded-3 p-2 cursor-pointer hover-effect"
                  onClick={openSignUpModal}>
                    <p className="text-dark m-0 p-0">Post Property</p>
                  </div>
                </li> */}
              </ul>
            </div>
            <div className="socialMediaLink">
              <ul className="list-inline list-unstyled">
                <li>
                  <Link
                    className="text-decoration-none"
                    href="https://www.facebook.com/mypropertyfact1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="My Property Fact on Facebook"
                    aria-label="My Property Fact on Facebook"
                  >
                    <FontAwesomeIcon icon={faFacebook} />
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="https://www.instagram.com/my.property.fact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="My Property Fact on Instagram"
                    aria-label="My Property Fact on Instagram"
                  >
                    <FontAwesomeIcon icon={faInstagram} />
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="https://www.linkedin.com/company/my-property-fact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="My Property Fact on LinkedIn"
                    aria-label="My Property Fact on LinkedIn"
                  >
                    <FontAwesomeIcon icon={faLinkedin} />
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="https://www.youtube.com/@my.propertyfact/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="My Property Fact on YouTube"
                    aria-label="My Property Fact on YouTube"
                  >
                    <FontAwesomeIcon icon={faYoutube} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <BrokerLoginModal show={showBrokerLoginModal} onClose={setShowBrokerLoginModal} />
    </>
  );
};
export default HeaderComponent;
