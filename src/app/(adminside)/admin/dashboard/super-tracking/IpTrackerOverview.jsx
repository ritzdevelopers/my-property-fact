"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { isSuspectedScanPath, scanProbeKind } from "@/lib/scanPathUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faLocationDot,
  faShieldHalved,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

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
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return data;
}

function parseOccurredAt(raw) {
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

function formatWhen(raw) {
  const d = parseOccurredAt(raw);
  return d ? d.toLocaleString() : "—";
}

function mapsHref(lat, lon) {
  if (lat == null || lon == null) return null;
  const a = Number(lat);
  const b = Number(lon);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return `https://www.google.com/maps?q=${a},${b}`;
}

function normalizePathLabel(raw) {
  if (!raw || typeof raw !== "string") return { path: "—", isScan: false, kind: null };
  const isScanPrefixed = raw.startsWith("SCAN ");
  const path = isScanPrefixed ? raw.slice(5) : raw;
  const kind = scanProbeKind(path);
  const isScan = isScanPrefixed || Boolean(kind) || isSuspectedScanPath(path);
  return { path, isScan, kind: kind || (isScan ? "PROBE" : null) };
}

function PathCell({ raw }) {
  const { path, isScan, kind } = normalizePathLabel(raw);
  return (
    <div className={`ip-tracker__path-row${isScan ? " ip-tracker__path-row--scan" : ""}`}>
      {isScan && kind ? (
        <span className="super-tracking__pill super-tracking__pill--fail ip-tracker__probe-pill">
          {kind}
        </span>
      ) : null}
      <span className="super-tracking__mono">{path}</span>
    </div>
  );
}

/**
 * Super-admin IP tracker: who hit the site, when, where, what path, hit/scan counts.
 */
export default function IpTrackerOverview({
  ipRevealed,
  trafficPin,
  setTrafficPin,
  trafficPinErr,
  trafficPinLoading,
  onUnlockIp,
}) {
  const base = getPublicApiBase();
  const [summary, setSummary] = useState(null);
  const [ips, setIps] = useState(null);
  const [events, setEvents] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [scansOnly, setScansOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedIp, setSelectedIp] = useState("");
  const [detailEvents, setDetailEvents] = useState(null);

  const loadAll = useCallback(
    async (opts = {}) => {
      const silent = Boolean(opts.silent);
      if (!base) return;
      if (!silent) {
        setLoading(true);
        setErr("");
      }
      try {
        const scansQ = scansOnly ? "true" : "false";
        const [sum, ipPage, evPage] = await Promise.all([
          adminFetchJson(`${base}admin/super/ip-track/summary`),
          adminFetchJson(
            `${base}admin/super/ip-track/ips?page=${page}&size=25&scansOnly=${scansQ}&hours=168`,
          ),
          adminFetchJson(
            `${base}admin/super/ip-track/events?page=0&size=40&scansOnly=${scansQ}`,
          ),
        ]);
        setSummary(sum);
        setIps(ipPage);
        setEvents(evPage);
      } catch (e) {
        if (!silent) {
          setErr(e.message || "Failed to load IP tracker");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [base, page, scansOnly],
  );

  const loadIpDetail = useCallback(
    async (ip) => {
      if (!base || !ip || ip === "Unlock to view IP" || ip === "—") return;
      setSelectedIp(ip);
      try {
        const data = await adminFetchJson(
          `${base}admin/super/ip-track/events?page=0&size=50&ip=${encodeURIComponent(ip)}`,
        );
        setDetailEvents(data);
      } catch {
        setDetailEvents(null);
      }
    },
    [base],
  );

  useEffect(() => {
    loadAll({ silent: false });
    const id = window.setInterval(() => loadAll({ silent: true }), 8000);
    return () => window.clearInterval(id);
  }, [loadAll]);

  useEffect(() => {
    if (ipRevealed) {
      loadAll({ silent: true });
    }
  }, [ipRevealed, loadAll]);

  const s = summary || {};

  return (
    <div className="ip-tracker">
      <div className="super-tracking__live-row">
        <span className="super-tracking__live-badge">
          <FontAwesomeIcon icon={faShieldHalved} />
          IP TRACKER
        </span>
        <span className="super-tracking__muted">
          Every visitor &amp; scanner — date/time, location, paths, hit counts
        </span>
        <button
          type="button"
          className="super-tracking__btn super-tracking__btn--ghost"
          onClick={() => loadAll({ silent: false })}
          disabled={loading}
          style={{ marginLeft: "auto" }}
        >
          <FontAwesomeIcon icon={faArrowsRotate} spin={loading} /> Refresh
        </button>
      </div>

      {err ? <div className="super-tracking__err">{err}</div> : null}

      <div className="ip-tracker__stats">
        <div className="ip-tracker__stat">
          <div className="ip-tracker__stat-label">Total hits</div>
          <div className="ip-tracker__stat-value">{s.totalHits ?? "—"}</div>
        </div>
        <div className="ip-tracker__stat ip-tracker__stat--scan">
          <div className="ip-tracker__stat-label">Scans done</div>
          <div className="ip-tracker__stat-value">{s.totalScans ?? "—"}</div>
        </div>
        <div className="ip-tracker__stat">
          <div className="ip-tracker__stat-label">Unique IPs</div>
          <div className="ip-tracker__stat-value">{s.uniqueIps ?? "—"}</div>
        </div>
        <div className="ip-tracker__stat ip-tracker__stat--scan">
          <div className="ip-tracker__stat-label">Scanner IPs</div>
          <div className="ip-tracker__stat-value">{s.uniqueScanIps ?? "—"}</div>
        </div>
        <div className="ip-tracker__stat">
          <div className="ip-tracker__stat-label">Hits (24h)</div>
          <div className="ip-tracker__stat-value">{s.hitsLast24Hours ?? "—"}</div>
        </div>
        <div className="ip-tracker__stat ip-tracker__stat--scan">
          <div className="ip-tracker__stat-label">Scans (24h)</div>
          <div className="ip-tracker__stat-value">{s.scansLast24Hours ?? "—"}</div>
        </div>
      </div>

      <div className="super-tracking__panel" style={{ marginBottom: "1rem" }}>
        <div className="super-tracking__panel-head">Unlock visitor IPs</div>
        <div className="super-tracking__filters" style={{ alignItems: "flex-end" }}>
          {ipRevealed || ips?.ipRevealActive ? (
            <p className="super-tracking__muted" style={{ margin: 0 }}>
              IPs are visible for this browser session.
            </p>
          ) : (
            <>
              <div className="super-tracking__field">
                <label htmlFor="ip-track-pin">PIN</label>
                <input
                  id="ip-track-pin"
                  type="password"
                  value={trafficPin}
                  onChange={(e) => setTrafficPin(e.target.value)}
                  placeholder="Traffic reveal PIN"
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                className="super-tracking__btn"
                onClick={onUnlockIp}
                disabled={trafficPinLoading}
              >
                Unlock IPs
              </button>
              {trafficPinErr ? (
                <span className="super-tracking__err" style={{ margin: 0 }}>
                  {trafficPinErr}
                </span>
              ) : null}
            </>
          )}
          <label className={`ip-tracker__toggle${scansOnly ? " ip-tracker__toggle--on" : ""}`}>
            <input
              type="checkbox"
              checked={scansOnly}
              onChange={(e) => {
                setPage(0);
                setScansOnly(e.target.checked);
              }}
            />
            Scanners only (.env / .git / .aws / wp-*)
          </label>
        </div>
        <p className="super-tracking__muted ip-tracker__hint">
          Tip: &quot;Amazon / AWS EC2&quot; in Location is the hosting ISP (crawler), not a{" "}
          <code>/.aws</code> file scan. Toggle <strong>Scanners only</strong> for{" "}
          <code>/.env</code>, <code>/.git</code>, <code>/.aws</code> probes. If those still
          never appear, Cloudflare or nginx is blocking them before tracking — check
          Cloudflare → Security → Events, or proxy probes to Next (see deploy note).
        </p>
      </div>

      <div className="super-tracking__panel">
        <div className="super-tracking__panel-head">
          <FontAwesomeIcon icon={faGlobe} style={{ marginRight: 8 }} />
          {scansOnly
            ? "Scanner IPs (last 7 days) — .env / .git / .aws / wp probes"
            : "IPs (last 7 days) — hit count & what they scanned / visited"}
        </div>
        {loading && !ips ? (
          <div className="super-tracking__muted" style={{ padding: "1rem" }}>
            Loading…
          </div>
        ) : ips?.content?.length ? (
          <div className="super-tracking__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>IP</th>
                  <th>Location</th>
                  <th>Hits</th>
                  <th>Scans</th>
                  <th>First seen</th>
                  <th>Last seen</th>
                  <th>What scanned / visited</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ips.content.map((row, idx) => {
                  const map = mapsHref(row.latitude, row.longitude);
                  return (
                    <tr key={`${row.ip}-${idx}`}>
                      <td className="super-tracking__mono">{row.ip || "—"}</td>
                      <td>
                        <div className="ip-tracker__loc">
                          <FontAwesomeIcon icon={faLocationDot} />
                          <span>{row.locationLabel || "—"}</span>
                        </div>
                        {row.org ? (
                          <div className="super-tracking__muted" style={{ fontSize: "0.72rem" }}>
                            {row.org}
                          </div>
                        ) : null}
                        {map ? (
                          <a href={map} target="_blank" rel="noreferrer" className="ip-tracker__map">
                            Map
                          </a>
                        ) : null}
                      </td>
                      <td className="super-tracking__mono">{row.hitCount ?? 0}</td>
                      <td className="super-tracking__mono">
                        <span
                          className={
                            Number(row.scanCount) > 0
                              ? "super-tracking__pill super-tracking__pill--fail"
                              : ""
                          }
                        >
                          {row.scanCount ?? 0}
                        </span>
                      </td>
                      <td className="super-tracking__mono">{formatWhen(row.firstSeen)}</td>
                      <td className="super-tracking__mono">{formatWhen(row.lastSeen)}</td>
                      <td className="ip-tracker__paths">
                        {(row.recentPaths || []).slice(0, 5).map((p) => (
                          <PathCell key={p} raw={p} />
                        ))}
                      </td>
                      <td>
                        {ipRevealed || row.ipRevealed ? (
                          <button
                            type="button"
                            className="super-tracking__btn super-tracking__btn--ghost"
                            onClick={() => loadIpDetail(row.ip)}
                          >
                            Details
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="super-tracking__muted" style={{ padding: "1rem" }}>
            No IP hits recorded yet. Data starts after deploy.
          </div>
        )}
        <div className="super-tracking__pager">
          <span>
            Page {(ips?.number ?? page) + 1} / {Math.max(ips?.totalPages ?? 1, 1)}
          </span>
          <button
            type="button"
            disabled={loading || page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={loading || !ips || page >= (ips.totalPages ?? 1) - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {selectedIp && detailEvents ? (
        <div className="super-tracking__panel" style={{ marginTop: "1rem" }}>
          <div className="super-tracking__panel-head">
            Timeline for {selectedIp}
            <button
              type="button"
              className="super-tracking__btn super-tracking__btn--ghost"
              style={{ marginLeft: 12 }}
              onClick={() => {
                setSelectedIp("");
                setDetailEvents(null);
              }}
            >
              Close
            </button>
          </div>
          <div className="super-tracking__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Path</th>
                  <th>Scan?</th>
                  <th>Location</th>
                  <th>UA</th>
                </tr>
              </thead>
              <tbody>
                {(detailEvents.content || []).map((row) => {
                  const kind = row.scan ? scanProbeKind(row.path) || "PROBE" : null;
                  return (
                  <tr key={row.id}>
                    <td className="super-tracking__mono">{formatWhen(row.occurredAt)}</td>
                    <td className="super-tracking__mono">{row.path}</td>
                    <td>
                      {row.scan ? (
                        <span className="super-tracking__pill super-tracking__pill--fail">
                          {kind || "SCAN"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{row.locationLabel || "—"}</td>
                    <td className="ip-tracker__ua" title={row.userAgent || ""}>
                      {(row.userAgent || "—").slice(0, 48)}
                      {(row.userAgent || "").length > 48 ? "…" : ""}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="super-tracking__panel" style={{ marginTop: "1rem" }}>
        <div className="super-tracking__panel-head">Latest hits (live)</div>
        {events?.content?.length ? (
          <div className="super-tracking__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>IP</th>
                  <th>Path</th>
                  <th>Location</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {events.content.map((row) => {
                  const kind = row.scan ? scanProbeKind(row.path) || "PROBE" : null;
                  return (
                  <tr key={row.id}>
                    <td className="super-tracking__mono">{formatWhen(row.occurredAt)}</td>
                    <td className="super-tracking__mono">{row.ip}</td>
                    <td>
                      <PathCell raw={row.scan ? `SCAN ${row.path}` : row.path} />
                    </td>
                    <td>{row.locationLabel || "—"}</td>
                    <td>
                      {row.scan ? (
                        <span className="super-tracking__pill super-tracking__pill--fail">
                          {kind || "SCAN"}
                        </span>
                      ) : (
                        <span className="super-tracking__pill super-tracking__pill--ok">
                          visit
                        </span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="super-tracking__muted" style={{ padding: "1rem" }}>
            Waiting for traffic…
          </div>
        )}
      </div>
    </div>
  );
}
