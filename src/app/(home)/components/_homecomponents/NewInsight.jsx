"use client";

import { useState } from "react";
import Link from "next/link";
import { PiCalculatorLight, PiHouseLine } from "react-icons/pi";
import { GrScorecard } from "react-icons/gr";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";

const INSIGHTS = [
  {
    id: "emi-calculator",
    tabLabel: "EMI Calculator",
    Icon: PiCalculatorLight,
    iconTitle: "EMI Calculator — Expert Insights and Resources",
    badge: "Financial Tool",
    readTime: "5 min read",
    title: "Master Your Mortgage with the EMI Calculator",
    description:
      "Take the guesswork out of home financing. Our advanced EMI calculator provides a complete amortization schedule, helps you understand the impact of prepayments, and allows you to compare different loan offers side-by-side.",
    cta: "Open EMI Calculator",
    href: "/emi-calculator",
  },
  {
    id: "home-loan-calculator",
    tabLabel: "Home Loan Calculator",
    Icon: PiHouseLine,
    iconTitle: "Home Loan Calculator — Expert Insights and Resources",
    badge: "Financial Tool",
    readTime: "3 min read",
    title: "Check Your Home Loan Eligibility Instantly",
    description:
      "Find out how much home loan you may be eligible for based on your income, existing EMIs, tenure, and interest rate. Get a clear estimate of EMI, interest payable, and total cost before you apply.",
    cta: "Open Home Loan Calculator",
    href: "/home-loan-calculator",
  },
  {
    id: "locate-score",
    tabLabel: "Locate Score",
    Icon: GrScorecard,
    iconTitle: "Locate Score — Expert Insights and Resources",
    badge: "Location Tool",
    readTime: "5 min read",
    title: "Discover Location Potential with LOCATE Score",
    description:
      "Assess location quality, growth potential, and investment risk. Check price trends, connectivity, amenities, and infrastructure to guide smarter property investments with clarity.",
    cta: "Open Locate Score",
    href: "/locate-score",
  },
];

const SECTION_SUBTITLE =
  "Expert resources to help you navigate your next big move with confidence.";

export default function NewInsight() {
  useDeferredStylesheet(() => import("./newinsight.css"));

  const [activeId, setActiveId] = useState(INSIGHTS[0].id);
  const activeInsight =
    INSIGHTS.find((insight) => insight.id === activeId) ?? INSIGHTS[0];

  return (
    <div className="expert-insights-wrapper">
    <section className="expert-insights-section" aria-labelledby="expert-insights-heading">
      <div className="expert-insights-bg" aria-hidden="true">
        <img
          src="/static/home-meta-data/expert_insights.png"
          alt="Decorative background artwork for Expert Insights and Resources section"
          title="Decorative background artwork for Expert Insights and Resources section"
          className="expert-insights-bg-image"
        />
      </div>

      <div className="expert-insights-inner">
        <header className="expert-insights-header">
          <h2
            id="expert-insights-heading"
            className="expert-insights-title"
          >
            Expert Insights &amp; Resources
          </h2>
          <p className="expert-insights-subtitle">
            {SECTION_SUBTITLE}
          </p>
        </header>

        <div className="expert-insights-body">
          <div className="expert-insights-card">
            <div className="expert-insights-tabs" role="tablist" aria-label="Expert tools">
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
                    <span className="expert-insights-tab-label">
                      {insight.tabLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="expert-insights-card-image">
              <img
                src="/static/home-meta-data/expert.png"
                alt="Luxury home featured in Expert Insights and Resources"
                title="Luxury home featured in Expert Insights and Resources"
                width={297}
                height={154}
                className="expert-insights-feature-image"
              />
            </div>

            <p className="expert-insights-card-caption">
              {SECTION_SUBTITLE}
            </p>
          </div>

          <div
            className="expert-insights-detail"
            role="tabpanel"
            id={`expert-insights-panel-${activeInsight.id}`}
            aria-labelledby={`expert-insights-tab-${activeInsight.id}`}
          >
            <div className="expert-insights-meta">
              <span className="expert-insights-badge">
                {activeInsight.badge}
              </span>
              <span className="expert-insights-read-time">
                {activeInsight.readTime}
              </span>
            </div>

            <h3 className="expert-insights-detail-title">
              {activeInsight.title}
            </h3>

            <p className="expert-insights-detail-description">
              {activeInsight.description}
            </p>

            <Link
              href={activeInsight.href}
              className="expert-insights-cta"
              title={activeInsight.cta}
            >
              {activeInsight.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
