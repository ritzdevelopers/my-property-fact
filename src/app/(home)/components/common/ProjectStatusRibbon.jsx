import { resolveProjectStatusRibbon } from "@/lib/projectCardHelpers";
import "./projectStatusRibbon.css";

/**
 * Folded 3D corner ribbon for a project/property status.
 * Render it as a direct child of the (position: relative, overflow: hidden) media
 * wrapper — it pins itself to the top-left corner and inherits the corner radius.
 */
export default function ProjectStatusRibbon({ status, className = "" }) {
  const ribbon = resolveProjectStatusRibbon(status);
  if (!ribbon) return null;

  const { key, label, lines } = ribbon;

  return (
    <>
      {key === "under-construction" ? (
        <span className="mpf-status-treatment" aria-hidden />
      ) : null}

      <div
        className={`mpf-status-ribbon ${className}`.trim()}
        data-status={key || undefined}
        role="img"
        aria-label={label}
      >
        <span className="mpf-status-ribbon__band">
          <span className="mpf-status-ribbon__shine" aria-hidden />
          <span className="mpf-status-ribbon__text">
            {lines.map((line) => (
              <span key={line} className="mpf-status-ribbon__line">
                {line}
              </span>
            ))}
          </span>
        </span>
      </div>
    </>
  );
}
