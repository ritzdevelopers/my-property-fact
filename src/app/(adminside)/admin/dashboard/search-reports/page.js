"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import "../super-tracking/super-tracking.css";
import "./search-reports.css";

function adminAuthHeaders() {
  return {};
}

async function adminFetchJson(url) {
  const res = await fetch(url, {
    headers: { ...adminAuthHeaders(), Accept: "application/json" },
    credentials: "include",
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
  return Number(n).toLocaleString();
}

function RankTable({ title, rows, emptyHint }) {
  return (
    <div className="super-tracking__panel search-reports__panel">
      <div className="super-tracking__panel-head">{title}</div>
      {!rows?.length ? (
        <div className="super-tracking__muted">{emptyHint || "No searches in this period yet."}</div>
      ) : (
        <div className="super-tracking__table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Query</th>
                <th>Type</th>
                <th>Searches</th>
                <th>Sessions</th>
                <th>Matched target</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={`${row.query}-${row.searchType}-${idx}`}>
                  <td className="super-tracking__mono">{idx + 1}</td>
                  <td>
                    <span className="search-reports__query">{row.query}</span>
                  </td>
                  <td>
                    <span className={`search-reports__type search-reports__type--${row.searchType || "keyword"}`}>
                      {row.searchType || "—"}
                    </span>
                  </td>
                  <td className="super-tracking__mono">{formatCount(row.searchCount)}</td>
                  <td className="super-tracking__mono">{formatCount(row.uniqueSessions)}</td>
                  <td className="super-tracking__mono">{row.topTargetLabel || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SearchReportsPage() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [period, setPeriod] = useState("week");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [exporting, setExporting] = useState(false);
  const [section, setSection] = useState("overall");

  const base = useMemo(() => getPublicApiBase(), []);

  const load = useCallback(async () => {
    if (!base || !isSuperAdmin) return;
    setLoading(true);
    setErr("");
    try {
      const data = await adminFetchJson(
        `${base}admin/super/search-reports?period=${encodeURIComponent(period)}`,
      );
      setReport(data);
    } catch (e) {
      setErr(e?.message || "Failed to load search report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [base, isSuperAdmin, period]);

  useEffect(() => {
    if (roleLoading) return;
    if (!isSuperAdmin) return;
    void load();
  }, [load, isSuperAdmin, roleLoading]);

  const downloadExcel = async () => {
    if (!base) return;
    setExporting(true);
    try {
      const res = await fetch(
        `${base}admin/super/search-reports/export?period=${encodeURIComponent(period)}`,
        {
          headers: { ...adminAuthHeaders() },
          credentials: "include",
        },
      );
      if (!res.ok) {
        throw new Error(`Export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mpf-search-report-${period}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e?.message || "Excel export failed");
    } finally {
      setExporting(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="super-tracking">
        <p className="super-tracking__muted">Loading…</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="super-tracking">
        <p className="super-tracking__err">You do not have access to this page.</p>
      </div>
    );
  }

  const maxDaily = Math.max(
    1,
    ...(report?.dailyTrend || []).map((d) => Number(d.total) || 0),
  );

  const sectionRows =
    section === "property"
      ? report?.topPropertySearches
      : section === "blog"
        ? report?.topBlogSearches
        : section === "keyword"
          ? report?.topKeywords?.length
            ? report.topKeywords
            : report?.topOverall
          : report?.topOverall;

  const sectionTitle =
    section === "property"
      ? "Top property / project searches"
      : section === "blog"
        ? "Top blog searches"
        : section === "keyword"
          ? "Top keywords & search terms"
          : "Top searches overall";

  return (
    <div className="super-tracking search-reports">
      <p className="super-tracking__kicker">Super Admin · Insights</p>
      <h1 className="super-tracking__title">Search Reports</h1>
      <p className="super-tracking__note">
        See what users searched for across properties, blogs, and keywords — then download a
        ready Excel workbook for stakeholder sharing.
      </p>

      <div className="search-reports__toolbar">
        <div className="super-tracking__tabs" role="tablist" aria-label="Report period">
          <button
            type="button"
            role="tab"
            aria-selected={period === "week"}
            className={`super-tracking__tab${period === "week" ? " super-tracking__tab--active" : ""}`}
            onClick={() => setPeriod("week")}
          >
            Weekly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={period === "month"}
            className={`super-tracking__tab${period === "month" ? " super-tracking__tab--active" : ""}`}
            onClick={() => setPeriod("month")}
          >
            Monthly
          </button>
        </div>
        <div className="search-reports__actions">
          <button
            type="button"
            className="super-tracking__btn"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            className="super-tracking__btn search-reports__btn-excel"
            onClick={() => void downloadExcel()}
            disabled={exporting || loading}
          >
            {exporting ? "Preparing Excel…" : "Download Excel"}
          </button>
        </div>
      </div>

      {err ? <div className="super-tracking__err">{err}</div> : null}

      <div className="super-tracking__metrics search-reports__metrics">
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Total searches</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(report?.totalSearches)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Property</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(report?.propertySearches)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Blog</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(report?.blogSearches)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Keywords</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(report?.keywordSearches)}
          </div>
        </div>
        <div className="super-tracking__metric">
          <div className="super-tracking__metric-label">Unique queries</div>
          <div className="super-tracking__metric-value">
            {loading ? "—" : formatCount(report?.uniqueQueries)}
          </div>
        </div>
      </div>

      {report?.fromInclusive ? (
        <p className="search-reports__range">
          Window: <strong>{report.fromInclusive}</strong> → <strong>{report.toExclusive}</strong>
        </p>
      ) : null}

      <div className="super-tracking__panel search-reports__panel">
        <div className="super-tracking__panel-head">Daily trend</div>
        {!report?.dailyTrend?.length ? (
          <div className="super-tracking__muted">
            {loading
              ? "Loading trend…"
              : "No search activity in this window yet. Searches on the live site will appear here."}
          </div>
        ) : (
          <div className="search-reports__bars" aria-label="Daily search volumes">
            {report.dailyTrend.map((d) => {
              const pct = Math.max(4, Math.round(((Number(d.total) || 0) / maxDaily) * 100));
              return (
                <div key={d.date} className="search-reports__bar-col" title={`${d.date}: ${d.total}`}>
                  <div className="search-reports__bar-stack">
                    <div className="search-reports__bar" style={{ height: `${pct}%` }} />
                  </div>
                  <div className="search-reports__bar-label">{String(d.date).slice(5)}</div>
                  <div className="search-reports__bar-count">{d.total}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="super-tracking__tabs search-reports__section-tabs" role="tablist" aria-label="Search categories">
        {[
          { id: "overall", label: "Overall" },
          { id: "property", label: "Properties" },
          { id: "blog", label: "Blogs" },
          { id: "keyword", label: "Keywords" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={section === tab.id}
            className={`super-tracking__tab${section === tab.id ? " super-tracking__tab--active" : ""}`}
            onClick={() => setSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <RankTable
        title={sectionTitle}
        rows={sectionRows}
        emptyHint={
          loading
            ? "Loading…"
            : "No data yet — once users search on the site, rankings will populate here."
        }
      />
    </div>
  );
}
