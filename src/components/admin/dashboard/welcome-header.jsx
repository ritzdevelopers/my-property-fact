"use client";

import * as React from "react";
import { Clock, ShieldCheck } from "lucide-react";

export function WelcomeHeader({
  displayName,
  roleLabel,
  isSuperAdmin,
  loading = false,
}) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const name =
    (displayName && displayName.trim()) ||
    (isSuperAdmin ? "Super Admin" : "Admin");

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

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
        <nav className="mpf-page-breadcrumb" aria-label="Breadcrumb">
          <span>Admin</span>
          <span className="mpf-page-breadcrumb__sep">/</span>
          <span className="mpf-page-breadcrumb__current">Dashboard</span>
        </nav>
        <h1 className="mpf-dash-welcome__title">
          {greeting}, {name}
        </h1>
        <p className="mpf-dash-welcome__sub">
          Here&apos;s what&apos;s happening across your property platform today.
        </p>
        <div className="mpf-dash-welcome__chips">
          <span className="mpf-dash-chip">MPF Admin</span>
          {roleLabel && (
            <span className="mpf-dash-chip mpf-dash-chip--role">
              <ShieldCheck className="h-3 w-3" />
              {roleLabel}
            </span>
          )}
        </div>
      </div>
      <div className="mpf-dash-welcome__right">
        <div className="mpf-dash-welcome__clock">
          <Clock className="h-4 w-4" />
          <div>
            <div className="mpf-dash-welcome__time" suppressHydrationWarning>
              {formattedTime}
            </div>
            <div className="mpf-dash-welcome__date" suppressHydrationWarning>
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeHeader;
