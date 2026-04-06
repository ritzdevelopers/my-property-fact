"use client";
import { exportTOExcel } from "../common-model/exporttoexcel";
import { toast } from "react-toastify";
import DashboardHeader from "../common-model/dashboardHeader";
import { useEffect, useMemo, useState } from "react";
import CommonModal from "../common-model/common-model";
import {
  Button,
  Form,
  FormControl,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import Link from "next/link";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

function enquirySource(row) {
  const from = row.enquiryFrom;
  if (from != null && String(from).trim() !== "") return String(from).trim();
  if (row.pageName != null && String(row.pageName).trim() !== "")
    return String(row.pageName).trim();
  if (row.projectLink != null && String(row.projectLink).trim() !== "")
    return "Project / listing";
  return "—";
}

function formatEnquiryDate(row) {
  const raw = row.createdAt ?? row.updatedAt ?? row.date;
  if (raw == null || raw === "") return "—";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

/** Newest first; missing/invalid dates sort last. */
function enquirySortTimeMs(row) {
  const raw = row.createdAt ?? row.updatedAt ?? row.date;
  if (raw == null || raw === "") return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function truncate(text, max) {
  if (text == null || text === "") return "—";
  const s = String(text);
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

const PAGE_SIZE = 25;

export default function Enquiries() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmBox, setConfirmBox] = useState(false);
  const [id, setId] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const apiBase = getPublicApiBase();

  const loadList = async () => {
    if (!apiBase) {
      toast.error("API URL is not configured (NEXT_PUBLIC_API_URL).");
      setList([]);
      setLoading(false);
      return;
    }
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
      const rows = Array.isArray(data) ? data : [];
      setList(rows);
      setPage(0);
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

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched =
      !q
        ? list
        : list.filter((row) => {
            const blob = [
              row.name,
              row.email,
              row.phone,
              row.message,
              row.enquiryFrom,
              row.pageName,
              row.projectLink,
              row.status,
              enquirySource(row),
              String(row.id ?? ""),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return blob.includes(q);
          });
    return [...matched].sort(
      (a, b) => enquirySortTimeMs(b) - enquirySortTimeMs(a),
    );
  }, [list, search]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageSlice = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, safePage]);

  const openConfirmationDialog = (rowId) => {
    setConfirmBox(true);
    setId(rowId);
  };

  const exportToExcel = async () => {
    const exportRows = filteredList.map((row, i) => ({
      index: i + 1,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      enquiryFrom: enquirySource(row),
      projectLink: row.projectLink,
      pageName: row.pageName,
      date: formatEnquiryDate(row),
      status: row.status,
    }));
    exportTOExcel(exportRows, "Enquiries");
    toast.success("Enquiries exported successfully...");
  };

  const handleStatusChange = async (e, enquiryId) => {
    const newStatus = e.target.value;
    if (!apiBase) return;
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

      {isSuperAdmin ? (
        <div className="mt-2">
          <div className="manage-users-toolbar">
            <InputGroup className="manage-users-search">
              <InputGroup.Text
                className="bg-white border-end-0"
                style={{ borderColor: "rgba(27, 46, 36, 0.12)" }}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search name, email, phone, message, source, page, link, status…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search enquiries"
                style={{ borderLeft: "none" }}
              />
            </InputGroup>
            <span className="manage-users-count">
              Showing {filteredList.length} of {list.length} enquiries
              {filteredList.length > PAGE_SIZE
                ? ` · Page ${safePage + 1} of ${pageCount}`
                : ""}
            </span>
          </div>

          <div className="manage-users-table-scroll">
            <table className="table table-sm manage-users-compact-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Source</th>
                  <th>Page</th>
                  <th>Link</th>
                  <th>When</th>
                  <th>Status</th>
                  <th style={{ width: 72 }}> </th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center text-muted py-4">
                      No enquiries match your search.
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((row, idx) => {
                    const src = enquirySource(row);
                    const when = formatEnquiryDate(row);
                    const st = row.status || "New";
                    const rowNum = safePage * PAGE_SIZE + idx + 1;
                    return (
                      <tr key={row.id}>
                        <td>{rowNum}</td>
                        <td className="fw-medium">{row.name || "—"}</td>
                        <td style={{ wordBreak: "break-all", maxWidth: 140 }}>
                          {row.email || "—"}
                        </td>
                        <td>{row.phone || "—"}</td>
                        <td
                          style={{ maxWidth: 200 }}
                          title={row.message || ""}
                        >
                          {truncate(row.message, 80)}
                        </td>
                        <td style={{ maxWidth: 140 }} title={src}>
                          {truncate(src, 40)}
                        </td>
                        <td style={{ maxWidth: 100 }} title={row.pageName || ""}>
                          {truncate(row.pageName, 24)}
                        </td>
                        <td style={{ maxWidth: 90 }}>
                          {row.projectLink ? (
                            <Link
                              href={row.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="small"
                            >
                              Open
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="text-nowrap small">{when}</td>
                        <td>
                          <FormControl
                            as="select"
                            size="sm"
                            value={st}
                            onChange={(e) =>
                              handleStatusChange(e, row.id)
                            }
                            style={{
                              backgroundColor: getStatusColor(st),
                              color: getStatusTextColor(st),
                              border: `1px solid ${getStatusTextColor(st)}40`,
                              borderRadius: "8px",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              minWidth: "108px",
                              cursor: "pointer",
                            }}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </FormControl>
                        </td>
                        <td className="text-end p-1">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="py-0 px-2"
                            title="Delete"
                            onClick={() => openConfirmationDialog(row.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredList.length > PAGE_SIZE ? (
            <div className="d-flex justify-content-between align-items-center mt-2 px-1 flex-wrap gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={safePage <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-muted small">
                Page {safePage + 1} of {pageCount}
              </span>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={safePage >= pageCount - 1}
                onClick={() =>
                  setPage((p) => Math.min(pageCount - 1, p + 1))
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <CommonModal
        api={`${apiBase}enquiry/delete/${id}`}
        setConfirmBox={setConfirmBox}
        confirmBox={confirmBox}
        fetchAllHeadersList={loadList}
      />
    </>
  );
}
