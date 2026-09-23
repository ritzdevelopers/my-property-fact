"use client";

import React from "react";
import aboutImg from "../assets/About_project_Image.jpg";

export default function AboutSection() {
  const openPopup = () => {
    window.dispatchEvent(new Event("openPopup"));
  };

  return (
    <section className="py-5 bg-white" id="about">
      <div className="container" style={{ maxWidth: "82rem" }}>
        {/* Subtitle + Title */}
        <div className="text-center mb-5">
          <p className="fs-4 text-secondary mb-2">
            About the Project
            <span
              className="d-block mx-auto mt-2"
              style={{
                width: "80px",
                height: "4px",
                backgroundColor: "#A8BE04",
              }}
            ></span>
          </p>
          <h2 className="fw-bold display-5 text-dark">Near Doon IT Park</h2>
        </div>

        {/* Content Layout */}
        <div className="row align-items-center gy-5">
          {/* Left Content */}
          <div className="col-lg-6 text-start">
            <p className="fs-5 text-muted mb-4">
              Discover a harmonious blend of nature and modern living at{" "}
              <strong>Sikka Kimaya Greens</strong>, nestled in the serene
              surroundings of Sahastradhara Road, Dehradun. Designed by global
              architects <strong>Broadway Malyan</strong>, this ready-to-move
              residential haven offers spacious 1, 2, 3, and 4 BHK apartments
              with unmatched views of the Himalayan foothills. Experience life
              where fresh mountain air meets contemporary comforts.
            </p>

            <ul className="mb-4 ps-3">
              {[
                "Ready-to-move residential property",
                "Spacious 1, 2, 3, and 4 BHK apartments",
                "Unmatched views of the Himalayan foothills",
                "Flexible Payment Plan",
                "Located on Sahastradhara Road, Dehradun",
                "Fresh mountain air with contemporary comforts",
              ].map((item, index) => (
                <li key={index} className="text-muted fs-5 mb-2">
                  {item}
                </li>
              ))}
            </ul>

            <button
              className="btn text-white fs-5 fw-semibold px-4 py-3 shadow"
              style={{
                backgroundColor: "#A8BE04",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#94a503")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#A8BE04")
              }
              onClick={openPopup}
            >
              Know More
            </button>
          </div>

          {/* Right Image */}
          <div className="col-lg-6">
            <img
              src={aboutImg.src}
              alt="About Sikka Kimaya"
              title="About Sikka Kimaya"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
