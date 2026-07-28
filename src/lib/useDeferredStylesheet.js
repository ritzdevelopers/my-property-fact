"use client";

import { useEffect } from "react";

/**
 * Loads stylesheets after mount so they do not block first paint / LCP.
 * Pass a function that returns a dynamic import (or Promise.all of imports).
 */
export function useDeferredStylesheet(loader) {
  useEffect(() => {
    void loader();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);
}
