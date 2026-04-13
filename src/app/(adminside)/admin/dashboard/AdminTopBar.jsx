"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useAdminRole } from "../_contexts/AdminRoleContext";
import { useAdminTheme } from "../_contexts/AdminThemeContext";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/** All searchable admin pages / nav items */
const NAV_INDEX = [
  { label: "Dashboard", href: "/admin/dashboard", tags: "home overview stats" },
  { label: "Property Approvals", href: "/admin/dashboard/property-approvals", tags: "approve reject listing" },
  { label: "Manage Users", href: "/admin/dashboard/manage-users", tags: "users accounts roles admin superadmin" },
  { label: "Pending Admin Access", href: "/admin/dashboard/pending-admin-approvals", tags: "pending approval admin staff" },
  { label: "Website Traffic and Logs", href: "/admin/dashboard/super-tracking", tags: "tracking traffic audit superadmin logs analytics" },
  { label: "Manage Projects", href: "/admin/dashboard/manage-projects", tags: "projects properties listings add edit delete" },
  { label: "Builders", href: "/admin/dashboard/builder", tags: "builder developer company" },
  { label: "Project Types", href: "/admin/dashboard/project-types", tags: "type residential commercial plot" },
  { label: "Project Status", href: "/admin/dashboard/manage-project-status", tags: "status ready under construction new launch" },
  { label: "Amenities", href: "/admin/dashboard/project-amenity", tags: "amenity gym pool parking" },
  { label: "Manage Features", href: "/admin/dashboard/manage-features", tags: "features" },
  { label: "Nearby Benefits", href: "/admin/dashboard/location-benifits", tags: "nearby benefits location" },
  { label: "Manage Countries", href: "/admin/dashboard/manage-countries", tags: "country india" },
  { label: "Manage States", href: "/admin/dashboard/manage-states", tags: "state province" },
  { label: "Manage Cities", href: "/admin/dashboard/manage-cities", tags: "city location" },
  { label: "Manage Localities", href: "/admin/dashboard/manage-localities", tags: "locality area sector" },
  { label: "City Price Data", href: "/admin/dashboard/city-price-data", tags: "price rate city data" },
  { label: "Manage Banners", href: "/admin/dashboard/manage-banners", tags: "banner home page slider" },
  { label: "Manage Blogs", href: "/admin/dashboard/manage-blogs", tags: "blog article post" },
  { label: "Blog Categories", href: "/admin/dashboard/manage-categories", tags: "blog category" },
  { label: "Web Story", href: "/admin/dashboard/web-story", tags: "web story reel short" },
  { label: "Web Story Category", href: "/admin/dashboard/web-story-category", tags: "story category" },
  { label: "Insight Management", href: "/admin/dashboard/manage-insight-headers", tags: "insight header" },
  { label: "Insight Category", href: "/admin/dashboard/insight-category", tags: "insight category" },
  { label: "Top Developers", href: "/admin/dashboard/top-developers", tags: "top developer featured" },
  { label: "Manage Gallery", href: "/admin/dashboard/manage-gallery", tags: "gallery images photos" },
  { label: "Floor Plans", href: "/admin/dashboard/manage-floor-plans", tags: "floor plan layout" },
  { label: "Project About", href: "/admin/dashboard/manage-project-about", tags: "about description" },
  { label: "Project Walkthrough", href: "/admin/dashboard/manage-project-walkthrough", tags: "walkthrough video" },
  { label: "Manage FAQs", href: "/admin/dashboard/manage-faqs", tags: "faq question answer" },
  { label: "Manage Enquiries", href: "/admin/dashboard/enquiries", tags: "enquiry lead contact" },
  { label: "Manage Score Evaluation", href: "/admin/dashboard/manage-score-evalution", tags: "score rating evaluation" },
  { label: "Location Benefits", href: "/admin/dashboard/manage-location-benefits", tags: "location benefit nearby" },
  { label: "Budget Options", href: "/admin/dashboard/budget-options", tags: "budget price range" },
  { label: "Career Applications", href: "/admin/dashboard/manage-career-applications", tags: "career job application" },
  { label: "Settings", href: "/admin/dashboard/settings", tags: "settings config" },
  { label: "Support", href: "/admin/dashboard/support", tags: "support help" },
];

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="admin-search-highlight-mark">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function AdminTopBar() {
  const { displayName, roleLabel, loading } = useAdminRole();
  const { theme, toggleTheme } = useAdminTheme();
  const name = !loading && displayName ? displayName : loading ? "…" : "Administrator";
  const role = !loading && roleLabel ? roleLabel : "Staff";
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const results = query.trim().length > 0
    ? NAV_INDEX.filter((item) => {
      const q = query.trim().toLowerCase();
      return item.label.toLowerCase().includes(q) || item.tags.toLowerCase().includes(q);
    }).slice(0, 8)
    : [];

  const navigate = useCallback((href) => {
    setQuery("");
    setOpen(false);
    router.push(href);
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIdx]) navigate(results[activeIdx].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <header className="admin-app-topbar" aria-label="Top bar">
      {/* Global search */}
      <div className="admin-app-topbar__search-wrap" ref={wrapRef}>
        <div className="admin-app-topbar__search">
          <FontAwesomeIcon icon={faSearch} className="admin-app-topbar__search-icon" />
          <input
            ref={inputRef}
            type="search"
            className="admin-app-topbar__search-input"
            placeholder="Search pages, projects, amenities…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIdx(0);
            }}
            onFocus={() => query && setOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-label="Global admin search"
            aria-autocomplete="list"
          />
          {query && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {open && results.length > 0 && (
          <ul className="admin-search-dropdown" role="listbox" aria-label="Search results">
            {results.map((item, i) => (
              <li
                key={item.href}
                role="option"
                aria-selected={i === activeIdx}
                className={`admin-search-dropdown__item${i === activeIdx ? " admin-search-dropdown__item--active" : ""}`}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => navigate(item.href)}
              >
                <span className="admin-search-dropdown__icon" aria-hidden>→</span>
                <span className="admin-search-dropdown__label">{highlight(item.label, query.trim())}</span>
              </li>
            ))}
          </ul>
        )}
        {open && query.trim().length > 0 && results.length === 0 && (
          <div className="admin-search-dropdown admin-search-dropdown--empty">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

      <div className="admin-app-topbar__actions">
        <button
          type="button"
          className="admin-app-topbar__icon-btn admin-theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          <img
            src={
              theme === "dark"
                ? "/images/admin/sun-line.svg"
                : "/images/admin/moon-line.svg"
            }
            alt=""
            width={22}
            height={22}
            className="admin-theme-toggle-svg"
          />
        </button>
        <button
          type="button"
          className="admin-app-topbar__icon-btn admin-topbar-notify-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <img className="admin-topbar-aux-icon" src="/images/admin/notification.svg" alt="Notifications" style={{ width: "22px", height: "auto" }} />
        </button>
        <div className="admin-app-topbar__divider" aria-hidden />
        <div className="admin-app-topbar__user">
          <div className="admin-app-topbar__user-text">
            <span className="admin-app-topbar__user-name">{name}</span>
            <span className="admin-app-topbar__user-role">{role}</span>
          </div>
          <div className="admin-app-topbar__avatar" aria-hidden>
            {name && name !== "…" ? String(name).trim().charAt(0).toUpperCase() : "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
