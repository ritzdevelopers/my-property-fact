"use client";

import { useEffect, useMemo, useState } from "react";

function easeOutQuart(t) {
  return 1 - (1 - t) ** 4;
}

export default function HeroCountNumber({ value = 0, duration = 1400 }) {
  const target = useMemo(() => Math.max(0, Number(value) || 0), [value]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const next = Math.floor(target * easeOutQuart(progress));
      setCount(next);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return <>{count.toLocaleString("en-US")}+</>;
}

