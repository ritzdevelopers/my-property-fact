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
  faPercent,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

function normalizeTodayPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  const hourly = Array.isArray(raw.hourlyBuckets)
    ? raw.hourlyBuckets
    : Array.isArray(raw.hourly_buckets)
      ? raw.hourly_buckets
      : [];
  const buckets = hourly.map((b) => ({
    hour: Number(b?.hour ?? 0) || 0,
    label: String(b?.label ?? ""),
    count: Number(b?.count ?? 0) || 0,
  }));
  const todayTotalSoFar =
    Number(raw.todayTotalSoFar ?? raw.today_total_so_far ?? 0) || 0;
  const yesterdayFullDayTotal =
    Number(raw.yesterdayFullDayTotal ?? raw.yesterday_full_day_total ?? 0) || 0;
  const yesterdaySameWindowTotal =
    Number(raw.yesterdaySameWindowTotal ?? raw.yesterday_same_window_total ?? 0) || 0;
  let pctSame =
    raw.percentChangeVsYesterdaySameWindow ??
    raw.percent_change_vs_yesterday_same_window ??
    null;
  if (pctSame != null && pctSame !== "") {
    const n = Number(pctSame);
    pctSame = Number.isFinite(n) ? n : null;
  } else {
    pctSame = null;
  }
  let pctOfFull =
    raw.todaySoFarPercentOfYesterdayFullDay ??
    raw.today_so_far_percent_of_yesterday_full_day ??
    null;
  if (pctOfFull != null && pctOfFull !== "") {
    const n = Number(pctOfFull);
    pctOfFull = Number.isFinite(n) ? n : null;
  } else {
    pctOfFull = null;
  }
  const calendarDate = String(raw.calendarDate ?? raw.calendar_date ?? "");
  const zoneId = String(raw.zoneId ?? raw.zone_id ?? "");
  return {
    buckets,
    todayTotalSoFar,
    yesterdayFullDayTotal,
    yesterdaySameWindowTotal,
    percentChangeVsYesterdaySameWindow: pctSame,
    todaySoFarPercentOfYesterdayFullDay: pctOfFull,
    calendarDate,
    zoneId,
  };
}

function formatTodayVsYesterdayPillLabel(
  pctSame,
  yesterdaySameWindowTotal,
  todayTotalSoFar,
) {
  if (pctSame != null && Number.isFinite(pctSame)) {
    const sign = pctSame > 0 ? "+" : "";
    return `${sign}${pctSame.toFixed(1)}% vs yesterday (same hours)`;
  }
  if (yesterdaySameWindowTotal <= 0 && todayTotalSoFar > 0) {
    return "No same-window traffic yesterday — today is the baseline";
  }
  if (todayTotalSoFar <= 0 && yesterdaySameWindowTotal <= 0) {
    return "No traffic yet today or in the comparison window";
  }
  return "Same hours as yesterday (0 views yesterday)";
}

function TodayVsYesterdayPill({
  pctSame,
  yesterdaySameWindowTotal,
  todayTotalSoFar,
}) {
  const up = pctSame != null && Number.isFinite(pctSame) && pctSame > 0;
  const down = pctSame != null && Number.isFinite(pctSame) && pctSame < 0;
  const neutral =
    pctSame != null && Number.isFinite(pctSame) && Math.abs(pctSame) < 0.05;

  let tone = "admin-dash-chart__wow--neutral";
  if (up && !neutral) tone = "admin-dash-chart__wow--up";
  if (down) tone = "admin-dash-chart__wow--down";

  let icon = faMinus;
  if (up && !neutral) icon = faArrowTrendUp;
  if (down) icon = faArrowTrendDown;

  const label = formatTodayVsYesterdayPillLabel(
    pctSame,
    yesterdaySameWindowTotal,
    todayTotalSoFar,
  );

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

/** Derive simple stats from the 24 hourly buckets returned for today. */
function buildTodayHourAnalysis(buckets) {
  if (!buckets?.length) {
    return null;
  }
  let maxCount = 0;
  let peakLabel = "—";
  let sumBuckets = 0;
  let activeHours = 0;
  for (const b of buckets) {
    sumBuckets += b.count;
    if (b.count > 0) {
      activeHours += 1;
    }
    if (b.count > maxCount) {
      maxCount = b.count;
      peakLabel = b.label || `${String(b.hour).padStart(2, "0")}:00`;
    }
  }
  const avgActive =
    activeHours > 0 ? sumBuckets / activeHours : 0;
  return {
    peakLabel,
    maxCount,
    sumBuckets,
    activeHours,
    avgActive,
  };
}

export default function SiteTrafficTrendChart({
  todayPayload,
  todayLoading,
  showSuperDetailsLink,
}) {
  const todayNorm = useMemo(() => normalizeTodayPayload(todayPayload), [todayPayload]);

  const { todayHourDataset, todayYMax } = useMemo(() => {
    const buckets = todayNorm?.buckets?.length ? todayNorm.buckets : [];
    const rows = buckets.map((b) => ({
      hourLabel: b.label,
      views: b.count,
    }));
    const maxV = rows.length ? Math.max(...rows.map((r) => r.views), 0) : 0;
    return {
      todayHourDataset: rows,
      todayYMax: Math.max(5, Math.ceil(Math.max(maxV, 1) * 1.08)),
    };
  }, [todayNorm]);

  const hourAnalysis = useMemo(
    () => buildTodayHourAnalysis(todayNorm?.buckets),
    [todayNorm],
  );

  const hasTodayHours = todayHourDataset.length > 0;

  return (
    <div className="admin-dash-chart__traffic-body">
      {todayNorm ? (
        <>
          <div className="admin-dash-chart__traffic-head">
            <TodayVsYesterdayPill
              pctSame={todayNorm.percentChangeVsYesterdaySameWindow}
              yesterdaySameWindowTotal={todayNorm.yesterdaySameWindowTotal}
              todayTotalSoFar={todayNorm.todayTotalSoFar}
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

          <p className="admin-dash-chart__traffic-day-meta admin-dash-chart__traffic-day-meta--above-chart">
            {todayNorm.calendarDate || "—"}
            {todayNorm.zoneId ? ` · ${todayNorm.zoneId}` : ""} · Full-day view (24 hourly buckets)
          </p>

          <div className="admin-dash-chart__mui-chart-host">
            {hasTodayHours ? (
              <LineChart
                dataset={todayHourDataset}
                xAxis={[
                  {
                    scaleType: "point",
                    dataKey: "hourLabel",
                    tickLabelStyle: { fontSize: 9, fill: "#6b7280" },
                    label: "Hour (today)",
                    labelStyle: { fontSize: 11, fill: "#9ca3af", fontWeight: 600 },
                  },
                ]}
                yAxis={[
                  {
                    min: 0,
                    max: todayYMax,
                    label: "Views / hour",
                    tickLabelStyle: { fontSize: 10, fill: "#6b7280" },
                    labelStyle: { fontSize: 11, fill: "#9ca3af", fontWeight: 600 },
                    width: 52,
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
                <p>No hourly buckets yet</p>
              </div>
            )}
          </div>

          <div className="admin-dash-chart__traffic-analysis">
            <h3 className="admin-dash-chart__traffic-analysis__title">Today&apos;s analysis</h3>
            <p className="admin-dash-chart__traffic-analysis__lead">
              Summary and percentages use server totals; the breakdown below is computed from the
              hourly chart for this calendar day.
            </p>

            {todayNorm.todaySoFarPercentOfYesterdayFullDay != null &&
            Number.isFinite(todayNorm.todaySoFarPercentOfYesterdayFullDay) ? (
              <p className="admin-dash-chart__traffic-today-pct-sub">
                So far today ={" "}
                <strong>{todayNorm.todaySoFarPercentOfYesterdayFullDay.toFixed(1)}%</strong> of all
                visits on the previous full calendar day.
              </p>
            ) : null}

            <div className="admin-dash-chart__kpi-row">
              <TrafficKpiCard
                icon={faChartLine}
                label="Today (so far)"
                value={todayNorm.todayTotalSoFar.toLocaleString()}
                sub="Server total · since midnight"
              />
              <TrafficKpiCard
                icon={faCalendarWeek}
                label="Yesterday (full day)"
                value={todayNorm.yesterdayFullDayTotal.toLocaleString()}
                sub="Previous calendar day"
              />
              <TrafficKpiCard
                icon={faPercent}
                label="Same hours yesterday"
                value={todayNorm.yesterdaySameWindowTotal.toLocaleString()}
                sub="Views in same clock window"
              />
            </div>

            {hourAnalysis ? (
              <ul className="admin-dash-chart__traffic-analysis__list">
                <li>
                  <strong>Peak hour:</strong>{" "}
                  {hourAnalysis.maxCount > 0
                    ? `${hourAnalysis.peakLabel} (${hourAnalysis.maxCount.toLocaleString()} views)`
                    : "No views yet in any hour"}
                </li>
                <li>
                  <strong>Active hours:</strong>{" "}
                  {hourAnalysis.activeHours} of 24 with at least one view
                </li>
                <li>
                  <strong>Average when active:</strong>{" "}
                  {hourAnalysis.activeHours > 0
                    ? `${(hourAnalysis.avgActive).toFixed(1)} views / hour`
                    : "—"}
                </li>
                <li>
                  <strong>Sum of hourly buckets:</strong>{" "}
                  {hourAnalysis.sumBuckets.toLocaleString()}
                  {hourAnalysis.sumBuckets !== todayNorm.todayTotalSoFar ? (
                    <span className="admin-dash-chart__traffic-analysis__note">
                      {" "}
                      (server total {todayNorm.todayTotalSoFar.toLocaleString()} may differ slightly
                      from rounding or timing)
                    </span>
                  ) : null}
                </li>
              </ul>
            ) : null}

            <div className="admin-dash-chart__kpi-row admin-dash-chart__kpi-row--analysis-mini">
              <TrafficKpiCard
                icon={faBolt}
                label="Peak (chart)"
                value={
                  hourAnalysis && hourAnalysis.maxCount > 0
                    ? hourAnalysis.maxCount.toLocaleString()
                    : "—"
                }
                sub={hourAnalysis && hourAnalysis.maxCount > 0 ? hourAnalysis.peakLabel : "—"}
              />
              <TrafficKpiCard
                icon={faClock}
                label="Busy hours"
                value={hourAnalysis ? String(hourAnalysis.activeHours) : "—"}
                sub="Hours with traffic"
              />
              <TrafficKpiCard
                icon={faChartLine}
                label="Avg / active hr"
                value={
                  hourAnalysis && hourAnalysis.activeHours > 0
                    ? hourAnalysis.avgActive.toFixed(1)
                    : "—"
                }
                sub="From hourly data"
              />
            </div>
          </div>
        </>
      ) : todayLoading ? (
        <div className="admin-dash-chart__traffic-loading admin-dash-chart__traffic-loading--compact" aria-busy="true">
          <p className="admin-dash-chart__traffic-loading-text">Loading today&apos;s chart…</p>
        </div>
      ) : (
        <div className="admin-dash-chart__traffic-placeholder" role="status">
          <p className="admin-dash-chart__traffic-placeholder__title">24-hour daily analysis</p>
          <p className="admin-dash-chart__traffic-placeholder__msg">
            The Full Chart and Breakdown Appear When The Server Returns Today&apos;s Hourly Traffic.
          </p>
          <p className="admin-dash-chart__traffic-placeholder__hint">
            Use <strong>Last 60 minutes</strong> on the left for live traffic while this loads.
            Your backend must expose today&apos;s hourly traffic for this panel to fill in.
          </p>
        </div>
      )}
    </div>
  );
}
