"use client";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import Cookies from "js-cookie";
import "../../../_components/PortalUI.css";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const EMPTY_FORM = {
  reraId: "",
  reraState: "",
  registrationNumber: "",
  registrationDate: "",
  expiryDate: "",
  status: "Active",
  documentUrl: "",
  notes: "",
};

const STATUS_TONE = {
  Active: "green",
  Pending: "amber",
  Expired: "red",
  Inactive: "slate",
};

function isExpired(expiryDate) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Days until expiry; negative when already lapsed. */
function daysUntil(expiryDate) {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
}

export default function RERAPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRera, setSelectedRera] = useState(null);
  const [reraCredentials, setReraCredentials] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchReraCredentials();
  }, []);

  const fetchReraCredentials = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: wire to `user/rera-credentials` once the backend endpoint ships.
      setLoading(false);
    } catch (err) {
      console.error("Error fetching RERA credentials:", err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRera = () => {
    setFormData(EMPTY_FORM);
    setSelectedRera(null);
    setShowFormModal(true);
  };

  const handleEditRera = (rera) => {
    setFormData({
      reraId: rera.reraId || "",
      reraState: rera.reraState || "",
      registrationNumber: rera.registrationNumber || "",
      registrationDate: rera.registrationDate || "",
      expiryDate: rera.expiryDate || "",
      status: rera.status || "Active",
      documentUrl: rera.documentUrl || "",
      notes: rera.notes || "",
    });
    setSelectedRera(rera);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setSelectedRera(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Please login again to save RERA credentials.");
        setSaving(false);
        return;
      }

      // TODO: replace the simulated call with the real create/update request.
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccess(
        selectedRera
          ? "RERA credential updated successfully."
          : "RERA credential added successfully.",
      );
      await fetchReraCredentials();
      closeFormModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving RERA credential:", err);
      setError(err.message || "Failed to save RERA credential. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRera) return;
    setSaving(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Please login again to delete RERA credentials.");
        setSaving(false);
        return;
      }

      // TODO: replace the simulated call with the real delete request.
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess("RERA credential deleted.");
      await fetchReraCredentials();
      setShowDeleteModal(false);
      setSelectedRera(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting RERA credential:", err);
      setError(err.message || "Failed to delete RERA credential. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    {
      label: "Total Credentials",
      value: reraCredentials.length,
      icon: BadgeCheck,
      tone: "emerald",
    },
    {
      label: "Active",
      value: reraCredentials.filter((r) => r.status === "Active" && !isExpired(r.expiryDate))
        .length,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Pending",
      value: reraCredentials.filter((r) => r.status === "Pending").length,
      icon: Clock,
      tone: "amber",
    },
    {
      label: "Expired",
      value: reraCredentials.filter((r) => isExpired(r.expiryDate)).length,
      icon: AlertTriangle,
      tone: "red",
    },
  ];

  const expiringSoon = reraCredentials.filter((r) => {
    const days = daysUntil(r.expiryDate);
    return days !== null && days > 0 && days <= 60;
  });

  return (
    <div className="brk-page">
      <header className="brk-page-head">
        <div className="brk-page-head__main">
          <span className="brk-page-head__icon">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h1 className="brk-page-head__title">RERA Compliance</h1>
            <p className="brk-page-head__sub">
              Keep your registration credentials current so your listings stay publishable
            </p>
          </div>
        </div>
        <div className="brk-page-head__actions">
          <button type="button" className="brk-btn brk-btn--primary" onClick={handleAddRera}>
            <Plus size={15} />
            Add Credential
          </button>
        </div>
      </header>

      <div className="brk-process" aria-label="Why RERA matters">
        <div className="brk-process__item">
          <span className="brk-process__num">1</span>
          <div>
            <p className="brk-process__title">Stay listable</p>
            <p className="brk-process__text">
              Some states require a valid RERA ID before a listing can go live.
            </p>
          </div>
        </div>
        <div className="brk-process__item">
          <span className="brk-process__num">2</span>
          <div>
            <p className="brk-process__title">Build buyer trust</p>
            <p className="brk-process__text">
              A current registration shows you operate as a verified broker.
            </p>
          </div>
        </div>
        <div className="brk-process__item">
          <span className="brk-process__num">3</span>
          <div>
            <p className="brk-process__title">Renew on time</p>
            <p className="brk-process__text">
              We flag credentials that expire within 60 days so listings are not interrupted.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="brk-alert brk-alert--error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button
            type="button"
            className="brk-alert__close"
            onClick={() => setError(null)}
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {success && (
        <div className="brk-alert brk-alert--success" role="status">
          <CheckCircle2 size={16} />
          <span>{success}</span>
          <button
            type="button"
            className="brk-alert__close"
            onClick={() => setSuccess(null)}
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="brk-stat-grid" aria-busy="true">
          {stats.map((s) => (
            <div key={s.label} className="brk-stat brk-stat--skeleton" />
          ))}
        </div>
      ) : (
        <div className="brk-stat-grid">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className={`brk-stat brk-stat--${tone}`}>
              <span className={`brk-stat__icon brk-stat__icon--${tone}`}>
                <Icon size={18} />
              </span>
              <span className="brk-stat__body">
                <span className="brk-stat__label">{label}</span>
                <span className="brk-stat__value">{value}</span>
              </span>
            </article>
          ))}
        </div>
      )}

      {expiringSoon.length > 0 && (
        <div className="brk-alert brk-alert--warning">
          <AlertTriangle size={16} />
          <span>
            {expiringSoon.length} credential{expiringSoon.length > 1 ? "s expire" : " expires"} within
            the next 60 days. Renew early to avoid listing interruptions.
          </span>
        </div>
      )}

      <section className="brk-panel">
        <div className="brk-panel__head">
          <div>
            <h2 className="brk-panel__title">Registered Credentials</h2>
            <p className="brk-panel__sub">
              {reraCredentials.length} credential{reraCredentials.length === 1 ? "" : "s"} on file
            </p>
          </div>
        </div>

        {loading ? (
          <div className="brk-loading">
            <span className="brk-spinner" />
            Loading RERA credentials…
          </div>
        ) : reraCredentials.length === 0 ? (
          <div className="brk-empty">
            <span className="brk-empty__icon">
              <BadgeCheck size={24} />
            </span>
            <h3 className="brk-empty__title">No RERA credentials yet</h3>
            <p className="brk-empty__text">
              Add your RERA registration to prove compliance, build buyer trust, and unlock
              listing in states that require it. You can store multiple state credentials.
            </p>
            <button type="button" className="brk-btn brk-btn--primary" onClick={handleAddRera}>
              <Plus size={15} />
              Add Your First Credential
            </button>
          </div>
        ) : (
          <div className="brk-table-wrap">
            <table className="brk-table">
              <thead>
                <tr>
                  <th>RERA ID</th>
                  <th>State</th>
                  <th>Registration No.</th>
                  <th>Registered</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reraCredentials.map((rera) => {
                  const expired = isExpired(rera.expiryDate);
                  const tone = expired ? "red" : STATUS_TONE[rera.status] || "slate";
                  return (
                    <tr key={rera.id}>
                      <td>
                        <span className="brk-table__primary">{rera.reraId}</span>
                        {rera.notes && <span className="brk-table__meta">{rera.notes}</span>}
                      </td>
                      <td>
                        <span className="brk-table__contact">
                          <MapPin size={13} />
                          {rera.reraState}
                        </span>
                      </td>
                      <td className={rera.registrationNumber ? "" : "brk-table__muted"}>
                        {rera.registrationNumber || "—"}
                      </td>
                      <td className="brk-table__muted" style={{ whiteSpace: "nowrap" }}>
                        {formatDate(rera.registrationDate) || "—"}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {rera.expiryDate ? (
                          <span style={expired ? { color: "#b91c1c", fontWeight: 700 } : undefined}>
                            {formatDate(rera.expiryDate)}
                          </span>
                        ) : (
                          <span className="brk-table__muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`brk-badge brk-badge--${tone}`}>
                          {expired ? "Expired" : rera.status}
                        </span>
                      </td>
                      <td>
                        <div className="brk-table__actions">
                          <button
                            type="button"
                            className="brk-icon-btn"
                            title="Edit credential"
                            aria-label="Edit credential"
                            onClick={() => handleEditRera(rera)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="brk-icon-btn brk-icon-btn--danger"
                            title="Delete credential"
                            aria-label="Delete credential"
                            onClick={() => {
                              setSelectedRera(rera);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add / edit */}
      <Modal show={showFormModal} onHide={closeFormModal} size="lg" centered dialogClassName="brk-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <BadgeCheck size={18} />
            {selectedRera ? "Edit RERA Credential" : "Add RERA Credential"}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="brk-form-grid">
              <div>
                <label className="brk-label" htmlFor="reraId">
                  RERA ID <span className="brk-label__req">*</span>
                </label>
                <input
                  id="reraId"
                  className="brk-input"
                  type="text"
                  name="reraId"
                  value={formData.reraId}
                  onChange={handleInputChange}
                  placeholder="e.g. RERA/2023/001234"
                  required
                />
                <span className="brk-hint">Your unique RERA registration ID</span>
              </div>

              <div>
                <label className="brk-label" htmlFor="reraState">
                  RERA State <span className="brk-label__req">*</span>
                </label>
                <select
                  id="reraState"
                  className="brk-select"
                  style={{ flex: "1 1 auto" }}
                  name="reraState"
                  value={formData.reraState}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="brk-label" htmlFor="registrationNumber">
                  Registration Number
                </label>
                <input
                  id="registrationNumber"
                  className="brk-input"
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. REG/MAH/2023/1234"
                />
              </div>

              <div>
                <label className="brk-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="brk-select"
                  style={{ flex: "1 1 auto" }}
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="brk-label" htmlFor="registrationDate">
                  <CalendarDays size={13} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                  Registration Date
                </label>
                <input
                  id="registrationDate"
                  className="brk-input"
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="brk-label" htmlFor="expiryDate">
                  <CalendarDays size={13} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  className="brk-input"
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
                {formData.expiryDate && isExpired(formData.expiryDate) && (
                  <span className="brk-hint brk-hint--error">This credential has expired</span>
                )}
              </div>

              <div className="brk-field--full">
                <label className="brk-label" htmlFor="documentUrl">
                  Document URL
                </label>
                <input
                  id="documentUrl"
                  className="brk-input"
                  type="url"
                  name="documentUrl"
                  value={formData.documentUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/rera-certificate.pdf"
                />
                <span className="brk-hint">Link to your registration certificate</span>
              </div>

              <div className="brk-field--full">
                <label className="brk-label" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  className="brk-input"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or comments…"
                />
              </div>
            </div>

            <div className="brk-alert brk-alert--info" style={{ margin: "1.15rem 0 0" }}>
              <Info size={16} />
              <span>
                Expired credentials may block you from listing properties in states that mandate
                RERA registration.
              </span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              className="brk-btn brk-btn--ghost"
              onClick={closeFormModal}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="brk-btn brk-btn--primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="brk-spinner brk-spinner--sm" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  {selectedRera ? "Update" : "Add"} Credential
                </>
              )}
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        dialogClassName="brk-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <AlertTriangle size={18} />
            Delete credential?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRera && (
            <>
              <p style={{ marginBottom: "0.9rem", fontSize: "0.875rem", color: "#475569" }}>
                This will permanently remove the following RERA credential.
              </p>
              <div className="brk-quote">
                <div className="brk-detail-row">
                  <strong>RERA ID:</strong> {selectedRera.reraId}
                </div>
                <div className="brk-detail-row">
                  <strong>State:</strong> {selectedRera.reraState}
                </div>
              </div>
            </>
          )}
          <div className="brk-alert brk-alert--warning" style={{ margin: "1rem 0 0" }}>
            <AlertTriangle size={16} />
            <span>This action cannot be undone.</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="brk-btn brk-btn--ghost"
            onClick={() => setShowDeleteModal(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="brk-btn brk-btn--danger"
            onClick={handleConfirmDelete}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="brk-spinner brk-spinner--sm" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
