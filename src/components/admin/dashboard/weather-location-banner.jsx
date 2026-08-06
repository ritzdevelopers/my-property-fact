"use client";

import * as React from "react";
import {
  MapPin,
  CloudRain,
  CloudSun,
  Sun,
  Cloud,
  CloudFog,
  CloudSnow,
  CloudLightning,
  Droplets,
  Wind,
  Eye,
  Thermometer,
  ArrowRight,
  X,
  Globe,
  Wifi,
  Navigation,
  Crosshair,
} from "lucide-react";

const WEATHER_BG = {
  rain: "/mpf-weather/rain.jpg",
  storm: "/mpf-weather/storm.jpg",
  sunny: "/mpf-weather/sunny.jpg",
  partly: "/mpf-weather/partly.jpg",
  cloudy: "/mpf-weather/cloudy.jpg",
  fog: "/mpf-weather/fog.jpg",
  snow: "/mpf-weather/snow.jpg",
};

function resolveCondition(code, precipitation = 0) {
  // Active precip wins even if WMO code still says overcast
  if (precipitation > 0.2) {
    if ([95, 96, 99].includes(code)) return "storm";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
    return "rain";
  }
  if (code == null) return "cloudy";
  if (code === 0) return "sunny";
  if (code === 1 || code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "cloudy";
}

function resolveConditionLabel(code, precipitation = 0) {
  if (precipitation > 0.2 && ![71, 73, 75, 77, 85, 86, 95, 96, 99].includes(code)) {
    return precipitation >= 2.5 ? "Heavy Rain" : "Rain";
  }
  return conditionLabel(code);
}

function conditionLabel(code) {
  const map = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Dense Drizzle",
    56: "Freezing Drizzle",
    57: "Freezing Drizzle",
    61: "Light Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Freezing Rain",
    67: "Freezing Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Light Showers",
    81: "Showers",
    82: "Heavy Showers",
    85: "Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Severe Storm",
  };
  return map[code] || "Unknown";
}

function WeatherIcon({ condition, className }) {
  const props = { className, strokeWidth: 1.5 };
  switch (condition) {
    case "sunny":
      return <Sun {...props} />;
    case "partly":
      return <CloudSun {...props} />;
    case "rain":
      return <CloudRain {...props} />;
    case "snow":
      return <CloudSnow {...props} />;
    case "storm":
      return <CloudLightning {...props} />;
    case "fog":
      return <CloudFog {...props} />;
    default:
      return <Cloud {...props} />;
  }
}

function formatLocation(geo) {
  if (!geo) return "Detecting location…";
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.length ? parts.join(", ") : geo.country || "Unknown location";
}

function getBrowserPosition(timeoutMs = 8000, maximumAge = 60_000) {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge },
    );
  });
}

const REFRESH_MS = 5 * 60 * 1000;

function DetailsModal({ open, onClose, geo, weather }) {
  if (!open) return null;

  return (
    <div className="mpf-wx-modal" role="dialog" aria-modal="true" aria-labelledby="mpf-wx-modal-title">
      <button type="button" className="mpf-wx-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="mpf-wx-modal__panel">
        <div className="mpf-wx-modal__head">
          <h3 id="mpf-wx-modal-title">Location &amp; Network Details</h3>
          <button type="button" className="mpf-wx-modal__close" onClick={onClose} aria-label="Close details">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mpf-wx-modal__grid">
          <div className="mpf-wx-modal__item">
            <Wifi className="h-4 w-4" />
            <div>
              <span>IP Address</span>
              <strong>{geo?.ip || "—"}</strong>
            </div>
          </div>
          <div className="mpf-wx-modal__item">
            <Globe className="h-4 w-4" />
            <div>
              <span>ISP / Org</span>
              <strong>{geo?.isp || "—"}</strong>
            </div>
          </div>
          <div className="mpf-wx-modal__item">
            <MapPin className="h-4 w-4" />
            <div>
              <span>City</span>
              <strong>{geo?.city || "—"}</strong>
            </div>
          </div>
          <div className="mpf-wx-modal__item">
            <Navigation className="h-4 w-4" />
            <div>
              <span>Region / State</span>
              <strong>{geo?.region || "—"}</strong>
            </div>
          </div>
          <div className="mpf-wx-modal__item">
            <Globe className="h-4 w-4" />
            <div>
              <span>Country</span>
              <strong>
                {geo?.country || "—"}
                {geo?.countryCode ? ` (${geo.countryCode})` : ""}
              </strong>
            </div>
          </div>
          <div className="mpf-wx-modal__item">
            <Crosshair className="h-4 w-4" />
            <div>
              <span>Location Source</span>
              <strong>
                {geo?.source === "gps"
                  ? "GPS (precise)"
                  : geo?.source === "ip"
                    ? "IP geolocation"
                    : "—"}
              </strong>
            </div>
          </div>
          <div className="mpf-wx-modal__item">
            <Navigation className="h-4 w-4" />
            <div>
              <span>Coordinates</span>
              <strong>
                {geo?.lat != null && geo?.lon != null
                  ? `${Number(geo.lat).toFixed(4)}, ${Number(geo.lon).toFixed(4)}`
                  : "—"}
              </strong>
            </div>
          </div>
          <div className="mpf-wx-modal__item">
            <Thermometer className="h-4 w-4" />
            <div>
              <span>Weather</span>
              <strong>
                {weather
                  ? `${Math.round(weather.temp)}°C · ${resolveConditionLabel(
                      weather.code,
                      weather.precipitation ?? 0,
                    )}`
                  : "—"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RainLayer({ heavy = false }) {
  const count = heavy ? 90 : 70;
  return (
    <div className={`mpf-wx-rain ${heavy ? "mpf-wx-rain--heavy" : ""}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            "--i": i,
            "--x": `${(i * 37) % 100}%`,
            "--d": `${0.55 + ((i * 17) % 45) / 100}s`,
            "--delay": `${-((i * 13) % 100) / 100}s`,
            "--h": `${10 + ((i * 7) % 16)}px`,
          }}
        />
      ))}
    </div>
  );
}

function CloudLayer() {
  return (
    <div className="mpf-wx-clouds" aria-hidden="true">
      <span className="mpf-wx-clouds__blob mpf-wx-clouds__blob--1" />
      <span className="mpf-wx-clouds__blob mpf-wx-clouds__blob--2" />
      <span className="mpf-wx-clouds__blob mpf-wx-clouds__blob--3" />
    </div>
  );
}

export function WeatherLocationBanner() {
  const [geo, setGeo] = React.useState(null);
  const [weather, setWeather] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [now, setNow] = React.useState(new Date());
  const [bgLoaded, setBgLoaded] = React.useState(false);
  const gpsRef = React.useRef(null);
  const hasLoadedRef = React.useRef(false);

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const loadData = React.useCallback(async ({ silent = false, forceGps = false } = {}) => {
    if (!silent || !hasLoadedRef.current) setLoading(true);
    setError("");
    try {
      const gps = await getBrowserPosition(
        forceGps ? 10000 : 7000,
        forceGps ? 0 : 120_000,
      );
      if (gps?.lat != null && gps?.lon != null) {
        gpsRef.current = gps;
      }

      const coords = gpsRef.current;
      const qs =
        coords?.lat != null && coords?.lon != null
          ? `?lat=${coords.lat}&lon=${coords.lon}&_=${Date.now()}`
          : `?_=${Date.now()}`;

      const res = await fetch(`/api/admin/geo-weather${qs}`, {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Could not detect your location");
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Location lookup failed");

      setGeo(data.geo || null);
      setWeather(data.weather || null);
      hasLoadedRef.current = true;
    } catch (e) {
      if (!hasLoadedRef.current) {
        setError(e.message || "Failed to load weather");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
    const t = setInterval(() => void loadData({ silent: true }), REFRESH_MS);
    const onFocus = () => void loadData({ silent: true });
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadData]);

  const precip = weather?.precipitation ?? 0;
  const condition = weather ? resolveCondition(weather.code, precip) : "cloudy";
  const locationLabel = formatLocation(geo);
  const bgSrc = WEATHER_BG[condition] || WEATHER_BG.cloudy;
  const isWet = condition === "rain" || condition === "storm";

  React.useEffect(() => {
    setBgLoaded(false);
  }, [bgSrc]);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="mpf-wx-banner mpf-wx-banner--loading" aria-busy="true">
        <div className="mpf-apple-loader" role="status" aria-label="Loading weather">
          <div className="mpf-apple-loader__spinner">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} style={{ "--i": i }} />
            ))}
          </div>
          <p className="mpf-apple-loader__text">Fetching location &amp; weather…</p>
        </div>
      </div>
    );
  }

  if (error && !geo) {
    return (
      <div className="mpf-wx-banner mpf-wx-banner--error">
        <p>{error}</p>
        <button
          type="button"
          className="mpf-wx-ip__link"
          onClick={() => void loadData({ forceGps: true })}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`mpf-wx-banner mpf-wx-banner--${condition}`}>
        <img
          className={`mpf-wx-banner__photo ${bgLoaded ? "is-loaded" : ""}`}
          src={bgSrc}
          alt=""
          aria-hidden="true"
          onLoad={() => setBgLoaded(true)}
        />
        <div className="mpf-wx-banner__overlay" aria-hidden="true" />
        <CloudLayer />
        {isWet && <RainLayer heavy={condition === "storm"} />}
        {condition === "snow" && (
          <div className="mpf-wx-snow" aria-hidden="true">
            {Array.from({ length: 36 }).map((_, i) => (
              <span key={i} style={{ "--i": i, "--x": `${(i * 29) % 100}%` }} />
            ))}
          </div>
        )}
        {condition === "sunny" && <div className="mpf-wx-sun-glow" aria-hidden="true" />}

        <div className="mpf-wx-banner__content">
          <div className="mpf-wx-banner__weather">
            <div className="mpf-wx-banner__loc">
              <MapPin className="h-3.5 w-3.5" />
              <span>{locationLabel}</span>
              {geo?.source === "gps" ? (
                <em className="mpf-wx-banner__gps" title="Precise GPS location">
                  GPS
                </em>
              ) : (
                <button
                  type="button"
                  className="mpf-wx-banner__gps-btn"
                  onClick={() => void loadData({ forceGps: true })}
                  title="Allow browser location for a more accurate city"
                >
                  <Crosshair className="h-3 w-3" />
                  Precise
                </button>
              )}
            </div>

            <div className="mpf-wx-banner__main">
              <span className="mpf-wx-banner__icon">
                <WeatherIcon condition={condition} className="h-11 w-11" />
              </span>
              <div>
                <div className="mpf-wx-banner__temp">
                  {weather?.temp != null ? `${Math.round(weather.temp)}°C` : "—"}
                </div>
                <div className="mpf-wx-banner__cond">
                  {weather
                    ? resolveConditionLabel(weather.code, precip)
                    : "Weather unavailable"}
                </div>
              </div>
            </div>

            <div className="mpf-wx-banner__metrics">
              <span>
                <Thermometer className="h-3 w-3" />
                Feels like {weather?.feelsLike != null ? `${Math.round(weather.feelsLike)}°C` : "—"}
              </span>
              <span>
                <Droplets className="h-3 w-3" />
                Humidity {weather?.humidity != null ? `${weather.humidity}%` : "—"}
              </span>
              <span>
                <Wind className="h-3 w-3" />
                Wind {weather?.wind != null ? `${Math.round(weather.wind)} km/h` : "—"}
              </span>
              <span>
                <Eye className="h-3 w-3" />
                Visibility {weather?.visibility != null ? `${weather.visibility} km` : "—"}
              </span>
            </div>
          </div>

          <div className="mpf-wx-banner__aside">
            <div className="mpf-wx-banner__clock" suppressHydrationWarning>
              {timeStr}, {dateStr}
            </div>

            <div className="mpf-wx-ip">
              <div className="mpf-wx-ip__label">
                Your IP Address
                <span className="mpf-wx-ip__live">
                  <span className="mpf-wx-ip__dot" />
                  Live
                </span>
              </div>
              <div className="mpf-wx-ip__value">{geo?.ip || "—"}</div>
              <div className="mpf-wx-ip__isp">{geo?.isp || "ISP unavailable"}</div>
              <div className="mpf-wx-ip__place">
                <MapPin className="h-3 w-3" />
                {locationLabel}
              </div>
              <button
                type="button"
                className="mpf-wx-ip__link"
                onClick={() => setDetailsOpen(true)}
              >
                View Full Details
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        geo={geo}
        weather={weather}
      />
    </>
  );
}

export default WeatherLocationBanner;
