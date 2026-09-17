"use client";

export function parseEnquiryMetadata(row) {
  const raw = row?.metadataJson ?? row?.metadata_json ?? null;
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(String(raw));
  } catch {
    return null;
  }
}

function text(value) {
  const s = String(value ?? "").trim();
  return s && s !== "null" ? s : "";
}

function hostPath(value) {
  const raw = text(value);
  if (!raw) return "";
  try {
    const url = raw.includes("://")
      ? new URL(raw)
      : raw.startsWith("/")
        ? new URL(raw, "https://placeholder.local")
        : new URL(`https://${raw.replace(/^\/+/, "")}`);
    const host = url.hostname.includes("placeholder") ? "" : url.host;
    const path = url.pathname === "/" ? "" : url.pathname;
    if (!host) return path || raw.split("?")[0];
    return `${host}${path}`;
  } catch {
    return raw.replace(/^https?:\/\//i, "").split("?")[0];
  }
}

function queryParamFromPages(pages, key) {
  for (const page of pages) {
    const raw = text(page);
    if (!raw || !raw.includes("?")) continue;
    try {
      const url = raw.includes("://")
        ? new URL(raw)
        : new URL(raw, "https://mypropertyfact.in");
      const value = url.searchParams.get(key);
      if (value) return value;
    } catch {
      /* ignore malformed */
    }
  }
  return "";
}

function formatJourneyTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatDuration(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n < 60) return `${Math.round(n)}s`;
  const mins = Math.floor(n / 60);
  const secs = Math.round(n % 60);
  return secs ? `${mins}m ${secs}s` : `${mins}m`;
}

export function buildEnquiryInsight(row) {
  const meta = parseEnquiryMetadata(row);
  const utm = meta?.utm && typeof meta.utm === "object" ? meta.utm : {};
  const device = meta?.device && typeof meta.device === "object" ? meta.device : {};
  const geo = meta?.geo && typeof meta.geo === "object" ? meta.geo : {};
  const session = meta?.session && typeof meta.session === "object" ? meta.session : {};
  const journey = Array.isArray(meta?.journey) ? meta.journey : [];
  const from = String(row?.enquiryFrom || "").trim().toUpperCase();

  const pageCandidates = [
    utm.landing_page,
    session.entry_page,
    ...journey.map((event) => event?.page),
  ];
  const gclid = text(utm.gclid) || queryParamFromPages(pageCandidates, "gclid");
  const fbclid = text(utm.fbclid) || queryParamFromPages(pageCandidates, "fbclid");
  const msclkid = text(utm.msclkid) || queryParamFromPages(pageCandidates, "msclkid");
  const campaignId =
    text(utm.utm_campaign) ||
    queryParamFromPages(pageCandidates, "gad_campaignid") ||
    queryParamFromPages(pageCandidates, "utm_campaign");
  const utmSource = text(utm.utm_source);
  const utmMedium = text(utm.utm_medium);
  const referrer = text(utm.referrer);
  const landingPage = hostPath(utm.landing_page || session.entry_page || "");
  const exitPage = hostPath(utm.exit_page || session.exit_page || "");

  let channel = "Website";
  let channelKey = "web";
  if (from === "APP") {
    channel = "App";
    channelKey = "app";
  } else if (gclid || utmSource.toLowerCase().includes("google") || utmMedium.toLowerCase() === "cpc") {
    channel = "Google Ads";
    channelKey = "ads";
  } else if (fbclid || utmSource.toLowerCase().includes("facebook") || utmSource.toLowerCase().includes("fb")) {
    channel = "Facebook";
    channelKey = "fb";
  } else if (msclkid || utmSource.toLowerCase().includes("bing")) {
    channel = "Microsoft Ads";
    channelKey = "ads";
  } else if (utmSource) {
    channel = utmSource;
    channelKey = "web";
  } else if (/google\.com/i.test(referrer)) {
    channel = "Google Organic";
    channelKey = "organic";
  } else if (referrer) {
    channel = "Referral";
    channelKey = "web";
  }

  const deviceParts = [device.device_type, device.os, device.browser].map(text).filter(Boolean);
  const geoParts = [geo.city || geo.ip_city, geo.state || geo.ip_state].map(text).filter(Boolean);
  const address = text(geo.formatted_address || geo.user_provided_address);
  const journeySteps = journey.map((event) => ({
    time: formatJourneyTime(event?.time),
    action: text(event?.action) || "Visited page",
    page: hostPath(event?.page) || text(event?.page),
    detail: text(event?.detail),
  }));

  const hasInsight = Boolean(
    landingPage ||
      referrer ||
      gclid ||
      campaignId ||
      deviceParts.length ||
      journeySteps.length,
  );

  return {
    channel,
    channelKey,
    referrer,
    landingPage,
    exitPage,
    campaignId,
    gclid,
    utmSource,
    utmMedium,
    utmCampaign: text(utm.utm_campaign),
    deviceLabel: deviceParts.join(" · "),
    geoLabel: geoParts.join(", "),
    address,
    isp: text(geo.isp || geo.organization),
    pagesVisited: session.pages_visited ?? meta?.analytics?.num_visits ?? "",
    timeOnSite: formatDuration(session.avg_time_seconds || meta?.analytics?.avg_session_duration_seconds),
    journey: journeySteps,
    hasInsight,
  };
}

export function EnquiryInsightPanel({ insight, listingPage }) {
  if (!insight?.hasInsight) {
    return (
      <div className="enquiries-insight">
        <p className="enquiries-insight__empty">No acquisition details were captured for this lead.</p>
      </div>
    );
  }

  const facts = [
    ["Channel", insight.channel],
    ["Referrer", insight.referrer],
    ["Landed on", insight.landingPage],
    ["Submitted on", listingPage || insight.exitPage],
    ["Campaign ID", insight.campaignId],
    ["UTM source", insight.utmSource],
    ["UTM medium", insight.utmMedium],
    ["UTM campaign", insight.utmCampaign],
    ["GCLID", insight.gclid],
    ["Device", insight.deviceLabel],
    ["Location", insight.geoLabel],
    ["Address", insight.address],
    ["ISP", insight.isp],
    ["Pages visited", insight.pagesVisited !== "" ? String(insight.pagesVisited) : ""],
    ["Time on site", insight.timeOnSite],
  ].filter(([, value]) => value);

  return (
    <div className="enquiries-insight">
      <div className="enquiries-insight__grid">
        {facts.map(([label, value]) => (
          <div key={label} className="enquiries-insight__fact">
            <span className="enquiries-insight__label">{label}</span>
            <span className="enquiries-insight__value" title={String(value)}>
              {String(value)}
            </span>
          </div>
        ))}
      </div>
      {insight.journey.length ? (
        <div className="enquiries-insight__journey">
          <div className="enquiries-insight__label">Page journey</div>
          <ol className="enquiries-insight__steps">
            {insight.journey.map((step, index) => (
              <li key={`${step.time}-${index}`}>
                <span className="enquiries-insight__step-time">{step.time || "—"}</span>
                <span className="enquiries-insight__step-action">{step.action}</span>
                <span className="enquiries-insight__step-page" title={step.page}>
                  {step.page || "—"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
