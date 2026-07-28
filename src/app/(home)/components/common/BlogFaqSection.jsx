"use client";
import { useState } from "react";
import "./common.css";

const DEFAULT_SUBTITLE =
  "Find answers to common questions about property types, filters, and coverage on My Property Fact across India.";

const VISIBLE_FAQ_COUNT = 5;

const toggleFaqIndex = (current, index) => (current === index ? null : index);

export default function BlogFaqSection({
  faqItems = [],
  subtitle = DEFAULT_SUBTITLE,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const hasScrollableList = faqItems.length > VISIBLE_FAQ_COUNT;

  if (!faqItems?.length) return null;

  return (
    <section className="blog-faq-section">
      <div className="container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">{subtitle}</p>
        <div
          className={`faq-list${hasScrollableList ? " faq-list--scrollable" : ""}`}
          role={hasScrollableList ? "region" : undefined}
          aria-label={hasScrollableList ? "FAQ list" : undefined}
        >
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;

            return (
              <div key={index} className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
                <button
                  className="faq-head"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenFaq(toggleFaqIndex(openFaq, index))}
                >
                  <h3 className="faq-question">{item.q}</h3>
                  <span
                    className={`faq-plus-wrap${isOpen ? " open" : ""}`}
                    aria-hidden="true"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M9.75 0C4.374 0 0 4.374 0 9.75C0 15.126 4.374 19.5 9.75 19.5C15.126 19.5 19.5 15.126 19.5 9.75C19.5 4.374 15.126 0 9.75 0ZM9.75 1.5C14.3153 1.5 18 5.18475 18 9.75C18 14.3153 14.3153 18 9.75 18C5.18475 18 1.5 14.3153 1.5 9.75C1.5 5.18475 5.18475 1.5 9.75 1.5ZM9 5.25V9H5.25V10.5H9V14.25H10.5V10.5H14.25V9H10.5V5.25H9Z"
                        fill="black"
                      />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer" id={`faq-answer-${index}`}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
