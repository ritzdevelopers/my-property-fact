"use client";

import { useEffect, useState } from "react";
import ThirdPartyScripts from "./ThirdPartyScripts";

/**
 * Mount analytics after load + idle so GTM/FB/GA/Clarity don't compete with
 * homepage hydration (scripts still fire the same events once injected).
 */
export default function ThirdPartyScriptsLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId;
    let timeoutId;

    const reveal = () => {
      setReady(true);
    };

    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(reveal, { timeout: 4500 });
      } else {
        timeoutId = window.setTimeout(reveal, 2200);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      if (typeof window.cancelIdleCallback === "function" && idleId) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;
  return <ThirdPartyScripts />;
}
