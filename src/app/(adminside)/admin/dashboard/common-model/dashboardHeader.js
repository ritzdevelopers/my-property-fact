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
  exportIconType = "download",
  pageStyle = "default",
}) {
  const isExecutiveChrome =
    pageStyle === "executive" || pageStyle === "executivePlain";
  const showExecutiveKicker = pageStyle === "executive";
  const exportIsAdd = exportIconType === "add";

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
          <button
            type="button"
            className="admin-header-btn admin-header-btn--export"
            disabled={exportDisabled}
            onClick={() => exportFunction()}
          >
            {exportIsAdd ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, flexShrink: 0 }} aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, flexShrink: 0 }} aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {exportExcel}
          </button>
        )}
        {buttonName && (
          <button
            type="button"
            className="admin-header-btn admin-header-btn--primary"
            onClick={() => functionName()}
          >
            {!buttonName.trim().startsWith("+") && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,flexShrink:0}} aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
            {buttonName}
          </button>
        )}
      </div>
    </div>
  );
}
