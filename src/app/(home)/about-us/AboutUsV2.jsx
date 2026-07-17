import Link from "next/link";
import "./aboutus.css";

const UNITS_DISPLAY = "10,030";

const PRINCIPLES = [
  {
    id: "buyer-first",
    icon: "/static/icon/jacob.svg",
    title: "Buyer-first, always",
    text: "We optimise for clarity and outcomes, not inventory pressure. Your shortlist should feel simpler, not louder.",
  },
  {
    id: "transparent-math",
    icon: "/static/icon/Graph.svg",
    title: "Transparent price math",
    text: "Like-for-like comparisons using carpet-first thinking and all-in costs, so you can see true value quickly.",
  },
  {
    id: "verification",
    icon: "/static/icon/Vector.svg",
    title: "Verification-led research",
    text: "We combine data, documentation checks, and on-ground signals to reduce surprises late in the journey.",
  },
  {
    id: "tools",
    icon: "/static/icon/Calci.svg",
    title: "Tools you’ll actually use",
    text: "Scores, checklists, and calculators designed for real decisions with real timelines, budgets, and trade-offs.",
  },
];

const OFFERINGS = [
  {
    id: "locate",
    title: "Neighbourhood LOCATE Scores",
    text: "Compare micro-markets on economy, projects, connectivity, amenities, trends, and supply–demand in one view.",
  },
  {
    id: "listings",
    title: "Verified, carpet-first listings",
    text: "Understand usable space, approvals and status, and effective ₹/carpet sq ft so you don’t compare apples to posters.",
  },
  {
    id: "deal-math",
    title: "Deal math calculators",
    text: "Estimate all-in cost and stress-test EMIs, yields, vacancy, and exit costs for realistic comparisons.",
  },
  {
    id: "checklists",
    title: "Due-diligence checklists",
    text: "Step-by-step templates for RERA/OC/CC, sanctioned plans, title, and documentation hygiene.",
  },
  {
    id: "insights",
    title: "Plain-English guides",
    text: "Clear explainers on GST, stamp duty, area metrics, and market cycles with practical buying frameworks.",
  },
  {
    id: "support",
    title: "Guided expert support",
    text: "When you need it, talk to an expert to validate assumptions, documents, and decision trade-offs.",
  },
];

const TIMELINE = [
  {
    id: "start",
    title: "Started with fair comparisons",
    text: "MPF began as a simple way to compare homes using usable-area math and real transaction considerations.",
  },
  {
    id: "frameworks",
    title: "Built buyer-friendly frameworks",
    text: "We standardised checklists, calculators, and decision rules so first-time buyers can act with confidence.",
  },
  {
    id: "scale",
    title: "Scaled with stronger verification",
    text: "We keep expanding coverage while improving data quality, documentation checks, and decision tooling.",
  },
];

function Stat({ label, value }) {
  return (
    <div className="about-v2-stat" role="listitem">
      <div className="about-v2-stat__value plus-jakarta-sans-bold">{value}</div>
      <div className="about-v2-stat__label plus-jakarta-sans-regular">{label}</div>
    </div>
  );
}

export default function AboutUsV2({ platformStats }) {
  const cities = platformStats?.cities ?? 0;
  const builders = platformStats?.builders ?? 0;
  const projects = platformStats?.projects ?? 0;

  return (
    <div className="about-v2">
      <section className="about-v2-hero" aria-label="About My Property Fact">
        <div className="about-v2-hero__bg" aria-hidden="true" />

        <div className="container position-relative">
          <div className="row gy-4 align-items-end">
            <div className="col-lg-7">
              <p className="about-v2-eyebrow plus-jakarta-sans-regular">About My Property Fact</p>
              <h1 id="mpf-page-heading" className="about-v2-hero__title plus-jakarta-sans-bold">
                Buyer-first real estate decisions, backed by data.
              </h1>
              <p className="about-v2-hero__subtitle plus-jakarta-sans-regular">
                Compare homes and micro-markets with clear math, verification-led research, and practical decision
                tools, so you can shortlist confidently and avoid late-stage surprises.
              </p>

              <div className="about-v2-hero__actions">
                <Link
                  href="/projects"
                  title="Explore projects"
                  className="about-v2-btn about-v2-btn--primary text-decoration-none"
                >
                  Explore projects
                </Link>
                <Link
                  href="/contact-us"
                  title="Talk to an expert"
                  className="about-v2-btn about-v2-btn--ghost text-decoration-none"
                >
                  Talk to an expert
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="about-v2-glass">
                <h2 className="about-v2-card__title plus-jakarta-sans-semi-bold">Platform at a glance</h2>
                <div className="about-v2-stats" role="list" aria-label="Platform statistics">
                  <Stat label="Cities" value={cities.toLocaleString("en-IN")} />
                  <Stat label="Builders" value={builders.toLocaleString("en-IN")} />
                  <Stat label="Projects" value={projects.toLocaleString("en-IN")} />
                  <Stat label="Units" value={UNITS_DISPLAY} />
                </div>
                <p className="about-v2-card__note plus-jakarta-sans-regular">
                  Counts update as we expand coverage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-v2-story">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6">
              <div className="about-v2-media">
                <img
                  src="/static/about-us/about_us_section.jpg"
                  alt="My Property Fact — team and research overview"
                  width={666}
                  height={440}
                  className="about-v2-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="col-lg-6">
              <h2 className="about-v2-section-title plus-jakarta-sans-semi-bold">Our story & vision</h2>
              <p className="about-v2-section-subtitle plus-jakarta-sans-regular">
                MPF began as a simple comparison system built to cut through brochure math. We still work the same
                way: evidence over slogans, usable-space comparisons over vague metrics, and milestone-led thinking
                over hype.
              </p>

              <div className="about-v2-bullets" aria-label="Key strengths">
                <div className="about-v2-bullet">
                  <span className="about-v2-bullet__dot" aria-hidden="true" />
                  <span className="about-v2-bullet__text">Carpet-first, all-in cost comparisons</span>
                </div>
                <div className="about-v2-bullet">
                  <span className="about-v2-bullet__dot" aria-hidden="true" />
                  <span className="about-v2-bullet__text">Neighbourhood intelligence with LOCATE scoring</span>
                </div>
                <div className="about-v2-bullet">
                  <span className="about-v2-bullet__dot" aria-hidden="true" />
                  <span className="about-v2-bullet__text">Checklists and tools built for real buyers</span>
                </div>
              </div>
            </div>
          </div>

          <div className="about-v2-divider" aria-hidden="true" />

          <div className="row align-items-center gy-4">
            <div className="col-lg-6 order-lg-2">
              <div className="about-v2-media">
                <video
                  src="/static/about-us/mission.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="about-v2-video"
                  aria-label="My Property Fact mission video"
                />
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <h2 className="about-v2-section-title plus-jakarta-sans-semi-bold">How we work</h2>
              <p className="about-v2-section-subtitle plus-jakarta-sans-regular">
                We combine structured data with verification-led checks and plain-English guidance, so the journey
                feels more predictable from first shortlist to final paperwork.
              </p>
              <div className="about-v2-steps" aria-label="Verification approach">
                <div className="about-v2-step">
                  <div className="about-v2-step__num" aria-hidden="true">
                    1
                  </div>
                  <div>
                    <div className="about-v2-step__title plus-jakarta-sans-semi-bold">Normalise</div>
                    <div className="about-v2-step__text plus-jakarta-sans-regular">
                      Reduce options to comparable, usable-area and all-in cost views.
                    </div>
                  </div>
                </div>
                <div className="about-v2-step">
                  <div className="about-v2-step__num" aria-hidden="true">
                    2
                  </div>
                  <div>
                    <div className="about-v2-step__title plus-jakarta-sans-semi-bold">Verify</div>
                    <div className="about-v2-step__text plus-jakarta-sans-regular">
                      Check documentation, status signals, and on-ground context where it matters.
                    </div>
                  </div>
                </div>
                <div className="about-v2-step">
                  <div className="about-v2-step__num" aria-hidden="true">
                    3
                  </div>
                  <div>
                    <div className="about-v2-step__title plus-jakarta-sans-semi-bold">Decide</div>
                    <div className="about-v2-step__text plus-jakarta-sans-regular">
                      Use checklists and calculators to choose with clear trade-offs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-v2-principles">
        <div className="container">
          <div className="about-v2-section-head">
            <h2 className="about-v2-section-title plus-jakarta-sans-semi-bold">What we stand for</h2>
            <p className="about-v2-section-subtitle plus-jakarta-sans-regular">
              A calmer, clearer buying experience built on transparent comparisons and verification-led research.
            </p>
          </div>

          <div className="row gy-3">
            {PRINCIPLES.map((p) => (
              <div key={p.id} className="col-md-6 col-lg-3">
                <div className="about-v2-card">
                  <div className="about-v2-card__icon" aria-hidden="true">
                    <img src={p.icon} alt="" width={28} height={28} />
                  </div>
                  <h3 className="about-v2-card__heading plus-jakarta-sans-semi-bold">{p.title}</h3>
                  <p className="about-v2-card__text plus-jakarta-sans-regular">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-v2-offers">
        <div className="container">
          <div className="about-v2-section-head">
            <h2 className="about-v2-section-title plus-jakarta-sans-semi-bold">What we offer</h2>
            <p className="about-v2-section-subtitle plus-jakarta-sans-regular">
              Everything you need to shortlist, validate, and decide, from neighbourhood scoring to due-diligence
              templates.
            </p>
          </div>

          <div className="row gy-3">
            {OFFERINGS.map((o) => (
              <div key={o.id} className="col-md-6 col-lg-4">
                <div className="about-v2-offer">
                  <h3 className="about-v2-offer__title plus-jakarta-sans-semi-bold">{o.title}</h3>
                  <p className="about-v2-offer__text plus-jakarta-sans-regular">{o.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-v2-timeline">
        <div className="container">
          <div className="about-v2-section-head">
            <h2 className="about-v2-section-title plus-jakarta-sans-semi-bold">How we got here</h2>
            <p className="about-v2-section-subtitle plus-jakarta-sans-regular">
              Built step-by-step with one goal: make property decisions feel more predictable.
            </p>
          </div>

          <div className="about-v2-timeline__grid">
            {TIMELINE.map((t, idx) => (
              <div key={t.id} className="about-v2-timeline__item">
                <div className="about-v2-timeline__index" aria-hidden="true">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="about-v2-timeline__title plus-jakarta-sans-semi-bold">{t.title}</h3>
                  <p className="about-v2-timeline__text plus-jakarta-sans-regular">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-v2-commitment">
        <div className="container">
          <div className="about-v2-commitment__inner">
            <h2 className="about-v2-commitment__title plus-jakarta-sans-semi-bold">Our commitment</h2>
            <p className="about-v2-commitment__text plus-jakarta-sans-regular">
              We&apos;re committed to transparency, innovation, and reliability. By combining technology with a dedicated
              support team, we aim to make the real estate journey, from initial search to final closing, smoother and
              more rewarding.
            </p>
            <div className="about-v2-commitment__actions">
              <Link
                href="/contact-us"
                title="Get expert advice"
                className="about-v2-btn about-v2-btn--primary text-decoration-none"
              >
                Get expert advice
              </Link>
            </div>
            <p className="about-v2-commitment__note plus-jakarta-sans-regular">
              Visit{" "}
              <a
                href="https://mypropertyfact.in"
                target="_blank"
                rel="noopener noreferrer"
                className="about-v2-link"
                title="mypropertyfact.in"
              >
                mypropertyfact.in
              </a>{" "}
              to explore more.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

