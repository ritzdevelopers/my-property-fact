"use client";

import { useState } from "react";
import floorplan1 from "../assets/floor1.webp";
import floorplan2 from "../assets/floor1.webp";
import bgImage from "../assets/amenities.png";

const accordionData = [
  {
    title: "3 BHK – 1350-1545 sq. ft.",
    content:
      "Ideal for growing families, our 3 BHK layouts are designed with spacious living areas, corner ventilation, modular kitchens, and premium fittings to offer comfort and style.",
    image: floorplan1,
  },
  {
    title: "4 BHK – 2010-2050 sq. ft.",
    content:
      "Our 4 BHK residences offer expansive spaces perfect for larger families, featuring thoughtfully designed layouts, airy balconies, and smartly planned utility zones.",
    image: floorplan2,
  },
  {
    title: "Why Choose The Brook?",
    content:
      "Enjoy the freedom to live your way with flexible payment plans, loan assistance from top banks, and layouts tailored for modern lifestyles.",
    image: floorplan1,
  },
];

const FloorPlansSection = () => {
  const [openIndex, setOpenIndex] = useState(0); // Tracks which image to show
  const [activeIndex, setActiveIndex] = useState(0); // Controls which accordion is expanded

  const toggleAccordion = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null); // Collapse accordion
      // Keep openIndex unchanged to preserve image
    } else {
      setActiveIndex(index); // Expand new accordion
      setOpenIndex(index); // Update image
    }
  };

  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section
      id="floorPlan"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container py-5">
        <div className="text-center mb-5">
          <h4 className="text-uppercase text-secondary fw-semibold">
            Layout Options
          </h4>
          <h2 className="fw-bold display-5 text-dark mt-2">
            Tailored for Every Modern Family
          </h2>
          <p
            className="lead text-muted mt-3 mx-auto"
            style={{ maxWidth: "700px" }}
          >
            At The Brook, space isn’t just square footage — it’s the freedom to
            live your way.
          </p>
        </div>

        <div className="row align-items-start g-4">
          {/* Left: Dynamic Image */}
          <div className="col-md-6">
            {openIndex !== null && (
              <div
                key={openIndex} // forces re-render when openIndex changes
                className="fade-image-wrapper position-relative rounded overflow-hidden shadow"
              >
                <img
                  src={accordionData[openIndex].image}
                  alt={accordionData[openIndex].title}
                  className="img-fluid"
                  style={{
                    filter: "blur(3px) drop-shadow(0 0 3px gold)",
                  }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-10 backdrop-blur rounded" />
              </div>
            )}
          </div>

          {/* Right: Accordion */}
          <div className="col-md-6">
            <div className="accordion" id="floorPlanAccordion">
              {accordionData.map((item, index) => (
                <div className="accordion-item" key={index}>
                  <h2 className="accordion-header" id={`heading${index}`}>
                    <button id="accordion-btn"
                      className={`accordion-button ${activeIndex === index ? "" : "collapsed"
                        }`}
                      type="button"
                      onClick={() => toggleAccordion(index)}
                    >
                      {item.title}
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${activeIndex === index ? "show" : ""
                      }`}
                  >
                    <div className="accordion-body">{item.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                className="btn btn-lg text-white"
                style={{ backgroundColor: "#D0B674", borderColor: "#D0B674" }}
                onClick={openPopup}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#000")}
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#D0B674")
                }
              >
                Know More
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .accordion-button:focus {
          box-shadow: none !important;
          background-color: #d0b674 !important;
          border-color: #d0b674 !important;
        }
        .accordion-button:not(.collapsed) {
          color: inherit !important;
          background: #d0b674 !important;
          border-color: gold !important;
          box-shadow: none !important;
        }
        .accordion-item {
          margin-bottom: 1rem;
        }
        .accordion-button {
          font-size: 1.125rem;
        }
         
        .fade-image-wrapper {
          animation: fadeIn 0.6s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0.2;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

    
    
      `}</style>
    </section>
  );
};

export default FloorPlansSection;
