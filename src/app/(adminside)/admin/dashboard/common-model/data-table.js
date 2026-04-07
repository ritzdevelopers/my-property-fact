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

/** Shared MUI DataGrid styling (light header row) — use for standalone DataGrids outside DataTable. */
export const adminExecutiveDataGridSx = executiveGridSx;

/** Optional rowHeight, columnHeaderHeight, dataGridSx. Uses neutral (executive) grid chrome only. */
export default function DataTable({
  list,
  columns,
  rowHeight,
  columnHeaderHeight,
  dataGridSx,
  checkboxSelection = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const paginationModel = { page: 0, pageSize: 10 };

  const mergedSx = useMemo(() => {
    if (typeof dataGridSx === "object" && dataGridSx !== null) {
      return { ...executiveGridSx, ...dataGridSx };
    }
    return executiveGridSx;
  }, [dataGridSx]);

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
          borderRadius: "16px",
          border: "1px solid #eef0f4",
        }}
      >
        Loading…
      </Paper>
    );
  }

  const gridRowHeight = rowHeight ?? 56;
  const headerH = columnHeaderHeight ?? 48;

  return (
    <div className="admin-datagrid-scroll-host admin-datagrid-scroll-host--executive">
      <Paper
        className="admin-mui-datagrid-paper"
        elevation={0}
        sx={{ width: "100%", borderRadius: "16px" }}
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
          disableColumnMenu
          sx={mergedSx}
        />
      </Paper>
    </div>
  );
}
