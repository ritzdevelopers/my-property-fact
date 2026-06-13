"use client";

import * as React from "react";
import { Sparkles, Clock, ShieldCheck } from "lucide-react";

export function WelcomeHeader({
  displayName,
  roleLabel,
  isSuperAdmin,
  loading = false,
}) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [typedGreeting, setTypedGreeting] = React.useState("");
  const [typingDone, setTypingDone] = React.useState(false);

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const fullGreeting = React.useMemo(() => {
    if (loading) return "";
    const name =
      (displayName && displayName.trim()) ||
      (isSuperAdmin ? "Super Admin" : "Admin");
    return `${greeting}, ${name}`;
  }, [loading, displayName, isSuperAdmin, greeting]);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (!fullGreeting) {
      setTypedGreeting("");
      setTypingDone(false);
      return;
    }

    setTypedGreeting("");
    setTypingDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTypedGreeting(fullGreeting.slice(0, i));
      if (i >= fullGreeting.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [fullGreeting]);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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
      <div className="mpf-hero">
        <div className="mpf-hero__inner">
          <div>
            <div className="mpf-hero__badges">
              <span className="mpf-chip mpf-chip--accent">
                <Sparkles className="h-3 w-3" />
                MPF Admin v2.0
              </span>
            </div>
            <div className="mpf-hero__skel" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mpf-hero">
      <div className="mpf-hero__inner">
        <div>
          <div className="mpf-hero__badges">
            <span className="mpf-chip mpf-chip--accent">
              <Sparkles className="h-3 w-3" />
              MPF Admin v2.0
            </span>
            {roleLabel && (
              <span className="mpf-chip">
                <ShieldCheck className="h-3 w-3" />
                {roleLabel}
              </span>
            )}
          </div>
          <h1 className="mpf-hero__greeting">
            {typedGreeting}
            {!typingDone && fullGreeting && (
              <span className="mpf-hero__typing-cursor" />
            )}
          </h1>
          <p className="mpf-hero__sub">
            Here&apos;s what&apos;s happening across your property platform today.
          </p>
        </div>

        <div className="mpf-hero__meta">
          <div className="mpf-hero__clock">
            <span className="mpf-hero__clock-icon">
              <Clock className="h-4 w-4" />
            </span>
            <span>
              <span className="mpf-hero__clock-time" suppressHydrationWarning>
                {formattedTime}
              </span>
              <span className="mpf-hero__clock-date" style={{ display: "block" }} suppressHydrationWarning>
                {formattedDate}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeHeader;
