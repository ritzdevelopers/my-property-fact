"use client";

import { useEffect, useState } from "react";

/** True when viewport width is at most {@code maxPx} (for responsive charts / layout). */
export function useMatchMaxWidth(maxPx) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia(`(max-width: ${maxPx}px)`);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [maxPx]);

  return matches;
}
