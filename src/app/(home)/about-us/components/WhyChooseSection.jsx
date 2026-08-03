"use client";

import { useState, useEffect } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import "./style/WhyChooseSection.css";

const features = [
  {
    title: "Buyer-First Platform",
    description:
      "Every feature is designed to help buyers make informed decisions - not just browse listings.",
  },
  {
    title: "Verified Market Insights",
    description:
      "Access trusted data, on-ground research, and expert analysis to stay ahead of the market.",
  },
  {
    title: "LOCATE Score",
    description:
      "Compare neighbourhoods based on connectivity, amenities, infrastructure, demand, and future growth - all in one score.",
  },
  {
    title: "Smart Property Tools",
    description:
      "From EMI calculators to stamp duty estimates, our tools simplify planning and help you budget with confidence.",
  },
  {
    title: "Reach the Right Audience",
    description:
      "Generate quality enquiries by connecting your projects with genuine buyers and investors.",
  },
];

export default function WhyChooseSection() {
  const [isMobile, setIsMobile] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  const next = () => {
    setCurrent((prev) => (prev + 1) % features.length);
  };

  const prev = () => {
    setCurrent((prev) =>
      prev === 0 ? features.length - 1 : prev - 1
    );
  };

  return (
    <section className="whyChoose">
      <div className="whyChoose__container">
        <div className="whyChoose__content">

          <div className="whyChoose__blueBg" />

          <div className="whyChoose__header">
            <h2 className="whyChoose__title heading">
              Why My Property Fact?
            </h2>

            {!isMobile && (
              <div className="whyChoose__arrows">
                <button
                  className="whyChoose__arrow"
                  onClick={prev}
                >
                  <FiArrowLeft />
                </button>

                <button
                  className="whyChoose__arrow"
                  onClick={next}
                >
                  <FiArrowRight />
                </button>
              </div>
            )}
          </div>

          {!isMobile ? (
            <div className="whyChoose__slider">
              <div className="whyChoose__track">
                {[...features, ...features].map((item, index) => (
                  <div className="whyCard" key={index}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="whyChoose__mobileCard">
                <div className="whyCard">
                  <h3>{features[current].title}</h3>
                  <p>{features[current].description}</p>
                </div>
              </div>

              <div className="whyChoose__mobileButtons">
                <button
                  className="whyChoose__arrow"
                  onClick={prev}
                >
                  <FiArrowLeft />
                </button>

                <button
                  className="whyChoose__arrow"
                  onClick={next}
                >
                  <FiArrowRight />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}