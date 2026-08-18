"use client";

import "./LeadFormLockedSection.css";

/**
 * Wraps lead form fields that should stay disabled until OTP verification.
 * Phone + LeadOtpFields should remain outside this wrapper.
 */
export default function LeadFormLockedSection({
  locked,
  children,
  className = "",
  showNotice = true,
}) {
  const rootClass = [
    "lead-form-locked-section",
    locked ? "lead-form-locked-section--locked" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <fieldset disabled={locked} className={rootClass} aria-disabled={locked}>
      {locked && showNotice ? (
        <p className="lead-form-locked-section__notice">
          Verify your mobile number with OTP to fill the rest of this form.
        </p>
      ) : null}
      {children}
    </fieldset>
  );
}
