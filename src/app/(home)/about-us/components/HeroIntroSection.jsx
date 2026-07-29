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
          Building Trust. Creating Better Spaces.
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
              My Property Fact (MPF) is India&apos;s buyer-first real estate guide.
              We combine data, on-ground verification, and plain-English advice
              to help you choose confidently. Our proprietary LOCATE Score
              compares neighbourhoods on economy, projects, connectivity,
              amenities, trends, and supply and demand.

              We demystify carpet area, approvals, GST and stamp duty, and
              normalise every home to an effective price per usable square foot.

              Whether you&apos;re shortlisting your first 2-BHK or benchmarking a
              portfolio, MPF gives you clear checklists, calculators and market
              insights you can actually use.
            </p>

            <div className="rightImageFrame"  ref={rightImageRef}>
              <img
                src="/about/about_us_banner.jpg"
                alt="Property"
              />
            </div>
          </div>

        </div>

        <p className="bottomDescription">
          Welcome to My Property Fact, your go-to platform for discovering the
          perfect real estate opportunities. Whether you&apos;re an investor hunting
          for the next big project, a business owner scouting commercial space,
          or a family looking for a new home to call your own. We bring together
          all types of properties, from high-end apartments and cozy farmhouses
          to strategic commercial plots and premium office spaces for both
          buying and renting.
        </p>

      </div>

    </section>
  );
}