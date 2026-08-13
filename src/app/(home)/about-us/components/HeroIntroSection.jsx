"use client";
import { useEffect, useRef, useState } from "react";
import "./style/HeroIntroSection.css";

export default function HeroIntroSection() {

  const leftImageRef = useRef(null);
  const rightImageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          leftImageRef.current?.classList.add("reveal");
          rightImageRef.current?.classList.add("reveal");
        }
      },
      {
        threshold: 0.25,
      }
    );

    if (leftImageRef.current) observer.observe(leftImageRef.current);
    if (rightImageRef.current) observer.observe(rightImageRef.current);

    return () => observer.disconnect();
  }, []);

  const headingRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.intersectionRatio < 0.8);
      },
      {
        threshold: [0.8],
      }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="heroIntro">

      <div className="heroIntro-container">

        <h1
          ref={headingRef}
          className={`heroHeading ${active ? "active" : ""}`}
        >
          Why Trust MPF?
          <span></span>
        </h1>

        <div className="introGrid">

          <div className="leftImage" ref={leftImageRef}>

            <img
              src="/about/about_us_section.jpg"
              alt="Building"
            />

          </div>

          <div className="rightContent">

            <p className="introText">
              At My Property Fact, transparency, trust, and innovation are at the heart of everything we do. By combining technology, reliable data, and expert guidance, we make every stage of your real estate journey - from discovery to decision - simpler, smarter, and more transparent. <br /><br />
              Whether you&apos;re buying, renting, or investing, My Property Fact is here to help you explore with confidence and make property decisions you can truly trust.
            </p>

            <div className="rightImageFrame" ref={rightImageRef}>
              <img
                src="/about/about_us_banner.jpg"
                alt="Property"
              />
            </div>
          </div>

        </div>

        <h2 className="bottomHeading">
          Real Estate Without the Guesswork.
        </h2>

        <p className="bottomDescription">
          Welcome to My Property Fact (MPF), India&apos;s buyer-first real estate platform, built to make property decisions simpler, smarter, and more transparent.

          We combine verified data, on-ground research, and easy-to-understand insights to help you buy, rent, or invest with confidence. From our proprietary LOCATE Score to clear guidance on carpet area, approvals, GST, and stamp duty, we simplify complex real estate information so you can make informed decisions.

          Whether you&apos;re looking for apartments, villas, plots, farmhouses, office spaces, or commercial properties, MPF brings everything together in one place - helping you find the right property with confidence.
        </p>

      </div>

    </section>
  );
}