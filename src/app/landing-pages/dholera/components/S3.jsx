"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useModal } from "../layout";

gsap.registerPlugin(ScrollTrigger);

function S3() {
  const { openModal } = useModal();
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    gsap.set(headingRef.current, { opacity: 0, y: -50 });
    gsap.set(contentRef.current, { opacity: 0, y: 30 });
    gsap.set(imageRef.current, { opacity: 0, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(headingRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    })
      .to(
        contentRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.5"
      )
      .to(
        imageRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
        },
        "-=0.6"
      );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <section
    id="about"
      ref={sectionRef}
      className="dolera-s3-section"
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: "50px",
      }}
    >
      {/* Centered Align Div  */}
      <div
        className="s3-content-container"
        style={{
          width: "1156px",
          position: "relative",
          backgroundImage: "url(/dolera/s3/dol-s3-bg2.png)",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Top Heading Section  */}
        <div
          ref={headingRef}
          className="s3-heading-section"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="s3-title-wrapper"
            style={{
              textAlign: "center",
            }}
          >
            <h1
              className="s3-main-title"
              style={{
                fontWeight: 600,
                fontSize: "48px",
                color: "black",
              }}
            >
              Overview
            </h1>
            <p
              className="s3-subtitle"
              style={{
                fontWeight: 400,
                fontSize: "20px",
                color: "rgba(231, 73, 52, 1)",
              }}
            >
              India&apos;s First Greenfield Smart City
            </p>
          </div>

          <div
            ref={contentRef}
            className="s3-text-content"
            style={{
              textAlign: "center",
              padding: "20px",
            }}
          >
            <p
              className="s3-paragraph"
              style={{
                fontWeight: 400,
                fontSize: "16px",
                color: "rgba(0, 0, 0, 0.6)",
                textTransform: "capitalize",
              }}
            >
              DholeraSpecial Investment Regions (SIR) is a Greenfield Industrial
              City, planned developed and managed by a SPV named Dholera
              Industrial City Development Limited (DICDL), incorporated between
              the Government of India represented by NICDIT and the State
              Government represented by Dholera Special Investment Region
              Development Authority (DSIRDA). The greenfield city is planned to
              be developed over 920 sq.km. with access to other proximate major
              cities like Ahmedabad, Rajkot, Baroda. The city is envisioned as a
              self-sustaining integrated ecosystem of urban and industrial
              economy. Being located in Gujarat, Dholera SIR has inherent
              advantages for industrial development.
            </p>
            <p
              className="s3-paragraph"
              style={{
                fontWeight: 400,
                fontSize: "16px",
                color: "rgba(0, 0, 0, 0.6)",
                textTransform: "capitalize",
              }}
            >
              DSIR, under Town Planning Schemes 1 to 6 covers an area of 422 sq.
              km. Initially an area of 22.54 sq. km is being developed as
              activation zone for industrial& residential uses. The city plan
              includes mixed, recreational, tourism, knowledge & IT, city center
              and logistics land use that will chart the economic road map of
              Dholera.
            </p>

            <button
              onClick={() => openModal("Download Brochure")}
              style={{
                width: "218px",
                height: "52px",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "16px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "rgba(14, 76, 144, 1)",
                marginTop: "20px",
                marginBottom: "20px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgb(271, 73, 52, 0.9)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(14, 76, 144, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(14, 76, 144, 1)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Download A Brochure
            </button>
          </div>
        </div>

        {/* Bottom Image Section  */}
        <div
          ref={imageRef}
          className="s3-image-wrapper"
          style={{
            width: "945px",
            height: "541px",
            margin: "auto",
          }}
        >
          <img
            src="/dolera/s3/dol-s3-i1.png"
            className="s3-main-image"
            style={{
              width: "100% !important",
              height: "100% !important",
              objectFit: "cover !important",
            }}
            alt="Dholera Overview" title="Dholera Overview"
          />
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Desktop - Above lg (1025px+) - Keep original design */
        @media (min-width: 1025px) {
          .dolera-s3-section {
            min-height: 100vh !important;
            padding-bottom: 50px !important;
          }

          .s3-content-container {
            width: 1156px !important;
          }

          .s3-image-wrapper {
            width: 945px !important;
            height: 541px !important;
          }
        }

        /* Large screens - Exactly lg (1024px) */
        @media (min-width: 1024px) and (max-width: 1024px) {
          .dolera-s3-section {
            min-height: auto !important;
            // padding: 40px 20px !important;
            // padding-top: 90px !important;
            // padding-bottom: 60px !important;
          }

          .s3-content-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
            background-size: contain !important;
          }

          .s3-main-title {
            font-size: 42px !important;
          }

          .s3-subtitle {
            font-size: 18px !important;
          }

          .s3-text-content {
            padding: 30px 20px !important;
          }

          .s3-paragraph {
            font-size: 15px !important;
            line-height: 1.6 !important;
          }

          .s3-image-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            aspect-ratio: 945/541 !important;
          }
        }

        /* Tablet - Between md and lg (769px to 1023px) */
        @media (min-width: 769px) and (max-width: 1023px) {
          .dolera-s3-section {
            min-height: auto !important;
            // padding: 40px 30px !important;
            // padding-top: 90px !important;
            // padding-bottom: 60px !important;
          }

          .s3-content-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
            background-size: contain !important;
          }

          .s3-main-title {
            font-size: 40px !important;
          }

          .s3-subtitle {
            font-size: 18px !important;
          }

          .s3-text-content {
            padding: 30px 20px !important;
          }

          .s3-paragraph {
            font-size: 15px !important;
            line-height: 1.6 !important;
            margin-bottom: 20px !important;
          }

          .s3-image-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            aspect-ratio: 945/541 !important;
          }
        }

        /* Small tablets and large phones (481px to 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .dolera-s3-section {
            min-height: auto !important;
            //  padding: 10px !important;
            // padding-bottom: 10px !important;
          }

          .s3-content-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 15px !important;
            background-size: cover !important;
            background-position: center !important;
          }

          .s3-main-title {
            font-size: 32px !important;
          }

          .s3-subtitle {
            font-size: 16px !important;
            margin-top: 10px !important;
          }

          .s3-text-content {
            padding: 25px 15px !important;
          }

          .s3-paragraph {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }

          .s3-image-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            height: 541px !important;
          }
        }

        /* Mobile phones (up to 480px) */
        @media (max-width: 480px) {
          .dolera-s3-section {
            min-height: auto !important;
            padding: 10px !important;
            padding-bottom: 10px !important;
          }

          .s3-content-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 15px !important;
            background-size: cover !important;
            background-position: center !important;
          }

          .s3-main-title {
            font-size: 28px !important;
          }

          .s3-subtitle {
            font-size: 14px !important;
            margin-top: 8px !important;
          }

          .s3-text-content {
            padding: 20px 10px !important;
          }

          .s3-paragraph {
            font-size: 13px !important;
            line-height: 1.6 !important;
            margin-bottom: 12px !important;
          }

          .s3-image-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            height: 541px !important;
          }
        }

        /* Extra large screens (1440px+) */
        @media (min-width: 1440px) {
          .dolera-s3-section {
            padding-left: 60px !important;
            padding-right: 60px !important;
          }
        }

        /* Ensure image maintains aspect ratio */
        .s3-main-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
      `}</style>
    </section>
  );
}

export default S3;
