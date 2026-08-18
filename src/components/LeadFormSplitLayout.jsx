"use client";

import { MPF_LOGO_ALT, MPF_LOGO_SRC } from "@/lib/leadFormImages";
import "./leadFormSplitLayout.css";

/**
 * Shared split hero + form shell for all MPF lead forms.
 * Image left (MPF banner or project photo), compact form panel right — fits one viewport.
 */
export default function LeadFormSplitLayout({
  imageSrc,
  imageAlt,
  badge = null,
  eyebrow = null,
  title,
  subtitle = null,
  children,
  variant = "modal",
  className = "",
  onClose = null,
  closeLabel = "Close enquiry form",
  mediaOverlay = true,
}) {
  const rootClass = [
    "lead-form-split",
    variant ? `lead-form-split--${variant}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      {typeof onClose === "function" ? (
        <button
          type="button"
          className="lead-form-split__close"
          aria-label={closeLabel}
          onClick={onClose}
        />
      ) : null}

      <div className="lead-form-split__media">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="lead-form-split__media-img"
          loading="lazy"
          decoding="async"
        />
        {mediaOverlay ? <div className="lead-form-split__media-shade" aria-hidden /> : null}
        {badge ? <span className="lead-form-split__badge">{badge}</span> : null}
        <div className="lead-form-split__brand">
          <img
            src={MPF_LOGO_SRC}
            alt={MPF_LOGO_ALT}
            className="lead-form-split__brand-logo"
            width={132}
            height={36}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      <div className="lead-form-split__panel">
        <div className="lead-form-split__panel-logo">
          <img
            src={MPF_LOGO_SRC}
            alt={MPF_LOGO_ALT}
            className="lead-form-split__panel-logo-img"
            width={120}
            height={32}
            loading="eager"
            decoding="async"
          />
        </div>
        {eyebrow ? <p className="lead-form-split__eyebrow">{eyebrow}</p> : null}
        <h2 className="lead-form-split__title">{title}</h2>
        {subtitle ? <p className="lead-form-split__subtitle">{subtitle}</p> : null}
        <div className="lead-form-split__body">{children}</div>
      </div>
    </div>
  );
}
