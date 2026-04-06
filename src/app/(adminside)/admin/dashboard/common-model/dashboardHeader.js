import { Button } from "react-bootstrap";

export default function DashboardHeader({
  heading,
  buttonName,
  functionName,
  exportExcel,
  exportFunction,
  exportDisabled = false,
}) {
  return (
    <div className="admin-dashboard-toolbar">
      <div className="admin-dashboard-toolbar-title-wrap">
        <h1 className="admin-dashboard-toolbar-title">{heading}</h1>
      </div>
      <div className="admin-dashboard-toolbar-actions">
        {exportExcel && (
          <Button
            variant="warning"
            className="text-capitalize admin-toolbar-btn"
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
