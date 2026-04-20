"use client";
import Image from "next/image";
import "./aboutus.css";
import Link from "next/link";
import MpfPlatformStatistics from "./MpfPlatformStatistics";

export default function WhyMyPropertyFact({ platformStats }) {
  const whyMpfShapedAlt =
    "Why My Property Fact — shaped decorative illustration on About Us page";
  const whyMpfFeatureAlt =
    "Why My Property Fact — platform benefits illustration on About Us page";

  return (
    <>
      <div className="container-fluid position-relative why-mpf-section">
        <div className="why-mpf-section-top-imgae"></div>
        <div>
          <h2 className="text-center about-us-h2 plus-jakarta-sans-semi-bold">
            Why My Property Fact?
          </h2>
        </div>
        <div className="container why-mpf-cards-section-container text-center z-index-2">
          <div className="why-mpf-cards-section-container-inner">
            <div className="d-flex gap-5 align-items-center justify-content-between py-5">
              <div className="why-mpf-card">
                <h3 className="why-mpf-card-title">Buyer-First, Not Brokered</h3>
                <p className="why-mpf-card-text">
                We work for the buyer, not commissions or inventory pressure. Our frameworks reward clarity, not hype, so your shortlist is cleaner, your negotiation stronger, and your decision anchored to facts you can verify and trust.
                </p>
              </div>
              <div className="vertical-divs d-flex flex-column align-items-center justify-content-center">
                <div className="why-mpf-card">
                  <h3 className="why-mpf-card-title">Transparent Price Normalisation</h3>
                  <p className="why-mpf-card-text">
                  Every option is reduced to an effective price per carpet area with all charges included. Like-for-like comparisons expose hidden costs and inflated super built-up claims, so you pay for genuine value, not marketing theatrics.
                  </p>
                </div>
                <div className="why-mpf-card">
                  <h3 className="why-mpf-card-title">Milestone-Based Decisions</h3>
                  <p className="why-mpf-card-text">
                  We price infrastructure and construction by dated milestones, not slides or promises. That discipline helps you avoid pre-paying tomorrow&apos;s premium today and improves your risk-adjusted returns across ready and under-construction choices.
                  </p>
                </div>
              </div>
              <div className="why-mpf-card">
                <h3 className="why-mpf-card-title">Citywide, Micro-Market Depth</h3>
                <p className="why-mpf-card-text">
                From Tier-1 hubs to rising Tier-2 corridors, our research shows tenant depth, rent achieved, days-on-market, and livability drivers. You see beyond headlines to the micro-factors that actually move prices, yields, and exit liquidity.
                </p>
              </div>
            </div>
            <div className="d-flex justify-content-between why-mpf-section-bottom-container">
              <div className="why-mpf-section-bottom-image-container">
                <Image
                  src="/static/about-us/image_shaped.png"
                  alt={whyMpfShapedAlt}
                  title={whyMpfShapedAlt}
                  width={588}
                  height={532}
                />
              </div>
              <div className="d-flex flex-column gap-5 align-items-center image-contant-bottom-container">
                <div className="why-mpf-card">
                  {/* <div> */}
                    <h3 className="why-mpf-card-title">Tools You&apos;ll Use</h3>
                    <p className="why-mpf-card-text">
                    Scores, checklists, and calculators designed for busy families and first-time buyers. Save time, avoid paperwork traps, and buy once, buy right, with a practical system that fits real budgets, real commutes, and real life.
                    </p>
                  {/* </div> */}
                </div>
                <div className="image-bottom-container">
                  <Image
                    src="/static/about-us/why_mpf.png"
                    alt={whyMpfFeatureAlt}
                    title={whyMpfFeatureAlt}
                    width={544}
                    height={363}
                  />
                </div>
              </div>
            </div>
          </div>

          {platformStats ? (
            <MpfPlatformStatistics
              citiesCount={platformStats.cities}
              buildersCount={platformStats.builders}
              projectsCount={platformStats.projects}
            />
          ) : null}

          <div className="our-commitment-container">
            <div className="our-commitment-content-container">
              <h2 className="our-commitment-heading about-us-h2 plus-jakarta-sans-semi-bold">
                Our Commitment
              </h2>
              <div className="our-commitment-text-container">
                <p className="text-center">
                  We&apos;re Committed To Transparency, Innovation, And Reliability.
                  By Harnessing The Power Of Technology And A Dedicated Support
                  Team, We Aim To Make The Entire Real Estate Journey From
                  Initial Search To Final Closing As Smooth And Rewarding As
                  Possible.
                </p>
                <p className="text-center">
                  Join Us At{" "}
                  <Link href="https://www.mypropertyfact.com" target="_blank"
                   className="our-commitment-link">
                    mypropertyfact.com
                  </Link>{" "}
                  And Discover A New Way To Explore Real Estate. Whether You Are
                  Buying, Renting, Or Investing, My Property Fact Is Here To
                  Help You Make Your Next Move With Confidence.
                </p>
              </div>
              <Link
                href="/contact-us"
                className="new-about-us-container-content-button mx-auto text-decoration-none d-inline-flex align-items-center justify-content-center"
              >
                <span className="text-white m-0">Get Expert Advice</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="our-commitment-container-bottom"></div>
      </div>
    </>
  );
}
