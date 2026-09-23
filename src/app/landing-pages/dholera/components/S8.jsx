"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useModal } from "../layout";
import "../style.css";

gsap.registerPlugin(ScrollTrigger);

function S8() {
  const { openModal } = useModal();
  const sectionRef = useRef(null);
  const topSectionRef = useRef(null);
  const centerSectionRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    gsap.set(topSectionRef.current, { opacity: 0, y: -50 });
    gsap.set(centerSectionRef.current, { opacity: 0, y: 50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(topSectionRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
    }).to(
      centerSectionRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
      },
      "-=0.6"
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <section
    id="location"
      ref={sectionRef}
      className="dolera-s8-section"
      style={{
        width: "100vw",
        minHeight: "100vh",
        paddingLeft: "80px",
        paddingTop: "80px",
        paddingRight: "80px",
        paddingBottom: "80px",
      }}
    >
      <div
        className="s8-main-container"
        style={{
          width: "100%",
          minHeight: "959px",
          display: "flex",
          flexDirection: "column",
          backgroundImage: "url(/dolera/s8/dol-s8-bg2.png)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          paddingRight: "20px",
          alignItems: "center",
        }}
      >
        <div
          ref={topSectionRef}
          className="s8-top-section"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          {/* Left Side Div  */}
          <div
            className="s8-left-title"
            style={{
              width: "541px",
              height: "371px",
              position: "relative",
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            {/* Red Circle Div  */}
            <div
              className="s8-red-circle elips"
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                height: "100%",
                width: "371px",
                borderRadius: "50%",
                backgroundColor: "rgba(231, 73, 52, 1)",
                zIndex: 0,
              }}
            ></div>

            <h1
              className="s8-location-title"
              style={{
                fontWeight: 600,
                fontSize: "48px",
                color: "black",
                zIndex: 10,
              }}
            >
              Location Advantage
            </h1>
          </div>

          {/* Right Side Div  */}
          <div
            className="s8-right-box"
            style={{
              width: "539px",
              minHeight: "333px !important",
              backgroundColor: "rgba(220, 237, 255, 1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "90%",
                height: "90%",
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                // backgroundColor: "red",
              }}
            >
              <p
                style={{ fontWeight: 400, fontSize: "16px", color: "#000000" }}
              >
                Close to Petrochemicals and Petroleum Inv. Region (PCPIR)
              </p>
              <p
                style={{ fontWeight: 400, fontSize: "16px", color: "#000000" }}
              >
                Close to Gujarat International Finance TechCity (GIFT).
              </p>
              <p
                style={{ fontWeight: 400, fontSize: "16px", color: "#000000" }}
              >
                Proximity to mega cities: Ahmedabad, Bhavnagar, Vadodara.
              </p>
              <p
                style={{ fontWeight: 400, fontSize: "16px", color: "#000000" }}
              >
                Airport & Sea Port in the vicinity.
              </p>
              <p
                style={{ fontWeight: 400, fontSize: "16px", color: "#000000" }}
              >
                Central spine express way & Metro Rail to link the SIR with
                megacities
              </p>
              <p
                style={{ fontWeight: 400, fontSize: "16px", color: "#000000" }}
              >
                Benefit of the sea coast, nature park, and golf course.
              </p>
            </div>
          </div>
        </div>

        {/* Center Align Div  */}
        <div
          ref={centerSectionRef}
          className="s8-center-section"
          style={{
            width: "1084px",
            height: "768px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "35px",
          }}
        >
          <div
            className="s8-location-image-container"
            style={{
              width: "100%",
              height: "681px",
            }}
          >
            <img
              src="/dolera/s8/dol-location.png"
              className="s8-location-image"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              alt="Location Map" title="Location Map"
            />
          </div>
          <button
            className="s8-callback-btn"
            onClick={() => openModal("Enquiry")}
            style={{
              width: "245px",
              height: "52px",
              borderRadius: "4px",
              fontWeight: 600,
              fontSize: "16px",
              border: "none",
              backgroundColor: "rgba(231, 73, 52, 1)",
              color: "white",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(14, 76, 144, 0.9)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(14, 76, 144, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgb(271, 73, 52, 1)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Request A Call Back
          </button>
        </div>
      </div>

      {/* Bottom Div  */}
      <div
        className="s8-bottom-cta"
        style={{
          width: "100%",
          minHeight: "353px",
          backgroundImage: "url(/dolera/s8/dol-s8-bg-3.png)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          marginTop: "50px",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Dark Overlay Div  */}
        <div
          className="s8-overlay"
          style={{
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(26, 26, 26, 0.88)",
            zIndex: 0,
          }}
        ></div>

        {/* Absolute Elips 1  */}
        <div
          className="s8-elips-1"
          style={{
            width: "248px",
            height: "248px",
            position: "absolute",

            left: "-10px",
            bottom: "-10px",
          }}
        >
          <img
            src="/dolera/lft-elips.png"
            style={{ width: "100%", height: "100%" }}
            alt="Right Elips" title="Right Elips"
          />
        </div>

        {/* Absolute Elips 2  */}
        <div
          className="s8-elips-2"
          style={{
            width: "248px",
            height: "248px",
            position: "absolute",

            right: "-10px",
            top: "-10px",
          }}
        >
          {" "}
          <img
            src="/dolera/rght-elips.png"
            style={{ width: "100%", height: "100%" }}
            alt="Left Elips" title="Left Elips"
          />
        </div>

        {/* Center Align Div  */}
        <div
          className="s8-cta-content"
          style={{
            width: "585px",
            display: "flex",
            flexDirection: "column",
            gap: "35px",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
            position: "relative",
          }}
        >
          <h2
            className="s8-cta-title"
            style={{
              fontWeight: 600,
              fontSize: "48px",
              color: "white",
            }}
          >
            Are You Ready For Investment?
          </h2>
          <button
            className="s8-enquire-btn"
            onClick={() => openModal("Enquiry")}
            style={{
              width: "164px",
              height: "48px !important",
              border: "none",
              color: "white",
              backgroundColor: "rgba(14, 76, 144, 1)",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgb(271, 73, 52, 0.9)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(14, 76, 144, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(14, 76, 144, 0.9)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Enquire Now
          </button>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Desktop - Above lg (1025px+) - Keep original design */
        @media (min-width: 1025px) {
          .dolera-s8-section {
            padding-left: 80px !important;
            padding-top: 80px !important;
            padding-right: 80px !important;
            padding-bottom: 80px !important;
          }

          .s8-main-container {
            min-height: 959px !important;
          }

          .s8-top-section {
            flex-direction: row !important;
            justify-content: space-between !important;
          }

          .s8-left-title {
            width: 541px !important;
            height: 371px !important;
          }

          .s8-right-box {
            width: 539px !important;
            height: 333px !important;
          }

          .s8-center-section {
            width: 1084px !important;
            height: 768px !important;
          }

          .s8-bottom-cta {
            min-height: 353px !important;
          }

          .s8-cta-content {
            width: 585px !important;
          }
        }

        /* Large screens - Exactly lg (1024px) */
        @media (min-width: 1024px) and (max-width: 1024px) {
          .dolera-s8-section {
            padding: 0px !important;
            padding-top: 0px !important;
            padding-bottom: 00px !important;
          }

          .s8-main-container {
            min-height: auto !important;
            padding: 20px !important;
            padding-right: 20px !important;
          }

          .s8-top-section {
            flex-direction: column !important;
            gap: 30px !important;
            margin-bottom: 30px !important;
            align-items: center !important;
          }

          .s8-left-title {
            width: 100% !important;
            max-width: 500px !important;
            height: auto !important;
            min-height: 200px !important;
            justify-content: center !important;
          }

          .s8-red-circle {
            width: auto !important;
            height: auto !important;
          }

          .s8-location-title {
            font-size: 36px !important;
          }

          .s8-right-box {
            width: 100% !important;
            max-width: 500px !important;
            min-height: 250px !important;
          }

          .s8-center-section {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            gap: 25px !important;
          }

          .s8-location-image-container {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1084/681 !important;
          }

          .s8-callback-btn {
            width: 100% !important;
            max-width: 250px !important;
          }

          .s8-bottom-cta {
            margin-top: 30px !important;
            min-height: 280px !important;
          }

          .s8-cta-content {
            width: 90% !important;
            max-width: 500px !important;
            height: auto !important;
            padding: 20px !important;
          }

          .s8-cta-title {
            font-size: 36px !important;
          }

          .s8-elips-1,
          .s8-elips-2 {
            width: 150px !important;
            height: 150px !important;
          }
        }

        /* Tablet - Between md and lg (769px to 1023px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .dolera-s8-section {
            padding:0px !important;
            padding-top: 0px !important;
            padding-bottom: 00px !important;
          }
          .s8-red-circle elips {
            display: none !important;
          }
          .s8-main-container {
            min-height: auto !important;
            padding: 20px !important;
            padding-right: 20px !important;
          }

          .s8-top-section {
            flex-direction: column !important;
            gap: 30px !important;
            margin-bottom: 30px !important;
            align-items: center !important;
          }

          .s8-left-title {
            width: 100% !important;
            max-width: 500px !important;
            height: auto !important;
            min-height: 200px !important;
            justify-content: center !important;
          }

          .s8-red-circle {
            width: auto !important;
            height: auto !important;
          }

          .s8-location-title {
            font-size: 32px !important;
          }

          .s8-right-box {
            width: 100% !important;
            max-width: 500px !important;
            min-height: 250px !important;
          }

          .s8-center-section {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            gap: 25px !important;
          }

          .s8-location-image-container {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1084/681 !important;
          }

          .s8-callback-btn {
            width: 100% !important;
            max-width: 250px !important;
          }

          .s8-bottom-cta {
            margin-top: 30px !important;
            min-height: 280px !important;
          }

          .s8-cta-content {
            width: 90% !important;
            max-width: 500px !important;
            height: auto !important;
            padding: 20px !important;
          }

          .s8-cta-title {
            font-size: 32px !important;
          }

          .s8-elips-1,
          .s8-elips-2 {
            width: 150px !important;
            height: 150px !important;
          }
        }

        /* Small tablets and large phones (481px to 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .dolera-s8-section {
            padding: 30px 20px !important;
            // padding-top: 90px !important;
            padding-bottom: 50px !important;
          }

          .s8-main-container {
            min-height: auto !important;
            padding: 15px !important;
            padding-right: 15px !important;
          }

          .s8-top-section {
            flex-direction: column !important;
            gap: 25px !important;
            margin-bottom: 25px !important;
            align-items: center !important;
          }

          .s8-left-title {
            width: 100% !important;
            height: auto !important;
            min-height: 180px !important;
            justify-content: center !important;
          }

          .s8-red-circle {
            width: 180px !important;
            height: 180px !important;
          }

          .s8-location-title {
            font-size: 28px !important;
          }

          .s8-right-box {
            width: 100% !important;
          }

          .s8-center-section {
            width: 100% !important;
            height: auto !important;
            gap: 20px !important;
          }

          .s8-location-image-container {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1084/681 !important;
          }

          .s8-callback-btn {
            width: 100% !important;
            max-width: 220px !important;
            font-size: 15px !important;
          }

          .s8-bottom-cta {
            margin-top: 25px !important;
            min-height: 250px !important;
          }

          .s8-cta-content {
            width: 90% !important;
            max-width: 100% !important;
            height: auto !important;
            padding: 20px 15px !important;
            gap: 25px !important;
          }

          .s8-cta-title {
            font-size: 28px !important;
            text-align: center !important;
          }

          .s8-enquire-btn {
            width: 100% !important;
            max-width: 180px !important;
          }

          .s8-elips-1,
          .s8-elips-2 {
            width: 120px !important;
            height: 120px !important;
          }
        }

        /* Mobile phones (up to 480px) */
        @media (max-width: 480px) {
          .dolera-s8-section {
            padding: 20px 16px !important;
            // padding-top: 90px !important;
            padding-bottom: 40px !important;
          }

          .s8-main-container {
            min-height: auto !important;
            padding: 15px !important;
            padding-right: 15px !important;
          }

          .s8-top-section {
            flex-direction: column !important;
            gap: 20px !important;
            margin-bottom: 20px !important;
            align-items: center !important;
          }

          .s8-left-title {
            width: 100% !important;
            height: auto !important;
            min-height: 150px !important;
            justify-content: center !important;
          }

          .s8-red-circle {
            width: 150px !important;
            height: 150px !important;
          }

          .s8-location-title {
            font-size: 24px !important;
            text-align: center !important;
            padding-right: 10px !important;
          }

          .s8-right-box {
            width: 100% !important;
          }

          .s8-center-section {
            width: 100% !important;
            height: auto !important;
            gap: 20px !important;
          }

          .s8-location-image-container {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1084/681 !important;
          }

          .s8-callback-btn {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
          }

          .s8-bottom-cta {
            margin-top: 20px !important;
            min-height: 220px !important;
          }

          .s8-cta-content {
            width: 90% !important;
            max-width: 100% !important;
            height: auto !important;
            padding: 20px 12px !important;
            gap: 20px !important;
          }

          .s8-cta-title {
            font-size: 24px !important;
            text-align: center !important;
            line-height: 1.3 !important;
          }

          .s8-enquire-btn {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
          }

          .s8-elips-1,
          .s8-elips-2 {
            width: 100px !important;
            height: 100px !important;
          }
        }

        /* Extra large screens (1440px+) */
        @media (min-width: 1440px) {
          .dolera-s8-section {
            padding-left: 100px !important;
            padding-right: 100px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default S8;
