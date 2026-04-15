"use client";

import { useEffect, useMemo, useState } from "react";
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

const FULL_TEXT = "www.mypropertyfact.com";
const TYPING_SPEED_MS = 130;
const EXIT_START_MS = 4400;
const EXIT_END_MS = 5400;

export default function WebsiteGateway() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [typedText, setTypedText] = useState("");

  const typingChars = useMemo(() => FULL_TEXT.split(""), []);

  useEffect(() => {
    let exitTimer;
    let hideTimer;

    // Show gateway only when the browser loads the home page (first paint path is "/").
    if (window.location.pathname !== "/") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = readGatewayAlreadySeen();

    // Skip full splash after first completion (same body state as after overlay).
    if (reduceMotion || alreadySeen) {
      finishGatewayWithoutOverlay();
      if (reduceMotion) writeGatewaySeen();
      return;
    }

    document.body.classList.remove("mpf-post-gateway-reveal");
    setIsVisible(true);
    document.body.classList.add("gateway-open");

    exitTimer = window.setTimeout(() => setIsExiting(true), EXIT_START_MS);
    hideTimer = window.setTimeout(() => {
      writeGatewaySeen();
      document.body.classList.remove("gateway-open");
      document.body.classList.add("mpf-post-gateway-reveal");
      window.dispatchEvent(new CustomEvent(MPF_GATEWAY_HIDDEN_EVENT));
      setIsVisible(false);
    }, EXIT_END_MS);

    return () => {
      if (exitTimer) window.clearTimeout(exitTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
      document.body.classList.remove("gateway-open");
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    setTypedText("");
    let index = 0;
    const typingTimer = window.setInterval(() => {
      index += 1;
      setTypedText(typingChars.slice(0, index).join(""));
      if (index >= typingChars.length) {
        window.clearInterval(typingTimer);
      }
    }, TYPING_SPEED_MS);

    return () => window.clearInterval(typingTimer);
  }, [isVisible, typingChars]);

  if (!isVisible) return null;

  return (
    <div
      className={`mpf-gateway-overlay${isExiting ? " mpf-gateway-overlay--exit" : ""}`}
      aria-label="Website entry gateway"
      role="status"
    >
      <div className="mpf-gateway-logo-wrap">
        <Image
          src="/static/icon/mpf 1.png"
          alt="My Property Fact"
          width={120}
          height={120}
          priority
          className="mpf-gateway-logo"
        />
      </div>
      <h1 className="mpf-gateway-title">
        {typedText}
        <span className="mpf-gateway-caret" aria-hidden>
          |
        </span>
      </h1>
    </div>
  );
}
