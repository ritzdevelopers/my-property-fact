import { resolveProjectStatusRibbon } from "@/lib/projectCardHelpers";
import "./projectStatusRibbon.css";

export default function ProjectStatusRibbon({
  status,
  className = "",
}) {
  const ribbon = resolveProjectStatusRibbon(status);

  if (!ribbon) return null;

  const { key, label, lines } = ribbon;

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