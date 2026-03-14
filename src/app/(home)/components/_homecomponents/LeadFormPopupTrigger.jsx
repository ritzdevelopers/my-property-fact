"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import CommonPopUpform from "../common/popupform";
import "./LeadFormPopupTrigger.css";

/**
 * Floating button that opens lead form popup.
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
  const isControlled = typeof onOpen === "function";

  if (showOnHomeOnly && pathname !== "/") return null;

  const handleClick = () => (isControlled ? onOpen() : setShowPopup(true));
  const from = projectData ? "Project Detail" : "Home Page";
  const data = projectData || null;

  return (
    <>
      <button
        type="button"
        className={`lead-form-popup-trigger ${showOnMobileOnly ? "d-md-none" : ""}`}
        onClick={handleClick}
        aria-label="Enquire Now - Open lead form"
      >
        <span className="lead-form-popup-trigger__text">Enquire</span>
      </button>
      {!isControlled && (
        <CommonPopUpform
          show={showPopup}
          handleClose={setShowPopup}
          from={from}
          data={data}
        />
      )}
    </>
  );
}
