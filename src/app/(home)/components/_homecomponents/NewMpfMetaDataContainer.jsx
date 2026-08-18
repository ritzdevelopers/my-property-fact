"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import "./newmpfmetadata.css";
import Link from "next/link";

export default function NewMpfMetaDataContainer({ propertyTypes, projects, builders, cities }) {
  const normalizePropertyTypeName = (value = "") => value.trim().toLowerCase();
  const semanticPropertyHeadings = ["Commercial", "New Launches", "Residential"].filter(
    (heading) =>
      propertyTypes?.some((item) => {
        const typeName = normalizePropertyTypeName(item?.projectTypeName);
        if (normalizePropertyTypeName(heading) === "new launches") {
          return typeName === "new launches" || typeName === "new launch";
        }
        return typeName === normalizePropertyTypeName(heading);
      })
  );

  // Default statistics for MPF meta data
  const [statistics, setStatistics] = useState([
    {
      image: "/static/footer/icon1.svg",
      alt: "Cities covered",
      number: cities.length > 0 ? cities.length : 0,
      label: "Cities",
    },
    {
      image: "/static/footer/icon2.svg",
      alt: "Verified builders",
      number: builders.length > 0 ? builders.length : 0,
      label: "Builders",
    },
    {
      image: "/static/footer/icon3.svg",
      alt: "Listed projects",
      number: projects.length > 0 ? projects.length : 0,
      label: "Projects",
    },
    {
      image: "/static/footer/icon4.svg",
      alt: "Property units",
      number: "10,030",
      label: "Units",
    },
  ]);
  // Animated values for statistics
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0]);
  // Has animated flag
  const [hasAnimated, setHasAnimated] = useState(false);
  // Observer reference
  const observerRef = useRef(null);
  // Fetch statistics data dynamically from API

  // Helper function to parse number from string (handles commas)
  const parseNumber = useCallback((value) => {
    if (typeof value === "number") return value;
    return parseInt(value.replace(/,/g, ""), 10) || 0;
  }, []);

  // Helper function to format number with commas
  const formatNumber = useCallback((num) => {
    return num.toLocaleString("en-US");
  }, []);

  // Counter animation function
  const animateCounter = useCallback((targetValue, index, duration = 2000) => {
    const startValue = 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (targetValue - startValue) * easeOutQuart
      );

      setAnimatedValues((prev) => {
        const newValues = [...prev];
        newValues[index] = currentValue;
        return newValues;
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedValues((prev) => {
          const newValues = [...prev];
          newValues[index] = targetValue;
          return newValues;
        });
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Intersection Observer to trigger animation when component is visible
  useEffect(() => {
    const currentRef = observerRef.current;
    if (!currentRef) return;

    // Check if statistics have valid data (not all zeros)
    const hasValidData = statistics.some(stat => parseNumber(stat.number) > 0);
    if (!hasValidData) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            statistics.forEach((stat, index) => {
              const targetValue = parseNumber(stat.number);
              animateCounter(targetValue, index);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    // If component is already visible and data is loaded, trigger animation immediately
    const checkVisibility = () => {
      if (currentRef) {
        const rect = currentRef.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible && !hasAnimated && hasValidData) {
          setHasAnimated(true);
          statistics.forEach((stat, index) => {
            const targetValue = parseNumber(stat.number);
            animateCounter(targetValue, index);
          });
        }
      }
    };

    // Check immediately and after a short delay
    checkVisibility();
    const timeoutId = setTimeout(checkVisibility, 100);

    return () => {
      clearTimeout(timeoutId);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated, statistics, parseNumber, animateCounter]);

  return (
    <div className="mpf-metadata-container container my-5">
      {/* Top Section: Property Search Interface */}
      <div className="property-search-card">
        <div className="illustration-left">
          <div className="left-iilution-container">
            <img
              src="/static/footer/leftillution.png"
              alt="Illustration for Find The Best Property — homes and city search on My Property Fact"
              title="Illustration for Find The Best Property — homes and city search on My Property Fact"
              width={336}
              height={90}
            />
          </div>
        </div>
        <div className="property-search-card-content">
          <h1 className="property-search-title plus-jakarta-sans-semi-bold mt-3 mt-md-0">
            Find The Best Property
          </h1>
          <div className="visually-hidden">
            {semanticPropertyHeadings.map((heading) => (
              <h2 key={heading}>{heading}</h2>
            ))}
          </div>
          <div className="property-buttons-overlay d-flex flex-wrap justify-content-center gap-4 gap-lg-3">

            {propertyTypes && propertyTypes.map((item, index) => (
              <div key={`row-${index}`}>
                <Link
                  href={`projects/${item.slugUrl}`}
                  className="btn-normal-color rounded-5 py-2 px-3 text-white text-decoration-none z-3 position-relative"
                  title={`${item.projectTypeName} projects`}
                >
                  {item.projectTypeName}
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/* Right: House with Figures Illustration */}
        <div className="illustration-right">
          <div className="right-illustration-container">
            <img
              src="/static/footer/rightillution.png"
              alt="Illustration for Find The Best Property — family and suburban homes on My Property Fact"
              title="Illustration for Find The Best Property — family and suburban homes on My Property Fact"
              width={450}
              height={130}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: Statistics */}
      <div className="statistics-section" ref={observerRef}>
        {statistics.map((stat, index) => (
          <div key={index} className="statistics-card">
            <div className="statistics-icon">
              <img
                src={stat.image}
                alt={stat.alt}
                title={stat.alt}
                width={58}
                height={58}
              />
            </div>
            <p className="statistics-number">
              {formatNumber(animatedValues[index])}
              <span>+</span>
            </p>
            <div className="statistics-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}