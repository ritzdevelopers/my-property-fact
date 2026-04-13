"use client";

import { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCalendarWeek,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

function formatShortDate(isoDate) {
  if (!isoDate || typeof isoDate !== "string") return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return isoDate;
}

function normalizeLivePayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  const arr = Array.isArray(raw.buckets) ? raw.buckets : [];
  const buckets = arr.map((b) => ({
    minuteStart: String(b?.minuteStart ?? b?.minute_start ?? ""),
    label: String(b?.label ?? ""),
    count: Number(b?.count ?? 0) || 0,
  }));
  const visitsLast15 =
    Number(raw.visitsLast15Minutes ?? raw.visits_last_15_minutes ?? 0) || 0;
  const visitsLast1Hour =
    Number(raw.visitsLast1Hour ?? raw.visits_last_1_hour ?? 0) || 0;
  const windowMinutes =
    Number(raw.windowMinutes ?? raw.window_minutes ?? buckets.length) || buckets.length;
  return { buckets, visitsLast15, visitsLast1Hour, windowMinutes };
}

const CHART_LINE = "#0d9488";
const CHART_FILL = "rgba(13, 148, 136, 0.12)";

function TrafficKpiCard({ icon, label, value, sub }) {
  return (
    <div className="admin-dash-last60__kpi">
      <div className="admin-dash-last60__kpi-icon" aria-hidden>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="admin-dash-last60__kpi-body">
        <p className="admin-dash-last60__kpi-label">{label}</p>
        <p className="admin-dash-last60__kpi-value">{value}</p>
        {sub ? <p className="admin-dash-last60__kpi-sub">{sub}</p> : null}
      </div>
    </div>
  );
}

/**
 * Last 60 minutes of public-site traffic — shown in the dashboard left column for super admins.
 */
export default function AdminDashboardLast60Traffic({
  livePayload,
  liveLoading,
  liveError,
  liveUpdatedAt,
}) {
  const liveNorm = useMemo(() => normalizeLivePayload(livePayload), [livePayload]);

  const { liveDataset, liveYMax } = useMemo(() => {
    const buckets = liveNorm?.buckets?.length ? liveNorm.buckets : [];
    const rows = buckets.map((b) => ({
      tlabel: b.label || formatShortDate(b.minuteStart),
      views: b.count,
    }));
    const maxV = rows.length ? Math.max(...rows.map((r) => r.views), 0) : 0;
    return {
      liveDataset: rows,
      liveYMax: Math.max(5, Math.ceil(Math.max(maxV, 1) * 1.12)),
    };
  }, [liveNorm]);

  return (
    <div className="admin-dash-last60">
      <div className="admin-dash-last60__head">
        <div>
          <h2 className="admin-dash-last60__title">Website Traffic (Last 60 minutes)</h2>
          <p className="admin-dash-last60__sub">
            Per-minute page views · Y-axis from 0 · auto-refresh while you stay on this page
          </p>
        </div>
        {liveUpdatedAt instanceof Date && !Number.isNaN(liveUpdatedAt.getTime()) ? (
          <p className="admin-dash-last60__updated" suppressHydrationWarning>
            Updated{" "}
            {liveUpdatedAt.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        ) : null}
      </div>

      {liveNorm ? (
        <div className="admin-dash-last60__kpi-row">
          <TrafficKpiCard
            icon={faBolt}
            label="Last 15 min"
            value={liveNorm.visitsLast15.toLocaleString()}
            sub="Rolling"
          />
          <TrafficKpiCard
            icon={faChartLine}
            label="Last 1 hour"
            value={liveNorm.visitsLast1Hour.toLocaleString()}
            sub="Rolling"
          />
          <TrafficKpiCard
            icon={faCalendarWeek}
            label="Window"
            value={`${liveNorm.windowMinutes || liveDataset.length} min`}
            sub="Buckets"
          />
        </div>
      ) : null}

      {liveError ? (
        <div className="admin-dash-last60__err" role="alert">
          <p className="admin-dash-last60__err-title">Could not load live traffic</p>
          <p className="admin-dash-last60__err-msg">{liveError}</p>
        </div>
      ) : null}

      {liveLoading && !liveNorm && !liveError ? (
        <div className="admin-dash-last60__loading" aria-busy="true">
          <p>Loading…</p>
        </div>
      ) : null}

      {liveNorm && liveDataset.length > 0 ? (
        <div className="admin-dash-last60__chart">
          <LineChart
            dataset={liveDataset}
            xAxis={[
              {
                scaleType: "point",
                dataKey: "tlabel",
                tickLabelStyle: { fontSize: 8, fill: "#6b7280" },
                label: "Time",
                labelStyle: { fontSize: 10, fill: "#9ca3af", fontWeight: 600 },
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: liveYMax,
                label: "Views",
                tickLabelStyle: { fontSize: 9, fill: "#6b7280" },
                labelStyle: { fontSize: 10, fill: "#9ca3af", fontWeight: 600 },
                width: 40,
              },
            ]}
            series={[
              {
                type: "line",
                dataKey: "views",
                label: "Views / min",
                color: CHART_LINE,
                area: true,
                curve: "natural",
                showMark: false,
                valueFormatter: (v) =>
                  v == null || Number.isNaN(v) ? "" : `${Number(v).toLocaleString()} views`,
              },
            ]}
            height={220}
            margin={{ top: 20, right: 8, bottom: 48, left: 6 }}
            grid={{ vertical: true, horizontal: true }}
            hideLegend
            axisHighlight={{ x: "line", y: "line" }}
            sx={{
              width: "100%",
              "& .MuiAreaElement-root": { fill: CHART_FILL },
              "& .MuiLineElement-root": {
                strokeWidth: 2.2,
                stroke: CHART_LINE,
              },
            }}
          />
        </div>
      ) : null}

      {liveNorm && liveDataset.length === 0 && !liveLoading ? (
        <div className="admin-dash-last60__empty">
          <p>No visits in this window yet</p>
        </div>
      ) : null}
    </div>
  );
}
