"use client";

import overviewImg from "../assets/An_Icon_Image_ONYX.png";

export default function Overview() {
  return (
    <section
      id="overview"
      className="d-flex align-items-center"
      style={{
        backgroundColor: "#324F43",
        minHeight: "80vh",
        padding: "2rem 0",
      }}
    >
      <div className="container px-3 px-sm-4 px-md-5 d-flex flex-column flex-lg-row align-items-center justify-content-between gap-4 mb-4 mb-sm-0">
        {/* Left: Image */}
        <div
          className="w-100 w-lg-50 d-flex justify-content-center"
          data-aos="fade-right"
        >
          <div
            className="overflow-hidden"
            style={{
              borderTopLeftRadius: "30px",
              maxWidth: "500px",
            }}
          >
            <img
              src={overviewImg}
              alt="Overview Image"
              width={400}
              height={400}
              style={{
                width: "100%",
                maxWidth: "400px",
                height: "auto",
                objectFit: "cover",
                borderTopLeftRadius: "30px",
              }}
            />
          </div>
        </div>

        {/* Right: Text Content */}
        <div
          className="w-100 w-lg-50 text-center text-lg-start px-2 px-sm-0"
          data-aos="fade-right"
        >
          <p className="text-uppercase text-success mb-2 d-flex justify-content-center justify-content-lg-start align-items-center fw-semibold small">
            <i className="fas fa-info-circle me-2"></i>Overview
          </p>

          <h2
            className="fw-bold mb-2"
            style={{ fontSize: "32px", color: "#3AB24B" }}
          >
            An Icon Rises in the Heart of Noida
          </h2>

          <div className="text-white mb-3 fs-5 d-flex justify-content-center justify-content-lg-start align-items-center">
            Where Business Meets Brilliance. And Lifestyle Meets Legacy.
          </div>

          <p
            className="text-white mb-4"
            style={{
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            ONYX by Splendour is a commercial development built for the future.
            Located in Sector 142, NOIDA, it offers modern office spaces,
            High-Street Retail, Luxury Business Suites, and World-Class food
            court spaces. This comes with exceptional connectivity,
            climate-controlled design, and excellent corporate catchment. ONYX
            is more than a workplace, it’s the next breakthrough in business.
          </p>

          <a
            href="#contact"
            className="btn px-4 py-2 text-white shadow"
            style={{
              backgroundColor: "#3AB24B",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#324F49")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#3AB24B")
            }
          >
            Book a Site Visit
          </a>
        </div>
      </div>
    </section>
  );
}
