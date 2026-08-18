import { isUnderConstructionStatus } from "@/lib/projectCardHelpers";

export default function UnderConstructionHoverOverlay({ status }) {
  if (!isUnderConstructionStatus(status)) return null;

  return (
    <span className="mpf-uc-overlay" aria-hidden="true">
      <img
        src="/static/under-construction.svg"
        alt=""
        className="mpf-uc-overlay__stamp"
      />
    </span>
  );
}
