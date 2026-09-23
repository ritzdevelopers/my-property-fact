"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function S7() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const galleryRef = useRef(null);
  const imagesRef = useRef([]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    const images = document.querySelectorAll(".s7-image");
    imagesRef.current = Array.from(images);

    gsap.set(titleRef.current, { opacity: 0, y: -40 });
    gsap.set(imagesRef.current, { opacity: 0, scale: 0.85 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
    }).to(
      imagesRef.current,
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      },
      "-=0.5"
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <section
    id="gallery"
      ref={sectionRef}
      className="dolera-s7-section"
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "40px",
        overflowX: "hidden",
      }}
    >
      <div
        className="s7-main-container"
        style={{
          width: "1240px",
          display: "flex",
          flexDirection: "column",
          gap: "50px",
        }}
      >
        <div
          ref={titleRef}
          className="s7-title-wrapper"
          style={{
            textAlign: "center",
          }}
        >
          <h2 className="s7-title" style={{ fontSize: "48px" }}>
            Gallery
          </h2>
        </div>
        <div
          ref={galleryRef}
          className="s7-gallery-grid"
          style={{ width: "100%" }}
        >
          {/* Row 1  */}
          <div
            className="s7-row-1"
            style={{
              width: "100%",
              display: "flex",
              gap: "20px",
            }}
          >
            <div
              className="s7-big-image-1"
              style={{
                width: "610px",
                height: "533px",
              }}
            >
              <img
                src="/dolera/s7/s7-big-1.png"
                className="s7-image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt="Gallery Image 1" title="Gallery Image 1"
              />
            </div>

            <div
              className="s7-big-image-2"
              style={{
                width: "610px",
                height: "533px",
              }}
            >
              <img
                src="/dolera/s7/s7-big-2.png"
                className="s7-image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt="Gallery Image 2" title="Gallery Image 2"
              />
            </div>
          </div>

          {/* Row 2  */}
          <div
            className="s7-row-2"
            style={{
              width: "100%",
              display: "flex",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div
              className="s7-sm-image-1"
              style={{
                width: "399px",
                height: "347px",
              }}
            >
              <img
                src="/dolera/s7/s7-sm-1.png"
                className="s7-image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt="Gallery Image 3" title="Gallery Image 3"
              />
            </div>
            <div
              className="s7-sm-image-2"
              style={{
                width: "399px",
                height: "347px",
              }}
            >
              <img
                src="/dolera/s7/s7-sm-2.png"
                className="s7-image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt="Gallery Image 4" title="Gallery Image 4"
              />
            </div>
            <div
              className="s7-sm-image-3"
              style={{
                width: "399px",
                height: "347px",
              }}
            >
              <img
                src="/dolera/s7/s7-sm-3.png"
                className="s7-image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt="Gallery Image 5" title="Gallery Image 5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Desktop - Above lg (1025px+) - Keep original design */
        @media (min-width: 1025px) {
          .dolera-s7-section {
            min-height: 100vh !important;
            padding-top: 40px !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            padding-bottom: 40px !important;
            overflow-x: hidden !important;
          }

          .s7-main-container {
            width: 1240px !important;
            max-width: 1240px !important;
            gap: 50px !important;
          }

          .s7-title {
            font-size: 48px !important;
          }

          .s7-gallery-grid {
            width: 100% !important;
          }

          .s7-row-1 {
            flex-direction: row !important;
            gap: 20px !important;
            display: flex !important;
            width: 100% !important;
          }

          .s7-big-image-1,
          .s7-big-image-2 {
            width: 610px !important;
            height: 533px !important;
            flex-shrink: 0 !important;
          }

          .s7-row-2 {
            flex-direction: row !important;
            gap: 20px !important;
            display: flex !important;
            width: 100% !important;
            margin-top: 20px !important;
          }

          .s7-sm-image-1,
          .s7-sm-image-2,
          .s7-sm-image-3 {
            width: 399px !important;
            height: 347px !important;
            flex-shrink: 0 !important;
          }
        }

        /* Large screens - Exactly lg (1024px) - Use Grid Layout */
        @media (min-width: 1024px) and (max-width: 1024px) {
          .dolera-s7-section {
            min-height: auto !important;
            padding: 40px 20px !important;
            padding-bottom: 60px !important;
            overflow-x: hidden !important;
          }

          .s7-main-container {
            width: 100% !important;
            max-width: 100% !important;
            gap: 40px !important;
          }

          .s7-title {
            font-size: 42px !important;
          }

          .s7-gallery-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .s7-row-1 {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
            margin-top: 0 !important;
          }

          .s7-big-image-1,
          .s7-big-image-2 {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 610/533 !important;
          }

          .s7-row-2 {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
            margin-top: 20px !important;
          }

          .s7-sm-image-1,
          .s7-sm-image-2,
          .s7-sm-image-3 {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 399/347 !important;
          }
        }

        /* Tablet - Between md and lg (769px to 1023px) - Use Grid Layout */
        @media (min-width: 769px) and (max-width: 1023px) {
          .dolera-s7-section {
            min-height: auto !important;
            padding: 40px 30px !important;
            padding-top: 90px !important;
            padding-bottom: 60px !important;
            overflow-x: hidden !important;
          }

          .s7-main-container {
            width: 100% !important;
            max-width: 100% !important;
            gap: 40px !important;
          }

          .s7-title {
            font-size: 40px !important;
          }

          .s7-gallery-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .s7-row-1 {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
            margin-top: 0 !important;
          }

          .s7-big-image-1,
          .s7-big-image-2 {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 610/533 !important;
          }

          .s7-row-2 {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
            margin-top: 20px !important;
          }

          .s7-sm-image-1,
          .s7-sm-image-2,
          .s7-sm-image-3 {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 399/347 !important;
          }
        }

        /* Small tablets and large phones (481px to 768px) - Use Grid Layout */
      

        /* Mobile phones (up to 480px) - Use Grid Layout */
        @media (max-width: 769px) {
          .dolera-s7-section {
            min-height: auto !important;
            padding: 20px 16px !important;
            padding-top: 90px !important;
            padding-bottom: 40px !important;
            overflow-x: hidden !important;
          }

          .s7-main-container {
            width: 100% !important;
            max-width: 100% !important;
            gap: 25px !important;
          }

          .s7-title {
            font-size: 28px !important;
          }

          .s7-gallery-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            width: 100% !important;
          }

          .s7-row-1 {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-top: 0 !important;
            width: 100% !important;
          }

          .s7-big-image-1,
          .s7-big-image-2 {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 610/533 !important;
          }

          .s7-row-2 {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-top: 12px !important;
            width: 100% !important;
          }

          .s7-sm-image-1,
          .s7-sm-image-2,
          .s7-sm-image-3 {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 399/347 !important;
          }
        }

        /* Very small screens (up to 360px) */
        @media (max-width: 360px) {
          .dolera-s7-section {
            padding: 16px 12px !important;
            padding-top: 90px !important;
            padding-bottom: 30px !important;
            overflow-x: hidden !important;
          }

          .s7-main-container {
            gap: 20px !important;
          }

          .s7-title {
            font-size: 24px !important;
          }

          .s7-gallery-grid {
            gap: 10px !important;
          }

          .s7-row-1,
          .s7-row-2 {
            gap: 10px !important;
          }
        }

        /* Extra large screens (1440px+) */
        @media (min-width: 1440px) {
          .dolera-s7-section {
            padding-left: 60px !important;
            padding-right: 60px !important;
            padding-top: 40px !important;
            padding-bottom: 40px !important;
            overflow-x: hidden !important;
          }

          .s7-main-container {
            width: 1240px !important;
            max-width: 1240px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default S7;
