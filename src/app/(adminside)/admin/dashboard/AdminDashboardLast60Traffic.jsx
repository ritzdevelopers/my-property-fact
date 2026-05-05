"use client";

import { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useMatchMaxWidth } from "./useMatchMaxWidth";
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
  const compactChart = useMatchMaxWidth(576);
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

  const chartHeight = compactChart ? 190 : 220;
  const chartMargins = compactChart
    ? { top: 16, right: 4, bottom: 52, left: 2 }
    : { top: 20, right: 8, bottom: 48, left: 6 };
  const xTickSize = compactChart ? 7 : 8;
  const yTickSize = compactChart ? 8 : 9;
  const yAxisWidth = compactChart ? 34 : 40;

  return (
    <div className="admin-dash-last60">
      <div className="admin-dash-last60__head">
        <div>
          <h2 className="admin-dash-last60__title">Live traffic (last hour)</h2>
          <p className="admin-dash-last60__sub">
            People opening pages on your public site — not the admin panel. The big number is the
            rolling last 60 minutes; the chart is one point per minute.
          </p>
        </div>
        {liveUpdatedAt instanceof Date && !Number.isNaN(liveUpdatedAt.getTime()) ? (
          <p className="admin-dash-last60__updated" suppressHydrationWarning>
            Last updated{" "}
            {liveUpdatedAt.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        ) : null}
      </div>

      {liveNorm ? (
        <>
          <div className="admin-dash-last60__hero">
            <p className="admin-dash-last60__hero-label">Visits in the last 60 minutes</p>
            <p className="admin-dash-last60__hero-value">
              {liveNorm.visitsLast1Hour.toLocaleString()}
            </p>
            <p className="admin-dash-last60__hero-hint">Rolling total · updates while you stay here</p>
          </div>
          <div className="admin-dash-last60__kpi-row">
            <TrafficKpiCard
              icon={faBolt}
              label="Last 15 minutes"
              value={liveNorm.visitsLast15.toLocaleString()}
              sub="Short recent window"
            />
            <TrafficKpiCard
              icon={faChartLine}
              label="Last 60 minutes"
              value={liveNorm.visitsLast1Hour.toLocaleString()}
              sub="Matches the headline above"
            />
            <TrafficKpiCard
              icon={faCalendarWeek}
              label="Minutes on chart"
              value={String(liveNorm.windowMinutes || liveDataset.length || 60)}
              sub="One dot per minute"
            />
          </div>
        </>
      ) : null}

      {liveError ? (
        <div className="admin-dash-last60__err" role="alert">
          <p className="admin-dash-last60__err-title">Could not load live traffic</p>
          <p className="admin-dash-last60__err-msg">{liveError}</p>
        </div>
      ) : null}

      {liveLoading && !liveNorm && !liveError ? (
        <div className="admin-dash-last60__skeleton" aria-busy="true">
          <div className="admin-skel admin-dash-last60__skeleton-hero" />
          <div className="admin-skel admin-dash-last60__skeleton-chart" />
        </div>
      ) : null}

      {liveNorm && liveDataset.length > 0 ? (
        <div className="admin-dash-last60__chart-wrap">
          <p className="admin-dash-last60__chart-caption">
            Vertical axis = how many visits happened in that minute (0 is the bottom line).
          </p>
          <div className="admin-dash-last60__chart">
            <LineChart
            dataset={liveDataset}
            xAxis={[
              {
                scaleType: "point",
                dataKey: "tlabel",
                tickLabelStyle: { fontSize: xTickSize, fill: "#6b7280" },
                label: "Minute",
                labelStyle: { fontSize: 10, fill: "#9ca3af", fontWeight: 600 },
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: liveYMax,
                label: "Visits",
                tickLabelStyle: { fontSize: yTickSize, fill: "#6b7280" },
                labelStyle: { fontSize: 10, fill: "#9ca3af", fontWeight: 600 },
                width: yAxisWidth,
              },
            ]}
            series={[
              {
                type: "line",
                dataKey: "views",
                label: "Visits this minute",
                color: CHART_LINE,
                area: true,
                curve: "natural",
                showMark: false,
                valueFormatter: (v) =>
                  v == null || Number.isNaN(v) ? "" : `${Number(v).toLocaleString()} views`,
              },
            ]}
            height={chartHeight}
            margin={chartMargins}
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
        </div>
      ) : null}

      {liveNorm && liveDataset.length === 0 && !liveLoading ? (
        <div className="admin-dash-last60__empty">
          <p>No visits in the last hour yet</p>
          <p className="admin-dash-last60__empty-sub">When visitors browse the public site, counts will show here.</p>
        </div>
      ) : null}
    </div>
  );
}
