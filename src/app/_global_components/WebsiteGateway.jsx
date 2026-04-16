"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import {
  MPF_GATEWAY_HIDDEN_EVENT,
  MPF_GATEWAY_STORAGE_KEY,
} from "./mpfGatewayEvents";

function readGatewayAlreadySeen() {
  try {
    return window.localStorage.getItem(MPF_GATEWAY_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeGatewaySeen() {
  try {
    window.localStorage.setItem(MPF_GATEWAY_STORAGE_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}

function finishGatewayWithoutOverlay() {
  document.body.classList.remove("gateway-open", "mpf-post-gateway-reveal");
  document.body.classList.add("mpf-post-gateway-reveal");
  window.dispatchEvent(new CustomEvent(MPF_GATEWAY_HIDDEN_EVENT));
}

/** Progress fill duration (ms) before hold + exit. */
const LOAD_MS = 3600;
/** Pause at 100% before exit animation. */
const HOLD_AT_FULL_MS = 320;
/** Must match `.mpf-gateway-overlay--exit` animation duration in globals.css. */
const EXIT_MS = 900;

const RING_R = 42;
const RING_C = 2 * Math.PI * RING_R;

export default function WebsiteGateway() {
  const gradId = useId().replace(/:/g, "");
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdRef = useRef(0);
  const exitRef = useRef(0);

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = readGatewayAlreadySeen();

    if (reduceMotion || alreadySeen) {
      finishGatewayWithoutOverlay();
      if (reduceMotion) writeGatewaySeen();
      return;
    }

    document.body.classList.remove("mpf-post-gateway-reveal");
    setIsVisible(true);
    document.body.classList.add("gateway-open");

    const stepMs = Math.max(16, Math.floor(LOAD_MS / 100));
    let p = 0;

    const intervalId = window.setInterval(() => {
      p += 1;
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(intervalId);
        holdRef.current = window.setTimeout(() => {
          setIsExiting(true);
          exitRef.current = window.setTimeout(() => {
            writeGatewaySeen();
            document.body.classList.remove("gateway-open");
            document.body.classList.add("mpf-post-gateway-reveal");
            window.dispatchEvent(new CustomEvent(MPF_GATEWAY_HIDDEN_EVENT));
            setIsVisible(false);
          }, EXIT_MS);
        }, HOLD_AT_FULL_MS);
      }
    }, stepMs);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(holdRef.current);
      window.clearTimeout(exitRef.current);
      document.body.classList.remove("gateway-open");
    };
  }, []);

  if (!isVisible) return null;

  const dashOffset = RING_C * (1 - progress / 100);

  return (
    <div
      className={`mpf-gateway-overlay${isExiting ? " mpf-gateway-overlay--exit" : ""}`}
      aria-label="Loading My Property Fact"
      role="status"
      aria-busy="true"
    >
      <div
        className="mpf-gateway-loader"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-live="polite"
      >
        <svg
          className="mpf-gateway-loader__svg"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient
              id={`mpf-loader-stroke-${gradId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0d5834" />
              <stop offset="45%" stopColor="#1a8f4a" />
              <stop offset="100%" stopColor="#c9a24d" />
            </linearGradient>
          </defs>
          <circle
            className="mpf-gateway-loader__track"
            cx="50"
            cy="50"
            r={RING_R}
            fill="none"
          />
          <circle
            className="mpf-gateway-loader__progress"
            cx="50"
            cy="50"
            r={RING_R}
            fill="none"
            stroke={`url(#mpf-loader-stroke-${gradId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="mpf-gateway-loader__center">
          <Image
            src="/static/icon/mpf 1.png"
            alt=""
            width={88}
            height={88}
            priority
            className="mpf-gateway-loader__logo"
          />
          <span className="mpf-gateway-loader__percent">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
