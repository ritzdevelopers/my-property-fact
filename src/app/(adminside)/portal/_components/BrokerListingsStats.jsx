"use client";

import { Building2, CheckCircle2, Clock, FileEdit } from "lucide-react";
import "./PortalUI.css";

const STATS = [
  { key: "total", label: "Total Listings", icon: Building2, tone: "emerald", filter: "" },
  { key: "active", label: "Active Listings", icon: CheckCircle2, tone: "green", filter: "APPROVED" },
  { key: "pending", label: "Pending Approval", icon: Clock, tone: "amber", filter: "PENDING" },
  { key: "draft", label: "Draft", icon: FileEdit, tone: "slate", filter: "DRAFT" },
];

export default function BrokerListingsStats({
  loading,
  total,
  active,
  pending,
  draft,
  selected = "",
  onSelect,
}) {
  const values = { total, active, pending, draft };

  if (loading) {
    return (
      <div className="brk-stat-grid" aria-busy="true">
        {STATS.map((stat) => (
          <div key={stat.key} className="brk-stat brk-stat--skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="brk-stat-grid">
      {STATS.map(({ key, label, icon: Icon, tone, filter }) => {
        const clickable = typeof onSelect === "function";
        const className = [
          "brk-stat",
          `brk-stat--${tone}`,
          clickable ? "is-clickable" : "",
          selected === filter ? "is-selected" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const body = (
          <>
            <span className={`brk-stat__icon brk-stat__icon--${tone}`}>
              <Icon size={18} />
            </span>
            <span className="brk-stat__body">
              <span className="brk-stat__label">{label}</span>
              <span className="brk-stat__value">{Number(values[key] || 0).toLocaleString()}</span>
            </span>
          </>
        );

        if (clickable) {
          return (
            <button
              key={key}
              type="button"
              className={className}
              onClick={() => onSelect(filter)}
            >
              {body}
            </button>
          );
        }

        return (
          <article key={key} className={className}>
            {body}
          </article>
        );
      })}
    </div>
  );
}
