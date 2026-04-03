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
    <>
      <div className="d-flex justify-content-between mt-2">
        <h1>{heading}</h1>
        <div>
          {exportExcel && (
            <Button
              className="mx-3 btn btn-warning text-capitalize"
              disabled={exportDisabled}
              onClick={() => exportFunction()}
            >
              {exportExcel}
            </Button>
          )}
          {buttonName && (
            <Button
              className="mx-3 btn btn-success text-capitalize"
              onClick={() => functionName()}
            >
              {buttonName}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
