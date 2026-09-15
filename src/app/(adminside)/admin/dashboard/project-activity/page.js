"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import { useAdminConfirm } from "../../_contexts/AdminConfirmContext";
import { toast } from "../../_lib/adminToast";
import "../super-tracking/super-tracking.css";
import "./project-activity.css";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toDateInputValue(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayIso() {
  return toDateInputValue(new Date());
}

function addDaysIso(iso, days) {
  const [y, m, d] = String(iso || todayIso()).split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  return toDateInputValue(dt);
}

function formatLongDate(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y || !m || !d) return iso || "";
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function relativeLabel(iso) {
  const today = todayIso();
  if (iso === today) return "Today";
  if (iso === addDaysIso(today, -1)) return "Yesterday";
  if (iso === addDaysIso(today, 1)) return "Tomorrow";
  if (iso === addDaysIso(today, 2)) return "Day After Tomorrow";
  return "Custom Date";
}

async function adminFetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...(options.headers || {}) },
    credentials: "include",
    ...options,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data;
}

function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  return Number(n).toLocaleString("en-IN");
}

function initials(name, email) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

function statusClass(key) {
  const k = String(key || "").toUpperCase();
  if (k === "ACTIVE") return "ok";
  if (k === "PENDING") return "warn";
  if (k === "REJECTED") return "danger";
  if (k === "DRAFT" || k === "UNPUBLISHED") return "muted";
  if (k === "SOLD") return "gold";
  return "muted";
}

function isLocalUiUrl(url) {
  if (!url) return true;
  const u = String(url).toLowerCase();
  return u.includes("localhost") || u.includes("127.0.0.1");
}

function publicSiteOrigin() {
  const raw = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_UI_URL : "";
  const trimmed = raw && String(raw).trim() ? String(raw).trim().replace(/\/?$/, "") : "";
  if (!trimmed || isLocalUiUrl(trimmed)) return "https://mypropertyfact.in";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function publicHref(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${publicSiteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

const EMPTY_FILTERS = {
  projectName: "",
  userName: "",
  email: "",
  projectId: "",
  listingType: "ALL",
  status: "ALL",
  developer: "",
  location: "",
  userRole: "ALL",
  dateFrom: "",
  dateTo: "",
};

export default function ProjectActivityPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const { confirm } = useAdminConfirm();
  const base = useMemo(() => getPublicApiBase(), []);

  const [date, setDate] = useState(todayIso);
  const [customOpen, setCustomOpen] = useState(false);
  const [view, setView] = useState("table");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(EMPTY_FILTERS);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [report, setReport] = useState(null);
  const [options, setOptions] = useState({ developers: [], locations: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [menuId, setMenuId] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 320);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 320);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    setPage(0);
  }, [date, debouncedQuery, debouncedFilters, pageSize]);

  const loadOptions = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    try {
      const data = await adminFetchJson(`${base}admin/super/project-listings/filter-options`);
      setOptions({
        developers: Array.isArray(data?.developers) ? data.developers : [],
        locations: Array.isArray(data?.locations) ? data.locations : [],
      });
    } catch {
      setOptions({ developers: [], locations: [] });
    }
  }, [base, isSuperAdmin]);

  const load = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      params.set("date", date);
      params.set("page", String(page));
      params.set("size", String(pageSize));
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      Object.entries(debouncedFilters).forEach(([key, value]) => {
        if (value && value !== "ALL") params.set(key, value);
      });
      const data = await adminFetchJson(`${base}admin/super/project-listings?${params.toString()}`);
      setReport(data);
    } catch (e) {
      setErr(e?.message || "Failed to load project listings");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [base, date, debouncedQuery, debouncedFilters, isSuperAdmin, page, pageSize]);

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    void loadOptions();
  }, [loadOptions, isSuperAdmin, roleLoading]);

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    void load();
  }, [load, isSuperAdmin, roleLoading]);

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuId(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const openDetails = useCallback(
    async (row) => {
      if (!row?.source || row.id == null) return;
      setDrawerLoading(true);
      setMenuId(null);
      try {
        const data = await adminFetchJson(
          `${base}admin/super/project-listings/${encodeURIComponent(row.source)}/${row.id}`,
        );
        setDrawer(data);
      } catch (e) {
        toast.error(e?.message || "Could not load project details");
      } finally {
        setDrawerLoading(false);
      }
    },
    [base],
  );

  const handleDelete = useCallback(
    async (row) => {
      setMenuId(null);
      const ok = await confirm({
        title: "Delete this listing?",
        description: `${row.projectName || "This listing"} will be permanently removed.`,
        confirmText: "Delete",
        variant: "destructive",
      });
      if (!ok) return;
      try {
        await adminFetchJson(
          `${base}admin/super/project-listings/${encodeURIComponent(row.source)}/${row.id}`,
          { method: "DELETE" },
        );
        toast.success("Listing deleted");
        if (drawer?.id === row.id && drawer?.source === row.source) setDrawer(null);
        void load();
      } catch (e) {
        toast.error(e?.message || "Could not delete listing");
      }
    },
    [base, confirm, drawer, load],
  );

  const copyId = useCallback(async (row) => {
    setMenuId(null);
    try {
      await navigator.clipboard.writeText(String(row.displayId || row.id || ""));
      toast.success("Project ID copied");
    } catch {
      toast.error("Could not copy ID");
    }
  }, []);

  if (roleLoading) {
    return <div className="super-tracking__muted">Checking access…</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="super-tracking">
        <h1 className="super-tracking__title">Project listings</h1>
        <p className="super-tracking__note">This page is available to Super Admin only.</p>
      </div>
    );
  }

  const summary = report?.summary || {};
  const rows = Array.isArray(report?.content) ? report.content : [];
  const total = Number(report?.totalElements || 0);
  const totalPages = Math.max(1, Number(report?.totalPages || 1));
  const safePage = Math.min(page, totalPages - 1);
  const headingDate = formatLongDate(date);
  const headingRelative = report?.relativeLabel || relativeLabel(date);
  const rangeActive = Boolean(filters.dateFrom || filters.dateTo);
  const today = todayIso();
  const quickDates = [
    { id: addDaysIso(today, -1), label: "Yesterday" },
    { id: today, label: "Today" },
    { id: addDaysIso(today, 1), label: "Tomorrow" },
    { id: addDaysIso(today, 2), label: "Day After Tomorrow" },
  ];

  return (
    <div className="super-tracking project-activity">
      <p className="super-tracking__kicker">Super Admin · Listings</p>
      <h1 className="super-tracking__title">Project listings &amp; activity</h1>
      <p className="super-tracking__note">
        Chronological view of every website project and portal / broker listing created in MPF,
        using the listing timestamp stored on the server.
      </p>

      <div className="pa-datebar">
        <button
          type="button"
          className="super-tracking__btn"
          onClick={() => {
            setCustomOpen(false);
            setDate((current) => addDaysIso(current, -1));
          }}
        >
          ← Previous Day
        </button>
        <div className="pa-datebar__current">
          <div className="pa-datebar__relative">{headingRelative}</div>
          <div className="pa-datebar__date">{headingDate}</div>
          <div className="pa-datebar__count">
            {loading ? "Loading…" : `${formatCount(total)} ${total === 1 ? "Project Listed" : "Projects Listed"}`}
          </div>
        </div>
        <button
          type="button"
          className="super-tracking__btn"
          onClick={() => {
            setCustomOpen(false);
            setDate((current) => addDaysIso(current, 1));
          }}
        >
          Next Day →
        </button>
      </div>

      <div className="pa-quick">
        {quickDates.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`pa-chip${date === item.id && !customOpen ? " pa-chip--active" : ""}`}
            onClick={() => {
              setCustomOpen(false);
              setDate(item.id);
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className={`pa-chip${customOpen || relativeLabel(date) === "Custom Date" ? " pa-chip--active" : ""}`}
          onClick={() => setCustomOpen(true)}
        >
          Custom
        </button>
        {customOpen ? (
          <input
            type="date"
            className="pa-date-input"
            value={date}
            onChange={(e) => {
              if (e.target.value) setDate(e.target.value);
            }}
          />
        ) : null}
      </div>

      {rangeActive ? (
        <div className="pa-range-note">
          Date range filter is active ({filters.dateFrom || "start"} → {filters.dateTo || "end"}).
          Day navigation still sets the default day when the range is cleared.
        </div>
      ) : null}

      {err ? <div className="super-tracking__err">{err}</div> : null}

      <div className="super-tracking__metrics pa-metrics">
        {[
          { label: "Total Listings", value: summary.totalListings },
          { label: "Normal Projects", value: summary.normalProjects },
          { label: "Portal/Broker", value: summary.portalBrokerProjects },
          { label: "Active", value: summary.active },
          { label: "Pending", value: summary.pending },
          { label: "Rejected", value: summary.rejected },
        ].map((card) => (
          <div key={card.label} className="super-tracking__metric">
            <div className="super-tracking__metric-label">{card.label}</div>
            <div className="super-tracking__metric-value">{loading ? "—" : formatCount(card.value)}</div>
          </div>
        ))}
      </div>

      <div className="pa-toolbar">
        <input
          type="search"
          className="pa-search"
          placeholder="Search project, user, email, or project ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="pa-toolbar__right">
          <div className="super-tracking__tabs" role="tablist" aria-label="View">
            {[
              { id: "table", label: "Table" },
              { id: "timeline", label: "Timeline" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={view === tab.id}
                className={`super-tracking__tab${view === tab.id ? " super-tracking__tab--active" : ""}`}
                onClick={() => setView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`super-tracking__btn${filtersOpen ? " pa-btn-active" : ""}`}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            Filters
          </button>
          <button type="button" className="super-tracking__btn" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {filtersOpen ? (
        <div className="super-tracking__panel pa-filters">
          <div className="super-tracking__panel-head">Search &amp; filters</div>
          <div className="pa-filters__grid">
            <label>
              Project name
              <input
                value={filters.projectName}
                onChange={(e) => setFilters((f) => ({ ...f, projectName: e.target.value }))}
                placeholder="ATS Destinaire"
              />
            </label>
            <label>
              Listed by
              <input
                value={filters.userName}
                onChange={(e) => setFilters((f) => ({ ...f, userName: e.target.value }))}
                placeholder="User name"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={filters.email}
                onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
                placeholder="user@email.com"
              />
            </label>
            <label>
              Project ID
              <input
                value={filters.projectId}
                onChange={(e) => setFilters((f) => ({ ...f, projectId: e.target.value }))}
                placeholder="ID or UID"
              />
            </label>
            <label>
              Project type
              <select
                value={filters.listingType}
                onChange={(e) => setFilters((f) => ({ ...f, listingType: e.target.value }))}
              >
                <option value="ALL">All</option>
                <option value="NORMAL">Normal</option>
                <option value="PORTAL">Portal/Broker</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="DRAFT">Draft</option>
                <option value="REJECTED">Rejected</option>
                <option value="UNPUBLISHED">Unpublished</option>
                <option value="SOLD">Sold</option>
              </select>
            </label>
            <label>
              Developer
              <input
                list="pa-developers"
                value={filters.developer}
                onChange={(e) => setFilters((f) => ({ ...f, developer: e.target.value }))}
                placeholder="All developers"
              />
              <datalist id="pa-developers">
                {options.developers.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
            <label>
              Location
              <input
                list="pa-locations"
                value={filters.location}
                onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                placeholder="City or locality"
              />
              <datalist id="pa-locations">
                {options.locations.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
            <label>
              User role
              <select
                value={filters.userRole}
                onChange={(e) => setFilters((f) => ({ ...f, userRole: e.target.value }))}
              >
                <option value="ALL">All</option>
                <option value="SUPERADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="BROKER">Broker</option>
                <option value="OWNER">Owner</option>
                <option value="USER">User</option>
              </select>
            </label>
            <label>
              Date from
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              />
            </label>
            <label>
              Date to
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              />
            </label>
          </div>
          <div className="pa-filters__actions">
            <button
              type="button"
              className="super-tracking__btn"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setQuery("");
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : null}

      <div className="super-tracking__panel">
        <div className="super-tracking__panel-head">
          {view === "timeline" ? "Timeline view" : "Listing table"}
          <span className="pa-count">{loading ? "" : `${formatCount(total)} matching`}</span>
        </div>

        {loading && !rows.length ? (
          <div className="pa-skeleton" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pa-skeleton__row" />
            ))}
          </div>
        ) : !rows.length ? (
          <div className="pa-empty">
            <div className="pa-empty__title">No project listings found for this date.</div>
            <p>Try another day, clear filters, or widen the date range.</p>
          </div>
        ) : view === "timeline" ? (
          <ol className="pa-timeline">
            {rows.map((row) => (
              <li key={`${row.source}-${row.id}`}>
                <button type="button" className="pa-timeline__item" onClick={() => void openDetails(row)}>
                  <div className="pa-timeline__time">{row.listedTime || "—"}</div>
                  <div className="pa-timeline__body">
                    <div className="pa-user">
                      <span className="pa-avatar" aria-hidden>
                        {initials(row.listedBy, row.userEmail)}
                      </span>
                      <span>{row.listedBy || "Unknown"}</span>
                    </div>
                    <div className="pa-timeline__action">
                      Added <strong>{row.projectName || "Untitled"}</strong>
                    </div>
                    <span className={`pa-type pa-type--${row.source === "PROJECT" ? "normal" : "portal"}`}>
                      {row.listingTypeLabel}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className="super-tracking__table-wrap pa-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Listing Type</th>
                  <th>Listed By</th>
                  <th>User Email</th>
                  <th>User Role</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Developer</th>
                  <th>Status</th>
                  <th>Project ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.source}-${row.id}`}
                    className="pa-row"
                    onClick={() => void openDetails(row)}
                  >
                    <td>
                      <div className="pa-name">{row.projectName || "—"}</div>
                    </td>
                    <td>
                      <span className={`pa-type pa-type--${row.source === "PROJECT" ? "normal" : "portal"}`}>
                        {row.listingTypeLabel || (row.source === "PROJECT" ? "NORMAL PROJECT" : "PORTAL / BROKER")}
                      </span>
                    </td>
                    <td>
                      <div className="pa-user">
                        <span className="pa-avatar" aria-hidden>
                          {initials(row.listedBy, row.userEmail)}
                        </span>
                        <span>{row.listedBy || "—"}</span>
                      </div>
                    </td>
                    <td className="pa-email">{row.userEmail || "—"}</td>
                    <td>{row.userRole || "—"}</td>
                    <td className="pa-nowrap">{row.listedDate || "—"}</td>
                    <td className="pa-nowrap">{row.listedTime || "—"}</td>
                    <td>{row.location || "—"}</td>
                    <td>{row.developer || "—"}</td>
                    <td>
                      <span className={`pa-status pa-status--${statusClass(row.statusKey)}`}>
                        {row.status || "—"}
                      </span>
                    </td>
                    <td className="super-tracking__mono">{row.displayId || row.id}</td>
                    <td className="pa-actions" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="pa-link" onClick={() => void openDetails(row)}>
                        View
                      </button>
                      {row.adminPath ? (
                        <Link className="pa-link" href={row.adminPath}>
                          Edit
                        </Link>
                      ) : null}
                      <button type="button" className="pa-link pa-link--danger" onClick={() => void handleDelete(row)}>
                        Delete
                      </button>
                      <div className="pa-more" ref={menuId === `${row.source}-${row.id}` ? menuRef : null}>
                        <button
                          type="button"
                          className="pa-link"
                          aria-expanded={menuId === `${row.source}-${row.id}`}
                          onClick={() =>
                            setMenuId((current) =>
                              current === `${row.source}-${row.id}` ? null : `${row.source}-${row.id}`,
                            )
                          }
                        >
                          More
                        </button>
                        {menuId === `${row.source}-${row.id}` ? (
                          <div className="pa-more__menu">
                            <button type="button" onClick={() => void copyId(row)}>
                              Copy project ID
                            </button>
                            {row.publicPath ? (
                              <a href={publicHref(row.publicPath)} target="_blank" rel="noreferrer">
                                Open public page
                              </a>
                            ) : null}
                            {row.adminPath ? (
                              <Link href={row.adminPath} onClick={() => setMenuId(null)}>
                                Open in admin
                              </Link>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 ? (
          <div className="pa-pager">
            <label className="pa-pagesize">
              Rows
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) || 20)}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            <button
              type="button"
              className="super-tracking__btn"
              disabled={safePage <= 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {safePage + 1} of {totalPages}
            </span>
            <button
              type="button"
              className="super-tracking__btn"
              disabled={safePage >= totalPages - 1 || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {drawerLoading || drawer ? (
        <div className="pa-drawer-root">
          <button type="button" className="pa-drawer__backdrop" aria-label="Close details" onClick={() => setDrawer(null)} />
          <aside className="pa-drawer" aria-label="Project details">
            {drawerLoading && !drawer ? (
              <div className="super-tracking__muted">Loading details…</div>
            ) : drawer ? (
              <>
                <div className="pa-drawer__head">
                  <div>
                    <div className="pa-drawer__kicker">{drawer.listingTypeLabel}</div>
                    <h2>{drawer.projectName || "Untitled"}</h2>
                  </div>
                  <button type="button" className="super-tracking__btn" onClick={() => setDrawer(null)}>
                    Close
                  </button>
                </div>
                <section>
                  <h3>Project information</h3>
                  <dl className="pa-dl">
                    <div><dt>Project name</dt><dd>{drawer.projectName || "—"}</dd></div>
                    <div><dt>Project ID</dt><dd>{drawer.displayId || drawer.id}</dd></div>
                    <div><dt>Project type</dt><dd>{drawer.listingTypeLabel || "—"}</dd></div>
                    <div><dt>Developer</dt><dd>{drawer.developer || "—"}</dd></div>
                    <div><dt>Location</dt><dd>{drawer.location || "—"}</dd></div>
                    <div><dt>Status</dt><dd>{drawer.status || "—"}</dd></div>
                    <div><dt>Created date</dt><dd>{drawer.createdDate || "—"}</dd></div>
                    <div><dt>Created time</dt><dd>{drawer.createdTime || "—"}</dd></div>
                    <div><dt>Last updated</dt><dd>{[drawer.updatedDate, drawer.updatedTime].filter(Boolean).join(" · ") || "—"}</dd></div>
                  </dl>
                </section>
                <section>
                  <h3>User information</h3>
                  <dl className="pa-dl">
                    <div><dt>User name</dt><dd>{drawer.userName || "—"}</dd></div>
                    <div><dt>Email</dt><dd>{drawer.userEmail || "—"}</dd></div>
                    <div><dt>Phone</dt><dd>{drawer.userPhone || "—"}</dd></div>
                    <div><dt>User role</dt><dd>{drawer.userRole || "—"}</dd></div>
                    <div><dt>User ID</dt><dd>{drawer.userId ?? "—"}</dd></div>
                  </dl>
                </section>
                <section>
                  <h3>Activity</h3>
                  {Array.isArray(drawer.activity) && drawer.activity.length ? (
                    <ol className="pa-activity">
                      {drawer.activity.map((item, idx) => (
                        <li key={`${item.action}-${item.occurredAt}-${idx}`}>
                          <div className="pa-activity__action">{item.actionLabel || item.action}</div>
                          <div className="pa-activity__meta">
                            {item.actorName || "Unknown"} · {item.date || "—"} · {item.time || "—"}
                          </div>
                          {item.detail ? <div className="pa-activity__detail">{item.detail}</div> : null}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="super-tracking__muted">No activity recorded yet.</p>
                  )}
                </section>
                <div className="pa-drawer__foot">
                  {drawer.adminPath ? <Link href={drawer.adminPath}>Open in admin</Link> : null}
                  {drawer.publicPath ? (
                    <a href={publicHref(drawer.publicPath)} target="_blank" rel="noreferrer">
                      Public page
                    </a>
                  ) : null}
                </div>
              </>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
