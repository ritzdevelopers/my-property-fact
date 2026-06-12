"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form } from "react-bootstrap";

export function AdminSummaryFilterCards({
  filters,
  activeFilter,
  onFilterChange,
  counts = {},
  ariaLabel = "Filter content",
}) {
  return (
    <div
      className="mu-summary-cards admin-horizontal-scroll"
      role="group"
      aria-label={ariaLabel}
    >
      {filters.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mu-summary-card mu-summary-card--${item.tone || "neutral"}${
            activeFilter === item.id ? " is-active" : ""
          }`}
          onClick={() => onFilterChange(item.id)}
          aria-pressed={activeFilter === item.id}
          title={`Show ${item.label.toLowerCase()}`}
        >
          <span className="mu-summary-card__icon" aria-hidden>
            <FontAwesomeIcon icon={item.icon} />
          </span>
          <span className="mu-summary-card__count">{counts[item.id] ?? 0}</span>
          <span className="mu-summary-card__label">{item.shortLabel || item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function AdminFilterCount({
  filteredCount,
  totalCount,
  activeFilter,
  activeFilterLabel,
  onClear,
}) {
  return (
    <span className="manage-users-count">
      Showing {filteredCount} of {totalCount}
      {activeFilter && activeFilter !== "all" && activeFilterLabel ? (
        <>
          {" "}
          ·{" "}
          <button type="button" className="mu-clear-filter-btn" onClick={onClear}>
            Clear {activeFilterLabel.toLowerCase()} filter
          </button>
        </>
      ) : null}
    </span>
  );
}

export function ContentStatusPill({ variant, children, icon }) {
  return (
    <span className={`mu-status-pill mu-status-pill--${variant}`}>
      {icon ? (
        <FontAwesomeIcon icon={icon} className="mu-status-pill__icon" aria-hidden />
      ) : variant === "active" ? (
        <span className="mu-status-pill__dot" aria-hidden />
      ) : null}
      {children}
    </span>
  );
}

export function AdminStatusToggle({
  checked,
  disabled = false,
  onChange,
  id,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}) {
  return (
    <div className="admin-status-toggle">
      <Form.Check
        type="switch"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        label={checked ? activeLabel : inactiveLabel}
      />
    </div>
  );
}
