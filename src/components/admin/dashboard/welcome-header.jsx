"use client";

import * as React from "react";
import { WeatherLocationBanner } from "./weather-location-banner";

function prettyName(raw, isSuperAdmin) {
  const name = (raw && raw.trim()) || (isSuperAdmin ? "Super Admin" : "Admin");
  // "My propertyfact" → "My Propertyfact"
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function WelcomeHeader({
  displayName,
  roleLabel,
  isSuperAdmin,
  loading = false,
}) {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const name = prettyName(displayName, isSuperAdmin);

  if (loading) {
    return (
      <div className="mpf-dash-welcome mpf-dash-welcome--loading">
        <div className="mpf-dash-welcome__skel" />
      </div>
    );
  }

  return (
    <div className="mpf-dash-welcome">
      <div className="mpf-dash-welcome__left">
        <p className="mpf-dash-welcome__eyebrow">Dashboard</p>
        <h1 className="mpf-dash-welcome__title">
          {greeting}, <span>{name}</span>
        </h1>
        <p className="mpf-dash-welcome__sub">
          Your platform snapshot for today
          {roleLabel ? (
            <>
              {" · "}
              <span className="mpf-dash-welcome__role">{roleLabel}</span>
            </>
          ) : null}
        </p>
      </div>
      <div className="mpf-dash-welcome__right">
        <WeatherLocationBanner />
      </div>
    </div>
  );
}

export default WelcomeHeader;
