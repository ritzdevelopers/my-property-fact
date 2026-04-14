"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
import { getPublicApiBase } from "@/lib/publicApiBase";

function apiWithAuth() {
  return {
    withCredentials: true,
    headers: {
      ...(typeof window !== "undefined" && Cookies.get("token")
        ? { Authorization: `Bearer ${Cookies.get("token")}` }
        : {}),
    },
  };
}

function formatWhen(iso) {
  if (iso == null || iso === "") return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

export default function PendingPermissionsClient() {
  const router = useRouter();
  const [adminRows, setAdminRows] = useState([]);
  const [passwordRows, setPasswordRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRequestId, setEditRequestId] = useState(null);
  const [editedPassword, setEditedPassword] = useState("");

  const load = useCallback(async () => {
    const base = getPublicApiBase();
    if (!base) {
      toast.error("API URL is not configured.");
      setAdminRows([]);
      setPasswordRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${base}users/pending-permissions`,
        apiWithAuth(),
      );
      const data = res.data || {};
      setAdminRows(
        Array.isArray(data.adminAccessRequests)
          ? data.adminAccessRequests
          : [],
      );
      setPasswordRows(
        Array.isArray(data.passwordChangeRequests)
          ? data.passwordChangeRequests
          : [],
      );
    } catch (e) {
      console.error(e);
      toast.error(
        e.response?.data?.message || "Could not load pending permissions.",
      );
      setAdminRows([]);
      setPasswordRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approveAdmin = async (id) => {
    const base = getPublicApiBase();
    try {
      await axios.put(
        `${base}users/${id}/approve-admin-staff`,
        {},
        apiWithAuth(),
      );
      toast.success("Admin access approved.");
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed.");
    }
  };

  const rejectAdmin = async (id) => {
    if (
      !window.confirm(
        "Reject this request? The Admin role and dashboard username will be removed.",
      )
    ) {
      return;
    }
    const base = getPublicApiBase();
    try {
      await axios.put(
        `${base}users/${id}/reject-admin-staff`,
        {},
        apiWithAuth(),
      );
      toast.success("Request rejected.");
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Reject failed.");
    }
  };

  const approvePasswordAsSubmitted = async (id) => {
    const base = getPublicApiBase();
    try {
      await axios.put(
        `${base}users/password-reset-requests/${id}/approve`,
        {},
        apiWithAuth(),
      );
      toast.success("Password updated using the proposed password.");
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Approve failed.");
    }
  };

  const openEditModal = (id) => {
    setEditRequestId(id);
    setEditedPassword("");
    setEditModalOpen(true);
  };

  const submitEditedPassword = async () => {
    if (!editRequestId) return;
    const p = editedPassword.trim();
    if (p.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    const base = getPublicApiBase();
    try {
      await axios.put(
        `${base}users/password-reset-requests/${editRequestId}/approve`,
        { editedPassword: p },
        apiWithAuth(),
      );
      toast.success("Password updated with your edited value.");
      setEditModalOpen(false);
      setEditRequestId(null);
      setEditedPassword("");
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed.");
    }
  };

  const rejectPassword = async (id) => {
    if (!window.confirm("Reject this password change request?")) return;
    const base = getPublicApiBase();
    try {
      await axios.put(
        `${base}users/password-reset-requests/${id}/reject`,
        {},
        apiWithAuth(),
      );
      toast.success("Password reset request rejected.");
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Reject failed.");
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <Spinner animation="border" role="status" variant="success" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <DashboardHeader heading="Pending permissions" />
      <p className="text-muted mb-4">
        Review staff who requested the Admin role from registration, and password
        change requests sent from the admin login screen. You can approve as
        submitted, set a different password, or reject.
      </p>

      <h5 className="mb-3">Admin access</h5>
      <p className="text-muted small mb-3">
        New registrations that included the Admin role and are waiting for your
        approval.
      </p>
      {adminRows.length === 0 ? (
        <p className="text-muted mb-5">No pending admin access requests.</p>
      ) : (
        <div className="table-responsive mb-5">
          <table className="table table-bordered align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Dashboard username</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminRows.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName || "—"}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.dashboardUsername || "—"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="success"
                      className="me-2"
                      onClick={() => approveAdmin(u.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => rejectAdmin(u.id)}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h5 className="mb-3">Password change request</h5>
      <p className="text-muted small mb-3">
        An existing admin proposed a new password from &ldquo;Forgot
        password&rdquo; on the login page. Approve to apply their hash, use
        &ldquo;Edit &amp; apply&rdquo; to set a different password, or reject.
      </p>
      {passwordRows.length === 0 ? (
        <p className="text-muted">No pending password change requests.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle bg-white">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Dashboard username</th>
                <th>Requested</th>
                <th style={{ minWidth: 280 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {passwordRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.fullName || "—"}</td>
                  <td>{row.email || "—"}</td>
                  <td>{row.dashboardUsername || "—"}</td>
                  <td>{formatWhen(row.requestedAt)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="success"
                      className="me-1 mb-1"
                      onClick={() => approvePasswordAsSubmitted(row.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="me-1 mb-1"
                      onClick={() => openEditModal(row.id)}
                    >
                      Edit &amp; apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="mb-1"
                      onClick={() => rejectPassword(row.id)}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={editModalOpen} onHide={() => setEditModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Set password for this account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted">
            This replaces the proposed password from the request. Minimum 8 characters.
          </p>
          <label className="form-label" htmlFor="superadmin-edit-pw">
            New password
          </label>
          <input
            id="superadmin-edit-pw"
            type="password"
            className="form-control"
            autoComplete="new-password"
            value={editedPassword}
            onChange={(e) => setEditedPassword(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={submitEditedPassword}>
            Apply password
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
