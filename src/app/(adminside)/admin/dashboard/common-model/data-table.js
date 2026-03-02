"use client";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";

export default function DataTable({ list, columns }) {
    const [mounted, setMounted] = useState(false);

    // Defer DataGrid until after mount to avoid "state update on unmounted component"
    // (MUI Data Grid's internal layout/ref effects can trigger setState before commit)
    useEffect(() => {
        setMounted(true);
    }, []);

    //Defining default rows
    const paginationModel = { page: 0, pageSize: 10 };

    if (!mounted) {
        return (
            <Paper sx={{ height: 400, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Loading…
            </Paper>
        );
    }

    return (
        <>
            <Paper sx={{ height: 'auto', width: "auto" }}>
                <DataGrid
                    rows={list ?? []}
                    columns={columns ?? []}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[10, 15, 20, 50]}
                    sx={{
                        border: 0,
                        "& .MuiDataGrid-columnHeader": {
                            fontWeight: "bold",
                            fontSize: "16px",
                            backgroundColor: "#68ac78",
                        },
                        "& .centered-cell": {
                            marginLeft: "10px"
                        },
                    }}
                />
            </Paper>
        </>
    )
}