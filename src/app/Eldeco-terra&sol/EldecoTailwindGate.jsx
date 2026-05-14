"use client";

import { useEffect, useState } from "react";

const TAILWIND_CDN = "https://cdn.tailwindcss.com";
const SCRIPT_MARK = "data-eldeco-tailwind-cdn";

function afterTailwindPaint(run) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(run, 0);
    });
  });
}

export default function EldecoTailwindGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const reveal = () => {
      if (cancelled) return;
      afterTailwindPaint(() => {
        if (!cancelled) setReady(true);
      });
    };

    let script = document.querySelector(`script[${SCRIPT_MARK}]`);

    if (!script) {
      script = document.createElement("script");
      script.src = TAILWIND_CDN;
      script.setAttribute(SCRIPT_MARK, "");
      script.async = true;
      document.head.appendChild(script);
    }

    if (typeof window !== "undefined" && window.tailwind) {
      reveal();
      return () => {
        cancelled = true;
      };
    }

    const onLoad = () => reveal();
    script.addEventListener("load", onLoad);

    const fallback = window.setTimeout(reveal, 12_000);

    return () => {
      cancelled = true;
      script.removeEventListener("load", onLoad);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={ready}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2147483646,
          display: ready ? "none" : "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#c59c35",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          aria-label="Loading page styles"
          style={{
            width: 42,
            height: 42,
            border: "3px solid rgba(197, 156, 53, 0.22)",
            borderTopColor: "#c59c35",
            borderRadius: "50%",
            animation: "eldeco-tw-spin 0.85s linear infinite",
          }}
        />
        <p
          style={{
            marginTop: 22,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Loading
        </p>
        <style>{`@keyframes eldeco-tw-spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      <div
        suppressHydrationWarning
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          visibility: ready ? "visible" : "hidden",
          opacity: ready ? 1 : 0,
          pointerEvents: ready ? "auto" : "none",
          transition: ready ? "opacity 0.22s ease-out" : "none",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </div>
    </>
  );
}
