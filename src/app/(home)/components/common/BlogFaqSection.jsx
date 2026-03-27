"use client";
import { useState } from "react";
import Image from "next/image";
import "./common.css";

const DEFAULT_SUBTITLE =
  "Find answers to common questions about property types, filters, and coverage on My Property Fact across India.";

export default function BlogFaqSection({
  faqItems = [],
  subtitle = DEFAULT_SUBTITLE,
}) {
  const [openFaq, setOpenFaq] = useState(null);

  if (!faqItems?.length) return null;

  return (
    <section className="blog-faq-section">
      <div className="container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">{subtitle}</p>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <div className="faq-head">
                <h3 className="faq-question">{item.q}</h3>
                <button
                  className={`faq-plus-wrap ${openFaq === index ? "open" : ""}`}
                  type="button"
                  aria-label={openFaq === index ? "Collapse question" : "Expand question"}
                  aria-expanded={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <Image
                    src="/static/icon/plus.svg"
                    alt="Toggle answer"
                    title="Toggle answer"
                    width={18}
                    height={18}
                  />
                </button>
              </div>
              {openFaq === index && (
                <div className="faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
