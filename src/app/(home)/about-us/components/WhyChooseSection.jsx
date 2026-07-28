"use client";

import { useEffect, useRef } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import "./style/WhyChooseSection.css";

const features = [
  {
    title: "HOLISTIC PLATFORM",
    description:
      "Find everything from residential rentals to large-scale commercial investments in one place.",
  },
  {
    title: "HOLISTIC PLATFORM",
    description:
      "Find everything from residential rentals to large-scale commercial investments in one place.",
  },
  {
    title: "HOLISTIC PLATFORM",
    description:
      "Find everything from residential rentals to large-scale commercial investments in one place.",
  },
  {
    title: "HOLISTIC PLATFORM",
    description:
      "Find everything from residential rentals to large-scale commercial investments in one place.",
  },
];

export default function WhyChooseSection() {
  const sliderRef = useRef(null);
  const resumeTimer = useRef(null);

  const handleArrow = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Pause marquee
    slider.classList.add("paused");

    slider.scrollBy({
      left: direction * 350,
      behavior: "smooth",
    });

    clearTimeout(resumeTimer.current);

    resumeTimer.current = setTimeout(() => {
      slider.classList.remove("paused");
    }, 1200);
  };

  useEffect(() => {
    return () => clearTimeout(resumeTimer.current);
  }, []);

  return (
    <section className="whyChoose">
      <div className="whyChoose__container">
        <div className="whyChoose__content">

          <div className="whyChoose__blueBg" />

          <div className="whyChoose__header">

            <h2 className="whyChoose__title heading">
              Why My Property Fact?
            </h2>

            <div className="whyChoose__arrows">

              <button
                className="whyChoose__arrow"
                onClick={() => handleArrow(-1)}
              >
                <FiArrowLeft />
              </button>

              <button
                className="whyChoose__arrow"
                onClick={() => handleArrow(1)}
              >
                <FiArrowRight />
              </button>

            </div>

          </div>

          <div
            ref={sliderRef}
            className="whyChoose__slider"
          >
            <div className="whyChoose__track">
              {[...features, ...features].map((item, index) => (
                <div className="whyCard" key={index}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}