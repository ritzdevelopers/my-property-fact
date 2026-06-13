"use client";
import { exportTOExcel } from "../common-model/exporttoexcel";
import { toast } from "../../_lib/adminToast";
import DashboardHeader from "../common-model/dashboardHeader";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ADMIN_PERMISSIONS } from "../../adminPermissions";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { AdminTableDeleteIcon } from "../common-model/admin-table-icons";
import "./enquiries-unlock.css";

function enquirySource(row) {
  const from = String(row.enquiryFrom || "").trim().toUpperCase();
  if (from === "APP") return "App";
  // Existing frontend flow should be treated as Website by default.
  return "Website";
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

function sourceBadgeClass(source) {
  return source === "App" ? "admin-chip-role" : "admin-chip-ok";
}

function getSourcePageLink(row) {
  const direct = String(row?.projectLink || "").trim();
  if (direct) return direct;

  const pageName = String(row?.pageName || "").trim();
  if (!pageName) return "";
  if (/^https?:\/\//i.test(pageName)) return pageName;
  if (pageName.startsWith("/")) {
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}${pageName}`;
    }
    return pageName;
  }
  return "";
}

const PAGE_SIZE = 10;

function StatusDropdown({ currentStatus, options, onSelect, getStatusColor, getStatusTextColor }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="status-custom-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="status-custom-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: getStatusColor(currentStatus),
          color: getStatusTextColor(currentStatus),
          borderColor: `${getStatusTextColor(currentStatus)}44`
        }}
      >
        <span>{currentStatus}</span>
        <svg 
          width="10" 
          height="6" 
          viewBox="0 0 10 6" 
          fill="none" 
          className={`status-custom-arrow ${isOpen ? 'is-open' : ''}`}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="status-custom-menu">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`status-custom-item ${opt === currentStatus ? 'is-active' : ''}`}
              onClick={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
            >
              <span 
                className="status-custom-dot" 
                style={{ backgroundColor: getStatusTextColor(opt) }} 
              />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Enquiries() {
  const { isSuperAdmin, hasPermission, loading: roleLoading } = useAdminRole();
  const canUseEnquiries =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmBox, setConfirmBox] = useState(false);
  const [id, setId] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [accessStatus, setAccessStatus] = useState(null);
  const [unlockCells, setUnlockCells] = useState(["", "", "", ""]);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const unlockInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const apiBase = getPublicApiBase();

  const fetchAccessStatus = useCallback(async () => {
    if (!apiBase) return null;
    try {
      const res = await fetch(`${apiBase}admin-portal/auth/enquiry-access-status`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, [apiBase]);

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
        toast.error(
          "Enquiries access denied. Enter your 4-digit code or contact a Super Admin.",
        );
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
    if (!canUseEnquiries) {
      setList([]);
      setLoading(false);
      setAccessStatus(null);
      return;
    }
    if (isSuperAdmin) {
      setAccessStatus({ unlocked: true, needsCode: false, hasPermission: true });
      loadList();
      return;
    }
    let cancelled = false;
    (async () => {
      const st = await fetchAccessStatus();
      if (cancelled) return;
      if (!st) {
        toast.error("Could not verify enquiries access. Try refreshing the page.");
        setAccessStatus({ fetchFailed: true });
        setLoading(false);
        setList([]);
        return;
      }
      setAccessStatus(st);
      if (st.unlocked) {
        await loadList();
      } else {
        setLoading(false);
        setList([]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- gate on role + permission
  }, [roleLoading, canUseEnquiries, isSuperAdmin, fetchAccessStatus]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    const code = unlockCells.join("").replace(/\D/g, "");
    if (!apiBase || code.length !== 4) {
      toast.error("Enter the 4-digit code.");
      return;
    }
    setUnlockBusy(true);
    try {
      const res = await fetch(`${apiBase}admin-portal/auth/unlock-enquiries`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        toast.error(data.message || "Could not unlock enquiries.");
        return;
      }
      toast.success("Unlocked. You can manage enquiries until the session expires.");
      setUnlockCells(["", "", "", ""]);
      setAccessStatus((prev) =>
        prev ? { ...prev, unlocked: true } : { unlocked: true },
      );
      await loadList();
    } catch (err) {
      console.error(err);
      toast.error("Unlock request failed.");
    } finally {
      setUnlockBusy(false);
    }
  };

  const handleUnlockDigitChange = (index, raw) => {
    const digit = String(raw).replace(/\D/g, "").slice(-1);
    setUnlockCells((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 3) {
      unlockInputRefs[index + 1].current?.focus();
    }
  };

  const handleUnlockDigitKeyDown = (index, e) => {
    if (e.key !== "Backspace") return;
    if (unlockCells[index]) {
      setUnlockCells((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      e.preventDefault();
      return;
    }
    if (index > 0) {
      unlockInputRefs[index - 1].current?.focus();
      setUnlockCells((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      e.preventDefault();
    }
  };

  const handleUnlockPaste = (e) => {
    e.preventDefault();
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = ["", "", "", ""];
    for (let i = 0; i < t.length; i++) next[i] = t[i];
    setUnlockCells(next);
    const focusAt = Math.min(t.length, 3);
    requestAnimationFrame(() => unlockInputRefs[focusAt].current?.focus());
  };

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

  const handleStatusChange = async (newStatus, enquiryId) => {
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
        toast.error(
          "Enquiries access denied. Unlock again with your 4-digit code if needed.",
        );
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

  const showUnlockGate =
    canUseEnquiries &&
    !isSuperAdmin &&
    accessStatus &&
    !accessStatus.fetchFailed &&
    accessStatus.hasPermission &&
    !accessStatus.unlocked;

  const showTable =
    canUseEnquiries &&
    (isSuperAdmin || (accessStatus && accessStatus.unlocked));

  useEffect(() => {
    if (!showUnlockGate) return;
    const t = setTimeout(() => unlockInputRefs[0].current?.focus(), 120);
    return () => clearTimeout(t);
  }, [showUnlockGate]);

  if (roleLoading || (canUseEnquiries && !isSuperAdmin && accessStatus === null)) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status" variant="success" />
      </div>
    );
  }

  return (
    <div className="admin-page-surface enquiries-page">
      <DashboardHeader
        heading="Manage Enquiries"
        pageStyle="executivePlain"
        exportExcel={showTable && !loading ? "Export to Excel" : undefined}
        exportFunction={exportToExcel}
      />
      {!canUseEnquiries ? (
        <div className="alert alert-warning mt-3">
          You do not have permission to manage enquiries. Ask a Super Admin to
          assign &quot;Manage enquiries&quot; in Manage Users.
        </div>
      ) : null}

      {canUseEnquiries && !isSuperAdmin && accessStatus?.fetchFailed ? (
        <div className="alert alert-danger mt-3">
          Could not verify enquiries access. Check your connection and refresh
          the page.
        </div>
      ) : null}

      {showUnlockGate ? (
        <div className="enquiries-unlock-shell">
          <div className="enquiries-unlock-card">
            <div className="enquiries-unlock-icon-ring" aria-hidden>
              <FontAwesomeIcon icon={faLock} />
            </div>
            <h2 className="enquiries-unlock-title">Unlock enquiries</h2>
            <p className="enquiries-unlock-lead">
              Enter the 4-digit code your Super Admin shared with you. After
              unlocking, you can view and update leads until the session expires
              or you log out.
            </p>
            <Form onSubmit={handleUnlock} className="text-start">
              <span className="enquiries-unlock-pin-label" id="enquiries-pin-label">
                Access code
              </span>
              <div
                className="enquiries-unlock-pin-row"
                onPaste={handleUnlockPaste}
                role="group"
                aria-labelledby="enquiries-pin-label"
              >
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={unlockInputRefs[i]}
                    type="password"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    name={i === 0 ? "enquiry-pin-0" : undefined}
                    maxLength={1}
                    className="enquiries-unlock-digit"
                    value={unlockCells[i]}
                    disabled={unlockBusy}
                    onChange={(e) => handleUnlockDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleUnlockDigitKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    aria-label={`Digit ${i + 1} of 4`}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="enquiries-unlock-submit"
                disabled={unlockBusy || unlockCells.join("").length !== 4}
              >
                {unlockBusy ? "Verifying…" : "Unlock enquiries"}
              </button>
              <p className="enquiries-unlock-foot mb-0">
                Tip: you can paste the full code at once into any box.
              </p>
            </Form>
          </div>
        </div>
      ) : null}

      {loading && showTable ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" role="status" variant="success" />
        </div>
      ) : null}

      {!loading && showTable ? (
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
            <table className="table manage-users-compact-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Message</th>
                  <th>Device Source</th>
                  <th>Source Page</th>
                  <th>When</th>
                  <th style={{ width: 140 }}>Status</th>
                  <th style={{ width: 60 }} className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-5">
                      No enquiries match your search.
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((row, idx) => {
                    const src = enquirySource(row);
                    const when = formatEnquiryDate(row);
                    const st = row.status || "New";
                    const rowNum = safePage * PAGE_SIZE + idx + 1;
                    const sourcePageLink = getSourcePageLink(row);
                    return (
                      <tr key={row.id}>
                        <td>{rowNum}</td>
                        <td>
                          <div className="fw-700 text-dark">{row.name || "—"}</div>
                        </td>
                        <td>
                          <div className="small text-dark mb-1">{row.email || "—"}</div>
                          <div className="small text-muted">{row.phone || "—"}</div>
                        </td>
                        <td>
                          <div
                            className="text-dark small"
                            style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}
                            title={row.message || ""}
                          >
                            {truncate(row.message, 120)}
                          </div>
                        </td>
                        <td>
                          <div className="small mb-1">
                            <span className={sourceBadgeClass(src)}>{src}</span>
                          </div>
                        </td>
                        <td>
                          {sourcePageLink ? (
                            <Link
                              href={sourcePageLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="small text-decoration-none"
                              title={sourcePageLink}
                            >
                              {truncate(sourcePageLink, 42)}
                            </Link>
                          ) : (
                            <div className="small text-muted" title={row.pageName}>
                              {truncate(row.pageName, 25)}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="text-nowrap small text-dark fw-500">{when}</div>
                        </td>
                        <td>
                          <StatusDropdown
                            currentStatus={st}
                            options={statusOptions}
                            onSelect={(newStatus) => handleStatusChange(newStatus, row.id)}
                            getStatusColor={getStatusColor}
                            getStatusTextColor={getStatusTextColor}
                          />
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="admin-grid-action admin-grid-action--delete"
                            onClick={() => openConfirmationDialog(row.id)}
                            style={{ padding: '6px 10px' }}
                          >
                            <img src="/images/admin/delete.svg" alt="" width={12} height={14} style={{ filter: "brightness(10)" }} />
                          </button>
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
    </div>
  );
}
