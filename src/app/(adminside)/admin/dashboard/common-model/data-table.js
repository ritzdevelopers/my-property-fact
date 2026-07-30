"use client";
import { Paper } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";

const executiveGridSx = {
  border: "1px solid #e6e8ec",
  borderRadius: "10px",
  fontFamily: "'Nunito Sans', 'Source Sans 3', system-ui, sans-serif",
  boxShadow: "none",
  "& .MuiDataGrid-toolbarContainer": {
    padding: "0.55rem 0.85rem",
    borderBottom: "1px solid #e6e8ec",
    gap: "0.5rem",
    background: "#fafbfc",
    borderRadius: "10px 10px 0 0",
  },
  "& .MuiDataGrid-toolbarContainer button": {
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#6f8229",
    textTransform: "none",
    letterSpacing: "0.01em",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#fafbfc",
    borderBottom: "1px solid #e6e8ec",
  },
  "& .MuiDataGrid-columnHeader": {
    fontWeight: 700,
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#6b7280",
    backgroundColor: "#fafbfc",
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
    color: "#e6e8ec",
  },
  "& .MuiDataGrid-iconSeparator": {
    color: "#d1d5db",
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#fff",
    fontSize: "0.8125rem",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#f3f5e6 !important",
  },
  "& .MuiDataGrid-cell": {
    borderColor: "#eef0f3",
    color: "#1c2430",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.4,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid #e6e8ec",
    backgroundColor: "#fafbfc",
    fontWeight: 500,
    fontSize: "0.8125rem",
    color: "#6b7280",
  },
  "& .MuiCheckbox-root": {
    color: "#cbd5e1",
  },
  "& .Mui-checked, & .MuiCheckbox-root.Mui-checked": {
    color: "#8fa63a !important",
  },
  "& .centered-cell": {
    marginLeft: "0",
  },
  "& .MuiDataGrid-virtualScroller": {
    overflowX: "auto",
  },
};

/** Shared MUI DataGrid styling (light header row) — use for standalone DataGrids outside DataTable. */
export const adminExecutiveDataGridSx = executiveGridSx;

/** Optional rowHeight, columnHeaderHeight, dataGridSx. Uses neutral (executive) grid chrome only. */
export default function DataTable({
  list,
  columns,
  rowHeight,
  getRowHeight,
  columnHeaderHeight,
  dataGridSx,
  checkboxSelection = true,
  showToolbar = true,
  getRowClassName,
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
      <div className="admin-datagrid-loader">
        <div className="admin-datagrid-loader__spinner">
          <span className="admin-datagrid-loader__ring" />
        </div>
        <p className="admin-datagrid-loader__label">Loading data…</p>
      </div>
    );
  }

  const gridRowHeight = getRowHeight ? undefined : (rowHeight ?? 56);
  const headerH = columnHeaderHeight ?? 48;

  return (
    <div className="admin-datagrid-scroll-host admin-datagrid-scroll-host--executive">
      <Paper
        className="admin-mui-datagrid-paper"
        elevation={0}
        sx={{ width: "100%", borderRadius: "10px" }}
      >
        <DataGrid
          rows={list ?? []}
          columns={columns ?? []}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 15, 20, 50]}
          rowHeight={gridRowHeight}
          getRowHeight={getRowHeight}
          columnHeaderHeight={headerH}
          disableRowSelectionOnClick
          checkboxSelection={checkboxSelection}
          getRowClassName={
            getRowClassName
              ? (params) => getRowClassName(params.row) || ""
              : undefined
          }
          slots={showToolbar ? { toolbar: GridToolbar } : undefined}
          slotProps={
            showToolbar
              ? {
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 300 },
                    csvOptions: { disableToolbarButton: false },
                    printOptions: { disableToolbarButton: true },
                  },
                }
              : undefined
          }
          sx={mergedSx}
        />
      </Paper>
    </div>
  );
}
