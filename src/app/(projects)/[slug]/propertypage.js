"use client";
import Link from "next/link";
import Slider from "react-slick";
import "./property.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// import './styles.css';

// import required modules
import { Navigation } from "swiper/modules";

import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowLeft,
  faBed,
  faChartArea,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Image from "next/image";
import NotFound from "../../not-found";
import CommonPopUpform from "../../(home)/components/common/popupform";
import { LoadingSpinner } from "../../(home)/contact-us/page";
import { toast } from "react-toastify";
import { sanitizeHtml } from "../../_global_components/sanitize";
import { Col, Row } from "react-bootstrap";
import { usePathname, useRouter } from "next/navigation";

export default function Property({ projectDetail }) {
  const [isAnswerVisible, setIsAnswerVisible] = useState([false, false]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [amenities, setAllAmenities] = useState([]);
  const [amenityButtonName, setAmenityButtonName] = useState("VIEW MORE");
  const [amenityButtonStatus, setAmenityButtonStatus] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [backToHomeExpanded, setBackToHomeExpanded] = useState(false);
  const [allNearbyBenefits, setAllNearbyBenefits] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    enquiryFrom: "",
    projectLink: "",
    pageName: "",
  });
  const pathname = usePathname();
  const router = useRouter();
  const [validated, setValidated] = useState(false);
  const [validated1, setValidated1] = useState(false);
  //Defining loading state
  const [loading, setLoading] = useState(true);

  //Validation errors state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  //Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return "";
  };

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

  //Handling answer div
  const toggleAnswer = (index) => {
    const updatedVisibility = [...isAnswerVisible];
    updatedVisibility[index] = !updatedVisibility[index];
    setIsAnswerVisible(updatedVisibility);
  };

  //Setting for banner slider
  const settings = {
    dots: false,
    infinite: (projectDetail.desktopImages?.length ?? 0) > 1,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: (projectDetail.desktopImages?.length ?? 0) > 1,
    autoplay: (projectDetail.desktopImages?.length ?? 0) > 1,
    autoplaySpeed: 3000,
  };

  // Gallery arrows: same style as Similar Projects (featured) – white circle + SVG icons
  const GalleryPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <button
        type="button"
        className={`${className || ""} custom-featured-arrow custom-featured-arrow-prev gallery-featured-arrow`}
        style={style}
        onClick={onClick}
        aria-label="Previous slide"
      >
        <Image
          src="/icon/arrow-left-s-line.svg"
          alt="Previous"
          width={32}
          height={32}
        />
      </button>
    );
  };
  const GalleryNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <button
        type="button"
        className={`${className || ""} custom-featured-arrow custom-featured-arrow-next gallery-featured-arrow`}
        style={style}
        onClick={onClick}
        aria-label="Next slide"
      >
        <Image
          src="/icon/arrow-right-s-line.svg"
          alt="Next"
          width={32}
          height={32}
        />
      </button>
    );
  };

  //Setting for gallery slider
  const settings1 = {
    dots: false,
    infinite: (projectDetail.galleryImages?.length ?? 0) > 1,
    speed: 500,
    autoplay: (projectDetail.galleryImages?.length ?? 0) > 1,
    slidesToShow: 2, // Default for large screens
    arrows: true,
    prevArrow: <GalleryPrevArrow />,
    nextArrow: <GalleryNextArrow />,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024, // Tablets
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768, // Mobile (Medium screens)
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 480, // Small mobile screens
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  //Generating price in lakh & cr
  const generatePrice = (price) => {
    if (/[a-zA-Z]/.test(price)) {
      return price;
    }
    return price < 1
      ? "₹ " + Math.round(parseFloat(price) * 100) + " Lakh* Onwards"
      : "₹ " + parseFloat(price) + " Cr* Onwards";
  };
  //Handle form input data
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));

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
    let error = "";

    if (name === "name") {
      error = validateName(value);
    } else if (name === "email") {
      error = validateEmail(value);
    } else if (name === "phone") {
      error = validatePhone(value);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  //Handle submit form
  const handleSubmit = async (e, form_position) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    const newErrors = {
      name: nameError,
      email: emailError,
      phone: phoneError,
    };

    setErrors(newErrors);

    // Check if form is valid
    const isFormValid =
      form.checkValidity() &&
      !nameError &&
      !emailError &&
      !phoneError &&
      formData.message.trim() !== "";

    if (form_position === "bottom_form") {
      if (!isFormValid) {
        e.stopPropagation();
        setValidated1(true);
        toast.error("Please fill all fields correctly!");
        return;
      }
    } else {
      if (!isFormValid) {
        e.stopPropagation();
        setValidated(true);
        toast.error("Please fill all fields correctly!");
        return;
      }
    }

    try {
      setShowLoading(true);
      // Make API request
      const submitData = {
        ...formData,
        enquiryFrom: projectDetail.projectName,
        projectLink: process.env.NEXT_PUBLIC_UI_URL + pathname,
        pageName: "Project Detail",
      };

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "enquiry/post",
        submitData,
      );
      // Check if response is successful
      if (response.data.isSuccess === 1) {
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          enquiryFrom: "",
          projectLink: "",
        });
        setErrors({
          name: "",
          email: "",
          phone: "",
        });
        if (form_position === "bottom_form") {
          setValidated1(false);
        } else {
          setValidated(false);
        }
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setShowLoading(false);
    }
  };

  // Back to home: show text while scrolling, icon only when scroll stopped
  useEffect(() => {
    let scrollEndTimer = null;
    const handleBackToHomeScroll = () => {
      setBackToHomeExpanded(true);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => setBackToHomeExpanded(false), 1200);
    };
    window.addEventListener("scroll", handleBackToHomeScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleBackToHomeScroll);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
    };
  }, []);

// Add nearby image icon to the nearby benefits
const addNearbyImageIcon = (benefit) => {
  const name = typeof benefit === "string" ? benefit.trim() : "";
  if (!name || !allNearbyBenefits?.length) return null;
  const lower = name.toLowerCase();
  const nearbyBenefit = allNearbyBenefits.find(
    (b) =>
      b.benefitName &&
      (b.benefitName.toLowerCase() === lower ||
        b.benefitName.toLowerCase().includes(lower) ||
        lower.includes(b.benefitName.toLowerCase()))
  );
  return nearbyBenefit?.benefitIcon
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}nearby-benefit/${nearbyBenefit.benefitIcon}`
    : null;
};
  // Back to home: show text while scrolling, icon only when scroll stopped
  useEffect(() => {
    let scrollEndTimer = null;
    const handleBackToHomeScroll = () => {
      setBackToHomeExpanded(true);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => setBackToHomeExpanded(false), 1200);
    };
    window.addEventListener("scroll", handleBackToHomeScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleBackToHomeScroll);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
    };
  }, []);

  // Fetching all nearby benefits
  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}nearby-benefit/get-all`
        );
        setAllNearbyBenefits(res.data);
      } catch (err) {
        console.error("Failed to fetch nearby benefits", err);
      }
    };
  
    fetchBenefits();
  }, []);

  useEffect(() => {
    setAllAmenities((projectDetail?.amenities || []).slice(0, 18));
    const header = document.querySelector(".project-detail-header");
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const opacity = Math.min(scrollY / 2000, 1);
      header.style.background = `rgb(13, 88, 52, ${opacity})`;
    };
    window.addEventListener("scroll", handleScroll);

    // Close mobile menu when resizing to desktop view
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        const menu = document.getElementById("property-mbdiv");
        const menuButtons = document.querySelectorAll(".project-menuBtn");
        if (menu && menu.classList.contains("active")) {
          menu.classList.remove("active");
          menu.style.display = "none";
          menuButtons.forEach((btn) => btn.classList.remove("closeMenuBtn"));
          setMenuOpen(false);
          header?.classList.remove("notfixed");
          document.body.classList.remove("menu-open");
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [projectDetail?.amenities]);

  // Cleanup scroll lock when component unmounts or menu closes
  useEffect(() => {
    return () => {
      // Ensure scroll lock is removed on unmount
      document.body.classList.remove("menu-open");
      document.body.classList.remove("overflow-hidden");
      document.body.style.overflow = "";
      document.body.style.position = "";
    };
  }, []);

  // Ensure scroll lock is properly managed when menu state changes
  useEffect(() => {
    if (!menuOpen) {
      // Ensure scroll is restored when menu closes
      document.body.classList.remove("menu-open");
      document.body.classList.remove("overflow-hidden");
      document.body.style.overflow = "";
      document.body.style.position = "";
    }
  }, [menuOpen]);

  //Handle opening and closing of the property detail page mobile menu
  const openMenu = (e, targetId) => {
    // Only prevent default for menu link clicks (when targetId is provided)
    // Don't prevent default for hamburger button or backdrop clicks
    if (e && targetId && e.preventDefault) {
      e.preventDefault();
    }

    const menuButtons = document.querySelectorAll(".project-menuBtn");
    const menu = document.getElementById("property-mbdiv");
    const header = document.querySelector(".project-detail-header");

    if (!menu) return;

    // Determine if menu should be open or closed
    let isMenuOpen;
    if (targetId) {
      // If clicking a menu link, close the menu
      isMenuOpen = false;
      menu.classList.remove("active");
    } else {
      // Otherwise toggle the menu
      isMenuOpen = menu.classList.toggle("active");
    }

    // Toggle menu button classes
    menuButtons.forEach((btn) =>
      btn.classList.toggle("closeMenuBtn", isMenuOpen),
    );

    setMenuOpen(isMenuOpen);

    // Toggle display
    menu.style.display = isMenuOpen ? "block" : "none";

    // Toggle header class
    header?.classList.toggle("notfixed", isMenuOpen);

    // Toggle body scroll lock - ensure it's properly removed when menu closes
    if (isMenuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
      document.body.classList.remove("overflow-hidden");
      // Ensure body can scroll again
      document.body.style.overflow = "";
      document.body.style.position = "";
    }

    // Handle scrolling when clicking a menu link
    if (targetId) {
      // Use setTimeout to ensure menu is closed and scroll lock is removed before scrolling
      setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition =
            targetElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            50;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      }, 150);
    }
  };

  const handleBackToHomeClick = (e) => {
    if (e?.preventDefault) e.preventDefault();

    const menu = document.getElementById("property-mbdiv");
    const menuButtons = document.querySelectorAll(".project-menuBtn");
    const header = document.querySelector(".project-detail-header");

    if (menu) {
      menu.classList.remove("active");
      menu.style.display = "none";
    }
    menuButtons?.forEach((btn) => btn.classList.remove("closeMenuBtn"));
    header?.classList.remove("notfixed");
    setMenuOpen(false);

    // Ensure page is fully unlocked before route change.
    document.body.classList.remove("menu-open");
    document.body.classList.remove("overflow-hidden");
    document.body.style.overflow = "";
    document.body.style.position = "";

    router.push("/");

    // Fallback for cases where client navigation is blocked by runtime state.
    window.setTimeout(() => {
      if (window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }, 250);
  };

  //Generating banner src
  // const imageSrc = `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${projectDetail.slugURL}/${projectDetail.banners[0].desktopImage}`;
  // const imageSrc = `/properties/${projectDetail.slugURL}/${projectDetail.projectThumbnail}`;

  //Checking If project detail is not available then show not found page
  if (!projectDetail) {
    return <NotFound />;
  }

  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const slugURL = projectDetail.slugURL || "";
  const projectImageSrc = (filename) =>
    filename && slugURL ? `${imageBase}properties/${slugURL}/${filename}` : "/static/no_image.png";

  const viewAllAmenities = () => {
    const amenitiesList = projectDetail.amenities || [];
    setAmenityButtonStatus((prev) => {
      if (prev === true) {
        setAllAmenities(amenitiesList.slice(0, 18));
      } else {
        setAllAmenities(amenitiesList);
      }
      return !prev; // toggle status
    });

    setAmenityButtonName((prev) =>
      prev === "VIEW MORE" ? "VIEW LESS" : "VIEW MORE",
    );
  };

  return (
    <>
      <Link
        href="/"
        className={`back-to-home-floating ${backToHomeExpanded ? "back-to-home-floating--expanded" : ""}`}
        aria-label="Back to MyPropertyFact home page"
        onClick={handleBackToHomeClick}
      >
        <span className="back-to-home-floating__text">Back To Home</span>
        <span className="back-to-home-floating__icon">
          <FontAwesomeIcon icon={faArrowLeft} />
        </span>
      </Link>
      {/* Header for property detail page */}
      <header
        className={`project-detail-header px-4 ${
          isScrolled ? "fixed-header" : ""
        }`}
      >
        <div className="main-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex justify-content-center align-items-center">
              <Link href="#">
                <Image
                  width={198}
                  height={50.75}
                  src={projectImageSrc(projectDetail.projectLogo)}
                  alt="logo"
                  className="img-fluid"
                />
              </Link>
            </div>
            <nav className="navi d-none d-lg-flex">
              <div className="menu">
                <ul className="list-inline d-flex text-decoration-none gap-5 m-0 align-items-center">
                  <li>
                    <Link
                      className="text-decoration-none text-light fs-5 fw-bold"
                      href="#overview"
                    >
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-decoration-none text-light fs-5 fw-bold"
                      href="#amenities"
                    >
                      Amenities
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-decoration-none text-light fs-5 fw-bold"
                      href="#floorplan"
                    >
                      Plans &amp; Price
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-decoration-none text-light fs-5 fw-bold"
                      href="#gallery"
                    >
                      Gallery
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-decoration-none text-light fs-5 fw-bold"
                      href="#location"
                    >
                      Location
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
            {/* Defining header for small devices */}
            <div
              className="project-mbMenuContainer"
              id="property-mbdiv"
              onClick={(e) => {
                // close when clicking on dark backdrop only
                if (e.target.id === "property-mbdiv" && menuOpen) {
                  openMenu(e);
                }
              }}
            >
              <div className="mbMenu" onClick={(e) => e.stopPropagation()}>
                {/* Mobile menu header with logo + close */}
                <div className="project-mbMenu-header d-flex align-items-center justify-content-between mb-4">
                  <Link href="/">
                    <Image
                      src="/logo.webp"
                      alt="My Property Fact"
                      width={50}
                      height={55}
                      className="img-fluid"
                    />
                  </Link>
                  {/* <button
                    type="button"
                    className="project-mbMenu-close"
                    onClick={(e) => openMenu(e)}
                    aria-label="Close menu"
                  >
                    <span></span>
                    <span></span>
                  </button> */}
                </div>

                <ul className="project-mb-list d-lg-none">
                  <li>
                    <Link
                      href="/"
                      className="text-decoration-none"
                      onClick={handleBackToHomeClick}
                    >
                      Back to Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#overview"
                      className="text-decoration-none"
                      onClick={(e) => openMenu(e, "overview")}
                    >
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#amenities"
                      className="text-decoration-none"
                      onClick={(e) => openMenu(e, "amenities")}
                    >
                      Amenities
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#floorplan"
                      className="text-decoration-none"
                      onClick={(e) => openMenu(e, "floorplan")}
                    >
                      Plans &amp; Price
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#gallery"
                      className="text-decoration-none"
                      onClick={(e) => openMenu(e, "gallery")}
                    >
                      Gallery
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#location"
                      className="text-decoration-none"
                      onClick={(e) => openMenu(e, "location")}
                    >
                      Location
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Defining hamburger button for property detail page (mobile) */}
            <div
              className="project-menuBtn d-flex d-lg-none"
              onClick={openMenu}
            >
              <span id="menuLine1"></span>
              <span id="menuLine2"></span>
              <span id="menuLine3"></span>
            </div>
            {/* Logo container */}
            <div className="logo d-none d-lg-block px-4">
              <Link href="/">
                <Image
                  src="/logo.webp"
                  alt="mpf-logo"
                  width={70}
                  height={70}
                  className="img-fluid"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div id="home" className="container-fluid p-0">
        {/* Banner container for property detail page  */}
        <div className="slick-slider-container">
          <Slider {...settings}>
            {projectDetail.desktopImages && projectDetail.desktopImages.map((item, index) => {
              const mobileItem =
                projectDetail.mobileImages?.[index]; // pick same index mobile banner
              return (
                <picture className="image-con" key={`${item.id}-${index}`}>
                  {/* Mobile first */}
                  {mobileItem?.mobileImage && (
                    <source
                      srcSet={projectImageSrc(mobileItem.mobileImage)}
                      media="(max-width: 640px)" // mobile breakpoint
                    />
                  )}

                  {/* Tablet/Laptop (falls back to desktopImage) */}
                  {item.desktopImage && (
                    <source
                      srcSet={projectImageSrc(item.desktopImage)}
                      media="(min-width: 641px)" // tablet/laptop/desktop
                    />
                  )}

                  {/* Default fallback */}
                  <Image
                    src={projectImageSrc(item.desktopImage)}
                    alt={item.altTag || "Property Banner"}
                    width={2225}
                    height={1065}
                  />
                </picture>
              );
            })}
          </Slider>

          {/* Defining form on banner container  */}
          <div className="banner-form d-none d-lg-block">
            <Form
              noValidate
              validated={validated}
              onSubmit={(e) => handleSubmit(e, "top_form")}
            >
              <Form.Group className="mb-3" controlId="full_name">
                <Form.Control
                  type="text"
                  placeholder="Full name"
                  value={formData.name || ""}
                  onChange={(e) => handleChange(e)}
                  onBlur={handleBlur}
                  name="name"
                  isInvalid={
                    !!errors.name || (validated && !formData.name.trim())
                  }
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name || "Please provide a valid name."}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="email_id">
                <Form.Control
                  type="email"
                  placeholder="Email id"
                  value={formData.email || ""}
                  onChange={(e) => handleChange(e)}
                  onBlur={handleBlur}
                  name="email"
                  isInvalid={
                    !!errors.email || (validated && !formData.email.trim())
                  }
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email || "Please provide a valid email."}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="phone_number">
                <Form.Control
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange(e)}
                  onBlur={handleBlur}
                  name="phone"
                  isInvalid={
                    !!errors.phone || (validated && !formData.phone.trim())
                  }
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone || "Please provide a valid phone number."}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="message">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Message"
                  value={formData.message || ""}
                  onChange={(e) => handleChange(e)}
                  name="message"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid message.
                </Form.Control.Feedback>
              </Form.Group>
              <div>
                <Button
                  className="btn btn-background border-0 w-50"
                  type="submit"
                  disabled={showLoading}
                >
                  Submit <LoadingSpinner show={showLoading} />
                </Button>
              </div>
            </Form>
          </div>
          <div
            className="scroll-down-btn d-none d-md-flex"
            onClick={() => window.scrollBy({ top: 600, behavior: "smooth" })}
          >
            <div className="d-flex flex-column align-items-center justify-content-center text-center fs-5">
              <span>
                <FontAwesomeIcon icon={faArrowDown} />
              </span>
              <span>Scroll Down</span>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>

        <div
          id="overview"
          className="container py-5 bg-white rounded-3 mt-3 mb-3"
        >
          <div className="row gy-5 align-items-stretch">
            {/* Project Info */}
            <div className="col-lg-4">
              <div className="p-2 p-lg-5 rounded-4 bg-white h-100 d-flex flex-column justify-content-center align-items-center custom-shadow">
                <div>
                  <h1 className="mb-3 text-dark fw-bold">
                    {projectDetail.projectName}
                  </h1>

                  <p className="fs-5 mb-3 text-muted d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="text-success me-2 fs-5"
                    />
                    <span>{projectDetail.projectLocality}, {projectDetail.city}, {projectDetail.state}</span>
                  </p>

                  <p className="fs-5 text-dark mb-2">
                    <strong>
                      Price: {generatePrice(projectDetail.projectPrice)}
                    </strong>
                  </p>

                  <p className="fs-6 text-muted mb-2">
                    {projectDetail.projectConfiguration}
                  </p>

                  <p className="fs-6 text-muted">
                    <strong className="text-dark">RERA:</strong>{" "}
                    {projectDetail.reraNo || "Not found"}
                  </p>
                </div>
                <button
                  className="btn btn-success border-0 btn-background text-white w-100 p-2"
                  onClick={() => setShowPopUp(true)}
                >
                  <h5 className="m-0">Get Detail</h5>
                </button>
              </div>
            </div>
            {/* Walkthrough Description */}
            <div className="col-lg-8">
              <div className="bg-white p-4 p-md-5 rounded-4 custom-shadow h-100">
                <h2 className="text-dark fw-bold mb-4 text-center text-md-start">
                  Project Overview
                </h2>

                <div
                  className="text-muted fs-6 lh-lg"
                  dangerouslySetInnerHTML={{
                    __html: projectDetail.projectWalkthroughDescription,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities section */}
        <div className="container-fluid py-5 text-white mb-5" id="amenities">
          {/* Title */}
          <h2 className="text-center fw-bold mb-5">Amenities</h2>

          {/* Description */}
          <div
            className="text-center container mb-5"
            dangerouslySetInnerHTML={{
              __html: projectDetail.amenityDescription,
            }}
          ></div>

          {/* Amenities Grid */}
          <div className="container d-flex flex-wrap justify-content-center gap-3 mb-5 amenity-container">
            {amenities.map((item, index) => (
              <div key={index} className="amenity-detail-container">
                <div className="bg-white mb-3 p-3 rounded-2">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}amenity/${item.image}`}
                    height={60}
                    width={60}
                    alt={item.altTag || ""}
                    className="mb-3 d-flex mx-auto"
                  />
                </div>
                <p className="text-white text-center fs-6">{item.title}</p>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Button
              className="btn btn-background rounded-3 text-white border-0 px-5 py-3"
              onClick={() => viewAllAmenities(amenityButtonName)}
            >
              {amenityButtonName}
            </Button>
          </div>
        </div>

        {/* Floor plans section */}
        <div className="container mb-5" id="floorplan">
          <div className="">
            <h2 className="text-center fw-bold mb-4">Floor Plans</h2>
            {projectDetail.floorPlanDescription && (
              <div
                className="text-center mb-4"
                dangerouslySetInnerHTML={{
                  __html: projectDetail.floorPlanDescription,
                }}
              ></div>
            )}
          </div>
          {/* <div className="d-flex justify-content-center p-2 d-flex flex-column flex-md-row gap-md-3 flex-wrap flex-lg-nowrap"> */}
          <Swiper
            direction="horizontal"
            navigation={true}
            pagination={{ clickable: true }}
            spaceBetween={20}
            loop={true}
            breakpoints={{
              320: { slidesPerView: 1 },
              576: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            modules={[Navigation]}
            className="mySwiper p-2"
          >
            {projectDetail.floorPlans?.map((item, index) => (
              <SwiperSlide key={`${item.planType}-${index}`}>
                <div className="card">
                  <div className="p-3 rounded-sm d-flex mx-auto">
                    <Image
                      width={300}
                      height={200}
                      className="img-fluid rounded-3"
                      src="/static/generic-floorplan.jpg"
                      alt="floor plan"
                    />
                  </div>
                  <div className="border-bottom property-type-detail">
                    <p>
                      <FontAwesomeIcon icon={faBed} width={20} color="green" />{" "}
                      Type
                    </p>
                    <p>{item.planType}</p>
                  </div>
                  <div className="mt-2 property-type-detail">
                    <p>
                      <FontAwesomeIcon
                        icon={faChartArea}
                        width={20}
                        color="green"
                      />{" "}
                      Area
                    </p>
                    {/* <p>{item.areaSqFt} sqft*</p>
                    <p>{parseFloat(item.areaSqMt).toFixed(2)} sqmt*</p> */}
                  </div>
                  <div className="pb-4 ps-2 mt-4">
                    <button
                      className="btn btn-background text-white"
                      onClick={() => setShowPopUp(true)}
                    >
                      PRICE ON REQUEST
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* </div> */}
        </div>

        {/* Gallery section */}
        <div className="container-fluid bg-light py-5 mb-5" id="gallery">
          <h2 className="text-center mb-4 fw-bold">Gallery</h2>
          <div className="container-fluid mt-4">
            <div className="row justify-content-center">
              <div className="col-12">
                <Slider {...settings1} className="gallery-slider">
                  {(projectDetail.galleryImages || []).map((item, index) => (
                    <div
                      key={`${index}-${item.id}`}
                      className="project-detail-gallery-container "
                    >
                      <Image
                        src={projectImageSrc(item.imageName)}
                        alt={item.altTag || "Gallery Image"}
                        fill
                        className="img-fluid rounded-5 object-fit-cover px-2 "
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          </div>
        </div>
        {/* Location section */}
        <div className="container mb-5" id="location">
          <div>
            <h2 className="text-center fw-bold">Location</h2>
          </div>
          <div className="text-center p-2 p-md-4 p-lg-5">
            <div
              dangerouslySetInnerHTML={{
                __html: projectDetail.locationDescription,
              }}
            ></div>
          </div>
          <div className="row">
            <div className="col-md-6">
              {/* Nearby Benefits Section */}
              <div className="row g-3">
                {(projectDetail.locationBenefits || []).map((item, index) => (
                  <div key={index} className="col-6">
                    <div className="border rounded-4 p-3 h-100 d-flex align-items-center gap-3 bg-light shadow-sm">
                      {item.benefitName != null ? (
                        <Image
                          src={addNearbyImageIcon(item.benefitName) || `/icon/fallback-icon.png`}
                          alt={item.benefitName || ""}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <Image
                          src={`/icon/fallback-icon.png`}
                          alt="fallback-icon"
                          width={40}
                          height={40}
                        />
                      )}
                      <div>
                        <p className="mb-1 fw-semibold text-dark">
                          {item.benefitName}
                        </p>
                        <small className="text-muted">{item.distance}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address Section */}
              <div className="mt-4 p-4">
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <p className="mb-1 text-success fw-semibold">Address</p>
                    <p className="mb-0">{projectDetail.projectLocality || ""}</p>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <p className="mb-1 text-success fw-semibold">State</p>
                    <p className="mb-0">{projectDetail.state || ""}</p>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <p className="mb-1 text-success fw-semibold">City</p>
                    <p className="mb-0">{projectDetail.city || ""}</p>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <p className="mb-1 text-success fw-semibold">Country</p>
                    <p className="mb-0">{projectDetail.country || ""}</p>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-background text-white px-4 py-2 rounded-pill"
                    onClick={() => setShowPopUp(true)}
                  >
                    View On Map
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 p-3">
              <div
                className="position-relative border rounded-4 overflow-hidden shadow-sm"
                style={{ height: "350px" }}
              >
                <Image
                  src={projectImageSrc(projectDetail.locationMap)}
                  alt="Project Location Map"
                  fill
                  className="object-fit-cover"
                />

                {/* Overlay text */}
                <div className="position-absolute bottom-0 start-0 w-100 p-2 bg-dark bg-opacity-50 text-white text-center">
                  <small className="fw-semibold">Project Location</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About the project */}
      <div
        className="container-fluid py-5 mb-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${projectImageSrc(projectDetail?.desktopImages?.[0]?.desktopImage)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Section Heading */}
        <div>
          <h2 className="text-center text-white fw-bold mb-5">
            About The Builder {projectDetail.builder?.builderName || ""}
          </h2>

          {/* Description */}
          <div>
            <div className="container mb-5">
              <div
                className="text-center project-about-container text-white"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(projectDetail.builder?.builderDescription || ""),
                }}
              ></div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <Link
                href={`/builder/${projectDetail.builder?.slugURL || "#"}`}
                className="btn btn-success px-4 py-2 rounded-pill shadow-sm"
              >
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact us section */}
      <div className="container mb-5">
        <div>
          <h2 className="text-center fw-bold mb-4">Get in Touch</h2>
          <div className="row">
            <div
              className="col-12 col-md-6 col-lg-6 col-xl-6 
            d-flex justify-content-center align-items-center"
            >
              <div className="">
                <div className="w-100 w-md-50 w-lg-50 mb-3 contactus-content">
                  <p className="fs-5 mb-5">
                    If you have any additional queries regarding the project or
                    would like to take the next step in your investment journey,
                    you can fill out this query form and our team will be happy
                    to assist you with what you need.
                  </p>
                  <ul className="fs-5">
                    <li className="my-3">Book a Site Visit</li>
                    <li className="my-3">Ask For a Brochure</li>
                    <li className="my-3">Speak to a Representative</li>
                    <li className="my-3">Ask for a Quotation</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-6 col-xl-6">
              <div className="container d-flex justify-content-center project-detail-contact-form">
                <Form
                  noValidate
                  validated={validated1}
                  className="w-100 rounded-3 p-3"
                  onSubmit={(e) => handleSubmit(e, "bottom_form")}
                >
                  <Row>
                    <Col>
                      <Form.Group className="mb-3" controlId="first_name">
                        <Form.Control
                          type="text"
                          placeholder="Full Name"
                          value={formData.name || ""}
                          onChange={(e) => handleChange(e)}
                          onBlur={handleBlur}
                          name="name"
                          isInvalid={
                            !!errors.name ||
                            (validated1 && !formData.name.trim())
                          }
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.name || "Please provide a valid name."}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3" controlId="email_id">
                    <Form.Control
                      type="email"
                      placeholder="Email Id"
                      value={formData.email || ""}
                      onChange={(e) => handleChange(e)}
                      onBlur={handleBlur}
                      name="email"
                      isInvalid={
                        !!errors.email || (validated1 && !formData.email.trim())
                      }
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email || "Please provide a valid email."}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="phone_number">
                    <Form.Control
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone || ""}
                      onChange={(e) => handleChange(e)}
                      onBlur={handleBlur}
                      name="phone"
                      isInvalid={
                        !!errors.phone || (validated1 && !formData.phone.trim())
                      }
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone || "Please provide a valid phone number."}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="message">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Message"
                      value={formData.message || ""}
                      onChange={(e) => handleChange(e)}
                      name="message"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid message.
                    </Form.Control.Feedback>
                  </Form.Group>
                  <div className="d-flex flex-wrap gap-3 justify-content-center">
                    <Button
                      className="btn btn-background text-white border-0 px-5 py-3 fs-5 text-uppercase"
                      type="submit"
                      disabled={showLoading}
                    >
                      Submit Enquiry
                      <LoadingSpinner show={showLoading} />
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid bg-white mb-5">
        <h2 className="text-center mb-4 fw-bold">FAQs</h2>

        <div className="faq-container">
          {(projectDetail.faqs || []).map((item, index) => (
            <div key={`${item.id}-${index}`} className="faq-item mb-3">
              {/* Question */}
              <div
                className="faq-question d-flex justify-content-between align-items-center p-3 rounded-3"
                onClick={() => toggleAnswer(item.id)}
              >
                <h5 className="m-0">
                  Q{index + 1}: {item.question}
                </h5>
                <span className="faq-icon">
                  {isAnswerVisible[item.id] ? "−" : "+"}
                </span>
              </div>

              {/* Answer */}
              <div
                className={`faq-answer px-3 pb-3 ${
                  isAnswerVisible[item.id] ? "show" : ""
                }`}
              >
                <p className="m-0">
                  <strong className="text-success">Ans:</strong> {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CommonPopUpform
        show={showPopUp}
        handleClose={setShowPopUp}
        from={"Project Detail"}
        data={projectDetail}
      />
    </>
  );
}
