"use client";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

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
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const paginationModel = { page: 0, pageSize: 10 };

  if (!mounted) {
    return (
      <Paper
        className="admin-mui-datagrid-paper"
        sx={{
          height: 400,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading…
      </Paper>
    );
  }

  const mergedSx =
    typeof dataGridSx === "object" && dataGridSx !== null
      ? { ...defaultGridSx, ...dataGridSx }
      : defaultGridSx;

  return (
    <div className="admin-datagrid-scroll-host">
      <Paper className="admin-mui-datagrid-paper" elevation={0} sx={{ width: "100%" }}>
        <DataGrid
          rows={list ?? []}
          columns={columns ?? []}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 15, 20, 50]}
          rowHeight={rowHeight}
          columnHeaderHeight={columnHeaderHeight}
          disableRowSelectionOnClick
          sx={mergedSx}
        />
      </Paper>
    </div>
  );
}
