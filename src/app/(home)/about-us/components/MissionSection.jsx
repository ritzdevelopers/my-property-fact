"use client";

import "./style/MissionSection.css";

export default function MissionSection() {
  return (
    <section className="missionSection">

      <div className="missionContainer">

        <div className="missionLeft">

          <span className="sectionTag">
            Our Story
          </span>

          <h2 className="heading">
            Making Every Property Decision Smarter.
          </h2>

          <p className="paragraph">
            My Property Fact was founded with one simple vision—to make
            property buying transparent, data-driven, and stress-free.
            We believe every buyer deserves access to verified
            information before making one of life's biggest investments.
          </p>

        </div>

        <div className="missionRight">

          <div className="missionCard">

            <h3 className="heading">
              Our Mission
            </h3>

            <p className="paragraph">
              To simplify the real estate journey through verified
              information, market intelligence, and unbiased guidance.
            </p>

          </div>

          <div className="missionCard">

            <h3 className="heading">
              Our Vision
            </h3>

            <p className="paragraph">
              To become India's most trusted property intelligence
              platform where every decision is backed by real data.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}