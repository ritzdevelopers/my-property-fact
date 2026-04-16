"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CommonPopUpform from "../common/popupform";
import "./LeadFormPopupTrigger.css";

const ENQUIRE_TRIGGER_ICON = "/9412919.png";

/**
 * Floating control that opens lead form popup.
 * @param {Object} props
 * @param {boolean} props.showOnMobileOnly - If true, button visible only on mobile (for property page)
 * @param {boolean} props.showOnHomeOnly - If true, only render when pathname is "/" (for home page)
 * @param {Object} props.projectData - Optional project data for popup (when on property page)
 * @param {Function} props.onOpen - When provided (controlled mode), call this on click instead of opening internal popup
 */
export default function LeadFormPopupTrigger({
  showOnMobileOnly = false,
  showOnHomeOnly = false,
  projectData = null,
  onOpen = null,
}) {
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  /** On home, show the compact Enquire chip immediately (no auto-opened modal). */
  const [showMiniEnquire, setShowMiniEnquire] = useState(showOnHomeOnly);
  const isControlled = typeof onOpen === "function";
  const hiddenByRoute = showOnHomeOnly && pathname !== "/";

  const handlePopupClose = useCallback((open) => {
    const next = !!open;
    setShowPopup(next);
    if (!next) setShowMiniEnquire(true);
  }, []);

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
