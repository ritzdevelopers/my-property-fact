"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import "./aboutus-v3.css";

const UNITS_DISPLAY = 10030;

const OFFERINGS = [
  {
    id: "locate",
    title: "Neighbourhood LOCATE Scores",
    text: "Compare micro-markets on economy, projects, connectivity, amenities, trends, and supply–demand in one simple score.",
  },
  {
    id: "listings",
    title: "Verified, Carpet-First Listings",
    text: "Transparent carpet area, effective ₹/carpet sq ft, approvals, and RERA status — so you never overpay for super built-up numbers.",
  },
  {
    id: "deal-math",
    title: "Deal Math Calculators",
    text: "Estimate all-in costs in minutes and stress-test EMIs, rental yields, and exit costs to compare options on true cash flows.",
  },
  {
    id: "checklists",
    title: "Due-Diligence Checklists",
    text: "Step-by-step templates for title, encumbrance, sanctioned plans, RERA, OC/CC, and society NOCs — no expensive surprises.",
  },
  {
    id: "insights",
    title: "Expert Insights & Guides",
    text: "Plain-English explainers on GST, stamp duty, area metrics, and market cycles, plus city primers and hotspot maps.",
  },
  {
    id: "support",
    title: "Guided Expert Support",
    text: "Talk to an expert whenever you need to validate assumptions, documents, and decision trade-offs before you commit.",
  },
];

const VALUES = [
  {
    id: "buyer-first",
    title: "Buyer-First, Always",
    text: "We work for the buyer, not commissions or inventory pressure. Your shortlist should feel simpler, not louder.",
  },
  {
    id: "transparency",
    title: "Radical Transparency",
    text: "Every option reduced to effective price per carpet area with all charges included — like-for-like, no marketing theatrics.",
  },
  {
    id: "verification",
    title: "Verification-Led Research",
    text: "Data, documentation checks, and on-ground signals combined to reduce surprises late in your journey.",
  },
  {
    id: "discipline",
    title: "Milestone-Based Discipline",
    text: "We price construction and infrastructure by dated milestones, not slides or promises, improving your risk-adjusted returns.",
  },
];

const JOURNEY = [
  {
    id: "origin",
    year: "The Beginning",
    title: "A spreadsheet built for fair comparisons",
    text: "MPF began as a simple comparison system an investor built to cut through brochure math — usable-area numbers and real transaction costs, side by side. Friends shared it, then clients, then developers seeking honest feedback.",
  },
  {
    id: "frameworks",
    year: "Building the System",
    title: "Buyer-friendly frameworks, standardised",
    text: "We turned that spreadsheet into checklists, calculators, and decision rules — the LOCATE Score, carpet-first pricing, and milestone-based buying — so first-time buyers can act with the confidence of seasoned investors.",
  },
  {
    id: "scale",
    year: "Scaling Up",
    title: "Citywide coverage, deeper verification",
    text: "From Tier-1 hubs to rising Tier-2 corridors, we kept expanding coverage while strengthening data quality, documentation checks, and on-ground research across every micro-market we track.",
  },
  {
    id: "today",
    year: "Today",
    title: "India's buyer-first property guide",
    text: "Thousands of buyers use MPF to shortlist, validate, and decide. Our vision is to be India's most trusted property decision system — where every buyer sees risks, costs, and upside clearly.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function useCountUp(target, start) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || !target) return undefined;
    let raf;
    const duration = 1600;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);

  return value;
}

function StatItem({ value, label, suffix = "+" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useCountUp(value, inView);

  return (
    <div className="about3-stat" ref={ref} role="listitem">
      <span className="about3-stat__value plus-jakarta-sans-bold">
        {count.toLocaleString("en-IN")}
        <span className="about3-stat__suffix">{suffix}</span>
      </span>
      <span className="about3-stat__label">{label}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="about3-label">
      <span className="about3-label__line" aria-hidden="true" />
      <span className="about3-label__text">{children}</span>
    </div>
  );
}

export default function AboutUsV3({ platformStats }) {
  const cities = platformStats?.cities ?? 0;
  const builders = platformStats?.builders ?? 0;
  const projects = platformStats?.projects ?? 0;

  return (
    <div className="about3">
      {/* ============ HERO — Emaar-style full-bleed statement ============ */}
      <section className="about3-hero" aria-label="About My Property Fact">
        <div className="about3-hero__bg" aria-hidden="true" />

      </section>

      {/* ============ STATS BAND — Housing-style numbers ============ */}
      <section className="about3-stats" aria-label="Platform statistics">
        <div className="container">
          <div className="about3-stats__grid" role="list">
            <StatItem value={cities} label="Cities Covered" />
            <StatItem value={builders} label="Developers" />
            <StatItem value={projects} label="Projects Listed" />
            <StatItem value={UNITS_DISPLAY} label="Units Tracked" />
          </div>
        </div>
      </section>

      {/* ============ WHO WE ARE — Housing-style welcome ============ */}
      <section className="about3-who">
        <div className="container">
          <div className="row gy-4 gy-lg-0">
            <div className="col-lg-4">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
              >
                <SectionLabel>Who We Are</SectionLabel>
                <h2 className="about3-heading plus-jakarta-sans-semi-bold">
                  Welcome to
                  <br />
                  My Property Fact
                </h2>
              </motion.div>
            </div>
            <div className="col-lg-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={stagger}
              >
                <motion.p className="about3-who__lead" variants={fadeUp}>
                  My Property Fact is your go-to platform for discovering the perfect
                  real estate opportunity — whether you&apos;re an investor hunting for
                  the next big project, a business owner scouting commercial space, or
                  a family looking for a place to call home.
                </motion.p>
                <motion.p className="about3-who__text" variants={fadeUp}>
                  We bring together every kind of property — high-end apartments, cozy
                  farmhouses, strategic commercial plots, and premium office spaces —
                  backed by robust research and analytics. Our proprietary LOCATE Score
                  compares neighbourhoods on economy, projects, connectivity,
                  amenities, trends, and supply–demand. We demystify carpet area,
                  approvals, GST, and stamp duty, and normalise every home to an
                  effective price per usable square foot.
                </motion.p>
                <motion.p className="about3-who__text" variants={fadeUp}>
                  Whether you&apos;re shortlisting your first 2-BHK or benchmarking a
                  portfolio, MPF gives you clear checklists, calculators, and market
                  insights you can actually use. No hype — just transparent
                  comparisons, verified documentation support, and milestone-based
                  decision frameworks.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VISION & MISSION — dark statement band ============ */}
      <section className="about3-vision" aria-label="Our vision and mission">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-6">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={stagger}
              >
                <motion.div variants={fadeUp}>
                  <SectionLabel>Our Vision</SectionLabel>
                </motion.div>
                <motion.p
                  className="about3-vision__statement plus-jakarta-sans-semi-bold"
                  variants={fadeUp}
                >
                  Changing the way India experiences property — with data, not noise.
                </motion.p>
                <motion.div variants={fadeUp}>
                  <SectionLabel>Our Mission</SectionLabel>
                </motion.div>
                <motion.p className="about3-vision__text" variants={fadeUp}>
                  To be the first choice of buyers and investors in discovering,
                  comparing, and closing on property — empowering every decision with
                  transparent price math, verification-led research, and tools designed
                  for real budgets, real commutes, and real life.
                </motion.p>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                className="about3-vision__media"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <video
                  src="/static/about-us/mission.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="about3-vision__video"
                  aria-label="My Property Fact mission video"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHAT WE OFFER — numbered minimal grid ============ */}
      <section className="about3-offer">
        <div className="container">
          <motion.div
            className="about3-section-head"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            <SectionLabel>What We Offer</SectionLabel>
            <h2 className="about3-heading plus-jakarta-sans-semi-bold">
              Everything you need to shortlist, validate, and decide
            </h2>
          </motion.div>

          <motion.div
            className="row g-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            {OFFERINGS.map((item, index) => (
              <motion.div key={item.id} className="col-md-6 col-lg-4" variants={fadeUp}>
                <div className="about3-offer__card">
                  <span className="about3-offer__num plus-jakarta-sans-bold" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="about3-offer__title plus-jakarta-sans-semi-bold">
                    {item.title}
                  </h3>
                  <p className="about3-offer__text">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ VALUES — image + list, Emaar editorial style ============ */}
      <section className="about3-values">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-5">
              <motion.div
                className="about3-values__media"
                initial={{ opacity: 0, x: -32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <img
                  src="/static/about-us/about_us_section.jpg"
                  alt="My Property Fact — research and verification team at work"
                  width={515}
                  height={441}
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
            <div className="col-lg-7">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={stagger}
              >
                <motion.div variants={fadeUp}>
                  <SectionLabel>What We Stand For</SectionLabel>
                  <h2 className="about3-heading plus-jakarta-sans-semi-bold">
                    Principles that guide every recommendation
                  </h2>
                </motion.div>
                <div className="about3-values__list">
                  {VALUES.map((v) => (
                    <motion.div key={v.id} className="about3-values__item" variants={fadeUp}>
                      <h3 className="about3-values__title plus-jakarta-sans-semi-bold">
                        {v.title}
                      </h3>
                      <p className="about3-values__text">{v.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ JOURNEY — Housing-style timeline ============ */}
      <section className="about3-journey" aria-label="Our journey">
        <div className="container">
          <motion.div
            className="about3-section-head about3-section-head--center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            <SectionLabel>Our Journey</SectionLabel>
            <h2 className="about3-heading plus-jakarta-sans-semi-bold">
              Our journey to where we are
            </h2>
          </motion.div>

          <div className="about3-journey__timeline">
            {JOURNEY.map((step, index) => (
              <motion.div
                key={step.id}
                className={`about3-journey__row ${
                  index % 2 === 1 ? "about3-journey__row--flip" : ""
                }`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                variants={fadeUp}
              >
                <div className="about3-journey__marker" aria-hidden="true">
                  <span className="about3-journey__dot" />
                </div>
                <div className="about3-journey__card">
                  <span className="about3-journey__year plus-jakarta-sans-bold">
                    {step.year}
                  </span>
                  <h3 className="about3-journey__title plus-jakarta-sans-semi-bold">
                    {step.title}
                  </h3>
                  <p className="about3-journey__text">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA — full-bleed commitment band ============ */}
      <section className="about3-cta" aria-label="Our commitment">
        <div className="about3-cta__bg" aria-hidden="true" />
        <div className="about3-cta__overlay" aria-hidden="true" />
        <div className="container about3-cta__inner">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
          >
            <motion.p className="about3-hero__eyebrow" variants={fadeUp}>
              Our Commitment
            </motion.p>
            <motion.h2
              className="about3-cta__title plus-jakarta-sans-bold"
              variants={fadeUp}
            >
              Ready to make your next move with confidence?
            </motion.h2>
            <motion.p className="about3-cta__text" variants={fadeUp}>
              We&apos;re committed to transparency, innovation, and reliability — making
              the entire journey, from first search to final closing, smooth and
              rewarding. Whether you are buying, renting, or investing, My Property
              Fact is here to help.
            </motion.p>
            <motion.div className="about3-cta__actions" variants={fadeUp}>
              <Link
                href="/projects"
                title="Explore Projects"
                className="about3-btn about3-btn--gold text-decoration-none"
              >
                Explore Projects
              </Link>
              <Link
                href="/contact-us"
                title="Talk to an Expert"
                className="about3-btn about3-btn--ghost text-decoration-none"
              >
                Talk to an Expert
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
