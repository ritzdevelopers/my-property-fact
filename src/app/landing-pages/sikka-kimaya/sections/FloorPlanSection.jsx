"use client";

import React from "react";
import bhk2 from "../assets/2BHK_Floor_Plan.jpg";
import bhk3 from "../assets/3bhk_Floor_Plan.jpg";
import bhk4 from "../assets/4bhk_Floor_plan.jpg";
import penthouse from "../assets/Penthouse_FloorPlan.jpg";

const floorPlans = [
  {
    title: "2 BHK",
    size: "1195 – 1820 sq. ft.",
    desc: "Perfect for nuclear families with spacious living areas.",
    image: bhk2,
  },
  {
    title: "3 BHK",
    size: "1390 – 2135 sq. ft.",
    desc: "For growing families requiring more room and comfort.",
    image: bhk3,
  },
  {
    title: "4 BHK",
    size: "2645 – 2775 sq. ft.",
    desc: "Premium villas for those who want expansive luxury and privacy.",
    image: bhk4,
  },
  {
    title: "PentHouse",
    size: "Available on request",
    desc: "With panoramic views and modern interiors",
    image: penthouse,
  },
];

export default function FloorPlanSection() {
  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section className="py-5 bg-white" id="floorPlan">
      <div className="container text-center">
        {/* Subtitle & Title */}
        <p className="fs-4 text-secondary mb-2">
          Floor Plan
          <span
            className="d-block mx-auto mt-2"
            style={{
              width: "80px",
              height: "4px",
              backgroundColor: "#A8BE04",
            }}
          ></span>
        </p>

        <h2 className="fw-bold display-5 text-dark mb-5">
          Choose Your Ideal Home
        </h2>

        {/* Grid of Floor Plans */}
        <div className="row g-4 mb-5">
          {floorPlans.map((plan, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div className="card h-100 shadow-sm border-0">
                <div className="position-relative" style={{ height: "250px" }}>
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="object-fit-cover rounded-top"
                    style={{ filter: "blur(4px)" }}
                  />
                </div>
                <div className="card-body text-start">
                  <h3 className="h5 fw-semibold" style={{ color: "#587B89" }}>
                    {plan.title}
                  </h3>

                  <p className="text-muted small mb-1">{plan.size}</p>
                  <p className="text-secondary small">{plan.desc}</p>

                  {/* Optional Button */}
                  {/*
                  <button
                    className="btn btn-sm text-white mt-2"
                    style={{ backgroundColor: "#A8BE04" }}
                    onClick={openPopup}
                  >
                    View {plan.title}
                  </button>
                  */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Highlight Note */}
        <p className="fs-5 text-muted mb-4">
          All units offer balconies with breathtaking views and ample natural light.
        </p>

        {/* CTA Button */}
        <button
          className="btn text-white fs-5 fw-semibold px-5 py-3 shadow"
          style={{
            backgroundColor: "#A8BE04",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#94a503")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#A8BE04")}
          onClick={openPopup}
        >
          Schedule a Visit
        </button>
      </div>
    </section>
  );
}
