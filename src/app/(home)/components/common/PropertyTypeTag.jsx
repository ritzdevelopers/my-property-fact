import "./premiumBadges.css";

const HOUSE_ICON_PATH =
  "M12 3.1 2.6 11.4h2.6v8.5h4.9v-5.1h3.8v5.1h4.9v-8.5h2.6z";

const BUILDING_ICON_PATH =
  "M6.1 20.9V4.9c0-.8.6-1.4 1.4-1.4h5.2c.8 0 1.4.6 1.4 1.4v4.8h3.4c.8 0 1.4.6 1.4 1.4v9.8z";

export function resolvePropertyTypeTag(type) {
  const normalized = String(type || "").toLowerCase().trim();
  if (!normalized) return null;

  const isCommercial = normalized.includes("commercial");
  return {
    label: isCommercial ? "Commercial" : "Residential",
    className: isCommercial
      ? "mpf-type-tag--commercial"
      : "mpf-type-tag--residential",
    isCommercial,
  };
}

export default function PropertyTypeTag({ type, className = "" }) {
  const meta = resolvePropertyTypeTag(type);
  if (!meta) return null;

  return (
    <span className={`mpf-type-tag ${meta.className} ${className}`.trim()}>
      <svg className="mpf-type-tag__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d={meta.isCommercial ? BUILDING_ICON_PATH : HOUSE_ICON_PATH} />
      </svg>
      {meta.label}
    </span>
  );
}
