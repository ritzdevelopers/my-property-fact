"use client";
import Link from "next/link";
import Slider from "react-slick";
import "./property.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faMinus,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Image from "next/image";
import NotFound from "../../not-found";
import CommonPopUpform from "../../(home)/components/common/popupform";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import Featured from "../../(home)/components/home/featured/featured";
import PopularCitiesSection from "../../(home)/components/home/popular-cities/PopularCitiesSection";
import { toast } from "react-toastify";
import { sanitizeHtml } from "../../_global_components/sanitize";
import { Col, Row } from "react-bootstrap";
import { usePathname, useRouter } from "next/navigation";

function ScrollFadeSection({
  as: Tag = "section",
  className = "",
  threshold = 0.2,
  children,
  ...rest
}) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={sectionRef}
      className={`scroll-fade-section ${isVisible ? "is-visible" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function ParallaxImageStrip({ imageSrc, startWidth = 383, startHeight = 247, children }) {
  const wrapperRef = useRef(null);
  const innerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    const overlay = overlayRef.current;
    if (!wrapper || !inner) return;

    const lerp = (current, target, ease) => current + (target - current) * ease;
    const EASE = 0.08;
    const THRESHOLD = 0.0005;

    let smoothProgress = 0;
    let targetProgress = 0;
    let running = true;

    const getTargetProgress = () => {
      const wrapperRect = wrapper.getBoundingClientRect();
      const windowH = window.innerHeight;
      const scrollableHeight = wrapper.offsetHeight - windowH;
      if (scrollableHeight <= 0) return 0;
      const scrolled = Math.max(0, -wrapperRect.top);
      return Math.min(1, scrolled / scrollableHeight);
    };

    const isMobile = window.innerWidth <= 768;

    const tick = () => {
      if (!running) return;

      targetProgress = getTargetProgress();
      smoothProgress = lerp(smoothProgress, targetProgress, EASE);

      if (Math.abs(smoothProgress - targetProgress) < THRESHOLD) {
        smoothProgress = targetProgress;
      }

      const p = smoothProgress;

      const zoomEnd = isMobile ? 0.35 : 0.5;
      const zoomP = Math.min(1, p / zoomEnd);
      const stickyEl = wrapper.querySelector(".parallax-strip-sticky");
      const fullW = stickyEl ? stickyEl.offsetWidth : wrapper.offsetWidth;
      const fullH = window.innerHeight;
      const w = startWidth + (fullW - startWidth) * zoomP;
      const h = startHeight + (fullH - startHeight) * zoomP;
     

      inner.style.width = `${w.toFixed(1)}px`;
      inner.style.height = `${h.toFixed(1)}px`;
     

      if (overlay) {
        const fadeStart = isMobile ? 0.25 : 0.4;
        const fadeEnd = isMobile ? 0.55 : 0.85;
        const oP = p <= fadeStart ? 0 : p >= fadeEnd ? 1 : (p - fadeStart) / (fadeEnd - fadeStart);

        overlay.style.opacity = oP.toFixed(3);
        overlay.style.pointerEvents = oP > 0.15 ? "auto" : "none";
        overlay.style.transform = `translateY(${(Math.max(0, 1 - oP) * (isMobile ? 30 : 50)).toFixed(1)}px)`;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);

    return () => {
      running = false;
    };
  }, [startWidth, startHeight]);

  return (
    <div className="parallax-strip-wrapper" ref={wrapperRef}>
      <div className="parallax-strip-sticky">
        <div
          className="parallax-strip-inner"
          ref={innerRef}
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
        {children && (
          <div className="parallax-strip-overlay" ref={overlayRef}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Property({ projectDetail, similarProjects = [] }) {
  const [isAnswerVisible, setIsAnswerVisible] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [amenitiesSlideIndex, setAmenitiesSlideIndex] = useState(0);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isAmenitiesInView, setIsAmenitiesInView] = useState(false);
  const [visibleFloorPlanCards, setVisibleFloorPlanCards] = useState({});
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
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
  const toggleAnswer = (faqKey) => {
    setIsAnswerVisible((prev) => ({
      ...prev,
      [faqKey]: !prev[faqKey],
    }));
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

  const AmenityPrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        className={`${className || ""} amenities-custom-arrow amenities-custom-arrow-prev`}
        onClick={onClick}
        aria-label="Previous amenities"
      >
        <Image src="/icon/arrow-left-s-line.svg" alt="Previous" width={24} height={24} />
      </button>
    );
  };

  const AmenityNextArrow = (props) => {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        className={`${className || ""} amenities-custom-arrow amenities-custom-arrow-next`}
        onClick={onClick}
        aria-label="Next amenities"
      >
        <Image src="/icon/arrow-right-s-line.svg" alt="Next" width={24} height={24} />
      </button>
    );
  };

  const amenitiesSliderSettings = {
    dots: false,
    infinite: (projectDetail.amenities?.length ?? 0) > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <AmenityPrevArrow />,
    nextArrow: <AmenityNextArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
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
  const handleSubmit = async (e) => {
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

    if (!isFormValid) {
      e.stopPropagation();
      setValidated1(true);
      toast.error("Please fill all fields correctly!");
      return;
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
        setValidated1(false);
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

  useEffect(() => {
    const amenitySection = document.getElementById("amenities");
    if (!amenitySection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsAmenitiesInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(amenitySection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleViewportChange = () => {
      setIsMobileOrTablet(window.innerWidth <= 991);
    };
    handleViewportChange();
    window.addEventListener("resize", handleViewportChange);
    return () => window.removeEventListener("resize", handleViewportChange);
  }, []);

  useEffect(() => {
    setVisibleFloorPlanCards({});
    const totalCards = projectDetail?.floorPlans?.length || 0;
    if (!totalCards) return;

    const floorPlanSection = document.getElementById("floorplan");
    if (!floorPlanSection) return;

    const timeoutIds = [];
    let hasStarted = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasStarted) return;

        hasStarted = true;
        for (let index = 0; index < totalCards; index += 1) {
          const timeoutId = window.setTimeout(() => {
            setVisibleFloorPlanCards((prev) => ({ ...prev, [index]: true }));
          }, index * 1000);
          timeoutIds.push(timeoutId);
        }

        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(floorPlanSection);
    return () => {
      observer.disconnect();
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [projectDetail?.floorPlans?.length]);

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
  const amenitiesList = projectDetail.amenities || [];
  const floorPlans = projectDetail.floorPlans || [];
  const galleryImages = projectDetail.galleryImages || [];
  const nearbyBenefitsMaster = Array.isArray(allNearbyBenefits)
    ? allNearbyBenefits
    : Array.isArray(allNearbyBenefits?.data)
      ? allNearbyBenefits.data
      : [];
  const AMENITIES_PER_SLIDE = 8;
  const amenitiesChunks = [];
  for (let i = 0; i < amenitiesList.length; i += AMENITIES_PER_SLIDE) {
    amenitiesChunks.push(amenitiesList.slice(i, i + AMENITIES_PER_SLIDE));
  }
  const showAmenityCards = isAmenitiesInView;
  const aboutBuilderImage =
    projectDetail?.builder?.builderImage ||
    projectDetail?.builder?.image ||
    projectDetail?.projectThumbnail ||  
    projectDetail?.desktopImages?.[0]?.desktopImage ||
    "";
  const aboutBuilderImageSrc = aboutBuilderImage
    ? /^https?:\/\//i.test(aboutBuilderImage) || aboutBuilderImage.startsWith("/")
      ? aboutBuilderImage
      : projectImageSrc(aboutBuilderImage)
    : "/static/no_image.png";
  const getInTouchPoints = [
    "Book a Site Visit",
    "Ask For a Brochure",
    "Speak to a Representative",
    "Ask for a Quotation",
  ];
  const locationBenefitList =
    projectDetail.locationBenefits || projectDetail.projectLocationBenefitList || [];
  const normalizeBenefitText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();
  const formatDistanceLabel = (value) => {
    if (value === undefined || value === null) return "";
    const text = String(value).trim();
    if (!text) return "";
    return /km/i.test(text) ? text : `${text} KM`;
  };
  const getNearbyDistanceLabel = (benefit) => {
    const directDistance =
      benefit?.distance ?? benefit?.distanceKm ?? benefit?.distanceInKm;
    const formattedDirect = formatDistanceLabel(directDistance);
    if (formattedDirect) return formattedDirect;

    const benefitName = normalizeBenefitText(
      benefit?.benefitName || benefit?.name || benefit?.title,
    );

    const matchedItem = locationBenefitList.find((item) => {
      const itemName = normalizeBenefitText(
        item?.benefitName || item?.name || item?.title,
      );
      return (
        !!itemName &&
        !!benefitName &&
        (itemName === benefitName ||
          itemName.includes(benefitName) ||
          benefitName.includes(itemName))
      );
    });

    const matchedDistance =
      matchedItem?.distance ?? matchedItem?.distanceKm ?? matchedItem?.distanceInKm;
    return formatDistanceLabel(matchedDistance);
  };
  const faqList = projectDetail.faqs || [];
  const getFloorPlanImage = (plan) => {
    const imageName =
      plan?.planImage ||
      plan?.floorPlanImage ||
      plan?.imageName ||
      plan?.image ||
      plan?.planMap ||
      "";
    if (!imageName) return "/static/generic-floorplan.jpg";
    if (/^https?:\/\//i.test(imageName) || imageName.startsWith("/")) return imageName
    return projectImageSrc(imageName);
  };

  const getFloorPlanArea = (plan) => {
    const areaValue = plan?.areaSqFt || plan?.area || plan?.areaSqft || plan?.size;
    if (!areaValue) return "On Request";
    const areaText = String(areaValue).trim();
    return /sq|ft|mtr|meter/i.test(areaText) ? areaText : `${areaText} Sq Ft`;
  };

  const goToNextAmenitiesSlide = () => {
    setAmenitiesSlideIndex((prev) => Math.min(prev + 1, amenitiesChunks.length - 1));
  };

  const goToPrevAmenitiesSlide = () => {
    setAmenitiesSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const openGalleryModal = (index) => {
    setActiveGalleryIndex(index);
    setShowGalleryModal(true);
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
  };

  return (
    <>
      {/* <Link
        href="/"
        className={`back-to-home-floating ${backToHomeExpanded ? "back-to-home-floating--expanded" : ""}`}
        aria-label="Back to MyPropertyFact home page"
        onClick={handleBackToHomeClick}
      >
        <span className="back-to-home-floating__text">Back To Home</span>
        <span className="back-to-home-floating__icon">
          <FontAwesomeIcon icon={faArrowLeft} />
        </span>
      </Link> */}
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
                  {/* <li>
                    <Link
                      href="/"
                      className="text-decoration-none"
                      onClick={handleBackToHomeClick}
                    >
                      Back to Home
                    </Link>
                  </li> */}
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
          <div className="hero-content-overlay">
            <h1>{projectDetail.projectName}</h1>
            <button
              className="hero-enquire-btn"
              onClick={() => setShowPopUp(true)}
              type="button"
            >
              <Image
                src="/icon/enquire_now.svg"
                alt=""
                width={32}
                height={32}
                className="hero-enquire-btn__icon"
              />
              <span>Enquire Now</span>
            </button>
          </div>
          <div className="hero-get-detail-card">
            <p className="hero-get-location">
              {projectDetail.projectLocality}, {projectDetail.city},{" "}
              {projectDetail.state}
            </p>
            <p className="hero-get-price">{generatePrice(projectDetail.projectPrice)}</p>
            <p className="hero-get-config">{projectDetail.projectConfiguration}</p>
            <p className="hero-get-rera">RERA: {projectDetail.reraNo || "Not found"}</p>
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

        <div id="overview" className="container overview-section py-5 mt-3 mb-3">
          <div className="overview-lines-layer" aria-hidden="true">
            {[8, 18, 28, 38, 50, 62, 72, 82, 92].map((position, index) => (
              <span
                key={`overview-line-${position}`}
                className="overview-line"
                style={{
                  left: `${position}%`,
                  animationDelay: `${index * 0.5}s`,
                }}
              ></span>
            ))}
          </div>
          <div className="overview-content-wrap text-center mx-auto">
            <h2 className="overview-title">Project Overview</h2>
            <div
              className="overview-description"
              dangerouslySetInnerHTML={{
                __html: projectDetail.projectWalkthroughDescription,
              }}
            ></div>
          </div>
        </div>

        {/* Amenities section */}
        <div className="container-fluid py-5 mb-5 amenities-section" id="amenities">
          <div className="container amenities-content">
            <div className="amenities-head">
              <h2 className="amenities-title">Amenities</h2>
              {amenitiesChunks.length > 1 && (
                <>
                  {amenitiesSlideIndex < amenitiesChunks.length - 1 && (
                    <button
                      type="button"
                      className="amenities-toggle-btn"
                      onClick={goToNextAmenitiesSlide}
                    >
                      <span>View More</span>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="amenities-toggle-btn__icon"
                      />
                    </button>
                  )}
                  {amenitiesSlideIndex > 0 && (
                    <button
                      type="button"
                      className="amenities-toggle-btn amenities-toggle-btn--less ms-2"
                      onClick={goToPrevAmenitiesSlide}
                    >
                      <span>View Less</span>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="amenities-slide-container">
              <div
                className="amenities-slide-track"
                style={{ transform: `translateX(-${amenitiesSlideIndex * 100}%)` }}
              >
                {amenitiesChunks.map((chunk, chunkIndex) => (
                  <div key={chunkIndex} className="amenities-slide">
                    <div className="amenities-grid">
                      {chunk.map((item, index) => (
                        <div
                          key={`${item.id || item.title}-${index}`}
                          className={`amenity-modern-card ${showAmenityCards ? "is-visible" : ""}`}
                          style={{ transitionDelay: `${index * 80}ms` }}
                        >
                          <div className="amenity-modern-icon-wrap">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}amenity/${item.image}`}
                              height={40}
                              width={40}
                              alt={item.altTag || item.title || "Amenity icon"}
                              className="d-flex mx-auto"
                            />
                          </div>
                          <p className="amenity-modern-title">{item.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floor plans section */}
        <div className="container mb-5 floorplan-section" id="floorplan">
          <div className="">
            <h2 className="text-center fw-bold mb-4 floorplan-heading">Floor Plans</h2>
            {projectDetail.floorPlanDescription && (
              <div
                className="text-center mb-4 floorplan-description"
                dangerouslySetInnerHTML={{
                  __html: projectDetail.floorPlanDescription,
                }}
              ></div>
            )}
          </div>
          {!!floorPlans.length && (
            <div className={`floorplan-grid${floorPlans.length === 1 ? " floorplan-grid--single" : ""}`}>
              {floorPlans.map((item, index) => (
                <article
                  key={`${item.id || item.planType || "plan"}-${index}`}
                  data-floor-index={index}
                  className={`floorplan-card ${visibleFloorPlanCards[index] ? "is-visible" : ""}`}
                >
                  <div className="floorplan-card-top-meta">
                    <p>
                      <span>Type</span>
                      <strong>{item.planType || item.type || "Offices"}</strong>
                    </p>
                    <p>
                      <span>Size</span>
                      <strong>{getFloorPlanArea(item)}</strong>
                    </p>
                  </div>

                  <div className="floorplan-image-wrap">
                    <Image
                      width={500}
                      height={300}
                      className="img-fluid floorplan-image"
                      src={getFloorPlanImage(item)}
                      alt={item.altTag || item.planType || "Floor plan"}
                    />
                  </div>

                  <button
                    type="button"
                    className="floorplan-expand-btn"
                    onClick={() => setShowPopUp(true)}
                    aria-label={`Enquire for ${item.planType || "floor plan"}`}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Gallery section */}
        <div className="container py-5 mb-5 gallery-modern-section" id="gallery">
          <h2 className="gallery-modern-title">Gallery</h2>
          {!!galleryImages.length && (
            <div className="gallery-modern-grid">
              {galleryImages.map((item, index) => (
                <button
                  type="button"
                  key={`${index}-${item.id || item.imageName}`}
                  className="gallery-modern-item"
                  onClick={() => openGalleryModal(index)}
                  aria-label={`Open gallery image ${index + 1}`}
                >
                  <Image
                    src={projectImageSrc(item.imageName)}
                    alt={item.altTag || `Gallery image ${index + 1}`}
                    fill
                    className="gallery-modern-image"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Location section */}
        <ScrollFadeSection
          as="section"
          className="location-modern-section mb-5"
          id="location"
        >
          
          <div className="container location-modern-container">
            <div className="location-modern-map">
              <Image
                src={projectImageSrc(projectDetail.locationMap)}
                alt="Project Location Map"
                fill
                className="location-modern-map-image"
              />
            </div>

            <div className="location-modern-panel">
              <h2 className="location-modern-title">Location</h2>
              <div className="location-modern-info-card">
                <div className="location-modern-row">
                  <span>Address</span>
                  <strong>{projectDetail.projectLocality || "NA"}</strong>
                </div>
                <div className="location-modern-row">
                  <span>State</span>
                  <strong>{projectDetail.state || "NA"}</strong>
                </div>
                <div className="location-modern-row">
                  <span>City</span>
                  <strong>{projectDetail.city || "NA"}</strong>
                </div>
                <div className="location-modern-row">
                  <span>Country</span>
                  <strong>{projectDetail.country || "NA"}</strong>
                </div>
              </div>

              <button
                type="button"
                className="location-modern-map-btn"
                onClick={() => setShowPopUp(true)}
              >
                <span>View Map</span>
                <span className="location-modern-map-btn-icon">
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </button>
            </div>
          </div>

          {!!nearbyBenefitsMaster.length && (
            <div className="container location-nearby-wrap">
              <h3 className="location-nearby-title">Nearby Benefits</h3>
              <div className="location-nearby-marquee">
                <div className="location-nearby-track">
                  {[...nearbyBenefitsMaster, ...nearbyBenefitsMaster].map((benefit, index) => {
                    const benefitName = benefit.benefitName || benefit.name || benefit.title || "Benefit";
                    const linkedDistance = getNearbyDistanceLabel(benefit);
                    return (
                    <article
                      key={`${benefit.id || benefit.benefitName || "benefit"}-${index}`}
                      className="location-nearby-card"
                    >
                      <div className="location-nearby-card-icon">
                        <Image
                          src={
                            addNearbyImageIcon(benefit.benefitName) ||
                            "/icon/fallback-icon.png"
                          }
                          alt={benefitName}
                          width={22}
                          height={22}
                        />
                      </div>
                      <div className="location-nearby-card-content">
                        <p>{benefitName}</p>
                        {linkedDistance && <span>{linkedDistance}</span>}
                      </div>
                    </article>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </ScrollFadeSection>
      </div>

      {/* About the project */}
      <ScrollFadeSection as="section" className="about-modern-section mb-5">
        <div className="container about-modern-container">
          <div className="about-modern-image-wrap">
            <Image
              src={aboutBuilderImageSrc}
              alt={projectDetail.builder?.builderName || "Builder"}
              fill
              className="about-modern-image"
            />
          </div>

          <div className="about-modern-content">
            <p className="about-modern-label">About</p>
            <h2 className="about-modern-title">
              The Builder {projectDetail.builder?.builderName || ""}
            </h2>
            <div
              className="about-modern-description"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(projectDetail.builder?.builderDescription || ""),
              }}
            ></div>

            <Link
              href={`/builder/${projectDetail.builder?.slugURL || "#"}`}
              className="about-modern-link-btn"
              aria-label="Open builder details"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </ScrollFadeSection>

      <ParallaxImageStrip imageSrc={aboutBuilderImageSrc}>
        <div className="get-touch-overlay-inner">
          <h2 className="get-touch-title">Get in Touch</h2>
          <p className="get-touch-copy">
            If you have any additional queries regarding the project or would like to
            take the next step in your investment journey, you can fill out this query
            form and our team will be happy to assist you with what you need.
          </p>

          <div className="get-touch-point-list">
            {getInTouchPoints.map((point) => (
              <span key={point} className="get-touch-point-item">
                <span className="get-touch-point-icon">
                  <Image src="/icon/verify.svg" alt="" width={12} height={12} />
                </span>
                <span>{point}</span>
              </span>
            ))}
          </div>

          <div className="project-detail-contact-form get-touch-form-wrap">
            <Form
              noValidate
              validated={validated1}
              className="w-100"
              onSubmit={(e) => handleSubmit(e)}
            >
              <Row className="g-2">
                <Col md={4}>
                  <Form.Group className="mb-2" controlId="first_name">
                    <Form.Control
                      type="text"
                      placeholder="Full Name"
                      value={formData.name || ""}
                      onChange={(e) => handleChange(e)}
                      onBlur={handleBlur}
                      name="name"
                      isInvalid={!!errors.name || (validated1 && !formData.name.trim())}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name || "Please provide a valid name."}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2" controlId="email_id">
                    <Form.Control
                      type="email"
                      placeholder="Email Id"
                      value={formData.email || ""}
                      onChange={(e) => handleChange(e)}
                      onBlur={handleBlur}
                      name="email"
                      isInvalid={!!errors.email || (validated1 && !formData.email.trim())}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email || "Please provide a valid email."}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2" controlId="phone_number">
                    <Form.Control
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone || ""}
                      onChange={(e) => handleChange(e)}
                      onBlur={handleBlur}
                      name="phone"
                      isInvalid={!!errors.phone || (validated1 && !formData.phone.trim())}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone || "Please provide a valid phone number."}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-2" controlId="message">
                <Form.Control
                  as="textarea"
                  rows={4}
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

              <Button
                className="btn btn-background text-white border-0 w-100 py-3 text-capitalize get-touch-submit-btn"
                type="submit"
                disabled={showLoading}
              >
                Submit
                <LoadingSpinner show={showLoading} />
              </Button>
            </Form>
          </div>
        </div>
      </ParallaxImageStrip>

      {/* Similar Projects */}
      {similarProjects.length > 0 && (
        <div className="container-fluid mb-5 mt-5">
          <h2 className="text-center mb-4 fw-bold">Similar Projects</h2>
          <Featured
            title="Similar Projects"
            autoPlay={true}
            allProjects={similarProjects}
            type="Similar"
            badgeVariant="default"
          />
        </div>
      )}

      {/* FAQs */}
      {!!faqList.length && (
        <section className="faq-modern-section mb-5">
          <div className="container">
            <h2 className="faq-modern-title">Frequently Asked Question</h2>
            <p className="faq-modern-subtitle">
              Find answers to common questions about this project.
            </p>

            <div className="faq-modern-list">
              {faqList.map((item, index) => {
                const faqKey = item.id ?? index;
                const isOpen = !!isAnswerVisible[faqKey];
                return (
                  <article key={`${faqKey}-${index}`} className="faq-modern-item">
                    <button
                      type="button"
                      className="faq-modern-question"
                      onClick={() => toggleAnswer(faqKey)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <span className="faq-modern-icon-wrap">
                        <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} />
                      </span>
                    </button>
                    <div className={`faq-modern-answer ${isOpen ? "show" : ""}`}>
                      <p>{item.answer}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Popular Cities */}
      <PopularCitiesSection />

      <CommonPopUpform
        show={showPopUp}
        handleClose={setShowPopUp}
        from={"Project Detail"}
        data={projectDetail}
      />

      <Modal
        show={showGalleryModal}
        onHide={closeGalleryModal}
        centered
        size="xl"
        className="gallery-zoom-modal"
        backdropClassName="gallery-zoom-backdrop"
      >
        <Modal.Body>
          <button
            type="button"
            className="gallery-modal-close-btn"
            aria-label="Close gallery preview"
            onClick={closeGalleryModal}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div className="gallery-zoom-viewer">
            {galleryImages[activeGalleryIndex] && (
              <Image
                src={projectImageSrc(galleryImages[activeGalleryIndex].imageName)}
                alt={galleryImages[activeGalleryIndex].altTag || "Gallery preview"}
                width={1400}
                height={1000}
                className="gallery-zoom-image"
              />
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
