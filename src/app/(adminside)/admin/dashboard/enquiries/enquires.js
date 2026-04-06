"use client";
import { exportTOExcel } from "../common-model/exporttoexcel";
import { toast } from "react-toastify";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useEffect, useState } from "react";
import CommonModal from "../common-model/common-model";
import { FormControl, Spinner } from "react-bootstrap";
import Link from "next/link";
import { useAdminRole } from "../../_contexts/AdminRoleContext";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

export default function Enquiries() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmBox, setConfirmBox] = useState(false);
  const [id, setId] = useState(0);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}enquiry/get-all`, {
        credentials: "include",
      });
      if (res.status === 403) {
        toast.error("Only Super Admins can manage enquiries.");
        setList([]);
        return;
      }
      if (!res.ok) {
        toast.error("Failed to load enquiries.");
        setList([]);
        return;
      }
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load enquiries.");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleLoading) return;
    if (!isSuperAdmin) {
      setList([]);
      setLoading(false);
      return;
    }
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when role context ready
  }, [roleLoading, isSuperAdmin]);

  const openConfirmationDialog = (rowId) => {
    setConfirmBox(true);
    setId(rowId);
  };

  const exportToExcel = async () => {
    exportTOExcel(list, "Enquiries");
    toast.success("Enquiries exported successfully...");
  };

  const handleStatusChange = async (e, enquiryId) => {
    const newStatus = e.target.value;
    try {
      const response = await fetch(
        `${apiBase}enquiry/update-status/${enquiryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        toast.success(`Status updated to ${newStatus} successfully`);
        await loadList();
      } else if (response.status === 403) {
        toast.error("Only Super Admins can update enquiries.");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Shared: "#e3f2fd",
      Test: "#fff3e0",
      New: "#e8f5e8",
      Pending: "#fff8e1",
      Rejected: "#ffebee",
      Duplicate: "#f5f5f5",
      Irrelevant: "#f3e5f5",
    };
    return colors[status] || "#f8f9fa";
  };

  const getStatusTextColor = (status) => {
    const colors = {
      Shared: "#1565c0",
      Test: "#ef6c00",
      New: "#2e7d32",
      Pending: "#f57f17",
      Rejected: "#c62828",
      Duplicate: "#616161",
      Irrelevant: "#7b1fa2",
    };
    return colors[status] || "#424242";
  };

  const statusOptions = [
    "New",
    "Shared",
    "Test",
    "Pending",
    "Rejected",
    "Duplicate",
    "Irrelevant",
  ];

  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 70,
      cellClassName: "centered-cell",
    },
    { field: "name", headerName: "Name", width: 180 },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "message",
      headerName: "Message",
      width: 370,
    },
    {
      field: "enquiryFrom",
      headerName: "Enquiry From",
      width: 370,
    },
    {
      field: "projectLink",
      headerName: "Project Link",
      width: 370,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            padding: "8px",
          }}
        >
          <Link
            href={params.row.projectLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#1976d2",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "500",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              position: "relative",
            }}
          >
            {params.row.projectLink && params.row.projectLink !== "" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15,3 21,3 21,9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            ) : null}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "280px",
              }}
            >
              {params.row.projectLink && params.row.projectLink !== ""
                ? params.row.projectLink.length > 40
                  ? `${params.row.projectLink.substring(0, 40)}...`
                  : params.row.projectLink
                : ""}
            </span>
          </Link>
        </div>
      ),
    },
    {
      field: "pageName",
      headerName: "Page Name",
      width: 200,
    },
    {
      field: "date",
      headerName: "Data & Time",
      width: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            padding: "8px",
          }}
        >
          <FormControl
            as="select"
            value={params.row.status || "New"}
            onChange={(e) => handleStatusChange(e, params.row.id)}
            style={{
              backgroundColor: getStatusColor(params.row.status || "New"),
              color: getStatusTextColor(params.row.status || "New"),
              border: `2px solid ${getStatusTextColor(
                params.row.status || "New",
              )}30`,
              borderRadius: "12px",
              padding: "5px 10px",
              minWidth: "150px",
              fontWeight: "600",
              fontSize: "14px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow:
                "0 3px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)",
              outline: "none",
              appearance: "none",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              backgroundSize: "18px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {statusOptions.map((status) => (
              <option
                key={status}
                value={status}
                style={{
                  backgroundColor: getStatusColor(status),
                  color: getStatusTextColor(status),
                  fontWeight: "600",
                  padding: "8px",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {status}
              </option>
            ))}
          </FormControl>
        </div>
      ),
    },
  ];

  if (roleLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="success" />
      </div>
    );
  }

  return (
    <>
      <DashboardHeader
        buttonName={"Export to excel"}
        functionName={exportToExcel}
        heading={"Manage Enquiries"}
      />
      {!isSuperAdmin ? (
        <div className="alert alert-warning mt-3">
          Only Super Admins can view and manage enquiries.
        </div>
      ) : null}
      <div>
        <DataTable columns={columns} list={list} />
      </div>
      <CommonModal
        api={`${apiBase}enquiry/delete/${id}`}
        setConfirmBox={setConfirmBox}
        confirmBox={confirmBox}
        fetchAllHeadersList={loadList}
      />
    </>
  );
}
