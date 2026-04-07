import { Button } from "react-bootstrap";

/**
 * @param {"default" | "executive"} pageStyle — executive adds kicker + primary green CTA styling
 */
export default function DashboardHeader({
  heading,
  buttonName,
  functionName,
  exportExcel,
  exportFunction,
  exportDisabled = false,
  pageStyle = "default",
}) {
  const isExecutive = pageStyle === "executive";

  return (
    <div
      className={`admin-dashboard-toolbar${isExecutive ? " admin-dashboard-toolbar--executive" : ""}`}
    >
      <div className="admin-dashboard-toolbar-title-wrap">
        {isExecutive ? (
          <p className="admin-dashboard-toolbar-kicker">Executive overview</p>
        ) : null}
        <h1 className="admin-dashboard-toolbar-title">{heading}</h1>
      </div>
      <div className="admin-dashboard-toolbar-actions">
        {exportExcel && (
          <Button
            variant="warning"
            className={`text-capitalize admin-toolbar-btn${isExecutive ? " admin-toolbar-btn--secondary-outline" : ""}`}
            disabled={exportDisabled}
            onClick={() => exportFunction()}
          >
            {exportExcel}
          </Button>
        )}
        {buttonName && (
          <Button
            variant="success"
            className="text-capitalize admin-toolbar-btn"
            onClick={() => functionName()}
          >
            {buttonName}
          </Button>
        )}
      </div>
    </div>
  );
}
