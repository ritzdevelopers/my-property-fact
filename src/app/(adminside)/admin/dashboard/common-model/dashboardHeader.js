import { Button } from "react-bootstrap";

/**
 * @param {"default" | "executive" | "executivePlain"} pageStyle — executive adds kicker; executivePlain = same toolbar/chrome as executive without the kicker (e.g. Manage Users).
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
  const isExecutiveChrome =
    pageStyle === "executive" || pageStyle === "executivePlain";
  const showExecutiveKicker = pageStyle === "executive";

  return (
    <div
      className={`admin-dashboard-toolbar${isExecutiveChrome ? " admin-dashboard-toolbar--executive" : ""}`}
    >
      <div className="admin-dashboard-toolbar-title-wrap">
        {showExecutiveKicker ? (
          <p className="admin-dashboard-toolbar-kicker">Executive overview</p>
        ) : null}
        <h1 className="admin-dashboard-toolbar-title">{heading}</h1>
      </div>
      <div className="admin-dashboard-toolbar-actions">
        {exportExcel && (
          <Button
            variant="warning"
            className={`text-capitalize admin-toolbar-btn${isExecutiveChrome ? " admin-toolbar-btn--secondary-outline" : ""}`}
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
