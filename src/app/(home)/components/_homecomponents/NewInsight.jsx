"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LuArrowRight,
  LuBadgeCheck,
  LuBuilding2,
  LuCalculator,
  LuChartLine,
  LuClock3,
  LuHouse,
  LuMapPin,
  LuPercent,
  LuPlay,
  LuShieldCheck,
  LuSparkles,
  LuTrainFront,
  LuTrees,
  LuUsers,
  LuWallet,
} from "react-icons/lu";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";

const HIGHLIGHTS = [
  {
    title: "Make Informed Decisions",
    note: "Data-driven insights",
    Icon: LuShieldCheck,
  },
  {
    title: "Save Time",
    note: "All tools in one place",
    Icon: LuClock3,
  },
  {
    title: "Trusted by Home Buyers",
    note: "Built for your goals",
    Icon: LuUsers,
  },
];

const INSIGHTS = [
  {
    id: "home-loan",
    tabLabel: "Home Loan",
    tabHint: "Plan your loan",
    Icon: LuHouse,
    iconTitle: "Home Loan — Expert Insights and Resources",
    title: "Get the Right Home Loan for Your Needs",
    description:
      "Explore loan options, interest rates and eligibility from top banks , all in one place.",
    points: [
      { title: "Compare Loan Offers", note: "Find the best interest rates", Icon: LuBuilding2 },
      { title: "Check Eligibility", note: "Know your loan amount", Icon: LuBadgeCheck },
      { title: "Plan Better", note: "Make confident decisions", Icon: LuSparkles },
    ],
    cta: "Explore Home Loan Options",
    href: "/home-loan-calculator",
  },
  {
    id: "emi-calculator",
    tabLabel: "EMI Calculator",
    tabHint: "Calculate easily",
    Icon: LuCalculator,
    iconTitle: "EMI Calculator — Expert Insights and Resources",
    title: "Master Your Mortgage with the EMI Calculator",
    description:
      "See monthly payments, prepayment impact, and compare loan offers with a full amortization view , all in one place.",
    points: [
      { title: "Estimate EMI Instantly", note: "Adjust tenure and rate", Icon: LuPercent },
      { title: "Compare Offers", note: "See what fits your budget", Icon: LuWallet },
      { title: "Plan Prepayments", note: "Reduce interest with clarity", Icon: LuChartLine },
    ],
    cta: "Open EMI Calculator",
    href: "/emi-calculator",
  },
  {
    id: "locate-score",
    tabLabel: "Locate Score",
    tabHint: "Find the best location",
    Icon: LuMapPin,
    iconTitle: "Locate Score — Expert Insights and Resources",
    title: "Discover Location Potential with LOCATE Score",
    description:
      "Assess growth potential, connectivity, and livability so you can invest in the right neighbourhood.",
    points: [
      { title: "Check Connectivity", note: "Transit and commute access", Icon: LuTrainFront },
      { title: "See Amenities", note: "Parks, schools, and daily needs", Icon: LuTrees },
      { title: "Track Growth", note: "Price trends and infrastructure", Icon: LuChartLine },
    ],
    cta: "Open Locate Score",
    href: "/locate-score",
  },
];

export default function NewInsight() {
  useDeferredStylesheet(() => import("./newinsight.css"));

  const [activeId, setActiveId] = useState(INSIGHTS[0].id);
  const activeInsight =
    INSIGHTS.find((insight) => insight.id === activeId) ?? INSIGHTS[0];

  return (
    <div className="expert-insights-wrapper">
      <section
        className="expert-insights-section"
        aria-labelledby="expert-insights-heading"
      >
        <div className="expert-insights-bg" aria-hidden="true">
          <img
            src="/static/banners/banner_expert.png"
            alt=""
            title="Plan your dream home with My Property Fact smart tools"
            width={1920}
            height={720}
            className="expert-insights-bg-image"
          />
        </div>
        <div className="expert-insights-inner">
          <p className="expert-insights-scribble" aria-hidden="true">
            Your Dream Home
            <br />
            Starts Here
          </p>
          <div className="expert-insights-copy">
            {/* <p className="expert-insights-kicker">
              <span className="expert-insights-kicker-badge">Smart Tools</span>
              <span className="expert-insights-kicker-rule" aria-hidden="true" />
              For a brighter tomorrow
            </p> */}
            <h2 id="expert-insights-heading" className="expert-insights-title">
              Plan Your Dream Home
              <br />
              with <em>Smart Tools</em>
            </h2>
            <p className="expert-insights-subtitle">
              Get accurate insights, compare options, and make confident real
              estate decisions , all in one place.
            </p>

            <ul className="expert-insights-highlights">
              {HIGHLIGHTS.map((item) => {
                const Icon = item.Icon;
                return (
                  <li key={item.title} className="expert-insights-highlight">
                    <span className="expert-insights-highlight-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      {item.note}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* <div className="expert-insights-actions">
              <a
                href="#expert-insights-tools"
                className="expert-insights-cta expert-insights-cta--primary"
                title="Explore smart property tools"
              >
                Explore Tools
                <LuArrowRight aria-hidden="true" />
              </a>
              <a
                href="https://www.youtube.com/@my.propertyfact/"
                className="expert-insights-watch"
                target="_blank"
                rel="noopener noreferrer"
                title="Watch how My Property Fact tools help"
              >
                <span className="expert-insights-watch-play" aria-hidden="true">
                  <LuPlay />
                </span>
                <span>
                  <strong>Watch How It Helps</strong>
                  <small>2 min video</small>
                </span>
              </a>
            </div> */}

            <p className="expert-insights-quote">
              <span aria-hidden="true" />
              “Smarter tools. Brighter homes.”
            </p>
          </div>

          <div className="expert-insights-tools" id="expert-insights-tools">
            <div
              className="expert-insights-tabs"
              role="tablist"
              aria-label="Expert tools"
            >
              {INSIGHTS.map((insight) => {
                const isActive = insight.id === activeId;
                const Icon = insight.Icon;
                return (
                  <button
                    key={insight.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`expert-insights-panel-${insight.id}`}
                    id={`expert-insights-tab-${insight.id}`}
                    className={`expert-insights-tab expert-insights-tab--${insight.id}${isActive ? " is-active" : ""}`}
                    onClick={() => setActiveId(insight.id)}
                  >
                    <span className="expert-insights-tab-icon" title={insight.iconTitle}>
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="expert-insights-tab-copy">
                      <span className="expert-insights-tab-label">{insight.tabLabel}</span>
                      <span className="expert-insights-tab-hint">{insight.tabHint}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="expert-insights-card expert-insights-detail"
              role="tabpanel"
              id={`expert-insights-panel-${activeInsight.id}`}
              aria-labelledby={`expert-insights-tab-${activeInsight.id}`}
            >
              <h3 className="expert-insights-detail-title">{activeInsight.title}</h3>
              <p className="expert-insights-detail-description">
                {activeInsight.description}
              </p>
              <ul className="expert-insights-points">
                {activeInsight.points.map((point) => {
                  const Icon = point.Icon;
                  return (
                    <li key={point.title}>
                      <span className="expert-insights-point-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <span>
                        <strong>{point.title}</strong>
                        {point.note}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={activeInsight.href}
                className="expert-insights-cta"
                title={activeInsight.cta}
              >
                {activeInsight.cta}
                <LuArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
