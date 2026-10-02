"use client";

import { useEffect } from "react";
import { MPF_GATEWAY_HIDDEN_EVENT, MPF_GATEWAY_STORAGE_KEY } from "./mpfGatewayEvents";

function finishGatewayWithoutOverlay() {
  document.body.classList.remove("gateway-open", "mpf-post-gateway-reveal");
  document.body.classList.add("mpf-post-gateway-reveal");
  window.dispatchEvent(new CustomEvent(MPF_GATEWAY_HIDDEN_EVENT));
}

/**
 * The previous full-screen intro covered the homepage for ~5s on every first
 * visit. PageSpeed uses an empty profile, so that overlay became LCP and
 * pushed Speed Index past 10s. The page now paints immediately; listeners
 * that wait for `mpf-gateway-hidden` still run.
 */
export default function WebsiteGateway() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    try {
      window.localStorage.setItem(MPF_GATEWAY_STORAGE_KEY, "1");
    } catch {
      /* private mode / quota */
    }
    finishGatewayWithoutOverlay();
  }, []);

  return null;
}
