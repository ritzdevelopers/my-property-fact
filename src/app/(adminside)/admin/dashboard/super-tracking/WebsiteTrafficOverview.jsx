"use client";

import { useCallback, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { PieChart } from "@mui/x-charts/PieChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faDownload,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

const TRAFFIC_POLL_SEC = 4;
const PIE_COLORS = [
  "#0d9488",
  "#6366f1",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#64748b",
];

function adminAuthHeaders() {
  const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseVisitOccurredAt(raw) {
  if (raw == null) return null;
  if (Array.isArray(raw) && raw.length >= 3) {
    const y = Number(raw[0]);
    const mo = Number(raw[1]) - 1;
    const d = Number(raw[2]);
    const h = raw.length > 3 ? Number(raw[3]) : 0;
    const mi = raw.length > 4 ? Number(raw[4]) : 0;
    const s = raw.length > 5 ? Number(raw[5]) : 0;
    const ms = raw.length > 6 ? Math.floor(Number(raw[6]) / 1e6) : 0;
    if ([y, mo, d, h, mi, s].some((x) => Number.isNaN(x))) return null;
    return new Date(y, mo, d, h, mi, s, ms);
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatVisitOccurredAtCell(row) {
  const d = parseVisitOccurredAt(row?.occurredAt ?? row?.occurred_at);
  return d ? d.toLocaleString() : "—";
}

function visitDwellMs(row) {
  if (row == null) return null;
  const v = row.dwellMs ?? row.dwell_ms;
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatDwellOnPage(ms) {
  if (ms == null || ms < 0) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m`;
}

function formatVisitDwellCell(row) {
  const dms = visitDwellMs(row);
  return dms != null ? formatDwellOnPage(dms) : "—";
}

function formatLastUpdatedClock(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function secondsSinceUpdate(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
}

function relativeAgoFromSeconds(sec) {
  if (sec == null) return "";
  if (sec < 60) return `${sec}s ago`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(sec / 3600);
  return `${h}h ago`;
}

function formatReadyAt(raw) {
  if (!raw || typeof raw !== "string") return "";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

function truncatePath(path, max = 44) {
  if (!path || typeof path !== "string") return "—";
  const p = path.trim();
  if (p.length <= max) return p;
  return `${p.slice(0, max - 1)}…`;
}

function buildPieSeries(topPaths) {
  if (!Array.isArray(topPaths) || topPaths.length === 0) return [];
  const sorted = [...topPaths].sort(
    (a, b) => (Number(b?.count) || 0) - (Number(a?.count) || 0),
  );
  const maxSlices = 6;
  const top = sorted.slice(0, maxSlices);
  let other = 0;
  if (sorted.length > maxSlices) {
    other = sorted.slice(maxSlices).reduce((s, r) => s + (Number(r?.count) || 0), 0);
  }
  const data = top
    .map((r, i) => ({
      id: i,
      value: Math.max(0, Number(r?.count) || 0),
      label: truncatePath(String(r?.path ?? ""), 36),
    }))
    .filter((d) => d.value > 0);
  if (other > 0) {
    data.push({
      id: maxSlices,
      value: other,
      label: "Other pages",
    });
  }
  return data;
}

/**
 * Reorganized public-site traffic view: summary → pie + list → visits + export.
 */
export default function WebsiteTrafficOverview({
  siteUrl,
  siteLabel,
  traffic,
  trafficLoading,
  trafficErr,
  trafficUpdatedAt,
  visits,
  visitsErr,
  ipRevealed,
  trafficPin,
  setTrafficPin,
  trafficPinErr,
  trafficPinLoading,
  onUnlockIp,
  onRefresh,
  onRefreshDisabled,
}) {
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const report24hReady = Boolean(traffic?.report24hReady);
  const report24hReadyAtLabel = formatReadyAt(traffic?.report24hReadyAt);

  const pieData = useMemo(
    () => buildPieSeries(traffic?.topPathsLast24Hours),
    [traffic?.topPathsLast24Hours],
  );
  const pieTotal = useMemo(
    () => pieData.reduce((s, d) => s + (d.value || 0), 0),
    [pieData],
  );

  const downloadCsv = useCallback(async (hours) => {
    if (hours === 24 && !report24hReady) {
      setExportMsg(
        report24hReadyAtLabel
          ? `24h report will be available after ${report24hReadyAtLabel}.`
          : "24h report will be available after 24 hours of collected traffic data.",
      );
      return;
    }
    const base = getPublicApiBase();
    if (!base) {
      setExportMsg("API URL not configured.");
      return;
    }
    setExporting(true);
    setExportMsg("");
    try {
      const url = `${base}admin/super/traffic/visits-export?hours=${hours}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: { ...adminAuthHeaders(), Accept: "text/csv" },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t?.slice(0, 120) || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = `mpf-public-traffic-${hours}h.csv`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
      if (!ipRevealed) {
        setExportMsg(
          "Download saved. Unlock IPs on this page first if you need real addresses in the CSV.",
        );
      } else {
        setExportMsg("Report downloaded.");
      }
      window.setTimeout(() => setExportMsg(""), 8000);
    } catch (e) {
      setExportMsg(e?.message || "Download failed.");
    } finally {
      setExporting(false);
    }
  }, [ipRevealed, report24hReady, report24hReadyAtLabel]);

  return (
    <div className="wt-overview">
      <div className="wt-overview__hero">
        <div className="wt-overview__hero-text">
          <p className="wt-overview__eyebrow">Live public site</p>
          <h2 className="wt-overview__heading">Website traffic</h2>
          <p className="wt-overview__lead">
            Counts come from your marketing site (not the admin). Data refreshes about every{" "}
            {TRAFFIC_POLL_SEC}s while you stay on this tab.
          </p>
        </div>
        <div className="wt-overview__hero-actions">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wt-overview__link-out"
          >
            <FontAwesomeIcon icon={faGlobe} />
            {siteLabel}
          </a>
          <button
            type="button"
            className="wt-overview__btn wt-overview__btn--ghost"
            onClick={() => onRefresh()}
            disabled={onRefreshDisabled}
          >
            <FontAwesomeIcon icon={faArrowsRotate} />
            Refresh
          </button>
          <button
            type="button"
            className="wt-overview__btn wt-overview__btn--primary"
            onClick={() => downloadCsv(24)}
            disabled={exporting || !report24hReady}
          >
            <FontAwesomeIcon icon={faDownload} />
            {exporting ? "Preparing…" : "24h report (CSV)"}
          </button>
        </div>
      </div>

      {exportMsg ? <p className="wt-overview__hint wt-overview__hint--ok">{exportMsg}</p> : null}
      {!report24hReady ? (
        <p className="wt-overview__hint">
          24h report download unlocks after 24 hours of data collection
          {report24hReadyAtLabel ? ` (expected: ${report24hReadyAtLabel})` : ""}.
        </p>
      ) : null}

      {trafficErr ? <div className="super-tracking__err">{trafficErr}</div> : null}
      {visitsErr ? <div className="super-tracking__err">{visitsErr}</div> : null}

      <div className="wt-overview__stats">
        <article className="wt-stat-card">
          <p className="wt-stat-card__label">Last 15 min</p>
          {trafficLoading && !traffic ? (
            <div className="admin-skel wt-stat-card__skel" aria-hidden />
          ) : (
            <p className="wt-stat-card__value">{traffic?.visitsLast15Minutes ?? "—"}</p>
          )}
          <p className="wt-stat-card__hint">Recent window</p>
        </article>
        <article className="wt-stat-card">
          <p className="wt-stat-card__label">Last 1 hour</p>
          {trafficLoading && !traffic ? (
            <div className="admin-skel wt-stat-card__skel" aria-hidden />
          ) : (
            <p className="wt-stat-card__value">{traffic?.visitsLast1Hour ?? "—"}</p>
          )}
          <p className="wt-stat-card__hint">Rolling total</p>
        </article>
        <article className="wt-stat-card wt-stat-card--accent">
          <p className="wt-stat-card__label">Last 24 hours</p>
          {trafficLoading && !traffic ? (
            <div className="admin-skel wt-stat-card__skel" aria-hidden />
          ) : (
            <p className="wt-stat-card__value">{traffic?.visitsLast24Hours ?? "—"}</p>
          )}
          <p className="wt-stat-card__hint">Full day scale</p>
        </article>
      </div>

      <p className="wt-overview__live-meta" aria-live="polite">
        <span className="wt-overview__live-dot" aria-hidden />
        Live
        {trafficUpdatedAt ? (
          <>
            <span className="super-tracking__live-sep">·</span>
            Updated{" "}
            <time dateTime={trafficUpdatedAt.toISOString()}>
              {formatLastUpdatedClock(trafficUpdatedAt)}
            </time>
            <span className="super-tracking__live-updated-ago">
              {" "}
              ({relativeAgoFromSeconds(secondsSinceUpdate(trafficUpdatedAt))})
            </span>
          </>
        ) : null}
      </p>

      <div className="wt-overview__split">
        <section className="wt-panel">
          <div className="wt-panel__head">
            <h3 className="wt-panel__title">Traffic by page (24h)</h3>
            <p className="wt-panel__sub">Share of recorded views across top paths</p>
          </div>
          <div className="wt-panel__body wt-panel__body--pie">
            {trafficLoading && !traffic ? (
              <div className="admin-skel wt-overview__pie-skeleton" aria-busy="true" />
            ) : pieTotal <= 0 ? (
              <p className="wt-overview__empty">No path breakdown yet — visits will appear here.</p>
            ) : (
              <PieChart
                series={[
                  {
                    innerRadius: 48,
                    outerRadius: 108,
                    paddingAngle: 1.5,
                    cornerRadius: 3,
                    data: pieData,
                    highlightScope: { fade: "global", highlight: "item" },
                  },
                ]}
                colors={PIE_COLORS}
                height={280}
                hideLegend={false}
                slotProps={{
                  legend: {
                    direction: "horizontal",
                    position: { vertical: "bottom", horizontal: "middle" },
                  },
                }}
                sx={{
                  width: "100%",
                  maxWidth: 420,
                  margin: "0 auto",
                  "& .MuiChartsLegend-root": {
                    justifyContent: "center",
                    paddingTop: 0.5,
                  },
                  "& .MuiChartsLegend-label": {
                    fontSize: "0.75rem",
                    fill: "#475569",
                  },
                }}
              />
            )}
          </div>
        </section>

        <section className="wt-panel">
          <div className="wt-panel__head">
            <h3 className="wt-panel__title">Top pages</h3>
            <p className="wt-panel__sub">Ranked by views in the last 24 hours</p>
          </div>
          <ol className="wt-top-list">
            {trafficLoading && !traffic ? (
              <>
                <li className="admin-skel wt-top-list__skel" />
                <li className="admin-skel wt-top-list__skel" />
                <li className="admin-skel wt-top-list__skel" />
                <li className="admin-skel wt-top-list__skel" />
              </>
            ) : traffic?.topPathsLast24Hours?.length ? (
              traffic.topPathsLast24Hours.slice(0, 10).map((row, i) => (
                <li key={row.path + i} className="wt-top-list__item">
                  <span className="wt-top-list__rank">{i + 1}</span>
                  <span className="wt-top-list__path" title={row.path}>
                    {truncatePath(row.path, 52)}
                  </span>
                  <span className="wt-top-list__count">{Number(row.count).toLocaleString()}</span>
                </li>
              ))
            ) : (
              <li className="wt-overview__empty">No paths yet.</li>
            )}
          </ol>
        </section>
      </div>

      <section className="wt-panel wt-panel--full">
        <div className="wt-panel__head">
          <h3 className="wt-panel__title">Recent visits</h3>
          <p className="wt-panel__sub">
            Last 50 events (48h). IPs match your unlock setting below.
          </p>
        </div>
        <div className="super-tracking__visits-unlock wt-visits-unlock">
          <p className="super-tracking__visits-unlock-hint">
            Visitor IP uses <code className="super-tracking__inline-code">X-Forwarded-For</code>/
            <code className="super-tracking__inline-code">X-Real-IP</code>. Enter the PIN (default{" "}
            <strong>2026</strong>) to show real IPs in the table and in CSV exports.
          </p>
          {ipRevealed ? (
            <p className="super-tracking__visits-unlocked-msg">IPs unlocked in this browser.</p>
          ) : (
            <div className="super-tracking__visits-pin-row">
              <input
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={trafficPin}
                onChange={(e) => setTrafficPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="super-tracking__visits-pin-input"
                aria-label="PIN to show visitor IP"
              />
              <button
                type="button"
                className="super-tracking__btn super-tracking__btn--unlock"
                onClick={() => onUnlockIp()}
                disabled={trafficPinLoading || trafficPin.length !== 4}
              >
                {trafficPinLoading ? "…" : "Unlock IPs"}
              </button>
              {trafficPinErr ? (
                <span className="super-tracking__visits-pin-err">{trafficPinErr}</span>
              ) : null}
            </div>
          )}
        </div>
        {visits === null ? (
          <div className="super-tracking__muted">
            <div className="wt-table-skeleton" aria-busy="true">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="admin-skel wt-table-skeleton__row" />
              ))}
            </div>
          </div>
        ) : visits.content?.length ? (
          <div className="super-tracking__table-wrap wt-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Path</th>
                  <th>On page</th>
                  <th>Visitor IP</th>
                </tr>
              </thead>
              <tbody>
                {visits.content.map((row) => (
                  <tr key={row.id}>
                    <td className="super-tracking__mono">{formatVisitOccurredAtCell(row)}</td>
                    <td className="super-tracking__mono">{row.path}</td>
                    <td className="super-tracking__mono">{formatVisitDwellCell(row)}</td>
                    <td className="super-tracking__mono">{row.clientIp || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="super-tracking__muted">
            No rows yet — browse the public site to generate visits.
          </div>
        )}
      </section>
    </div>
  );
}
