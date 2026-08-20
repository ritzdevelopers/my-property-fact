import "./premiumBadges.css";

const HOUSE_ICON_PATH =
  "M12 3.1 2.6 11.4h2.6v8.5h4.9v-5.1h3.8v5.1h4.9v-8.5h2.6z";

const COMMERCIAL_BUILDING_ICON = "/icon/commercial-building.png";
const COMMERCIAL_BUILDING_ICON_META =
  "Commercial property type icon — My Property Fact";

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
      {meta.isCommercial ? (
        <img
          src={COMMERCIAL_BUILDING_ICON}
          alt={COMMERCIAL_BUILDING_ICON_META}
          title={COMMERCIAL_BUILDING_ICON_META}
          className="mpf-type-tag__icon mpf-type-tag__icon--img"
          width={11}
          height={11}
        />
      ) : (
        <svg className="mpf-type-tag__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d={HOUSE_ICON_PATH} />
        </svg>
      )}
      {meta.label}
    </span>
  );
}
