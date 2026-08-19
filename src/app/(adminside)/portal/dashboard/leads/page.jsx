"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Modal } from "react-bootstrap";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Eye,
  Flame,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import axios from "axios";
import { useUser } from "../../_contexts/UserContext";
import "../../_components/PortalUI.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_OPTIONS = ["New", "Contacted", "Warm", "Hot", "Converted", "Closed"];

const STATUS_TONE = {
  new: "red",
  hot: "red",
  warm: "amber",
  contacted: "amber",
  cold: "slate",
  converted: "green",
  closed: "green",
};

function statusTone(status) {
  return STATUS_TONE[(status || "New").toLowerCase()] || "blue";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function LeadsPage() {
  const { userData } = useUser();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [propertyFilter, setPropertyFilter] = useState("All");

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}enquiry/get-user-leads`, {
        withCredentials: true,
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        const isSuperAdmin =
          userData?.roles?.some(
            (role) => role?.roleName === "ROLE_SUPER_ADMIN" || role === "ROLE_SUPER_ADMIN",
          ) || userData?.role === "SUPER_ADMIN";

        const filteredLeads =
          !isSuperAdmin && userData?.id
            ? response.data.filter((lead) => lead.propertyId)
            : response.data;

        setLeads(filteredLeads);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.response?.data?.message || "Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLeadStatus = async (leadId, newStatus) => {
    const previous = leads;
    setLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)),
    );

    try {
      const apiUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      await axios.put(
        `${apiUrl}/enquiry/update-status/${leadId}`,
        { status: newStatus },
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Error updating lead status:", err);
      setLeads(previous);
      setError("Could not update the lead status. Please try again.");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (lead.name || "").toLowerCase().includes(term) ||
      (lead.email || "").toLowerCase().includes(term) ||
      (lead.phone || "").includes(searchTerm);
    const matchesStatus = statusFilter === "All" || (lead.status || "New") === statusFilter;
    const matchesProperty =
      propertyFilter === "All" ||
      (lead.propertyId && lead.propertyId.toString() === propertyFilter);
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const uniquePropertyIds = [
    ...new Set(leads.filter((l) => l.propertyId).map((l) => l.propertyId.toString())),
  ];

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => !l.status || l.status === "New").length;
  const contactedLeads = leads.filter(
    (l) => l.status === "Contacted" || l.status === "Warm",
  ).length;
  const convertedLeads = leads.filter(
    (l) => l.status === "Converted" || l.status === "Closed",
  ).length;

  const stats = [
    { label: "Total Leads", value: totalLeads, icon: Users, tone: "emerald", filter: "All" },
    { label: "New Leads", value: newLeads, icon: Flame, tone: "red", filter: "New" },
    { label: "Contacted", value: contactedLeads, icon: MessageSquare, tone: "amber", filter: "Contacted" },
    { label: "Converted", value: convertedLeads, icon: CheckCircle2, tone: "green", filter: "Converted" },
  ];

  const hasFilters = searchTerm || statusFilter !== "All" || propertyFilter !== "All";

  return (
    <div className="brk-page">
      <header className="brk-page-head">
        <div className="brk-page-head__main">
          <span className="brk-page-head__icon">
            <Users size={20} />
          </span>
          <div>
            <h1 className="brk-page-head__title">Property Leads</h1>
            <p className="brk-page-head__sub">
              Track and respond to buyer enquiries on your listings
            </p>
          </div>
        </div>
        <div className="brk-page-head__actions">
          <button
            type="button"
            className="brk-btn brk-btn--ghost"
            onClick={fetchLeads}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </header>

      <div className="brk-process" aria-label="How leads work">
        <div className="brk-process__item">
          <span className="brk-process__num">1</span>
          <div>
            <p className="brk-process__title">Buyer enquires</p>
            <p className="brk-process__text">
              Interested buyers submit a form on your live listing.
            </p>
          </div>
        </div>
        <div className="brk-process__item">
          <span className="brk-process__num">2</span>
          <div>
            <p className="brk-process__title">You get the lead</p>
            <p className="brk-process__text">
              Name, phone, email and message land here instantly.
            </p>
          </div>
        </div>
        <div className="brk-process__item">
          <span className="brk-process__num">3</span>
          <div>
            <p className="brk-process__title">Follow up</p>
            <p className="brk-process__text">
              Call or email, then update the status as the deal moves.
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

      {loading ? (
        <div className="brk-stat-grid" aria-busy="true">
          {stats.map((s) => (
            <div key={s.label} className="brk-stat brk-stat--skeleton" />
          ))}
        </div>
      ) : (
        <div className="brk-stat-grid">
          {stats.map(({ label, value, icon: Icon, tone, filter }) => {
            const selected = statusFilter === filter;
            return (
              <button
                key={label}
                type="button"
                className={`brk-stat brk-stat--${tone} is-clickable${selected ? " is-selected" : ""}`}
                onClick={() => setStatusFilter(selected ? "All" : filter)}
              >
                <span className={`brk-stat__icon brk-stat__icon--${tone}`}>
                  <Icon size={18} />
                </span>
                <span className="brk-stat__body">
                  <span className="brk-stat__label">{label}</span>
                  <span className="brk-stat__value">{value.toLocaleString()}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <section className="brk-panel">
        <div className="brk-panel__head">
          <div>
            <h2 className="brk-panel__title">All Leads</h2>
            <p className="brk-panel__sub">
              Showing {filteredLeads.length} of {totalLeads} enquir
              {totalLeads === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>

        <div className="brk-filters">
          <div className="brk-search">
            <Search size={15} className="brk-search__icon" />
            <input
              type="search"
              className="brk-input"
              placeholder="Search by name, email or phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search leads"
            />
          </div>

          <select
            className="brk-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {uniquePropertyIds.length > 0 && (
            <select
              className="brk-select"
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              aria-label="Filter by property"
            >
              <option value="All">All properties</option>
              {uniquePropertyIds.map((propId) => (
                <option key={propId} value={propId}>
                  Property #{propId}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="brk-loading">
            <span className="brk-spinner" />
            Loading leads…
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="brk-empty">
            <span className="brk-empty__icon">
              <Users size={24} />
            </span>
            <h3 className="brk-empty__title">
              {hasFilters ? "No leads match your filters" : "No leads yet"}
            </h3>
            <p className="brk-empty__text">
              {hasFilters
                ? "Try clearing the search or choosing a different status."
                : "Once buyers enquire about your listings, they'll appear here with their contact details."}
            </p>
            {hasFilters ? (
              <button
                type="button"
                className="brk-btn brk-btn--ghost"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setPropertyFilter("All");
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link href="/portal/dashboard/listings?action=add" className="brk-btn brk-btn--primary">
                <Plus size={15} />
                Add a listing
              </Link>
            )}
          </div>
        ) : (
          <div className="brk-table-wrap">
            <table className="brk-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <span className="brk-table__primary">{lead.name || "Unnamed lead"}</span>
                      <span className="brk-table__meta">#{lead.id}</span>
                    </td>
                    <td>
                      <span className="brk-table__contact">
                        <Mail size={13} />
                        {lead.email || "—"}
                      </span>
                      <span className="brk-table__contact">
                        <Phone size={13} />
                        {lead.phone || "—"}
                      </span>
                    </td>
                    <td>
                      {lead.propertyId ? (
                        <span className="brk-badge brk-badge--blue">#{lead.propertyId}</span>
                      ) : (
                        <span className="brk-table__muted">—</span>
                      )}
                    </td>
                    <td>
                      <select
                        className={`brk-select brk-status-select brk-status-select--${statusTone(lead.status)}`}
                        value={lead.status || "New"}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        aria-label={`Status for ${lead.name || `lead ${lead.id}`}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className="brk-table__clamp">
                        {lead.message || <span className="brk-table__muted">No message</span>}
                      </span>
                    </td>
                    <td className="brk-table__muted" style={{ whiteSpace: "nowrap" }}>
                      {formatDate(lead.createdAt)}
                    </td>
                    <td>
                      <div className="brk-table__actions">
                        {lead.phone && (
                          <a
                            className="brk-icon-btn"
                            href={`tel:${lead.phone}`}
                            title="Call lead"
                            aria-label="Call lead"
                          >
                            <Phone size={15} />
                          </a>
                        )}
                        {lead.email && (
                          <a
                            className="brk-icon-btn"
                            href={`mailto:${lead.email}`}
                            title="Email lead"
                            aria-label="Email lead"
                          >
                            <Mail size={15} />
                          </a>
                        )}
                        <button
                          type="button"
                          className="brk-icon-btn"
                          title="View details"
                          aria-label="View lead details"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowModal(true);
                          }}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        dialogClassName="brk-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <Users size={18} />
            {selectedLead?.name || "Lead details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLead && (
            <>
              <div className="brk-modal-detail">
                <div className="brk-detail-block">
                  <p className="brk-detail-block__title">Contact</p>
                  <div className="brk-detail-row">
                    <Mail size={14} />
                    {selectedLead.email || "Not provided"}
                  </div>
                  <div className="brk-detail-row">
                    <Phone size={14} />
                    {selectedLead.phone || "Not provided"}
                  </div>
                </div>

                <div className="brk-detail-block">
                  <p className="brk-detail-block__title">Lead info</p>
                  <div className="brk-detail-row">
                    <strong>Status:</strong>
                    <span className={`brk-badge brk-badge--${statusTone(selectedLead.status)}`}>
                      {selectedLead.status || "New"}
                    </span>
                  </div>
                  <div className="brk-detail-row">
                    <strong>Property:</strong>
                    {selectedLead.propertyId ? `#${selectedLead.propertyId}` : "N/A"}
                  </div>
                  <div className="brk-detail-row">
                    <strong>Source:</strong>
                    {selectedLead.enquiryFrom || "Property detail page"}
                  </div>
                  <div className="brk-detail-row">
                    <strong>Page:</strong>
                    {selectedLead.pageName || "N/A"}
                  </div>
                </div>
              </div>

              <p className="brk-detail-block__title" style={{ marginTop: "1.25rem" }}>
                Message
              </p>
              <p className="brk-quote">
                {selectedLead.message || "No message provided."}
              </p>

              <p className="brk-detail-block__title" style={{ marginTop: "1.25rem" }}>
                Timeline
              </p>
              <div className="brk-detail-row">
                <Calendar size={14} />
                <strong>Submitted:</strong> {formatDate(selectedLead.createdAt)}
              </div>
              {selectedLead.updatedAt && selectedLead.updatedAt !== selectedLead.createdAt && (
                <div className="brk-detail-row">
                  <Calendar size={14} />
                  <strong>Last updated:</strong> {formatDate(selectedLead.updatedAt)}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedLead && (
            <select
              className="brk-select"
              style={{ flex: "0 1 170px" }}
              value={selectedLead.status || "New"}
              onChange={(e) => {
                updateLeadStatus(selectedLead.id, e.target.value);
                setSelectedLead({ ...selectedLead, status: e.target.value });
              }}
              aria-label="Update lead status"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="brk-btn brk-btn--ghost"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .brk-table__clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 240px;
          font-size: 0.8rem;
          color: #475569;
        }
      `}</style>
    </div>
  );
}
