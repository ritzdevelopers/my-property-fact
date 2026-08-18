import { resolveProjectStatusRibbon } from "@/lib/projectCardHelpers";
import "./projectStatusRibbon.css";

const STAR_ICON_PATH =
  "M12 3.4 14.4 8.5l5.6.8-4.1 3.9 1 5.5-4.9-2.7-4.9 2.7 1-5.5L4 9.3l5.6-.8z";

const BUILDING_ICON_PATH =
  "M6.1 20.9V4.9c0-.8.6-1.4 1.4-1.4h5.2c.8 0 1.4.6 1.4 1.4v4.8h3.4c.8 0 1.4.6 1.4 1.4v9.8z";

const STATUS_ICON_PATHS = {
  "new-launched": STAR_ICON_PATH,
  "pre-launch": BUILDING_ICON_PATH,
};

export default function ProjectStatusRibbon({
  status,
  className = "",
}) {
  const ribbon = resolveProjectStatusRibbon(status);

  if (!ribbon) return null;

  const { key, label, lines } = ribbon;
  const iconPath =
    STATUS_ICON_PATHS[key] ||
    (className.includes("mpf-status-ribbon--lux") ? STAR_ICON_PATH : null);

 return (
  <>
    <span
      className={`mpf-status-ribbon__fold ${className}`.trim()}
      data-status={key || undefined}
      aria-hidden="true"
    />

    <div
      className={`mpf-status-ribbon ${className}`.trim()}
      data-status={key || undefined}
      role="img"
      aria-label={label}
    >
      <span className="mpf-status-ribbon__band">
        {iconPath ? (
          <svg
            className="mpf-status-ribbon__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d={iconPath} />
          </svg>
        ) : null}

        <span className="mpf-status-ribbon__text">
          {lines.map((line) => (
            <span
              key={line}
              className="mpf-status-ribbon__line"
            >
              {line}
            </span>
          ))}
        </span>
      </span>
    </div>
  </>
)}
