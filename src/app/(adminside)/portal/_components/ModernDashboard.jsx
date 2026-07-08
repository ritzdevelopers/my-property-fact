"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner, Alert } from "react-bootstrap";
import {
  cilHome,
  cilPlus,
  cilPeople,
  cilCheckCircle,
  cilClock,
  cilExternalLink,
  cilPencil,
  cilViewModule,
  cilLocationPin,
  cilShieldAlt,
  cilChart,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import axios from "axios";
import { useUser } from "../_contexts/UserContext";
import { getPublicPropertyUrl } from "../_utils/propertySlug";
import "./BrokerPhase2Styles.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function formatPrice(price) {
  if (!price && price !== 0) return "Price on request";
  const num = typeof price === "string" ? parseFloat(price.replace(/[^0-9.Ee+\-]/g, "")) : price;
  if (isNaN(num)) return "Price on request";
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${Math.round(num).toLocaleString("en-IN")}`;
}

function getPropertyImage(property) {
  if (property.imageUrls?.length > 0) {
    const path = property.imageUrls[0].replace(/\\/g, "/");
    return `${API_BASE}get/images/${path}`;
  }
  return null;
}

export default function ModernDashboard() {
  const { userData, loading: userLoading } = useUser();
  const [stats, setStats] = useState({
    total: 0,
    live: 0,
    pending: 0,
    draft: 0,
    rejected: 0,
    leads: 0,
  });
  const [properties, setProperties] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLoading) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [listingsRes, leadsRes] = await Promise.allSettled([
          axios.get(`${API_BASE}user/property-listings`, { withCredentials: true }),
          axios.get(`${API_BASE}enquiry/get-user-leads`, { withCredentials: true }),
        ]);

        let props = [];
        if (
          listingsRes.status === "fulfilled" &&
          listingsRes.value.data?.success &&
          Array.isArray(listingsRes.value.data.properties)
        ) {
          props = listingsRes.value.data.properties;
        }

        let leadCount = 0;
        if (leadsRes.status === "fulfilled" && Array.isArray(leadsRes.value.data)) {
          leadCount = leadsRes.value.data.filter((l) => l.propertyId).length;
        }

        const live = props.filter((p) => p.approvalStatus === "APPROVED").length;
        const pending = props.filter((p) => p.approvalStatus === "PENDING").length;
        const draft = props.filter((p) => p.approvalStatus === "DRAFT").length;
        const rejected = props.filter((p) => p.approvalStatus === "REJECTED").length;

        setStats({
          total: props.length,
          live,
          pending,
          draft,
          rejected,
          leads: leadCount,
        });
        setProperties(props);

        const acts = props
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
          )
          .slice(0, 5)
          .map((p) => {
            const title = p.title || p.projectName || "Property";
            const status = (p.approvalStatus || "PENDING").toUpperCase();
            let message = `Updated: ${title}`;
            let type = "info";
            if (status === "APPROVED") {
              message = `Live on /properties: ${title}`;
              type = "success";
            } else if (status === "PENDING") {
              message = `Submitted for review: ${title}`;
              type = "warning";
            } else if (status === "DRAFT") {
              message = `Draft saved: ${title}`;
              type = "muted";
            } else if (status === "REJECTED") {
              message = `Needs changes: ${title}`;
              type = "warning";
            }
            return {
              id: p.id,
              message,
              time: formatTimeAgo(p.updatedAt || p.createdAt),
              type,
            };
          });
        setActivities(acts);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userLoading]);

  const liveProperties = properties
    .filter((p) => p.approvalStatus === "APPROVED")
    .slice(0, 3);

  const showOnboarding = !loading && stats.total === 0;

  if (loading || userLoading) {
    return (
      <div className="broker-dashboard d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" style={{ color: "#68ac78" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="broker-dashboard">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  const firstName = (userData?.fullName || "Broker").split(" ")[0];

  return (
    <div className="broker-dashboard">
      {/* Hero */}
      <div className="broker-hero">
        <div className="broker-hero-content">
          <div>
            <div className="broker-hero-greeting">Broker Portal · Phase 2</div>
            <h1 className="broker-hero-title">Welcome back, {firstName}</h1>
            <p className="broker-hero-subtitle">
              List properties, track approvals, and go live on{" "}
              <strong style={{ color: "#c9f0d4" }}>/properties</strong> once approved.
            </p>
          </div>
          <div className="broker-hero-actions">
            <Link href="/portal/dashboard/listings?action=add" className="broker-btn-primary">
              <CIcon icon={cilPlus} />
              List a Property
            </Link>
            <Link href="/properties" target="_blank" className="broker-btn-ghost">
              <CIcon icon={cilExternalLink} />
              View Marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Onboarding for new brokers */}
      {showOnboarding && (
        <div className="broker-onboard-banner">
          <div>
            <h4>Start listing your first property</h4>
            <p>
              Complete the 5-step wizard, submit for approval, and your listing will appear on the public /properties page.
            </p>
          </div>
          <Link href="/portal/dashboard/listings?action=add" className="broker-btn-primary">
            <CIcon icon={cilPlus} />
            Add Your First Property
          </Link>
        </div>
      )}

      {/* Publish Pipeline */}
      <div className="broker-pipeline">
        <div className="broker-pipeline-title">Publishing Pipeline</div>
        <div className="broker-pipeline-steps">
          <div className={`broker-pipeline-step ${stats.draft > 0 ? "active" : stats.total > 0 ? "done" : ""}`}>
            <div className="broker-pipeline-dot">1</div>
            <div className="broker-pipeline-label">Draft</div>
            <div className="broker-pipeline-count">{stats.draft}</div>
          </div>
          <div className={`broker-pipeline-step ${stats.pending > 0 ? "active" : stats.live > 0 ? "done" : ""}`}>
            <div className="broker-pipeline-dot">2</div>
            <div className="broker-pipeline-label">Under Review</div>
            <div className="broker-pipeline-count">{stats.pending}</div>
          </div>
          <div className={`broker-pipeline-step ${stats.live > 0 ? "active done" : ""}`}>
            <div className="broker-pipeline-dot">3</div>
            <div className="broker-pipeline-label">Live on /properties</div>
            <div className="broker-pipeline-count">{stats.live}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="broker-stats-grid">
        <div className="broker-stat-card stat-total">
          <div className="broker-stat-header">
            <div className="broker-stat-icon icon-total">
              <CIcon icon={cilHome} />
            </div>
          </div>
          <div className="broker-stat-label">Total Listings</div>
          <div className="broker-stat-value">{stats.total}</div>
          <div className="broker-stat-meta">
            {stats.draft > 0 && <span className="highlight">{stats.draft} drafts</span>}
            {stats.draft > 0 && stats.rejected > 0 && " · "}
            {stats.rejected > 0 && <span>{stats.rejected} rejected</span>}
            {stats.draft === 0 && stats.rejected === 0 && "All your properties"}
          </div>
        </div>

        <div className="broker-stat-card stat-live">
          <div className="broker-stat-header">
            <div className="broker-stat-icon icon-live">
              <CIcon icon={cilCheckCircle} />
            </div>
          </div>
          <div className="broker-stat-label">Live on MPF</div>
          <div className="broker-stat-value">{stats.live}</div>
          <div className="broker-stat-meta">
            Visible on <span className="highlight">/properties</span>
          </div>
        </div>

        <div className="broker-stat-card stat-pending">
          <div className="broker-stat-header">
            <div className="broker-stat-icon icon-pending">
              <CIcon icon={cilClock} />
            </div>
          </div>
          <div className="broker-stat-label">Pending Review</div>
          <div className="broker-stat-value">{stats.pending}</div>
          <div className="broker-stat-meta">Awaiting admin approval</div>
        </div>

        <div className="broker-stat-card stat-leads">
          <div className="broker-stat-header">
            <div className="broker-stat-icon icon-leads">
              <CIcon icon={cilPeople} />
            </div>
          </div>
          <div className="broker-stat-label">Buyer Inquiries</div>
          <div className="broker-stat-value">{stats.leads}</div>
          <div className="broker-stat-meta">Leads from your listings</div>
        </div>
      </div>

      {/* Main content */}
      <div className="broker-two-col">
        <div>
          <div className="broker-card">
            <div className="broker-card-header">
              <h3 className="broker-card-title">Live Properties</h3>
              <Link href="/portal/dashboard/listings" className="broker-card-link">
                Manage all →
              </Link>
            </div>
            <div className="broker-card-body">
              {liveProperties.length > 0 ? (
                <div className="broker-property-grid">
                  {liveProperties.map((p) => {
                    const title = p.title || p.projectName || "Property";
                    const img = getPropertyImage(p);
                    const publicUrl = getPublicPropertyUrl(title, p.id);
                    return (
                      <div key={p.id} className="broker-property-card">
                        <div className="broker-property-img-wrap">
                          {img ? (
                            <img src={img} alt={title} className="broker-property-img" />
                          ) : (
                            <div className="broker-property-img-placeholder">
                              <CIcon icon={cilHome} />
                            </div>
                          )}
                          <span className="broker-property-badge live">Live</span>
                        </div>
                        <div className="broker-property-body">
                          <h4 className="broker-property-title">{title}</h4>
                          <div className="broker-property-location">
                            <CIcon icon={cilLocationPin} size="sm" />
                            {p.locality || p.city || p.address || "Location TBD"}
                          </div>
                          <div className="broker-property-price">{formatPrice(p.totalPrice)}</div>
                          <div className="broker-property-actions">
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-live">
                              View on MPF
                            </a>
                            <Link href={`/portal/dashboard/listings/${p.id}`}>Manage</Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="broker-empty">
                  <div className="broker-empty-icon">
                    <CIcon icon={cilHome} />
                  </div>
                  <h5>No live properties yet</h5>
                  <p>Submit a listing and once approved, it will appear here and on /properties.</p>
                  <Link href="/portal/dashboard/listings?action=add" className="broker-btn-primary">
                    <CIcon icon={cilPlus} />
                    List a Property
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="broker-card" style={{ marginTop: "1.25rem" }}>
            <div className="broker-card-header">
              <h3 className="broker-card-title">Recent Activity</h3>
            </div>
            <div className="broker-card-body">
              {activities.length > 0 ? (
                activities.map((a) => (
                  <div key={a.id} className="broker-activity-item">
                    <div className={`broker-activity-icon ${a.type}`}>
                      <CIcon icon={a.type === "success" ? cilCheckCircle : cilViewModule} />
                    </div>
                    <div>
                      <p className="broker-activity-text">{a.message}</p>
                      <span className="broker-activity-time">{a.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#6b7a8d", textAlign: "center", padding: "1rem 0" }}>
                  No activity yet. Start by listing a property.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar quick actions */}
        <div>
          <div className="broker-card">
            <div className="broker-card-header">
              <h3 className="broker-card-title">Quick Actions</h3>
            </div>
            <div className="broker-card-body">
              <Link href="/portal/dashboard/listings?action=add" className="broker-quick-action">
                <div className="broker-quick-action-icon">
                  <CIcon icon={cilPlus} />
                </div>
                <div className="broker-quick-action-text">
                  <strong>Add New Property</strong>
                  <span>5-step listing wizard</span>
                </div>
              </Link>
              <Link href="/portal/dashboard/listings" className="broker-quick-action">
                <div className="broker-quick-action-icon">
                  <CIcon icon={cilPencil} />
                </div>
                <div className="broker-quick-action-text">
                  <strong>My Listings</strong>
                  <span>{stats.total} total · {stats.live} live</span>
                </div>
              </Link>
              <Link href="/portal/dashboard/leads" className="broker-quick-action">
                <div className="broker-quick-action-icon">
                  <CIcon icon={cilPeople} />
                </div>
                <div className="broker-quick-action-text">
                  <strong>Buyer Leads</strong>
                  <span>{stats.leads} inquiries</span>
                </div>
              </Link>
              <Link href="/portal/dashboard/compliance/rera" className="broker-quick-action">
                <div className="broker-quick-action-icon">
                  <CIcon icon={cilShieldAlt} />
                </div>
                <div className="broker-quick-action-text">
                  <strong>RERA Compliance</strong>
                  <span>Manage credentials</span>
                </div>
              </Link>
              <Link href="/portal/dashboard/profile" className="broker-quick-action">
                <div className="broker-quick-action-icon">
                  <CIcon icon={cilChart} />
                </div>
                <div className="broker-quick-action-text">
                  <strong>Broker Profile</strong>
                  <span>Update your details</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
