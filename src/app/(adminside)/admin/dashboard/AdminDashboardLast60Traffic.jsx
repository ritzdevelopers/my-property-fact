"use client";

import { useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useMatchMaxWidth } from "./useMatchMaxWidth";
import { Activity, Clock3, Zap } from "lucide-react";

function formatShortDate(isoDate) {
  if (!isoDate || typeof isoDate !== "string") return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
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
    Number(raw.windowMinutes ?? raw.window_minutes ?? buckets.length) ||
    buckets.length;
  return { buckets, visitsLast15, visitsLast1Hour, windowMinutes };
}

const CHART_LINE = "#2563eb";
const CHART_FILL = "rgba(37, 99, 235, 0.12)";

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
      liveYMax: Math.max(4, Math.ceil(Math.max(maxV, 1) * 1.15)),
    };
  }, [liveNorm]);

  const chartHeight = compactChart ? 168 : 190;
  const chartMargins = compactChart
    ? { top: 12, right: 4, bottom: 28, left: 2 }
    : { top: 14, right: 8, bottom: 30, left: 4 };

  if (liveLoading && !liveNorm && !liveError) {
    return (
      <div className="mpf-traffic" aria-busy="true">
        <div className="mpf-skel-line" style={{ height: 72, borderRadius: 14 }} />
        <div className="mpf-skel-line" style={{ height: 160, borderRadius: 14, marginTop: 12 }} />
      </div>
    );
  }

  if (liveError) {
    return (
      <div className="mpf-traffic mpf-traffic--error" role="alert">
        <p className="mpf-traffic__err-title">Could not load live traffic</p>
        <p className="mpf-traffic__err-msg">{liveError}</p>
      </div>
    );
  }

  return (
    <div className="mpf-traffic">
      <div className="mpf-traffic__hero mpf-traffic__hero--blue">
        <div>
          <p className="mpf-traffic__hero-label">Visits · last 60 min</p>
          <p className="mpf-traffic__hero-value">
            {(liveNorm?.visitsLast1Hour ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="mpf-traffic__hero-meta">
          {liveUpdatedAt instanceof Date && !Number.isNaN(liveUpdatedAt.getTime()) ? (
            <span suppressHydrationWarning>
              Updated{" "}
              {liveUpdatedAt.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          ) : (
            <span>Live rolling window</span>
          )}
        </div>
      </div>

      <div className="mpf-traffic__kpis">
        <div className="mpf-traffic__kpi">
          <span className="mpf-traffic__kpi-icon mpf-traffic__kpi-icon--amber">
            <Zap className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="mpf-traffic__kpi-label">15 min</p>
            <p className="mpf-traffic__kpi-value">
              {(liveNorm?.visitsLast15 ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mpf-traffic__kpi">
          <span className="mpf-traffic__kpi-icon mpf-traffic__kpi-icon--blue">
            <Activity className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="mpf-traffic__kpi-label">60 min</p>
            <p className="mpf-traffic__kpi-value">
              {(liveNorm?.visitsLast1Hour ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mpf-traffic__kpi">
          <span className="mpf-traffic__kpi-icon mpf-traffic__kpi-icon--slate">
            <Clock3 className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="mpf-traffic__kpi-label">Points</p>
            <p className="mpf-traffic__kpi-value">
              {String(liveNorm?.windowMinutes || liveDataset.length || 60)}
            </p>
          </div>
        </div>
      </div>

      {liveDataset.length > 0 ? (
        <div className="mpf-traffic__chart">
          <LineChart
            dataset={liveDataset}
            xAxis={[
              {
                scaleType: "point",
                dataKey: "tlabel",
                tickLabelStyle: { fontSize: 7, fill: "#9ca3af" },
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: liveYMax,
                tickLabelStyle: { fontSize: 8, fill: "#9ca3af" },
                width: 28,
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
                showMark: false,
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
                strokeWidth: 2.4,
                stroke: CHART_LINE,
              },
            }}
          />
        </div>
      ) : (
        <div className="mpf-traffic__empty">
          <Activity className="h-5 w-5" />
          <p>No visits in the last hour yet</p>
          <span>Public site traffic will appear here live.</span>
        </div>
      )}
    </div>
  );
}
