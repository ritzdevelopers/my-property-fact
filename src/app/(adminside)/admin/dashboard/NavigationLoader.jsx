"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Dot-pulse progress bar that appears at the top of the content area
 * when a navigation starts and disappears when the new page is ready.
 * Uses pathname change + a flag to avoid false-positives on initial mount.
 */
export default function NavigationLoader() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const timerRef = useRef(null);
  const [active, setActive] = useState(false);
  // Prevent firing on the very first mount
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevPathRef.current = pathname;
      return;
    }

    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      setActive(true);

      // Clear any previous timer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setActive(false);
      }, 500);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="nav-loader-bar" aria-hidden="true">
      <span className="nav-loader-dot" />
      <span className="nav-loader-dot" />
      <span className="nav-loader-dot" />
    </div>
  );
}
