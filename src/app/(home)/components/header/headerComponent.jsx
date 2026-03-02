"use client";
import Link from "next/link";
import "./header.css";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Spinner } from "react-bootstrap";
import LoginSignupModal from "../_homecomponents/loginSignupModal";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronDown,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";
import { motion } from "framer-motion";

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
  const [showLoginModal, setShowModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Defer dropdown content until after mount to avoid hydration mismatch (data + motion)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if the pathname starts with /city/
  const isCityRoute = pathname.startsWith("/city");
  const isBuilderRoute = pathname.startsWith("/builder");
  const isProjectTypeRoute = pathname.startsWith("/projects");
  const isBlogTypeRoute = pathname.startsWith("/blog");
  const isPropertiesRoute = pathname === "/properties";
  //Defining scroll variable
  const [isScrolled, setIsScrolled] = useState(false);
  const [isConditionalHeader, setIsConditionalHeader] = useState(false);
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
    const DEFAULT_IMAGE = "/static/no_image.png";
    const projectId = project.id || project.slugURL;
    const bannerImage =
      project.projectBannerImage || project.projectThumbnailImage;

    // If image failed to load for this project, return default
    if (imageErrors[projectId] || !bannerImage) {
      return DEFAULT_IMAGE;
    }

    // Construct full image URL
    return `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}properties/${project.slugURL}/${bannerImage}`;
  };

  // Handle image error
  const handleImageError = (projectId) => {
    setImageErrors((prev) => ({ ...prev, [projectId]: true }));
  };
  const openMenuMobile = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

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
        if (window.scrollY > 100) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
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

  const openSignUpModal = () => {
    setShowModal(true);
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

  // Handle project click navigation
  const handleProjectClick = (project) => {
    if (project.slugURL) {
      router.push(`/${project.slugURL}`);
      setProjectSearchInput("");
      setProjectSearchQuery("");
      setProjectSearchResults([]);
    }
  };

  // Handle Explore button click
  const handleExploreClick = () => {
    const searchValue = projectSearchInput.trim();
    if (projectSearchResults.length > 0 && projectSearchResults[0]?.slugURL) {
      router.push(`/${projectSearchResults[0].slugURL}`);
      setProjectSearchInput("");
      setProjectSearchQuery("");
      setProjectSearchResults([]);
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

  return (
    <>
      <div
        className={`d-flex justify-content-between align-items-center px-2 px-lg-4 header ${isScrolled ? "fixed-header" : ""
          } ${isPropertiesRoute ? "properties-header" : ""} ${pathname.includes("/properties/") ? "conditional-header" : ""}`}
      >
        <div className="container d-flex justify-content-between align-items-center">
          <div className="mpf-logo d-flex align-items-center gap-4">
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
            >
              <Image
                src="/logo.webp"
                alt="My Property fact"
                height={74}
                width={80}
                loading="lazy"
              />
            </Link>
          </div>
          <nav className="d-none d-lg-flex flex-grow-1 justify-content-end align-items-center">
            <div className="menu position-relative">
              <ul className="d-flex gap-5 m-0 align-items-center header-links list-unstyled fw-bold">
                <li
                  className="hasChild"
                  onMouseEnter={() => setIsDropdownHovered(true)}
                  onMouseLeave={() => setIsDropdownHovered(false)}
                >
                  <Link
                    href="#"
                    className={`text-light text-decoration-none py-3 plus-jakarta-sans-semi-bold${isCityRoute ? "header-link-active" : ""
                      }`}
                  >
                    City
                  </Link>
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
                            >
                              Commercial
                            </Link>
                            <Link
                              href="/projects/residential"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                            >
                              Residential
                            </Link>
                            <Link
                              href="/projects/new-launches"
                              className="city-dropdown-item with-badge plus-jakarta-sans-semi-bold"
                            >
                              New Launches{" "}
                              <NewBadge isVisible={isDropdownHovered} />
                            </Link>
                            <Link
                              href="/blog"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                            >
                              Articles &amp; News
                            </Link>
                          </div>
                          <ul className="list-inline city-dropdown-right">
                            {cityList?.map((city) => (
                              <li key={city.id}>
                                <Link
                                  href={`/city/${city.slugURL}`}
                                  className={`text-light text-decoration-none plus-jakarta-sans-semi-bold ${pathname === "/city/" + city.slugURL
                                      ? "header-link-active"
                                      : ""
                                    }`}
                                >
                                  {city.cityName}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="dropdown-footer-bar">
                          <div className="dropdown-footer-left">
                            <span className="dropdown-footer-label">Contact Us</span>
                            <span className="dropdown-footer-phone">
                              <img src="/static/icon/Vector (1).svg" alt="Phone" className="dropdown-footer-phone-icon" />
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
                  className="hasChild"
                  onMouseEnter={() => setIsDropdownHovered(true)}
                  onMouseLeave={() => setIsDropdownHovered(false)}
                >
                  <Link
                    href="#"
                    className={`text-light py-3 text-decoration-none plus-jakarta-sans-semi-bold ${isBuilderRoute ? "header-link-active" : ""
                      }`}
                  >
                    Builder
                  </Link>
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
                            >
                              Commercial
                            </Link>
                            <Link
                              href="/projects/residential"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                              prefetch={true}
                            >
                              Residential
                            </Link>
                            <Link
                              href="/projects/new-launches"
                              className="city-dropdown-item with-badge plus-jakarta-sans-semi-bold"
                              prefetch={true}
                            >
                              New Launches{" "}
                              <NewBadge isVisible={isDropdownHovered} />
                            </Link>
                            <Link
                              href="/blog"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                            >
                              Articles &amp; News
                            </Link>
                          </div>
                          <ul className="list-inline city-dropdown-right">
                            {builderList?.map((builder) => (
                              <li key={builder.id}>
                                <Link
                                  href={`/builder/${builder.slugUrl}`}
                                  className={`text-light text-decoration-none plus-jakarta-sans-semi-bold ${pathname === "/builder/" + builder.slugUrl
                                      ? "header-link-active"
                                      : ""
                                    }`}
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
                              <img src="/static/icon/Vector (1).svg" alt="Phone" className="dropdown-footer-phone-icon" />
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
                <li className="hasChild">
                  <Link
                    href="/about-us"
                    className={`text-light py-3  text-decoration-none plus-jakarta-sans-semi-bold${pathname === "/about-us" ? "header-link-active" : ""
                      }`}
                  >
                    About Us
                  </Link>
                </li>
                <li
                  className="hasChild"
                  onMouseEnter={() => setIsDropdownHovered(true)}
                  onMouseLeave={() => setIsDropdownHovered(false)}
                >
                  <Link
                    href="/projects"
                    className={`text-light py-3 text-decoration-none plus-jakarta-sans-semi-bold${isProjectTypeRoute ? "header-link-active" : ""
                      }`}
                  >
                    Projects
                  </Link>
                  <div
                    className="dropdown dropdown-lg projects-dropdown z-3"
                    ref={projectsDropdownRef}
                  >
                    {!isMounted || !projectTypes?.length ? (
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
                            >
                              Commercial
                            </Link>
                            <Link
                              href="/projects/residential"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                              prefetch={true}
                            >
                              Residential
                            </Link>
                            <Link
                              href="/projects/new-launches"
                              className="city-dropdown-item with-badge plus-jakarta-sans-semi-bold"
                              prefetch={true}
                            >
                              New Launches{" "}
                              <NewBadge isVisible={isDropdownHovered} />
                            </Link>
                            <Link
                              href="/blog"
                              className="city-dropdown-item plus-jakarta-sans-semi-bold"
                            >
                              Articles &amp; News
                            </Link>
                          </div>
                          <div className="city-dropdown-right projects-search-section">
                            <div className="projects-search-wrapper">
                                      {!(projectSearchQuery.trim().length >= 2 && projectSearchResults.length > 0 && !isSearchingProjects) && (
                                <>
                                  <h3 className="projects-search-title plus-jakarta-sans-semi-bold">
                                    Search Your Dream Home
                                  </h3>
                                  <div className="projects-search-container">
                                    <div className="projects-search-input-wrapper">
                                      <FontAwesomeIcon
                                        icon={faSearch}
                                        className="projects-search-icon"
                                      />
                                      <input
                                        ref={projectSearchInputRef}
                                        type="text"
                                        placeholder="Search"
                                        className="projects-search-input"
                                        value={projectSearchInput}
                                        onChange={(e) =>
                                          setProjectSearchInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleExploreClick();
                                          }
                                        }}
                                      />
                                      <button
                                        className="projects-explore-btn"
                                        onClick={handleExploreClick}
                                      >
                                        Explore
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                              {/* Search Results - loader, horizontal slider, back to search */}
                              {projectSearchQuery.trim().length >= 2 && (
                                <div className="projects-search-results-wrapper">
                                  {isSearchingProjects ? (
                                    <div className="projects-search-loader-box">
                                      <Spinner
                                        animation="border"
                                        variant="light"
                                        className="projects-search-loader-spinner"
                                      />
                                      <span className="projects-search-loader-text">
                                        Searching projects...
                                      </span>
                                    </div>
                                  ) : projectSearchResults.length > 0 ? (
                                    <>
                                      <div className="projects-search-results-header">
                                        <span className="projects-search-results-label">
                                          Projects
                                        </span>
                                        <div className="projects-search-results-header-search">
                                          <FontAwesomeIcon
                                            icon={faSearch}
                                            className="projects-search-results-header-search-icon"
                                          />
                                          <input
                                            type="text"
                                            className="projects-search-results-header-input"
                                            value={projectSearchInput}
                                            onChange={(e) =>
                                              setProjectSearchInput(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleExploreClick();
                                              }
                                            }}
                                            placeholder="Search"
                                            aria-label="Edit search"
                                          />
                                          <button
                                            type="button"
                                            className="projects-search-back-link"
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
                                      <div className="projects-search-horizontal-slider">
                                        {projectSearchResults.length > 2 && (
                                          <button
                                            type="button"
                                            className="projects-search-arrow projects-search-arrow-left"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSearchResultsSlideIndex((i) =>
                                                Math.max(0, i - 1)
                                              );
                                            }}
                                            disabled={searchResultsSlideIndex === 0}
                                            aria-label="Previous projects"
                                          >
                                            <FontAwesomeIcon icon={faChevronLeft} />
                                          </button>
                                        )}
                                        <div
                                          className="projects-search-cards-track"
                                          style={{
                                            "--slide-index": searchResultsSlideIndex,
                                          }}
                                        >
                                          {projectSearchResults.map((project) => {
                                            const projectId = project.id || project.slugURL;
                                            return (
                                              <div
                                                key={projectId}
                                                className="project-search-card"
                                                onClick={() => handleProjectClick(project)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    handleProjectClick(project);
                                                  }
                                                }}
                                                aria-label={`View ${project.projectName || project.name}`}
                                              >
                                                <div className="project-search-card-image">
                                                  <Image
                                                    src={getProjectImageSrc(project)}
                                                    alt={project.projectName || project.name || "Project"}
                                                    width={200}
                                                    height={140}
                                                    unoptimized
                                                    onError={() => handleImageError(projectId)}
                                                  />
                                                </div>
                                                <div className="project-search-card-body">
                                                  <h6 className="project-search-card-title plus-jakarta-sans-semi-bold">
                                                    {[project.projectName || project.name, project.cityName]
                                                      .filter(Boolean)
                                                      .join(" ")}
                                                  </h6>
                                                  {(project.projectAddress || project.cityName) && (
                                                    <p className="project-search-card-location">
                                                      {project.projectAddress || project.cityName}
                                                    </p>
                                                  )}
                                                  {project.projectPrice != null && project.projectPrice !== "" && (
                                                    <p className="project-search-card-price text-success plus-jakarta-sans-semi-bold">
                                                      {formatProjectPrice(project.projectPrice)}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        {projectSearchResults.length > 2 && (
                                          <button
                                            type="button"
                                            className="projects-search-arrow projects-search-arrow-right"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const maxSlide = Math.ceil(
                                                projectSearchResults.length / 2
                                              ) - 1;
                                              setSearchResultsSlideIndex((i) =>
                                                Math.min(maxSlide, i + 1)
                                              );
                                            }}
                                            disabled={
                                              searchResultsSlideIndex >=
                                              Math.ceil(projectSearchResults.length / 2) - 1
                                            }
                                            aria-label="Next projects"
                                          >
                                            <FontAwesomeIcon icon={faChevronRight} />
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  ) : projectSearchQuery.trim().length >= 2 ? (
                                    <div className="projects-no-results">
                                      No projects found matching &quot;
                                      {projectSearchQuery}&quot;
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="dropdown-footer-bar">
                          <div className="dropdown-footer-left">
                            <span className="dropdown-footer-label">Contact Us</span>
                            <span className="dropdown-footer-phone">
                              <img src="/static/icon/Vector (1).svg" alt="Phone" className="dropdown-footer-phone-icon" />
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
                <li className="hasChild">
                  <Link
                    href="/blog"
                    className={`text-light py-3  text-decoration-none plus-jakarta-sans-semi-bold${isBlogTypeRoute ? "header-link-active" : ""
                      }`}
                  >
                    Blog
                  </Link>
                </li>
                <li className="hasChild">
                  <Link
                    href="/career"
                    className={`text-light py-3 text-decoration-none plus-jakarta-sans-semi-bold${pathname === "/career" ? "header-link-active" : ""
                      }`}
                  >
                    Career
                  </Link>
                </li>
                <li className="hasChild">
                  <Link
                    href="/contact-us"
                    className={`text-light py-3 text-decoration-none plus-jakarta-sans-semi-bold${pathname === "/contact-us" ? "header-link-active" : ""
                      }`}
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
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
            >
              <Image
                src="/logo.webp"
                alt="My Property Fact"
                height={50}
                width={55}
                priority
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
                  <h3 className="mobile-projects-search-title plus-jakarta-sans-semi-bold">
                    Search Your Dream Home
                  </h3>
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
                              >
                                <div className="mobile-project-search-card-image">
                                  <Image
                                    src={getProjectImageSrc(project)}
                                    alt={project.projectName || project.name || "Project"}
                                    width={100}
                                    height={80}
                                    unoptimized
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
                  <Link
                    href="#"
                    className="text-decoration-none mobile-menu-item"
                    onClick={() => openMenuMobile("city")}
                  >
                    <span>City</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`mobile-dropdown-icon ${activeDropdown === "city" ? "rotate" : ""}`}
                    />
                  </Link>
                  <div
                    className={`dropdown mobile-dropdown ${activeDropdown === "city" ? "activeHeader" : ""
                      }`}
                  >
                    <ul className="list-inline list-unstyled">
                      {(isMounted ? cityList : [])?.map((city) => (
                        <li key={city.id}>
                          <Link
                            href={`/city/${city.slugURL}`}
                            onClick={openMenu}
                            className="text-decoration-none"
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
                  <Link
                    className="text-decoration-none mobile-menu-item"
                    href="#"
                    onClick={() => openMenuMobile("builder")}
                  >
                    <span>Builder</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`mobile-dropdown-icon ${activeDropdown === "builder" ? "rotate" : ""}`}
                    />
                  </Link>
                  <div
                    className={`dropdown mobile-dropdown ${activeDropdown === "builder" ? "activeHeader" : ""
                      }`}
                  >
                    <ul className="list-inline list-unstyled">
                      {(isMounted ? builderList : [])?.map((builder) => (
                        <li key={builder.id}>
                          <Link
                            className="text-decoration-none builder-link"
                            href={`/builder/${builder.slugUrl}`}
                            onClick={openMenu}
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
                  >
                    About Us
                  </Link>
                </li>
                <li
                  className={`mb-hasChild ${activeDropdown === "projects" ? "active" : ""
                    }`}
                >
                  <Link
                    href="#"
                    className="text-decoration-none mobile-menu-item"
                    onClick={() => openMenuMobile("projects")}
                  >
                    <span>Projects</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`mobile-dropdown-icon ${activeDropdown === "projects" ? "rotate" : ""}`}
                    />
                  </Link>
                  <div
                    className={`dropdown mobile-dropdown ${activeDropdown === "projects" ? "activeHeader" : ""
                      }`}
                  >
                    <ul className="list-inline list-unstyled">
                      {(isMounted ? projectTypes : [])?.map((project) => (
                        <li key={project.id}>
                          <Link
                            href={`/projects/${project.slugUrl}`}
                            onClick={openMenu}
                            className="text-decoration-none"
                          >
                            {project.projectTypeName}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="/career"
                    onClick={openMenu}
                  >
                    Career
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="/contact-us"
                    onClick={openMenu}
                  >
                    Contact us
                  </Link>
                </li>
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
                  >
                    <FontAwesomeIcon icon={faFacebook} />
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="https://www.instagram.com/my.property.fact/"
                    target="_blank"
                  >
                    <FontAwesomeIcon icon={faInstagram} />
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="https://www.linkedin.com/company/my-property-fact/"
                    target="_blank"
                  >
                    <FontAwesomeIcon icon={faLinkedin} />
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-decoration-none"
                    href="https://www.youtube.com/@my.propertyfact/"
                    target="_blank"
                  >
                    <FontAwesomeIcon icon={faYoutube} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <LoginSignupModal show={showLoginModal} handleClose={setShowModal} />
    </>
  );
};
export default HeaderComponent;
