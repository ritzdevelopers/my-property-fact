"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { useDeferredStylesheet } from "@/lib/useDeferredStylesheet";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--expert-plus-jakarta",
});

const INSIGHTS = [
  {
    id: "home-loan",
    tabLabel: "Home Loan",
    iconTitle: "Home Loan — Expert Insights and Resources",
    category: "Financial Tool",
    readTime: "4 min read",
    title: "Get the Right Home Loan for Your Needs",
    description:
      "Explore loan options, interest rates, and eligibility from top banks in one place so you can choose a plan that fits your budget and timeline.",
    href: "/home-loan-calculator",
  },
  {
    id: "emi-calculator",
    tabLabel: "EMI Calculator",
    iconTitle: "EMI Calculator — Expert Insights and Resources",
    category: "Financial Tool",
    readTime: "5 min read",
    title: "Master Your Mortgage with the EMI Calculator",
    description:
      "Take the guesswork out of home financing. Our advanced EMI calculator provides a complete amortization schedule, helps you understand the impact of prepayments, and allows you to compare different loan offers side-by-side.",
    href: "/emi-calculator",
  },
  {
    id: "locate-score",
    tabLabel: "Locate Score",
    iconTitle: "Locate Score — Expert Insights and Resources",
    category: "Location insight",
    readTime: "4 min read",
    title: "Discover Location Potential with LOCATE Score",
    description:
      "Assess growth potential, connectivity, and livability so you can invest in the right neighbourhood with a clearer picture of commute, amenities, and future value.",
    href: "/locate-score",
  },
];

export default function NewInsight() {
  useDeferredStylesheet(() => import("./newinsight.css"));

  const [activeId, setActiveId] = useState("emi-calculator");
  const activeInsight =
    INSIGHTS.find((insight) => insight.id === activeId) ?? INSIGHTS[1];

  return (
    <div className={`expert-insights-wrapper ${plusJakarta.variable}`}>
      <section
        className="expert-insights-section"
        aria-labelledby="expert-insights-heading"
      >
        <div className="expert-insights-bg" aria-hidden="true">
          <img
            src="/static/home-meta-data/bg%20image.png"
            alt=""
            title="Expert Insights and Resources"
            width={1920}
            height={720}
            className="expert-insights-bg-image"
          />
        </div>
        <div className="expert-insights-inner">
          <h2 id="expert-insights-heading" className="expert-insights-title">
            Expert Insights & Resources
          </h2>
          <p className="expert-insights-subtitle">
            Expert resources to help you navigate your next big move with
            confidence.
          </p>

          <div
            className="expert-insights-tabs"
            role="tablist"
            aria-label="Expert tools"
          >
            {INSIGHTS.map((insight) => {
              const isActive = insight.id === activeId;
              return (
                <button
                  key={insight.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`expert-insights-panel-${insight.id}`}
                  id={`expert-insights-tab-${insight.id}`}
                  className={`expert-insights-tab${isActive ? " is-active" : ""}`}
                  title={insight.iconTitle}
                  onClick={() => setActiveId(insight.id)}
                >
                  {insight.tabLabel}
                </button>
              );
            })}
          </div>

          <div
            className="expert-insights-article"
            role="tabpanel"
            id={`expert-insights-panel-${activeInsight.id}`}
            aria-labelledby={`expert-insights-tab-${activeInsight.id}`}
          >
            <p className="expert-insights-article-meta">
              <span className="expert-insights-article-chip">
                <svg
                  className="expert-insights-article-chip-icon"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 0c.22 2.18 1.82 3.78 4 4-2.18.22-3.78 1.82-4 4-.22-2.18-1.82-3.78-4-4 2.18-.22 3.78-1.82 4-4Z" />
                </svg>
                {activeInsight.category}
              </span>
              <span className="expert-insights-article-readtime">
                {activeInsight.readTime}
              </span>
            </p>
            <h3 className="expert-insights-article-title">
              <Link href={activeInsight.href} title={activeInsight.title}>
                {activeInsight.title}
              </Link>
            </h3>
            <p className="expert-insights-article-copy">
              {activeInsight.description}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
