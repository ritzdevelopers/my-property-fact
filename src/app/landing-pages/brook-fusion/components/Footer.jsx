"use client";

import parentLogo from "../assets/fusion-logo.webp";
import mainLogo from "../assets/BrookLogo.png";

export default function Footer() {
  return (
    <section id="footer-section" className="bg-light pt-5 pb-4 text-center">
      <div className="container px-3 px-md-5">
        <h2 className="display-5 fw-bold text-dark mb-5">
          Powered by a trusted Joint Venture
        </h2>

        <div className="row text-start g-4">
          {/* Left Column: Brook */}
          <div className="col-md-6">
            <img
              src={mainLogo}
              alt="The Brook Logo"
              width={160}
              height={90}
              className="mb-0"
            />
            <p className="text-muted fs-5">
              <strong>Come Home to Strength, Style & Speed </strong>
              The Brook isn’t just <strong>well-located </strong> or{" "}
              <strong>well-designed </strong> – it’s{" "}
              <strong>well-backed</strong>. With{" "}
              <strong>
                fully paid-up land, a 3-side open plot, zero debt{" "}
              </strong>
              , and a builder known for <strong>100% compliance </strong>, this
              is a home built on clarity and credibility. Constructed using{" "}
              <strong>Mivan technology </strong> for durability and speed, it’s
              one of the{" "}
              <strong>fastest progressing projects in the region </strong>. The
              Brook is not just your address – it’s your advantage.
              <strong> Move in. Move ahead. </strong>
            </p>
          </div>

          {/* Right Column: Fusion */}
          <div className="col-md-6">
            <img
              src={parentLogo}
              alt="Fusion Logo"
              width={180}
              height={60}
              className="mb-3"
            />
            <p className="text-muted fs-5">
              <strong>
                Built by Fusion Limited – Trusted for Innovation, Integrity &
                Speed{" "}
              </strong>
              With a proven track record across NCR, Fusion Limited is known for{" "}
              <strong>
                exceptional construction quality, zero financial liabilities{" "}
              </strong>
              , and <strong>100% regulatory compliance </strong>. Led by{" "}
              <strong>
                highly reputable promoters with a spotless track record and the
                highest ethical standards{" "}
              </strong>
              , the group brings a future-forward mindset and complete
              transparency to every project.
              <br />
              Their landmark developments like
              <strong> Fusion Homes, French Apartments, The Rivulet </strong>
              and commercial destinations like
              <strong> U:Fairia </strong>
              reflect their commitment to quality, credibility, and delivery.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-5 pt-4 border-top text-muted small">
          <p className="mb-0">
            © Copyright 2025 FUSION LIMITED. All Rights Reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
