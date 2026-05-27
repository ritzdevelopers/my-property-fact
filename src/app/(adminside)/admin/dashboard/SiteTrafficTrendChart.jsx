"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useMatchMaxWidth } from "./useMatchMaxWidth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendDown,
  faArrowTrendUp,
  faMinus,
  faCalendarWeek,
  faBolt,
  faPercent,
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
    const rounded = Math.round(pctSame * 10) / 10;
    const sign = rounded > 0 ? "+" : "";
    if (Math.abs(rounded) < 0.1) {
      return "About the same as yesterday at this time";
    }
    return `${sign}${rounded}% vs yesterday at this time`;
  }
  if (yesterdaySameWindowTotal <= 0 && todayTotalSoFar > 0) {
    return "No visits yesterday in this part of the day — you are building a new baseline";
  }
  if (todayTotalSoFar <= 0 && yesterdaySameWindowTotal <= 0) {
    return "No visits yet in the window we compare";
  }
  return "Yesterday had no visits in this same period";
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
  const compactChart = useMatchMaxWidth(576);
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

  const chartHeight = compactChart ? 220 : 280;
  const chartMargins = compactChart
    ? { top: 22, right: 6, bottom: 52, left: 4 }
    : { top: 28, right: 18, bottom: 44, left: 12 };
  const xTickSize = compactChart ? 7 : 9;
  const yAxisWidth = compactChart ? 38 : 52;
  const yTickSize = compactChart ? 8 : 10;

  const plainSummary =
    hourAnalysis && todayNorm
      ? hourAnalysis.maxCount > 0
        ? `Busiest hour so far: ${hourAnalysis.peakLabel} (${hourAnalysis.maxCount.toLocaleString()} visits). ${hourAnalysis.activeHours} of 24 hours had at least one visit.`
        : "No visits recorded in any hour yet today on this chart."
      : null;

  return (
    <div className="admin-dash-chart__traffic-body">
      {todayNorm ? (
        <>
          <div className="admin-dash-traffic-hero">
            <p className="admin-dash-traffic-hero__label">Public site visits today (so far)</p>
            <p className="admin-dash-traffic-hero__value">
              {todayNorm.todayTotalSoFar.toLocaleString()}
            </p>
            <p className="admin-dash-traffic-hero__hint">
              Counted from midnight
              {todayNorm.zoneId ? ` (${todayNorm.zoneId})` : ""}
              {todayNorm.calendarDate ? ` · ${todayNorm.calendarDate}` : ""}
            </p>
          </div>

          <div className="admin-dash-chart__traffic-head">
            <TodayVsYesterdayPill
              pctSame={todayNorm.percentChangeVsYesterdaySameWindow}
              yesterdaySameWindowTotal={todayNorm.yesterdaySameWindowTotal}
              todayTotalSoFar={todayNorm.todayTotalSoFar}
            />
            {showSuperDetailsLink ? (
              <Link
                title="Open full traffic & logs"
                href="/admin/dashboard/super-tracking"
                className="admin-dash-chart__traffic-details-link"
              >
                Open full traffic & logs
              </Link>
            ) : null}
          </div>

          <p className="admin-dash-chart__traffic-day-meta admin-dash-chart__traffic-day-meta--above-chart">
            Each point on the chart = total visits in that clock hour today (24 hours).
          </p>

          <div className="admin-dash-chart__mui-chart-host">
            {hasTodayHours ? (
              <LineChart
                dataset={todayHourDataset}
                xAxis={[
                  {
                    scaleType: "point",
                    dataKey: "hourLabel",
                    tickLabelStyle: { fontSize: xTickSize, fill: "#6b7280" },
                    label: "Time of day",
                    labelStyle: { fontSize: 11, fill: "#9ca3af", fontWeight: 600 },
                  },
                ]}
                yAxis={[
                  {
                    min: 0,
                    max: todayYMax,
                    label: "Visits that hour",
                    tickLabelStyle: { fontSize: yTickSize, fill: "#6b7280" },
                    labelStyle: { fontSize: 11, fill: "#9ca3af", fontWeight: 600 },
                    width: yAxisWidth,
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
                height={chartHeight}
                margin={chartMargins}
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
                <p>No hourly data yet for today</p>
                <p className="admin-dash-chart__traffic-empty-chart__sub">
                  When the server sends hourly counts, the chart will appear here.
                </p>
              </div>
            )}
          </div>

          {plainSummary ? (
            <p className="admin-dash-traffic-summary-line">{plainSummary}</p>
          ) : null}

          <div className="admin-dash-chart__traffic-analysis admin-dash-chart__traffic-analysis--compact">
            <h3 className="admin-dash-chart__traffic-analysis__title">Quick compare</h3>
            <div className="admin-dash-chart__kpi-row">
              <TrafficKpiCard
                icon={faCalendarWeek}
                label="Yesterday (whole day)"
                value={todayNorm.yesterdayFullDayTotal.toLocaleString()}
                sub="All visits on the previous calendar day"
              />
              <TrafficKpiCard
                icon={faPercent}
                label="Yesterday up to now"
                value={todayNorm.yesterdaySameWindowTotal.toLocaleString()}
                sub="Same hours as right now, yesterday"
              />
              <TrafficKpiCard
                icon={faBolt}
                label="Peak hour today"
                value={
                  hourAnalysis && hourAnalysis.maxCount > 0
                    ? hourAnalysis.maxCount.toLocaleString()
                    : "—"
                }
                sub={
                  hourAnalysis && hourAnalysis.maxCount > 0
                    ? `At ${hourAnalysis.peakLabel}`
                    : "No peak yet"
                }
              />
            </div>
            {todayNorm.todaySoFarPercentOfYesterdayFullDay != null &&
            Number.isFinite(todayNorm.todaySoFarPercentOfYesterdayFullDay) ? (
              <p className="admin-dash-chart__traffic-today-pct-sub">
                Today so far is{" "}
                <strong>{todayNorm.todaySoFarPercentOfYesterdayFullDay.toFixed(0)}%</strong> of
                yesterday&apos;s full-day total — useful when the day is still in progress.
              </p>
            ) : null}
            <details className="admin-dash-traffic-details">
              <summary className="admin-dash-traffic-details__summary">
                Technical details (optional)
              </summary>
              <div className="admin-dash-traffic-details__body">
                <p className="admin-dash-traffic-details__p">
                  Numbers use the server&apos;s official totals where available; the chart is built
                  from hourly buckets and may differ slightly from the headline total because of
                  timing or rounding.
                </p>
                {hourAnalysis ? (
                  <ul className="admin-dash-chart__traffic-analysis__list">
                    <li>
                      <strong>Hours with traffic:</strong> {hourAnalysis.activeHours} of 24
                    </li>
                    <li>
                      <strong>Average per busy hour:</strong>{" "}
                      {hourAnalysis.activeHours > 0
                        ? `${hourAnalysis.avgActive.toFixed(1)} visits`
                        : "—"}
                    </li>
                    <li>
                      <strong>Sum of hourly bars:</strong> {hourAnalysis.sumBuckets.toLocaleString()}
                      {hourAnalysis.sumBuckets !== todayNorm.todayTotalSoFar ? (
                        <span className="admin-dash-chart__traffic-analysis__note">
                          {" "}
                          (headline today total: {todayNorm.todayTotalSoFar.toLocaleString()})
                        </span>
                      ) : null}
                    </li>
                  </ul>
                ) : null}
              </div>
            </details>
          </div>
        </>
      ) : todayLoading ? (
        <div className="admin-dash-chart__traffic-skeleton" aria-busy="true">
          <div className="admin-skel admin-dash-chart__traffic-skeleton-block" />
          <div className="admin-skel admin-dash-chart__traffic-skeleton-block" style={{ height: 240 }} />
          <div className="admin-skel-line admin-skel-line--lg" style={{ width: "70%" }} />
        </div>
      ) : (
        <div className="admin-dash-chart__traffic-placeholder" role="status">
          <p className="admin-dash-chart__traffic-placeholder__title">Today-by-hour chart not ready</p>
          <p className="admin-dash-chart__traffic-placeholder__msg">
            We could not load today&apos;s hourly breakdown yet. The live &quot;last hour&quot; panel on the
            left still works when data is available.
          </p>
          <p className="admin-dash-chart__traffic-placeholder__hint">
            If this stays empty, check that the dashboard API returns today&apos;s hourly traffic for
            super admins.
          </p>
        </div>
      )}
    </div>
  );
}
