"use client";

import { cn } from "@/lib/utils";

/**
 * Single admin loader — arc spinner (not Bootstrap / not dot-pulse).
 * Use this everywhere in the admin panel so only one loader style appears.
 */
export function AdminLoader({
  label = "Loading…",
  size = "md",
  fullPage = false,
  className,
}) {
  const sizeClass =
    size === "sm"
      ? "mpf-loader--sm"
      : size === "lg"
        ? "mpf-loader--lg"
        : "mpf-loader--md";

  const body = (
    <div
      className={cn("mpf-loader", sizeClass, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <svg className="mpf-loader__ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="mpf-loader__track" cx="24" cy="24" r="18" fill="none" />
        <circle className="mpf-loader__arc" cx="24" cy="24" r="18" fill="none" />
      </svg>
      {label ? <span className="mpf-loader__label">{label}</span> : null}
    </div>
  );

  if (fullPage) {
    return <div className="mpf-loader-page">{body}</div>;
  }

  return body;
}

export default AdminLoader;
