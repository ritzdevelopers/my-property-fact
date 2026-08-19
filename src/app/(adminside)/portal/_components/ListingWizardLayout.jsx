"use client";

import Link from "next/link";
import { ArrowLeft, Headphones } from "lucide-react";
import { getUserDisplayName, getUserRoleLabel } from "../_utils/userDisplay";
import PortalUserAvatar from "./PortalUserAvatar";
import "./ListingWizardLayout.css";

const STEP_TIPS = {
  1: {
    title: "Choose the right listing type",
    tips: [
      "Select Sell or Rent based on your goal.",
      "Pick Residential or Commercial first, then the property sub-type.",
      "Accurate basic details help buyers find your listing faster.",
    ],
  },
  2: {
    title: "Why we need an accurate location?",
    tips: [
      "A precise city and locality ensures genuine buyer inquiries.",
      "Add the project or society name if available.",
      "Pincode helps match local search filters.",
    ],
  },
  3: {
    title: "Complete your property profile",
    tips: [
      "Add area details — at least one area type is recommended.",
      "Room counts and floor details improve search visibility.",
      "Expected price and price per sq.ft. attract serious buyers.",
    ],
  },
  4: {
    title: "Make your pictures perfect!",
    tips: [
      "Add 4+ property photos to increase responses.",
      "Capture photos in landscape mode during daylight.",
      "Optional: add a YouTube video link for virtual tours.",
    ],
  },
  5: {
    title: "Amenities & finishing touches",
    tips: [
      "Select amenities that apply to your property.",
      "Add nearby landmarks with distances when possible.",
      "Verify contact details so buyers can reach you.",
    ],
  },
};

function getStepSummary(stepId, formData) {
  if (!formData) return null;
  switch (stepId) {
    case 1:
      if (formData.subType && formData.transaction) {
        return `${formData.subType} for ${formData.transaction}`;
      }
      return null;
    case 2:
      if (formData.projectName || formData.locality) {
        const parts = [formData.projectName, formData.locality, formData.city].filter(Boolean);
        return parts.join(", ").slice(0, 40) + (parts.join(", ").length > 40 ? "…" : "");
      }
      return null;
    case 3:
      if (formData.bedrooms) return `${formData.bedrooms} bedrooms`;
      if (formData.totalPrice) return `₹${Number(formData.totalPrice).toLocaleString("en-IN")}`;
      return null;
    default:
      return null;
  }
}

export function computePropertyScore(formData) {
  if (!formData) return 0;
  const checks = [
    formData.listingType,
    formData.transaction,
    formData.subType,
    formData.description?.length >= 50,
    formData.projectName,
    formData.address,
    formData.city,
    formData.totalPrice || formData.pricePerSqFt,
    formData.bedrooms || formData.listingType === "Commercial",
    formData.imagePreviews?.length > 0,
    formData.imagePreviews?.length >= 4,
    formData.amenityIds?.length > 0,
    formData.contactName && formData.contactPhone,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.min(100, Math.round((filled / checks.length) * 100));
}

export default function ListingWizardLayout({
  steps,
  currentStep,
  formData,
  userName,
  userData,
  isEditMode,
  onStepClick,
  onBack,
  children,
  footer,
}) {
  const score = computePropertyScore(formData);
  const tips = STEP_TIPS[currentStep] || STEP_TIPS[1];
  const displayName = getUserDisplayName(userData || { fullName: userName });
  const roleLabel = getUserRoleLabel(userData || {});
  const progressPct = Math.round((currentStep / steps.length) * 100);

  return (
    <div className="lw-shell">
      <header className="lw-header">
        <div className="lw-header__brand">
          <Link href="/portal/dashboard/listings" className="lw-header__back" title="Back to listings">
            <ArrowLeft size={16} />
          </Link>
          <img src="/logo.webp" alt="My Property Fact" className="lw-header__logo" />
          <span className="lw-header__title">{isEditMode ? "Edit Property" : "Add Property"}</span>
        </div>
        <div className="lw-header__user">
          <PortalUserAvatar userData={userData || { fullName: userName }} size="sm" />
          <div className="lw-header__user-info">
            <span className="lw-header__user-name">{displayName}</span>
            <span className="lw-header__user-role">{roleLabel}</span>
          </div>
        </div>
        <div className="lw-header__actions">
          <span className="lw-header__help" title="Support">
            <Headphones className="h-5 w-5" />
          </span>
        </div>
      </header>

      <div className="lw-mobile-progress" aria-hidden>
        <div className="lw-mobile-progress__bar" style={{ width: `${progressPct}%` }} />
        <span className="lw-mobile-progress__label">
          Step {currentStep} of {steps.length}
        </span>
      </div>

      <div className="lw-body">
        <aside className="lw-sidebar">
          <nav className="lw-stepper" aria-label="Listing steps">
            {steps.map((step) => {
              const isDone = currentStep > step.id;
              const isActive = currentStep === step.id;
              const summary = isDone ? getStepSummary(step.id, formData) : null;
              return (
                <div
                  key={step.id}
                  className={`lw-step ${isDone ? "lw-step--done" : ""} ${isActive ? "lw-step--active" : ""}`}
                >
                  <div className="lw-step__marker">
                    {isDone ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className="lw-step__dot" />
                    )}
                  </div>
                  <div className="lw-step__content">
                    <p className="lw-step__title">{step.title}</p>
                    {summary && <p className="lw-step__summary">{summary}</p>}
                    {isDone && onStepClick && (
                      <button type="button" className="lw-step__edit" onClick={() => onStepClick(step.id)}>
                        Edit
                      </button>
                    )}
                    {isActive && !summary && <p className="lw-step__sub">Step {step.id}</p>}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="lw-score-card">
            <div className="lw-score-ring" style={{ "--score": score }}>
              <span className="lw-score-ring__value">{score}%</span>
            </div>
            <div>
              <p className="lw-score-card__title">Property Score</p>
              <p className="lw-score-card__sub">Better your property score, greater your visibility.</p>
            </div>
          </div>
        </aside>

        <main className="lw-main">
          {currentStep > 1 && onBack && (
            <button type="button" className="lw-back" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <div className="lw-main__head">
            <h1 className="lw-main__title">
              {currentStep === 1 && !isEditMode
                ? `Hi ${displayName}, fill out basic details`
                : steps[currentStep - 1]?.heading || steps[currentStep - 1]?.title}
            </h1>
            {steps[currentStep - 1]?.description && (
              <p className="lw-main__sub">{steps[currentStep - 1].description}</p>
            )}
          </div>

          <div className="lw-form-card">{children}</div>

          <div className="lw-tips lw-tips--mobile">
            <div className="lw-tips__card">
              <h3 className="lw-tips__title">{tips.title}</h3>
              <ul className="lw-tips__list">
                {tips.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {footer && <div className="lw-footer">{footer}</div>}
        </main>

        <aside className="lw-tips">
          <div className="lw-tips__card">
            <h3 className="lw-tips__title">{tips.title}</h3>
            <ul className="lw-tips__list">
              {tips.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="lw-help-card">
            <Headphones className="h-5 w-5" />
            <div>
              <p className="lw-help-card__title">Need help?</p>
              <p className="lw-help-card__text">
                Email us at{" "}
                <a href="mailto:support@mypropertyfact.com">support@mypropertyfact.com</a>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
