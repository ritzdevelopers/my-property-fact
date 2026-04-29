"use client";

import { useCallback, useState } from "react";

const STATIC_TESTIMONIALS = [
  {
    id: "rahul-sharma",
    clientName: "Rahul Sharma",
    clientLocation: "Noida",
    projectName: "3C Lotus 300",
    storyHeading: "Confident Home Purchase Guidance",
    testimonialText:
      "Provided step-by-step guidance from builder verification to RERA checks. Best real estate advisory for first-time buyers.",
  },
  {
    id: "vikram-malhotra",
    clientName: "Vikram Malhotra",
    clientLocation: "Gurgaon",
    projectName: "DLF One Midtown",
    storyHeading: "High-ROI Property Investment Insights",
    testimonialText:
      "Their insights and price trend analysis helped me identify high-appreciation properties in Noida and Gurgaon.",
  },
  {
    id: "priya-ankit-verma",
    clientName: "Priya & Ankit Verma",
    clientLocation: "Gurgaon",
    projectName: "Emaar Gurgaon Greens",
    storyHeading: "Dream Home Found Within Budget",
    testimonialText:
      "They helped us find our dream 3BHK home in Gurgaon through project filtering and builder checks.",
  },
  {
    id: "rajesh-nair",
    clientName: "Rajesh Nair",
    clientLocation: "Dubai",
    projectName: "Ace Acreville",
    storyHeading: "Easy Remote Investment Process",
    testimonialText:
      "As an NRI, MyPropertyFact made remote property investment easy with RERA verification, project research, and legal documentation.",
  },
  {
    id: "sanjay-mehta",
    clientName: "Sanjay Mehta",
    clientLocation: "Mumbai",
    projectName: "AJOD One",
    storyHeading: "Informed Commercial Property Decision",
    testimonialText:
      "Detailed analysis of commercial projects, rental yields, and builder credibility. Best for out-of-city investors.",
  },
  {
    id: "sunita-devi",
    clientName: "Sunita Devi",
    clientLocation: "Faridabad",
    projectName: "ACE Hanei",
    storyHeading: "Affordable, RERA-Verified Housing Solutions",
    testimonialText:
      "MyPropertyFact showed us RERA-verified affordable housing projects, helping us save with PMAY subsidy. Best for affordable homes.",
  },
  {
    id: "neha-gupta",
    clientName: "Neha Gupta",
    clientLocation: "Noida",
    projectName: "Aastha Greens",
    storyHeading: "Informed, High-Yield Investment Choices",
    testimonialText:
      "Their consultation helped me make informed real estate investments in Noida with strong rental yield potential.",
  },
  {
    id: "iyer-couple",
    clientName: "Mr. & Mrs. Iyer",
    clientLocation: "Chennai",
    projectName: "Hiranandani Anchorage",
    storyHeading: "Stress-Free, Clear Property Purchase",
    testimonialText:
      "Guided us to ready-to-move and legally clear properties. Stress-free process for senior buyers seeking safety and peace.",
  },
  {
    id: "deepak-singhania",
    clientName: "Deepak Singhania",
    clientLocation: "Delhi",
    projectName: "Ace Aquacasa",
    storyHeading: "Expanded Portfolio with Expert Insights",
    testimonialText:
      "With perfect market analysis and builder verification, they helped me grow my real estate portfolio with high-value investments.",
  },
];

function formatQuote(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= 280) return text;
  const clipped = text.slice(0, 280);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 160 ? clipped.slice(0, lastSpace) : clipped).trim()}…`;
}

export default function TestimonialSection() {
  const total = STATIC_TESTIMONIALS.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState("next");

  const goPrev = useCallback(() => {
    setSlideDir("prev");
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setSlideDir("next");
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const item = STATIC_TESTIMONIALS[activeIndex];
  if (!item) return null;

  return (
    <section className="container home-testimonials-section">
      <div
        className="home-testimonials-inner-container"
        style={{
          width: "100%",
          padding: "48px clamp(16px, 6vw, 240px)",
          boxSizing: "border-box",
        }}
      >
        <div
          className="home-testimonials-left-section"
          style={{
            display: "flex",
            width: "min(450px, 100%)",
            paddingTop: "clamp(0px, 3vw, 50px)",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div className="home-testimonials-header">
            <h2
              className="home-testimonials-main-title"
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                textAlign: "left",
                gap: "10px",
                color: "#000",
                fontFamily: "Lato",
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9" fill="none">
                <circle cx="4.5" cy="4.5" r="4.5" fill="#3CB52C" />
              </svg>
              My Client&apos;s Stories
            </h2>
            <p
              className="home-testimonials-subtext"
              style={{
                margin: "8px 0 0",
                textAlign: "left",
                display: "-webkit-box",
                width: "100%",
                maxWidth: "296px",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 4,
                overflow: "hidden",
                color: "var(--texttwo, rgba(0, 0, 0, 0.60))",
                textOverflow: "ellipsis",
                fontFamily: "Inter",
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "23px",
              }}
            >
              With the right help and insight in the market, buying my home became so easy and effortless.
            </p>
          </div>
        </div>

        <div
          className="home-testimonials-right-section"
          style={{
            display: "flex",
            width: "568px",
            maxWidth: "100%",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "49px",
            boxSizing: "border-box",
          }}
        >
          <div className="home-testimonial-card">
            <div
              key={activeIndex}
              className={`home-testimonial-slide-panel home-testimonial-slide-panel--${slideDir}`}
            >
            {/* Heading row: quote + title with horizontal gap (Figma) */}
            <div className="home-testimonial-heading-block">
              <div className="home-testimonials-quote-wrap">
                <img
                  src="/static/icon/image%201013.png"
                  alt="Opening quotation mark"
                  title="Opening quotation mark"
                  className="home-testimonials-quote-img"
                />
              </div>
              <h3 className="home-testimonial-story-heading">{item.storyHeading}</h3>
            </div>

            <p className="home-testimonial-text">{formatQuote(item.testimonialText)}</p>

            <footer className="home-testimonial-meta">
              <p className="home-testimonial-role">
                <span className="home-testimonial-role-name">{`— ${item.clientName}`}</span>
                <span className="home-testimonial-role-loc">{`, ${item.clientLocation}`}</span>
                <span className="home-testimonial-role-sep">{" / "}</span>
                <span className="home-testimonial-role-project">{item.projectName}</span>
              </p>
              <div className="home-testimonial-stars" role="img" aria-label="Rated 5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <img
                    key={`${item.id}-star-${i}`}
                    src="/static/icon/star.png"
                    alt={`Rating star ${i + 1} of 5`}
                    title="Rated 5 out of 5 stars"
                    aria-hidden="true"
                    width={22}
                    height={22}
                  />
                ))}
              </div>
            </footer>
            </div>
          </div>
        </div>

        <div className="home-testimonials-slider-controls">
          <button
            type="button"
            className="home-testimonials-nav-btn"
            aria-label="Previous testimonial"
            onClick={goPrev}
            disabled={total <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M16 6.9899V9.0101H3.87879L9.43434 14.5657L8 16L0 8L8 9.53674e-07L9.43434 1.43434L3.87879 6.9899L16 6.9899Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            type="button"
            className="home-testimonials-nav-btn"
            aria-label="Next testimonial"
            onClick={goNext}
            disabled={total <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M0 6.9899V9.0101H12.1212L6.56566 14.5657L8 16L16 8L8 0L6.56566 1.43434L12.1212 6.9899L0 6.9899Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .home-testimonials-header {
          width: 100%;
        }

        .home-testimonials-inner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        .home-testimonials-slider-controls {
          display: flex;
          align-items: center;
          gap: 24px;
          justify-content: center;
          width: 100%;
          flex-shrink: 0;
        }

        @media (min-width: 992px) {
          .home-testimonials-inner-container {
            display: grid;
            grid-template-columns: min(296px, auto) minmax(0, min(568px, 100%));
            column-gap: clamp(24px, 5vw, 97px);
            align-items: start;
            justify-content: center;
         
          }

          .home-testimonials-left-section {
            grid-column: 1;
            grid-row: 1;
          }

          .home-testimonials-slider-controls {
            grid-column: 1;
            grid-row: 2;
            justify-self: start;
            justify-content: flex-start;
            width: auto;
            margin-top: clamp(24px, 5vw, 73px);
          }

          .home-testimonials-right-section {
            grid-column: 2;
            grid-row: 1 / span 2;
            align-self: start;
          }
        }

        .home-testimonial-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .home-testimonial-slide-panel {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          animation-duration: 0.5s;
          animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
          animation-fill-mode: both;
        }

        .home-testimonial-slide-panel--next {
          animation-name: testimonial-enter-next;
        }

        .home-testimonial-slide-panel--prev {
          animation-name: testimonial-enter-prev;
        }

        @keyframes testimonial-enter-next {
          from {
            opacity: 0;
            transform: translateX(28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes testimonial-enter-prev {
          from {
            opacity: 0;
            transform: translateX(-28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .home-testimonials-nav-btn {
          display: flex;
          width: 56px;
          height: 56px;
          padding: 3px;
          justify-content: center;
          align-items: center;
          gap: 10px;
          border-radius: 30px;
          border: none;
          background: #fff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          color: #111827;
          cursor: pointer;
          transition:
            background 0.25s ease,
            box-shadow 0.25s ease,
            color 0.25s ease,
            opacity 0.2s ease;
        }

        .home-testimonials-nav-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .home-testimonials-nav-btn:not(:disabled):hover {
          background: #0d6d45;
          box-shadow: 0 8px 24px rgba(13, 109, 69, 0.35);
          color: var(--goldcolor, #ebcb91);
        }

        .home-testimonials-nav-btn svg path {
          fill: currentColor;
        }

        /* Quote + heading: flex row with gap — spacing between icon and title */
        .home-testimonial-heading-block {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          width: 100%;
          padding: 0;
          margin-bottom: 49px;
          box-sizing: border-box;
        }

        .home-testimonials-quote-wrap {
          flex-shrink: 0;
          margin: 0;
          padding: 0;
          line-height: 0;
          pointer-events: none;
          align-self: flex-start;
        }

        .home-testimonials-quote-img {
          display: block;
          width: 42px;
          height: 42px;
          max-width: 100%;
          object-fit: contain;
          object-position: left top;
          margin-top: -25px;
        }

        .home-testimonial-story-heading {
          flex: 1;
          min-width: 0;
          margin: 0;
          padding: 2px 0 0 0;
          font-family: Lato, sans-serif;
          font-size: clamp(22px, 2.85vw, 36px);
          font-weight: 600;
          font-style: normal;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #333333;
          text-align: left;
        }

        @media (min-width: 992px) {
          .home-testimonial-story-heading {
            white-space: nowrap;
          }
        }

        .home-testimonial-text {
          margin: 0;
          width: 100%;
          margin-bottom: 28px;
          font-family: Inter, sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.65;
          color: rgba(51, 51, 51, 0.75);
          text-align: left;
        }

        .home-testimonial-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .home-testimonial-role {
          margin: 0;  
          font-family: Inter, sans-serif;
          font-size: 15px;
          line-height: 1.5;
          color: #4b5563;
          text-align: left;
        }

        .home-testimonial-role-name {
          font-style: normal;
          font-weight: 400;
          color: #333333;
        }

        .home-testimonial-role-loc {
          font-style: italic;
          font-weight: 400;
          color: #4b5563;
        }

        .home-testimonial-role-sep {
          font-style: normal;
          color: #9ca3af;
        }

        .home-testimonial-role-project {
          font-style: normal;
          font-weight: 700;
          color: #333333;
        }

        .home-testimonial-stars {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .home-testimonial-stars img {
          display: block;
          width: 22px;
          height: auto;
          object-fit: contain;
          flex-shrink: 0;
        }

        @media (max-width: 991px) {
          .home-testimonials-section :global(.home-testimonials-inner-container) {
            align-items: center !important;
            padding: 36px 20px !important;
          }

          .home-testimonials-section :global(.home-testimonials-left-section) {
            align-items: center !important;
            padding-top: 0 !important;
            width: 100% !important;
            max-width: 560px !important;
          }

          .home-testimonials-section :global(.home-testimonials-main-title) {
            justify-content: center !important;
            text-align: center !important;
          }

          .home-testimonials-section :global(.home-testimonials-subtext) {
            text-align: center !important;
            max-width: 100% !important;
          }

          .home-testimonials-section :global(.home-testimonials-right-section) {
            width: 100% !important;
            max-width: 560px !important;
            align-items: center !important;
          }

          .home-testimonials-section .home-testimonial-slide-panel {
            align-items: center !important;
          }

          /* Row: quote + title stay adjacent. flex:1 + text-align:center on h3 made the title
             sit in the middle of the remaining width — huge gap beside the icon. */
          .home-testimonials-section .home-testimonial-heading-block {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            align-items: flex-start !important;
            justify-content: center !important;
            gap: 10px !important;
          }

          .home-testimonials-section .home-testimonials-quote-img {
            margin-top: 0 !important;
          }

          .home-testimonials-section .home-testimonial-story-heading {
            flex: 0 1 auto !important;
            max-width: calc(100% - 52px);
            padding-top: 0 !important;
            white-space: normal !important;
            text-align: left !important;
          }

          .home-testimonials-section .home-testimonial-text {
            text-align: center !important;
          }

          .home-testimonials-section .home-testimonial-meta {
            align-items: center !important;
          }

          .home-testimonials-section .home-testimonial-role {
            text-align: center !important;
          }

          .home-testimonials-section .home-testimonials-slider-controls {
            justify-content: center !important;
            margin-top: 8px !important;
          }
        }

        @media (max-width: 767.98px) {
          .home-testimonials-section :global(.home-testimonials-inner-container) {
            padding: 24px 12px !important;
            gap: 20px !important;
          }

          .home-testimonials-section :global(.home-testimonials-left-section) {
            width: 100% !important;
            gap: 20px !important;
          }

          .home-testimonials-section :global(.home-testimonials-slider-controls) {
            width: 100%;
          }

          .home-testimonials-main-title {
            font-size: 15px !important;
          }

          .home-testimonials-subtext {
            max-width: 100% !important;
            font-size: 13px !important;
            line-height: 21px !important;
          }

          .home-testimonial-text {
            font-size: 14px !important;
          }

          .home-testimonial-heading-block {
            gap: 12px !important;
          }

          .home-testimonials-quote-img {
            width: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
