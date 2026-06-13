"use client";
import { Button } from "react-bootstrap";
import DataTable from "../common-model/data-table";
import { Box, IconButton, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { AdminTableDeleteIcon } from "../common-model/admin-table-icons";
import { useState } from "react";
import CommonModal from "../common-model/common-model";
import { exportTOExcel } from "../common-model/exporttoexcel";
import { toast } from "../../_lib/adminToast";

export default function ManageCareerApplications({ list = [] }) {
    const [applicationId, setApplicationId] = useState(0);
    const [confirmBox, setConfirmBox] = useState(false);

    // Function to handle deletion of an application
    const deleteApplication = async (id) => {
        setConfirmBox(true);
        setApplicationId(id);
    }

    // Function to export data to Excel (placeholder for actual implementation)
    const exportDataToExcel = (data) => {
        exportTOExcel(data, "Career Applications");
        toast.success("Career applications exported successfully...");
    }

    // Define columns for the DataTable
    const columns = [
        { field: "index", headerName: "S.no", width: 50 },
        { field: "fullName", headerName: "Full Name", flex: 1 },
        { field: "emailId", headerName: "Email Id", flex: 1 },
        { field: "phoneNumber", headerName: "Phone Number", flex: 1 },
        {
            field: "resumeFile",
            headerName: "Resume",
            flex: 1,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" noWrap>
                        {params.value}
                    </Typography>
                    <IconButton
                        onClick={async () => {
                            const response = await fetch(params.value);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = params.value.split("/").pop(); // use file name from URL
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                        }}
                    >
                        <FontAwesomeIcon icon={faDownload} />
                    </IconButton>
                </Box>
            ),
        },
        { field: "createAt", headerName: "Applied On", flex: 1 },
        {
            field: "action", headerName: "Action", flex: 1, renderCell: (params) => (
                <IconButton
                    size="small"
                    aria-label="Delete application"
                    onClick={() => deleteApplication(params.row.id)}
                >
                    <AdminTableDeleteIcon />
                </IconButton>
            )
        },
    ];

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                <h1>Manage Career Applications</h1>
                <Button className="btn btn-success" onClick={() => exportDataToExcel(list)}>
                    Export to excel
                </Button>
            </div>
            <div className="table-responsive">
                <DataTable columns={columns} list={list} />
            </div>
            <CommonModal 
                api={`${process.env.NEXT_PUBLIC_API_URL}career/${applicationId}`}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />
        </>
    );
}