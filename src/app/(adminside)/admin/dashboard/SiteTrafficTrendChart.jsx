"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useMatchMaxWidth } from "./useMatchMaxWidth";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Minus,
  Sparkles,
} from "lucide-react";

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
    Number(raw.yesterdaySameWindowTotal ?? raw.yesterday_same_window_total ?? 0) ||
    0;
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
  const calendarDate = String(raw.calendarDate ?? raw.calendar_date ?? "");
  const zoneId = String(raw.zoneId ?? raw.zone_id ?? "");
  return {
    buckets,
    todayTotalSoFar,
    yesterdayFullDayTotal,
    yesterdaySameWindowTotal,
    percentChangeVsYesterdaySameWindow: pctSame,
    calendarDate,
    zoneId,
  };
}

function buildTodayHourAnalysis(buckets) {
  if (!buckets?.length) return null;
  let maxCount = 0;
  let peakLabel = "—";
  let activeHours = 0;
  for (const b of buckets) {
    if (b.count > 0) activeHours += 1;
    if (b.count > maxCount) {
      maxCount = b.count;
      peakLabel = b.label || `${String(b.hour).padStart(2, "0")}:00`;
    }
  }
  return { peakLabel, maxCount, activeHours };
}

const CHART_LINE = "#2563eb";
const CHART_FILL = "rgba(37, 99, 235, 0.14)";

function ComparePill({ pctSame, yesterdaySameWindowTotal, todayTotalSoFar }) {
  const up = pctSame != null && Number.isFinite(pctSame) && pctSame > 0.05;
  const down = pctSame != null && Number.isFinite(pctSame) && pctSame < -0.05;

  let label = "No comparable visits yet";
  if (pctSame != null && Number.isFinite(pctSame)) {
    const rounded = Math.round(pctSame * 10) / 10;
    if (Math.abs(rounded) < 0.1) label = "Same as yesterday · this window";
    else label = `${rounded > 0 ? "+" : ""}${rounded}% vs yesterday`;
  } else if (yesterdaySameWindowTotal <= 0 && todayTotalSoFar > 0) {
    label = "New baseline vs yesterday";
  }

  return (
    <span
      className={`mpf-traffic__pill ${
        up ? "mpf-traffic__pill--up" : down ? "mpf-traffic__pill--down" : ""
      }`}
    >
      {up ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : down ? (
        <ArrowDownRight className="h-3.5 w-3.5" />
      ) : (
        <Minus className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

export default function SiteTrafficTrendChart({
  todayPayload,
  todayLoading,
  showSuperDetailsLink,
}) {
  const compactChart = useMatchMaxWidth(576);
  const todayNorm = useMemo(
    () => normalizeTodayPayload(todayPayload),
    [todayPayload],
  );

  const { todayHourDataset, todayYMax } = useMemo(() => {
    const buckets = todayNorm?.buckets?.length ? todayNorm.buckets : [];
    const rows = buckets.map((b) => ({
      hourLabel: b.label,
      views: b.count,
    }));
    const maxV = rows.length ? Math.max(...rows.map((r) => r.views), 0) : 0;
    return {
      todayHourDataset: rows,
      todayYMax: Math.max(5, Math.ceil(Math.max(maxV, 1) * 1.1)),
    };
  }, [todayNorm]);

  const hourAnalysis = useMemo(
    () => buildTodayHourAnalysis(todayNorm?.buckets),
    [todayNorm],
  );

  const chartHeight = compactChart ? 210 : 248;
  const chartMargins = compactChart
    ? { top: 16, right: 6, bottom: 36, left: 2 }
    : { top: 18, right: 12, bottom: 38, left: 6 };

  if (todayLoading && !todayNorm) {
    return (
      <div className="mpf-traffic" aria-busy="true">
        <div className="mpf-skel-line" style={{ height: 84, borderRadius: 14 }} />
        <div className="mpf-skel-line" style={{ height: 220, borderRadius: 14, marginTop: 12 }} />
      </div>
    );
  }

  if (!todayNorm) {
    return (
      <div className="mpf-traffic__empty">
        <Sparkles className="h-5 w-5" />
        <p>Today&apos;s traffic chart is not ready</p>
        <span>Hourly public-site visits will show here when available.</span>
      </div>
    );
  }

  return (
    <div className="mpf-traffic">
      <div className="mpf-traffic__top">
        <div className="mpf-traffic__hero mpf-traffic__hero--indigo">
          <div>
            <p className="mpf-traffic__hero-label">Visits today</p>
            <p className="mpf-traffic__hero-value">
              {todayNorm.todayTotalSoFar.toLocaleString()}
            </p>
            <p className="mpf-traffic__hero-hint">
              Since midnight
              {todayNorm.zoneId ? ` · ${todayNorm.zoneId}` : ""}
              {todayNorm.calendarDate ? ` · ${todayNorm.calendarDate}` : ""}
            </p>
          </div>
        </div>

        <div className="mpf-traffic__top-side">
          <ComparePill
            pctSame={todayNorm.percentChangeVsYesterdaySameWindow}
            yesterdaySameWindowTotal={todayNorm.yesterdaySameWindowTotal}
            todayTotalSoFar={todayNorm.todayTotalSoFar}
          />
          {showSuperDetailsLink ? (
            <Link
              href="/admin/dashboard/super-tracking"
              className="mpf-traffic__link"
              title="Open full traffic & logs"
            >
              Full traffic & logs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mpf-traffic__chart mpf-traffic__chart--tall">
        {todayHourDataset.length > 0 ? (
          <LineChart
            dataset={todayHourDataset}
            xAxis={[
              {
                scaleType: "point",
                dataKey: "hourLabel",
                tickLabelStyle: { fontSize: compactChart ? 7 : 9, fill: "#9ca3af" },
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: todayYMax,
                tickLabelStyle: { fontSize: compactChart ? 8 : 9, fill: "#9ca3af" },
                width: compactChart ? 30 : 40,
              },
            ]}
            series={[
              {
                type: "line",
                dataKey: "views",
                label: "Visits",
                color: CHART_LINE,
                area: true,
                curve: "natural",
                showMark: true,
                valueFormatter: (v) =>
                  v == null || Number.isNaN(v)
                    ? ""
                    : `${Number(v).toLocaleString()} visits`,
              },
            ]}
            height={chartHeight}
            margin={chartMargins}
            grid={{ vertical: false, horizontal: true }}
            hideLegend
            axisHighlight={{ x: "line", y: "none" }}
            sx={{
              width: "100%",
              "& .MuiChartsAxis-line": { stroke: "#e5e7eb" },
              "& .MuiChartsAxis-tick": { stroke: "#e5e7eb" },
              "& .MuiChartsGrid-line": { stroke: "#f1f5f9" },
              "& .MuiAreaElement-root": { fill: CHART_FILL },
              "& .MuiLineElement-root": {
                strokeWidth: 2.6,
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
          <div className="mpf-traffic__empty mpf-traffic__empty--inset">
            <p>No hourly data yet for today</p>
          </div>
        )}
      </div>

      <div className="mpf-traffic__kpis mpf-traffic__kpis--3">
        <div className="mpf-traffic__kpi">
          <span className="mpf-traffic__kpi-icon mpf-traffic__kpi-icon--slate">
            <CalendarDays className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="mpf-traffic__kpi-label">Yesterday</p>
            <p className="mpf-traffic__kpi-value">
              {todayNorm.yesterdayFullDayTotal.toLocaleString()}
            </p>
            <p className="mpf-traffic__kpi-sub">Full day</p>
          </div>
        </div>
        <div className="mpf-traffic__kpi">
          <span className="mpf-traffic__kpi-icon mpf-traffic__kpi-icon--blue">
            <Clock3 className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="mpf-traffic__kpi-label">Same window</p>
            <p className="mpf-traffic__kpi-value">
              {todayNorm.yesterdaySameWindowTotal.toLocaleString()}
            </p>
            <p className="mpf-traffic__kpi-sub">Yesterday to now</p>
          </div>
        </div>
        <div className="mpf-traffic__kpi">
          <span className="mpf-traffic__kpi-icon mpf-traffic__kpi-icon--amber">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="mpf-traffic__kpi-label">Peak hour</p>
            <p className="mpf-traffic__kpi-value">
              {hourAnalysis?.maxCount > 0
                ? hourAnalysis.maxCount.toLocaleString()
                : "—"}
            </p>
            <p className="mpf-traffic__kpi-sub">
              {hourAnalysis?.maxCount > 0 ? `At ${hourAnalysis.peakLabel}` : "No peak yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
