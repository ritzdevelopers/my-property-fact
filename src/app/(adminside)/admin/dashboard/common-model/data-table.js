"use client";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";

const executiveGridSx = {
  border: "1px solid #eef0f4",
  borderRadius: "16px",
  fontFamily: "'Lato', 'Poppins', system-ui, sans-serif",
  boxShadow: "0 2px 12px rgba(17, 24, 39, 0.06)",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#f3f4f6",
    borderBottom: "1px solid #e5e7eb",
  },
  "& .MuiDataGrid-columnHeader": {
    fontWeight: 700,
    fontSize: "0.6875rem",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    outline: "none !important",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    whiteSpace: "normal",
    lineHeight: 1.25,
    overflow: "visible",
  },
  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
    {
      outline: "none !important",
    },
  "& .MuiDataGrid-columnSeparator": {
    color: "#e5e7eb",
  },
  "& .MuiDataGrid-iconSeparator": {
    color: "#d1d5db",
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#fff",
    fontSize: "0.875rem",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#f9fafb !important",
  },
  "& .MuiDataGrid-cell": {
    borderColor: "#eef0f4",
    color: "#111827",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid #eef0f4",
    backgroundColor: "#fafafa",
    fontWeight: 500,
    fontSize: "0.8125rem",
    color: "#6b7280",
  },
  "& .MuiCheckbox-root": {
    color: "#cbd5e1",
  },
  "& .Mui-checked, & .MuiCheckbox-root.Mui-checked": {
    color: "#01613E !important",
  },
  "& .centered-cell": {
    marginLeft: "0",
  },
};

const defaultGridSx = {
  border: "none",
  borderRadius: "12px",
  fontFamily: "'Poppins', system-ui, sans-serif",
  "& .MuiDataGrid-columnHeaders": {
    borderBottom: "2px solid rgba(255,255,255,0.2)",
  },
  "& .MuiDataGrid-columnHeader": {
    fontWeight: 700,
    fontSize: "0.8125rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#fff",
    background: "linear-gradient(180deg, #4a9960 0%, #3d8250 100%)",
    outline: "none !important",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    whiteSpace: "normal",
    lineHeight: 1.2,
    overflow: "visible",
  },
  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
    outline: "none !important",
  },
  "& .MuiDataGrid-columnSeparator": {
    color: "rgba(255,255,255,0.25)",
  },
  "& .MuiDataGrid-iconSeparator": {
    color: "rgba(255,255,255,0.5)",
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#fff",
    fontSize: "0.875rem",
  },
  "& .MuiDataGrid-row:nth-of-type(even)": {
    backgroundColor: "rgba(74, 153, 96, 0.04)",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "rgba(74, 153, 96, 0.1) !important",
  },
  "& .MuiDataGrid-cell": {
    borderColor: "rgba(27, 46, 36, 0.07)",
    color: "#1b2e24",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid rgba(27, 46, 36, 0.1)",
    backgroundColor: "rgba(248, 251, 249, 0.95)",
    fontWeight: 500,
    fontSize: "0.8125rem",
  },
  "& .centered-cell": {
    marginLeft: "10px",
  },
};

/** Optional rowHeight, columnHeaderHeight, dataGridSx for page-specific grids. */
export default function DataTable({
  list,
  columns,
  rowHeight,
  columnHeaderHeight,
  dataGridSx,
  /** @type {"executive" | "legacy"} executive = light header, checkboxes on by default */
  variant = "executive",
  checkboxSelection = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const paginationModel = { page: 0, pageSize: 10 };

  const mergedSx = useMemo(() => {
    const base = variant !== "legacy" ? executiveGridSx : defaultGridSx;
    if (typeof dataGridSx === "object" && dataGridSx !== null) {
      return { ...base, ...dataGridSx };
    }
    return base;
  }, [variant, dataGridSx]);

  if (!mounted) {
    return (
      <Paper
        className="admin-mui-datagrid-paper admin-mui-datagrid-paper--loading"
        sx={{
          height: 400,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: variant !== "legacy" ? "16px" : undefined,
          border: variant !== "legacy" ? "1px solid #eef0f4" : undefined,
        }}
      >
        Loading…
      </Paper>
    );
  }

  const isExecutive = variant !== "legacy";
  const gridRowHeight = rowHeight ?? (isExecutive ? 56 : undefined);
  const headerH = columnHeaderHeight ?? (isExecutive ? 48 : undefined);

  return (
    <div
      className={`admin-datagrid-scroll-host${isExecutive ? " admin-datagrid-scroll-host--executive" : ""}`}
    >
      <Paper
        className="admin-mui-datagrid-paper"
        elevation={0}
        sx={{ width: "100%", borderRadius: isExecutive ? "16px" : undefined }}
      >
        <DataGrid
          rows={list ?? []}
          columns={columns ?? []}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 15, 20, 50]}
          rowHeight={gridRowHeight}
          columnHeaderHeight={headerH}
          disableRowSelectionOnClick
          checkboxSelection={checkboxSelection}
          disableColumnMenu={isExecutive}
          sx={mergedSx}
        />
      </Paper>
    </div>
  );
}
