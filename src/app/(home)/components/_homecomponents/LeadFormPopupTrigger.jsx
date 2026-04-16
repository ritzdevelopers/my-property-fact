"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CommonPopUpform from "../common/popupform";
import "./LeadFormPopupTrigger.css";

const ENQUIRE_TRIGGER_ICON = "/static/icon/enquire.png";
const MODAL_FLEX_CLASS = "lead-form-popup-trigger--modal-flex";

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
          className={`lead-form-popup-trigger lead-form-popup-trigger--icon ${showOnMobileOnly ? "d-md-none" : ""}`}
          onClick={handleClick}
          aria-label="Enquire Now - Open lead form"
        >
          <Image
            src={ENQUIRE_TRIGGER_ICON}
            alt=""
            width={30}
            height={30}
            className="lead-form-popup-trigger__icon-img lead-form-popup-trigger__icon-img--vertical"
        
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
            width={30}
            height={30}
            className="lead-form-popup-trigger__icon-img"
            sizes="30px"
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
