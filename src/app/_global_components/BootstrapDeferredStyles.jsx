"use client";

import { useEffect } from "react";

const BOOTSTRAP_HREF = "/css/bootstrap-deferred.min.css";
const LINK_ID = "bootstrap-deferred-css";

/** Loads full Bootstrap after first paint (modals, forms). Not bundled in critical CSS. */
export default function BootstrapDeferredStyles() {
  useEffect(() => {
    if (document.getElementById(LINK_ID)) return;

    const link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    link.href = BOOTSTRAP_HREF;
    // Apply after load so it never blocks first paint.
    link.media = "print";
    link.onload = () => {
      link.media = "all";
    };
    document.head.appendChild(link);
  }, []);

  return null;
}
