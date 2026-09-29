"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const sectionPlaceholder = (className, minHeight) => (
  <section
    className={className}
    style={{ minHeight }}
    aria-busy="true"
  />
);

const VideoCTASection = dynamic(() => import("./components/VideoCTASection"), {
  ssr: false,
  loading: () => sectionPlaceholder("videoCTASection", 520),
});

const WhyChooseSection = dynamic(() => import("./components/WhyChooseSection"), {
  ssr: false,
  loading: () => sectionPlaceholder("whyChoose", 420),
});

const TimelineSection = dynamic(() => import("./components/TimelineSection"), {
  ssr: false,
  loading: () => sectionPlaceholder("timeline-section", 560),
});

const WhyMyPropertyFact = dynamic(
  () => import("./components/WhyMyPropertyFact"),
  {
    ssr: false,
    loading: () => sectionPlaceholder("commitment-section", 420),
  },
);

const VaastuStripSection = dynamic(
  () => import("../components/home/vaastu-strip/VaastuStripSection"),
  {
    ssr: false,
    loading: () => sectionPlaceholder("vaastu-strip", 220),
  },
);

const SocialFeedsOfMPF = dynamic(
  () => import("../components/_homecomponents/SocialFeedsOfMPF"),
  {
    ssr: false,
    loading: () => sectionPlaceholder("", 320),
  },
);

function LazyMount({ children, minHeight, rootMargin = "400px 0px" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}

export default function AboutBelowFold() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId;
    let timeoutId;
    const reveal = () => setReady(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(reveal, { timeout: 1800 });
      return () => {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleId);
        }
      };
    }

    timeoutId = window.setTimeout(reveal, 900);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!ready) {
    return (
      <>
        {sectionPlaceholder("videoCTASection", 520)}
        {sectionPlaceholder("whyChoose", 420)}
        {sectionPlaceholder("timeline-section", 560)}
        {sectionPlaceholder("commitment-section", 420)}
        {sectionPlaceholder("vaastu-strip", 220)}
        {sectionPlaceholder("", 320)}
      </>
    );
  }

  return (
    <>
      <LazyMount minHeight={520}>
        <VideoCTASection />
      </LazyMount>
      <LazyMount minHeight={420}>
        <WhyChooseSection />
      </LazyMount>
      <LazyMount minHeight={560}>
        <TimelineSection />
      </LazyMount>
      <LazyMount minHeight={420}>
        <WhyMyPropertyFact />
      </LazyMount>
      <LazyMount minHeight={220}>
        <VaastuStripSection ariaLabelledBy="our-commitment-heading" />
      </LazyMount>
      <LazyMount minHeight={320}>
        <SocialFeedsOfMPF sectionTitle="Social Feeds from My Property Fact on Instagram" />
      </LazyMount>
    </>
  );
}
