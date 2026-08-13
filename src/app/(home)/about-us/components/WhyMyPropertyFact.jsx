"use client";

import Link from "next/link";
import "./style/WhyMyPropertyFact.css";

export default function WhyMyPropertyFact() {
  return (
    <section className="commitment-section">
      <div className="commitment-card">

        <h2 className="commitment-title">
          Our Commitment
        </h2>

        <div className="commitment-content">
          <p>
            We&apos;re committed to transparency, innovation, and reliability. By
            harnessing the power of technology and a dedicated support team, we
            aim to make the entire real estate journey—from initial search to
            final closing—as smooth and rewarding as possible.
          </p>

          <p>
            Join us at{" "}
            <Link
              href="https://mypropertyfact.in"
              target="_blank"
              rel="noopener noreferrer"
              className="commitment-link"
            >
              mypropertyfact.in
            </Link>{" "}
            and discover a new way to explore real estate. Whether you&apos;re
            buying, renting, or investing, My Property Fact is here to help you
            make your next move with confidence.
          </p>
        </div>

        <Link
          href="/contact-us"
          className="commitment-btn"
        >
          Read More
        </Link>

      </div>
    </section>
  );
}