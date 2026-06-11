"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "../components/_homecomponents/newmpfmetadata.css";

const UNITS_DISPLAY = "10,030";

export default function MpfPlatformStatistics({
  citiesCount = 0,
  buildersCount = 0,
  projectsCount = 0,
}) {
  const statistics = useMemo(
    () => [
      {
        image: "/static/footer/icon1.svg",
        alt: "Cities covered — statistic icon",
        number: citiesCount,
        label: "Cities",
      },
      {
        image: "/static/footer/icon2.svg",
        alt: "Verified builders — statistic icon",
        number: buildersCount,
        label: "Builders",
      },
      {
        image: "/static/footer/icon3.svg",
        alt: "Listed projects — statistic icon",
        number: projectsCount,
        label: "Projects",
      },
      {
        image: "/static/footer/icon4.svg",
        alt: "Property units — statistic icon",
        number: UNITS_DISPLAY,
        label: "Units",
      },
    ],
    [citiesCount, buildersCount, projectsCount],
  );

  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const observerRef = useRef(null);

  const parseNumber = useCallback((value) => {
    if (typeof value === "number") return value;
    return parseInt(String(value).replace(/,/g, ""), 10) || 0;
  }, []);

  const formatNumber = useCallback((num) => {
    return num.toLocaleString("en-US");
  }, []);

  const animateCounter = useCallback((targetValue, index, duration = 2000) => {
    const startValue = 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (targetValue - startValue) * easeOutQuart,
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

  useEffect(() => {
    setHasAnimated(false);
    setAnimatedValues([0, 0, 0, 0]);
  }, [citiesCount, buildersCount, projectsCount]);

  useEffect(() => {
    const currentRef = observerRef.current;
    if (!currentRef) return;

    const hasValidData = statistics.some((stat) => parseNumber(stat.number) > 0);
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
      { threshold: 0.1 },
    );

    observer.observe(currentRef);

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
    <div
      className="statistics-section about-us-platform-stats"
      ref={observerRef}
      aria-label="My Property Fact platform scale"
    >
      {statistics.map((stat, index) => (
        <div key={stat.label} className="statistics-card">
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
  );
}
