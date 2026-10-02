"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "./contact.css";

const SocialFeedsOfMPF = dynamic(
  () => import("../components/_homecomponents/SocialFeedsOfMPF"),
  {
    ssr: false,
    loading: () => <section style={{ minHeight: 320 }} aria-busy="true" />,
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

function ContactDreamHomeSection() {
  return (
    <div className="container-fluid looking-for-dream-home-section">
      <div className="looking-for-dream-home-section-image1">
        <Image
          src="/static/contact-us/looking_for_Dream_home_bg.png"
          alt="Dream home — background graphic for Looking for a dream home on My Property Fact contact page"
          title="Dream home — background graphic for Looking for a dream home on My Property Fact contact page"
          width={414}
          height={603}
          sizes="(max-width: 767px) 100vw, 414px"
          quality={50}
        />
      </div>
      <div className="looking-for-dream-home-section-content">
        <h2 className="plus-jakarta-sans-semi-bold">Looking For A Dream Home?</h2>
        <p>We can help you realize your dream of a new home</p>
        <div>
          <button
            onClick={() => {
              window.location.href = "/projects";
            }}
          >
            View Projects
          </button>
        </div>
      </div>
      <div className="looking-for-dream-home-section-image2">
        <Image
          src="/static/contact-us/looking_for_dream_home.png"
          alt="Dream home — illustration for Looking for a dream home on My Property Fact contact page"
          title="Dream home — illustration for Looking for a dream home on My Property Fact contact page"
          width={480}
          height={500}
          sizes="(max-width: 767px) 100vw, 480px"
          quality={50}
        />
      </div>
    </div>
  );
}

function ContactMapSection() {
  return (
    <div className="container-fluid mt-3 mb-2 p-0 map-container">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.2218239019567!2d77.4114103!3d28.502973100000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce9cc1ae0ebad%3A0xc60e4de11898150c!2sMy%20Property%20Fact!5e0!3m2!1sen!2sin!4v1777278399978!5m2!1sen!2sin"
        className="contact-map-iframe"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Location Map"
      />
    </div>
  );
}

export default function ContactBelowFold() {
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
        <section
          className="looking-for-dream-home-section"
          style={{ minHeight: 603 }}
          aria-busy="true"
        />
        <section style={{ minHeight: 320 }} aria-busy="true" />
        <section className="map-container" style={{ minHeight: 465 }} aria-busy="true" />
      </>
    );
  }

  return (
    <>
      <LazyMount minHeight={603}>
        <ContactDreamHomeSection />
      </LazyMount>
      <LazyMount minHeight={320}>
        <SocialFeedsOfMPF />
      </LazyMount>
      <LazyMount minHeight={465}>
        <ContactMapSection />
      </LazyMount>
    </>
  );
}
