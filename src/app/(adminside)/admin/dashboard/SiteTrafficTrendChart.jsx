"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendDown,
  faArrowTrendUp,
  faChartLine,
  faMinus,
  faCalendarWeek,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

function normalizeTrendPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  const daily = Array.isArray(raw.dailyBuckets)
    ? raw.dailyBuckets
    : Array.isArray(raw.daily_buckets)
      ? raw.daily_buckets
      : [];
  const buckets = daily.map((b) => ({
    date: String(b?.date ?? ""),
    count: Number(b?.count ?? 0) || 0,
  }));
  const visitsLast7 =
    Number(raw.visitsLast7Days ?? raw.visits_last_7_days ?? 0) || 0;
  const visitsPrior7 =
    Number(raw.visitsPrior7Days ?? raw.visits_prior_7_days ?? 0) || 0;
  let pct =
    raw.percentChangeVsPrior7Days ?? raw.percent_change_vs_prior7_days ?? null;
  if (pct != null && pct !== "") {
    const n = Number(pct);
    pct = Number.isFinite(n) ? n : null;
  } else {
    pct = null;
  }
  return { buckets, visitsLast7, visitsPrior7, percentChange: pct };
}

function formatShortDate(isoDate) {
  if (!isoDate || typeof isoDate !== "string") return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return isoDate;
}

function formatWowLabel(percentChange, visitsLast7, visitsPrior7) {
  if (percentChange != null && Number.isFinite(percentChange)) {
    const sign = percentChange > 0 ? "+" : "";
    return `${sign}${percentChange.toFixed(1)}% vs prior week`;
  }
  if (visitsPrior7 <= 0 && visitsLast7 > 0) {
    return "No prior week to compare";
  }
  if (visitsLast7 <= 0 && visitsPrior7 <= 0) {
    return "No traffic in window yet";
  }
  return "Flat vs prior week (0 prior views)";
}

function WowPill({ percentChange, visitsLast7, visitsPrior7 }) {
  const up =
    percentChange != null && Number.isFinite(percentChange) && percentChange > 0;
  const down =
    percentChange != null && Number.isFinite(percentChange) && percentChange < 0;
  const neutral =
    percentChange != null &&
    Number.isFinite(percentChange) &&
    Math.abs(percentChange) < 0.05;

  let tone = "admin-dash-chart__wow--neutral";
  if (up && !neutral) tone = "admin-dash-chart__wow--up";
  if (down) tone = "admin-dash-chart__wow--down";

  let icon = faMinus;
  if (up && !neutral) icon = faArrowTrendUp;
  if (down) icon = faArrowTrendDown;

  const label = formatWowLabel(percentChange, visitsLast7, visitsPrior7);

  return (
    <div className={`admin-dash-chart__wow ${tone}`} title={label}>
      <FontAwesomeIcon icon={icon} className="admin-dash-chart__wow-icon" aria-hidden />
      <span className="admin-dash-chart__wow-text">{label}</span>
    </div>
  );
}

function TrafficKpiCard({ icon, label, value, sub }) {
  return (
    <div className="admin-dash-chart__kpi-card">
      <div className="admin-dash-chart__kpi-card-icon" aria-hidden>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="admin-dash-chart__kpi-card-body">
        <p className="admin-dash-chart__kpi-card-label">{label}</p>
        <p className="admin-dash-chart__kpi-card-value">{value}</p>
        {sub ? <p className="admin-dash-chart__kpi-card-sub">{sub}</p> : null}
      </div>
    </div>
  );
}

const CHART_LINE = "#0d9488";
const CHART_FILL = "rgba(13, 148, 136, 0.12)";

export default function SiteTrafficTrendChart({
  payload,
  loading,
  error,
  showSuperDetailsLink,
}) {
  const norm = useMemo(() => normalizeTrendPayload(payload), [payload]);

  const { dataset, peak } = useMemo(() => {
    const buckets = norm?.buckets?.length ? norm.buckets : [];
    let best = { count: 0, date: "" };
    const rows = buckets.map((b) => {
      if (b.count > best.count) best = { count: b.count, date: b.date };
      return {
        dateLabel: formatShortDate(b.date),
        dateRaw: b.date,
        views: b.count,
      };
    });
    return { dataset: rows, peak: best };
  }, [norm]);

  if (loading && !norm) {
    return (
      <div className="admin-dash-chart__traffic-loading" aria-busy="true">
        <p className="admin-dash-chart__traffic-loading-text">Loading traffic…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dash-chart__traffic-error" role="alert">
        <p className="admin-dash-chart__traffic-error-title">Could not load traffic</p>
        <p className="admin-dash-chart__traffic-error-msg">{error}</p>
      </div>
    );
  }

  const hasPoints = dataset.length > 0;

  return (
    <div className="admin-dash-chart__traffic-body">
      {norm ? (
        <div className="admin-dash-chart__traffic-head">
          <WowPill
            percentChange={norm.percentChange}
            visitsLast7={norm.visitsLast7}
            visitsPrior7={norm.visitsPrior7}
          />
          {showSuperDetailsLink ? (
            <Link
              href="/admin/dashboard/super-tracking"
              className="admin-dash-chart__traffic-details-link"
            >
              Full analytics
            </Link>
          ) : null}
        </div>
      ) : null}

      {norm ? (
        <div className="admin-dash-chart__kpi-row">
          <TrafficKpiCard
            icon={faChartLine}
            label="Last 7 days"
            value={norm.visitsLast7.toLocaleString()}
            sub="Total views"
          />
          <TrafficKpiCard
            icon={faCalendarWeek}
            label="Prior 7 days"
            value={norm.visitsPrior7.toLocaleString()}
            sub="Baseline window"
          />
          <TrafficKpiCard
            icon={faBolt}
            label="Peak day"
            value={
              peak.count > 0 ? peak.count.toLocaleString() : "—"
            }
            sub={
              peak.count > 0
                ? formatShortDate(peak.date)
                : "No spike in range"
            }
          />
        </div>
      ) : null}

      <div className="admin-dash-chart__mui-chart-host">
        {hasPoints ? (
          <LineChart
            dataset={dataset}
            xAxis={[
              {
                scaleType: "point",
                dataKey: "dateLabel",
                tickLabelStyle: { fontSize: 10, fill: "#6b7280" },
                label: "Date",
                labelStyle: { fontSize: 11, fill: "#9ca3af", fontWeight: 600 },
              },
            ]}
            yAxis={[
              {
                label: "Views",
                tickLabelStyle: { fontSize: 10, fill: "#6b7280" },
                labelStyle: { fontSize: 11, fill: "#9ca3af", fontWeight: 600 },
                width: 44,
              },
            ]}
            series={[
              {
                type: "line",
                dataKey: "views",
                label: "Page views",
                color: CHART_LINE,
                area: true,
                curve: "natural",
                showMark: true,
                valueFormatter: (v) =>
                  v == null || Number.isNaN(v) ? "" : `${Number(v).toLocaleString()} views`,
              },
            ]}
            height={280}
            margin={{ top: 28, right: 18, bottom: 44, left: 12 }}
            grid={{ vertical: true, horizontal: true }}
            hideLegend
            axisHighlight={{ x: "line", y: "line" }}
            sx={{
              width: "100%",
              "& .MuiAreaElement-root": { fill: CHART_FILL },
              "& .MuiLineElement-root": {
                strokeWidth: 2.5,
                stroke: CHART_LINE,
              },
              "& .MuiMarkElement-root": {
                fill: "#fff",
                stroke: CHART_LINE,
                strokeWidth: 2,
              },
            }}
          />
        ) : (
          <div className="admin-dash-chart__traffic-empty-chart">
            <p>No daily buckets yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
