"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  MapPin,
  HardHat,
  Layers,
  LayoutGrid,
  ArrowUpRight,
} from "lucide-react";

function MetricCard({ label, value, sub, icon: Icon, variant = "white", href }) {
  const content = (
    <>
      <div className="admin-dash-metric__top">
        <p className="admin-dash-metric__label">{label}</p>
        <span className="admin-dash-metric__icon">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="admin-dash-metric__value">{value.toLocaleString()}</p>
      {sub ? <p className="admin-dash-metric__sub">{sub}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`admin-dash-metric admin-dash-metric--${variant}`}>
        {content}
      </Link>
    );
  }

  return <div className={`admin-dash-metric admin-dash-metric--${variant}`}>{content}</div>;
}

function MiniStat({ icon: Icon, value, label, href }) {
  const inner = (
    <>
      <span className="admin-dash-mini__icon">
        <Icon className="h-5 w-5" />
      </span>
      <div className="admin-dash-mini__meta">
        <p className="admin-dash-mini__value">{value.toLocaleString()}</p>
        <p className="admin-dash-mini__label">{label}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="admin-dash-mini admin-dash-mini--mini-cities" style={{ textDecoration: "none" }}>
        {inner}
      </Link>
    );
  }

  return <div className="admin-dash-mini admin-dash-mini--mini-cities">{inner}</div>;
}

export default function BrokerDashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="admin-dash-home__top-metrics-row" aria-busy="true">
        <div className="admin-dash-home__projects-card" style={{ opacity: 0.6 }}>
          <div style={{ height: 44, width: 44, borderRadius: 10, background: "#f3f4f6" }} />
          <div>
            <div style={{ height: 12, width: 100, background: "#f3f4f6", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 36, width: 80, background: "#f3f4f6", borderRadius: 4 }} />
          </div>
        </div>
      </div>
    );
  }

  const {
    totalListings = 0,
    liveListings = 0,
    pendingListings = 0,
    enquiryCount = 0,
    addedThisMonth = 0,
    cityCount = 0,
    builderCount = 0,
    amenityCount = 0,
    propertyTypeCount = 0,
  } = stats || {};

  return (
    <>
      <div className="admin-dash-home__top-metrics-row">
        <Link href="/portal/dashboard/listings" className="admin-dash-home__projects-card" style={{ textDecoration: "none" }}>
          <span className="admin-dash-home__projects-card-icon">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="admin-dash-home__projects-card-label">Total Listings</p>
            <p className="admin-dash-home__projects-card-value">{totalListings.toLocaleString()}</p>
            {addedThisMonth > 0 && (
              <p className="admin-dash-metric__sub" style={{ marginTop: "0.35rem" }}>
                +{addedThisMonth} added this month
              </p>
            )}
          </div>
        </Link>

        <div className="admin-dash-home__top-metrics-right">
          <div className="admin-dash-home__metrics-scroll-row admin-horizontal-scroll">
            <MetricCard
              label="Live Listings"
              value={liveListings}
              icon={CheckCircle2}
              variant="mint"
              href="/portal/dashboard/listings"
            />
            <MetricCard
              label="Pending Review"
              value={pendingListings}
              icon={Clock}
              variant="cyan"
              href="/portal/dashboard/listings"
            />
            <MetricCard
              label="Enquiries"
              value={enquiryCount}
              icon={MessageSquare}
              variant="slate"
              href="/portal/dashboard/leads"
            />
          </div>

          <div className="admin-dash-home__mini admin-horizontal-scroll">
            <MiniStat icon={MapPin} value={cityCount} label="Cities" />
            <MiniStat icon={HardHat} value={builderCount} label="Builders" />
            <MiniStat icon={Layers} value={amenityCount} label="Amenities" />
            <MiniStat icon={LayoutGrid} value={propertyTypeCount} label="Property Types" />
          </div>
        </div>
      </div>
    </>
  );
}

export function BrokerQuickActions() {
  const links = [
    { href: "/portal/dashboard/listings?action=add", label: "Add Property" },
    { href: "/portal/dashboard/listings", label: "My Listings" },
    { href: "/portal/dashboard/leads", label: "Buyer Leads" },
    { href: "/portal/dashboard/profile", label: "Profile" },
  ];

  return (
    <section className="admin-dash-home__catalog">
      <p className="admin-dash-home__catalog-kicker">Quick Actions</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="admin-dash-quick-link">
            {link.label}
            <ArrowUpRight className="h-3.5 w-3.5" style={{ marginLeft: 4 }} />
          </Link>
        ))}
      </div>
    </section>
  );
}
