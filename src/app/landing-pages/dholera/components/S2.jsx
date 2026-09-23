"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TiHome } from "react-icons/ti";
import { useModal } from "../layout";

gsap.registerPlugin(ScrollTrigger);

function S2() {
  const { openModal } = useModal();
  const sectionRef = useRef(null);
  const leftSideRef = useRef(null);
  const rightSideRef = useRef(null);
  const squaresRef = useRef([]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile || !sectionRef.current) return;

    const squares = document.querySelectorAll(".s2-square");
    squaresRef.current = Array.from(squares);

    // Set initial states
    gsap.set(leftSideRef.current, { opacity: 0, x: -80 });
    gsap.set(rightSideRef.current, { opacity: 0, x: 80 });
    gsap.set(squaresRef.current, { opacity: 0, scale: 0.5, rotation: 45 });

    // Create timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(leftSideRef.current, {
      opacity: 1,
      x: 0,
      duration: 1.2,
      ease: "power3.out",
    })
      .to(
        rightSideRef.current,
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=0.8"
      )
      .to(
        squaresRef.current,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.6"
      );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <section
      ref={sectionRef}
      className="dolera-s2-section"
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "80px",
        overflow: "hidden",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
      }}
    >
      {/* Left Side Div  */}
      <div
        ref={leftSideRef}
        className="s2-left-side"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Centered Align Div  */}
        <div
          className="s2-squares-container"
          style={{
            width: "629px",
            height: "629px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="s2-squares-grid"
            style={{
              height: "70%",
              width: "70%",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              rotate: "45deg",
              gap: "20px",
            }}
          >
            {/* Square Part 1  */}
            <div
              className="s2-square s2-square-1"
              style={{
                width: "209px",
                height: "209px",
                backgroundColor: "rgba(14, 76, 144, 1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  rotate: "-45deg",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <TiHome
                  style={{
                    height: "46px",
                    width: "46px",
                    color: "white",
                  }}
                />
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: "16px",
                    color: "white",
                  }}
                >
                  Land Parcel
                </p>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "22px",
                    color: "white",
                  }}
                >
                  130 Sq.Yd.
                </p>
              </div>
            </div>

            {/* Square Part 2  */}
            <div
              className="s2-square s2-square-2"
              style={{
                width: "209px",
                height: "209px",
                backgroundColor: "rgba(184, 214, 247, 1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  rotate: "-45deg",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                <TiHome
                  style={{
                    height: "46px",
                    width: "46px",
                    color: "black",
                  }}
                />
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: "16px",
                    color: "black",
                  }}
                >
                  Amenities
                </p>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "22px",
                    color: "black",
                  }}
                >
                  Infrastructure & Connectivity
                </p>
              </div>
            </div>

            {/* Square Part 3   */}
            <div
              className="s2-square s2-square-3"
              style={{
                width: "209px",
                height: "209px",
                backgroundColor: "rgba(184, 214, 247, 1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  rotate: "-45deg",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <TiHome
                  style={{
                    height: "46px",
                    width: "46px",
                    color: "black",
                  }}
                />
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: "16px",
                    color: "black",
                  }}
                >
                  Price
                </p>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "22px",
                    color: "black",
                  }}
                >
                  ₹ 10 Lacs*
                </p>
              </div>
            </div>

            {/* Square Part 4  */}
            <div
              className="s2-square s2-square-4"
              style={{
                width: "209px",
                height: "209px",
                backgroundColor: "rgba(184, 214, 247, 1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  rotate: "-45deg",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <TiHome
                  style={{
                    height: "46px",
                    width: "46px",
                    color: "black",
                  }}
                />
                <p
                  style={{
                    fontWeight: 400,
                    fontSize: "16px",
                    color: "black",
                  }}
                >
                  Type
                </p>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "22px",
                    color: "black",
                  }}
                >
                  Plots
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Div  */}
      <div
        ref={rightSideRef}
        className="s2-right-side"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Div  */}
        <div
          className="s2-button-container"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <div
            className="s2-button-wrapper"
            style={{
              width: "80%",
              display: "flex",
              justifyContent: "end",
              backgroundImage: "url(/dolera/s2/dol-s2-i3-bg.png)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              paddingTop: "60px",
              paddingBottom: "60px",
              paddingRight: "40px",
            }}
          >
            <button
              className="s2-download-btn"
              onClick={() => openModal("Download Brochure")}
              style={{
                width: "218px",
                height: "52px",
                backgroundColor: "rgba(14, 76, 144, 1)",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "16px",
                border: "none",
                color: "white",
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
              Download Brochure
            </button>
          </div>
        </div>

        {/* Bottom Image  */}
        <div
          className="s2-image-container"
          style={{
            width: "710px",
            height: "537px",
            overflow: "hidden",
          }}
        >
          <img
            src="/dolera/s2/dol-s2-i1.png"
            alt="Dholera S2 Image" title="Dholera S2 Image"
            className="s2-main-image"
            style={{
              width: "100% !important",
              height: "100% !important",
              objectFit: "cover",
            }}
          />
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* iOS Safari Fixes */
        @supports (-webkit-touch-callout: none) {
          .dolera-s2-section {
            min-height: -webkit-fill-available !important;
          }
        }

        .s2-main-image:hover {
          width: 110%;
          height: 110%;
        }

        /* Prevent text size adjustment on iOS */
        * {
          -webkit-text-size-adjust: 100%;
          -moz-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }

        /* Desktop - Above lg (1025px+) - Keep original design */
        @media (min-width: 1025px) {
          .dolera-s2-section {
            height: 100vh !important;
            flex-direction: row !important;
            justify-content: space-between !important;
          }
        }

        /* Large screens - Exactly lg (1024px) */
        @media (min-width: 1024px) and (max-width: 1024px) {
          .dolera-s2-section {
            height: auto !important;
            min-height: 100vh !important;
            flex-direction: column !important;
            padding: 40px 20px !important;
            gap: 40px !important;
            padding-top: 90px !important;
          }

          .s2-left-side {
            padding: 20px !important;
            padding-left: 20px !important;
            width: 100% !important;
          }

          .s2-squares-container {
            width: 100% !important;
            max-width: 500px !important;
            height: auto !important;
            aspect-ratio: 1 !important;
          }

          .s2-right-side {
            width: 100% !important;
            align-items: center !important;
          }

          .s2-button-container {
            justify-content: center !important;
            width: 100% !important;
          }

          .s2-button-wrapper {
            width: 100% !important;
            max-width: 600px !important;
            justify-content: center !important;
            padding: 40px !important;
          }

          .s2-image-container {
            width: 100% !important;
            max-width: 600px !important;
            height: auto !important;
            aspect-ratio: 710/537 !important;
            margin: 0 auto !important;
          }
        }

        /* Tablet - Between md and lg (769px to 1023px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .dolera-s2-section {
            height: auto !important;
            min-height: auto !important;
            flex-direction: column !important;
            padding: 40px 30px !important;
            gap: 40px !important;
            padding-top: 90px !important;
            margin-bottom: 0px !important;
          }

          .s2-left-side {
            padding: 20px !important;
            padding-left: 20px !important;
            width: 100% !important;
          }

          .s2-squares-container {
            width: 100% !important;
            max-width: 500px !important;
            height: auto !important;
            aspect-ratio: 1 !important;
          }

          .s2-squares-grid {
            height: 90% !important;
            width: 90% !important;
            display: flex !important;
            flex-wrap: wrap !important;
          }

          .s2-square {
            width: calc(50% - 10px) !important;
            height: calc(50% - 10px) !important;
          }

          .s2-right-side {
            width: 100% !important;
            align-items: center !important;
          }

          .s2-button-container {
            justify-content: center !important;
            width: 100% !important;
          }

          .s2-button-wrapper {
            width: 100% !important;
            max-width: 600px !important;
            justify-content: center !important;
            padding: 40px 30px !important;
          }

          .s2-download-btn {
            width: 100% !important;
            max-width: 300px !important;
          }

          .s2-image-container {
            width: 100% !important;
            max-width: 600px !important;
            height: auto !important;
            aspect-ratio: 710/537 !important;
            margin: 0 auto !important;
          }
        }

        /* Mobile screens (up to 768px) */
        @media (max-width: 768px) {
          .dolera-s2-section {
            min-height: -webkit-fill-available !important;
            padding-left: env(safe-area-inset-left) !important;
            padding-right: env(safe-area-inset-right) !important;
          }

          .s2-squares-grid {
            width: auto !important;
            height: auto !important;
            rotate: 0deg !important;
            gap: 20px !important;
            display: flex !important;
            flex-direction: column !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            align-items: center !important;
            -webkit-transform: translateZ(0) !important;
            transform: translateZ(0) !important;
          }

          .s2-square {
            width: 209px !important;
            height: 209px !important;
            margin-bottom: 50px !important;
            -webkit-transform: translateZ(0) !important;
            transform: translateZ(0) !important;
            -webkit-tap-highlight-color: transparent !important;
          }

          .s2-square svg {
            width: 46px !important;
            height: 46px !important;
          }

          .s2-square p {
            font-size: 16px !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }

          .s2-square p:last-child {
            font-size: 22px !important;
          }
        }

        /* Small tablets and large phones (481px to 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .dolera-s2-section {
            height: auto !important;
            min-height: -webkit-fill-available !important;
            flex-direction: column !important;
            padding: calc(90px + env(safe-area-inset-top))
              calc(20px + env(safe-area-inset-right)) 30px
              calc(20px + env(safe-area-inset-left)) !important;
            gap: 30px !important;
            margin-bottom: 0px !important;
          }

          .s2-left-side {
            padding: 15px !important;
            padding-left: 15px !important;
            width: 100% !important;
          }

          .s2-squares-container {
            width: 100% !important;
            max-width: 400px !important;
            height: auto !important;
            aspect-ratio: 1 !important;
          }

          .s2-squares-grid {
            width: auto !important;
            height: auto !important;
            rotate: 0deg !important;
            gap: 20px !important;
            display: flex !important;
            flex-direction: column !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            align-items: center !important;
            margin-bottom: 0 !important;
          }

          .s2-square {
            width: 209px !important;
            height: 209px !important;
            margin-bottom: 90px !important;
            rotate: 90deg !important;
            -webkit-transform: translateZ(0) rotate(45deg) !important;
            transform: translateZ(0) rotate(45deg) !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
          }
 .s2-square div {
            rotate: 226deg !important;
          }
          .s2-square svg {
            width: 46px !important;
            height: 46px !important;
          }

          .s2-square p {
            font-size: 16px !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }

          .s2-square p:last-child {
            font-size: 22px !important;
          }

          .s2-right-side {
            width: 100% !important;
            align-items: center !important;
            flex-direction: column-reverse !important;
          }

          .s2-button-container {
            justify-content: center !important;
            width: 100% !important;
          }

          .s2-button-wrapper {
            width: 100% !important;
            justify-content: center !important;
            padding: 30px 20px !important;
          }

          .s2-download-btn {
            width: 100% !important;
            max-width: 280px !important;
          }

          .s2-image-container {
            width: 100% !important;
            height: 764px !important;
          }
        }

        /* Mobile phones (up to 480px) */
        @media (max-width: 480px) {
          .dolera-s2-section {
            height: auto !important;
            min-height: -webkit-fill-available !important;
            flex-direction: column !important;
            padding: calc(90px + env(safe-area-inset-top))
              calc(16px + env(safe-area-inset-right)) 20px
              calc(16px + env(safe-area-inset-left)) !important;
            gap: 30px !important;
            margin-bottom: 0px !important;
          }

          .s2-left-side {
            padding: 10px !important;
            padding-left: 10px !important;
            width: 100% !important;
          }

          .s2-squares-container {
            width: 100% !important;
            max-width: 320px !important;
            height: auto !important;
            aspect-ratio: 1 !important;
          }

          .s2-squares-grid {
            width: auto !important;
            height: auto !important;
            rotate: 0deg !important;
            gap: 20px !important;
            display: flex !important;
            flex-direction: column !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            align-items: center !important;
          }

          .s2-square {
            width: 209px !important;
            height: 209px !important;
            margin-bottom: 90px !important;
            rotate: 90deg !important;
            -webkit-transform: translateZ(0) rotate(45deg) !important;
            transform: translateZ(0) rotate(45deg) !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
          }
          .s2-square div {
            rotate: 226deg !important;
          }
          .s2-square svg {
            width: 46px !important;
            height: 46px !important;
          }

          .s2-square p {
            font-size: 16px !important;
            margin: 4px 0 !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }

          .s2-square p:last-child {
            font-size: 22px !important;
          }

          .s2-right-side {
            width: 100% !important;
            align-items: center !important;
            flex-direction: column-reverse !important;
          }

          .s2-button-container {
            justify-content: center !important;
            width: 100% !important;
          }

          .s2-button-wrapper {
            width: 100% !important;
            justify-content: center !important;
            padding: 30px 16px !important;
          }

          .s2-download-btn {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
          }

          .s2-image-container {
            width: 100% !important;
            height: 764px !important;
          }
        }

        /* Extra large screens (1440px+) */
        @media (min-width: 1440px) {
          .dolera-s2-section {
            padding-left: 80px !important;
            padding-top: 0px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default S2;
