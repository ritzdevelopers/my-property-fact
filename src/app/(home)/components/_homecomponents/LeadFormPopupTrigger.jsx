"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CommonPopUpform from "../common/popupform";
import { MPF_GATEWAY_HIDDEN_EVENT } from "@/app/_global_components/mpfGatewayEvents";
import "./LeadFormPopupTrigger.css";

const ENQUIRE_TRIGGER_ICON = "/9412919.png";

/**
 * Floating control that opens lead form popup.
 * @param {Object} props
 * @param {boolean} props.showOnMobileOnly - If true, button visible only on mobile (for property page)
 * @param {boolean} props.showOnHomeOnly - If true, only render when pathname is "/" (for home page)
 * @param {Object} props.projectData - Optional project data for popup (when on property page)
 * @param {Function} props.onOpen - When provided (controlled mode), call this on click instead of opening internal popup
 * @param {boolean} props.autoOpenOnHomeAfterGateway - Home: open modal after load + gateway, then delay (default true when home-only)
 * @param {number} props.autoOpenDelayMs - Delay in ms after gateway is ready (default 2000)
 */
export default function LeadFormPopupTrigger({
  showOnMobileOnly = false,
  showOnHomeOnly = false,
  projectData = null,
  onOpen = null,
  autoOpenOnHomeAfterGateway = true,
  autoOpenDelayMs = 2000,
}) {
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [showMiniEnquire, setShowMiniEnquire] = useState(false);
  const isControlled = typeof onOpen === "function";
  const hiddenByRoute = showOnHomeOnly && pathname !== "/";

  const handlePopupClose = useCallback((open) => {
    const next = !!open;
    setShowPopup(next);
    if (!next) setShowMiniEnquire(true);
  }, []);

  const autoHome =
    showOnHomeOnly &&
    pathname === "/" &&
    !isControlled &&
    autoOpenOnHomeAfterGateway &&
    !hiddenByRoute;

  useEffect(() => {
    if (!autoHome) return;

    let popupTimer;
    let fallbackTimer;
    let revealHandler;
    let armed = false;

    const armPopupTimer = () => {
      if (armed) return;
      armed = true;
      popupTimer = window.setTimeout(() => setShowPopup(true), autoOpenDelayMs);
    };

    const afterGateway = () => {
      if (document.body.classList.contains("mpf-post-gateway-reveal")) {
        armPopupTimer();
      } else {
        revealHandler = () => armPopupTimer();
        window.addEventListener(MPF_GATEWAY_HIDDEN_EVENT, revealHandler, { once: true });
        fallbackTimer = window.setTimeout(() => {
          if (revealHandler) {
            window.removeEventListener(MPF_GATEWAY_HIDDEN_EVENT, revealHandler);
            revealHandler = null;
          }
          armPopupTimer();
        }, 12000);
      }
    };

    let removeLoad = () => {};
    if (document.readyState === "complete") {
      afterGateway();
    } else {
      const onLoad = () => afterGateway();
      window.addEventListener("load", onLoad, { once: true });
      removeLoad = () => window.removeEventListener("load", onLoad);
    }

    return () => {
      removeLoad();
      if (revealHandler) window.removeEventListener(MPF_GATEWAY_HIDDEN_EVENT, revealHandler);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      if (popupTimer) window.clearTimeout(popupTimer);
    };
  }, [autoHome, autoOpenDelayMs]);

  const handleClick = () => (isControlled ? onOpen() : setShowPopup(true));
  const from = projectData ? "Project Detail" : "Home Page";
  const data = projectData || null;

  const showDefaultVerticalTrigger = !showOnHomeOnly;

  if (hiddenByRoute) return null;

  return (
    <>
      {showDefaultVerticalTrigger && (
        <button
          type="button"
          className={`lead-form-popup-trigger lead-form-popup-trigger--icon ${showOnMobileOnly ? "d-md-none" : ""}`}
          onClick={handleClick}
          aria-label="Enquire Now - Open lead form"
        >
          <Image
            src={ENQUIRE_TRIGGER_ICON}
            alt=""
            width={40}
            height={40}
            className="lead-form-popup-trigger__icon-img lead-form-popup-trigger__icon-img--vertical"
            sizes="40px"
          />
        </button>
      )}

      {showOnHomeOnly && showMiniEnquire && !showPopup && (
        <button
          type="button"
          className={`lead-form-popup-trigger lead-form-popup-trigger--collapsed lead-form-popup-trigger--icon ${showOnMobileOnly ? "d-md-none" : ""}`}
          onClick={handleClick}
          aria-label="Enquire — open lead form"
        >
          <Image
            src={ENQUIRE_TRIGGER_ICON}
            alt=""
            width={44}
            height={44}
            className="lead-form-popup-trigger__icon-img"
            sizes="48px"
          />
        </button>
      )}

      {!isControlled && (
        <CommonPopUpform
          show={showPopup}
          handleClose={handlePopupClose}
          from={from}
          data={data}
        />
      )}
    </>
  );
}
