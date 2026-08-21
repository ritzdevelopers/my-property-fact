"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CommonPopUpform from "../common/popupform";
import "./LeadFormPopupTrigger.css";

const ENQUIRE_TRIGGER_ICON = "/static/icon/enquire.png";
const MODAL_FLEX_CLASS = "lead-form-popup-trigger--modal-flex";

function EnquireHomeSparkles() {
  const starPath =
    "M12 2l1.4 4.9 5.1.4-3.9 3.1 1.2 5-4.8-3.1-4.8 3.1 1.2-5-3.9-3.1 5.1-.4z";
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <svg
          key={n}
          className={`lead-form-popup-trigger__star lead-form-popup-trigger__star--${n}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path className="lead-form-popup-trigger__star-path" d={starPath} />
        </svg>
      ))}
    </>
  );
}

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
  const isBlogRoute = typeof pathname === "string" && pathname.startsWith("/blog");

  const showDefaultVerticalTrigger = !showOnHomeOnly;

  useEffect(() => {
    if (!showPopup) return undefined;

    document.body.classList.add(MODAL_FLEX_CLASS);
    return () => {
      document.body.classList.remove(MODAL_FLEX_CLASS);
    };
  }, [showPopup]);

  if (hiddenByRoute) return null;

  return (
    <>
      {showDefaultVerticalTrigger && (
        <button
          type="button"
          className={`lead-form-popup-trigger lead-form-popup-trigger--icon ${isBlogRoute ? "lead-form-popup-trigger--blog" : ""} ${showOnMobileOnly ? "d-md-none" : ""}`}
          onClick={handleClick}
          aria-label="Enquire Now"
          title="Enquire Now"
        >
          <img
            src={ENQUIRE_TRIGGER_ICON}
            alt="Enquire Now"
            title="Enquire Now"
            width={30}
            height={30}
            className="lead-form-popup-trigger__icon-img"
          />
        </button>
      )}

      {showOnHomeOnly && showMiniEnquire && !showPopup && (
        <button
          type="button"
          className={`lead-form-popup-trigger--home-beside-chat ${showOnMobileOnly ? "d-md-none" : ""}`}
          onClick={handleClick}
          aria-label="Enquire Now"
          title="Enquire Now"
        >
          <EnquireHomeSparkles />
          <span className="lead-form-popup-trigger__enquire-label">Enquire Now</span>
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
