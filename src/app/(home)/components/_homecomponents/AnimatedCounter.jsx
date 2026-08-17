"use client";

import { useEffect, useState, useRef } from "react";

export default function AnimatedCounter({ targetValue, suffix = "+" }) {
  // Extract numeric value from string (handles commas)
  const getNumericValue = (value) => {
    if (typeof value === "string") {
      // Remove commas and any non-numeric characters except decimal point
      const numericStr = value.replace(/[^\d.]/g, "");
      return parseInt(numericStr, 10) || 0; 
    }
    return value || 0;
  };

  // Format number with commas - consistent formatting
  const formatNumber = (num) => {
    // Use consistent formatting to avoid hydration issues
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get target value once
  const target = getNumericValue(targetValue);
  
  // Initialize with 0 - will match on server and client
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const counterRef = useRef(null);

  // Mark as mounted after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run animation after component is mounted on client
    if (!isMounted || typeof window === "undefined") return;
    
    // Intersection Observer to trigger animation when element is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            
            // Animation duration (2 seconds)
            const duration = 2000;
            const startTime = Date.now();
            const startValue = 0;
            const endValue = target;

            const animate = () => {
              const now = Date.now();
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Easing function for smooth animation (ease-out)
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);

              setCount(currentValue);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCount(endValue);
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the element is visible
      }
    );

    const currentElement = counterRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [targetValue, hasAnimated, isMounted, target]);

  // Always render 0 initially to match server and client
  // Use suppressHydrationWarning to prevent warnings when value changes
  return (
    <span ref={counterRef} suppressHydrationWarning>
      {formatNumber(count)}{suffix}
    </span>
  );
}

