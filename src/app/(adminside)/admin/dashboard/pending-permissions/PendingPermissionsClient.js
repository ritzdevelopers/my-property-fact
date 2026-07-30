"use client";
import { adminApiWithAuth, adminFetchHeaders } from "../../_lib/adminApiAuth";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Spinner } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import DashboardHeader from "../common-model/dashboardHeader";
import { useAdminConfirm } from "../../_contexts/AdminConfirmContext";
import { useRouter } from "next/navigation";
import { getPublicApiBase } from "@/lib/publicApiBase";
import "./pending-permissions.css";



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
  const { confirm } = useAdminConfirm();
  const [adminRows, setAdminRows] = useState([]);
  const [passwordRows, setPasswordRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRequestId, setEditRequestId] = useState(null);
  const [editedPassword, setEditedPassword] = useState("");
  const [rejectPortalUser, setRejectPortalUser] = useState(null);
  const [rejectPortalSubmitting, setRejectPortalSubmitting] = useState(false);

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
        adminApiWithAuth(),
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
        adminApiWithAuth(),
      );
      toast.success("Registration approved.");
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed.");
    }
  };

  const openRejectPortalModal = (u) => {
    setRejectPortalUser(u);
  };

  const closeRejectPortalModal = () => {
    if (!rejectPortalSubmitting) {
      setRejectPortalUser(null);
    }
  };

  const confirmRejectPortal = async () => {
    const u = rejectPortalUser;
    if (!u) return;
    const base = getPublicApiBase();
    setRejectPortalSubmitting(true);
    try {
      await axios.put(
        `${base}users/${u.id}/reject-admin-staff`,
        {},
        adminApiWithAuth(),
      );
      toast.success("Rejected.");
      setRejectPortalUser(null);
      await load();
      router.refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Reject failed.");
    } finally {
      setRejectPortalSubmitting(false);
    }
  };

  const approvePasswordAsSubmitted = async (id) => {
    const base = getPublicApiBase();
    try {
      await axios.put(
        `${base}users/password-reset-requests/${id}/approve`,
        {},
        adminApiWithAuth(),
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
        adminApiWithAuth(),
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
    const ok = await confirm({
      title: "Reject password change?",
      description:
        "The user will keep their current password. They can submit a new request from the forgot-password screen if needed.",
      confirmText: "Reject request",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    const base = getPublicApiBase();
    try {
      await axios.put(
        `${base}users/password-reset-requests/${id}/reject`,
        {},
        adminApiWithAuth(),
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
      <div className="pending-permissions-loading">
        <Spinner animation="border" role="status" variant="success" />
      </div>
    );
  }

  return (
    <div className="pending-permissions-page">
      <DashboardHeader heading="Pending permissions" pageStyle="executivePlain" />
      <p className="pending-permissions-page__intro">
        Review portal registrations awaiting Super Administrator activation,
        staff who requested Admin from registration, and password change requests from the admin
        login screen. You can approve, edit, or reject.
      </p>

      <section className="pending-permissions-section" aria-labelledby="portal-registrations-heading">
        <div className="pending-permissions-section__head">
          <h2 id="portal-registrations-heading" className="pending-permissions-section__title">
            Portal registrations
          </h2>
          <p className="pending-permissions-section__desc">
            Accounts created via the admin signup page that still need activation (User-only or Admin).
          </p>
        </div>
        <div className="pending-permissions-section__body">
          {adminRows.length === 0 ? (
            <p className="pending-permissions-empty">No pending portal registrations.</p>
          ) : (
            <div className="pending-permissions-table-wrap">
              <table className="pending-permissions-table">
                <thead>
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
                        <div className="pending-permissions-actions">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => approveAdmin(u.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => openRejectPortalModal(u)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="pending-permissions-section" aria-labelledby="password-requests-heading">
        <div className="pending-permissions-section__head">
          <h2 id="password-requests-heading" className="pending-permissions-section__title">
            Password change requests
          </h2>
          <p className="pending-permissions-section__desc">
            An existing admin proposed a new password from &ldquo;Forgot password&rdquo; on the login page.
            Approve to apply their hash, use &ldquo;Edit &amp; apply&rdquo; to set a different password, or reject.
          </p>
        </div>
        <div className="pending-permissions-section__body">
          {passwordRows.length === 0 ? (
            <p className="pending-permissions-empty">No pending password change requests.</p>
          ) : (
            <div className="pending-permissions-table-wrap">
              <table className="pending-permissions-table">
                <thead>
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
                        <div className="pending-permissions-actions">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => approvePasswordAsSubmitted(row.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openEditModal(row.id)}
                          >
                            Edit &amp; apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => rejectPassword(row.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Modal
        show={!!rejectPortalUser}
        onHide={closeRejectPortalModal}
        centered
        backdrop={rejectPortalSubmitting ? "static" : true}
        keyboard={!rejectPortalSubmitting}
      >
        <Modal.Header closeButton>
          <Modal.Title>Reject registration?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rejectPortalUser ? (
            <>
              <p className="mb-3">
                {(() => {
                  const rolesUpper = (rejectPortalUser.roles || []).map((r) =>
                    String(r?.roleName || "").toUpperCase(),
                  );
                  return rolesUpper.includes("ADMIN")
                    ? "The Admin role and dashboard username will be removed."
                    : "The portal account will be disabled.";
                })()}
              </p>
              <div className="rounded border bg-light p-3 small">
                <div className="fw-semibold">
                  {rejectPortalUser.fullName || "—"}
                </div>
                <div className="text-break">{rejectPortalUser.email || "—"}</div>
                <div className="pending-permissions-section__desc mt-1">
                  Dashboard user: {rejectPortalUser.dashboardUsername || "—"}
                </div>
              </div>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={rejectPortalSubmitting}
            onClick={closeRejectPortalModal}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={rejectPortalSubmitting}
            onClick={confirmRejectPortal}
          >
            {rejectPortalSubmitting ? "Rejecting…" : "Reject registration"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={editModalOpen} onHide={() => setEditModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Set password for this account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="pending-permissions-section__desc">
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
