"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  HardHat,
  Layers,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Plus,
  UserRound,
} from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, tone, href }) {
  const body = (
    <>
      <span className={`brk-stat__icon brk-stat__icon--${tone}`}>
        <Icon size={18} />
      </span>
      <span className="brk-stat__body">
        <span className="brk-stat__label">{label}</span>
        <span className="brk-stat__value">{Number(value || 0).toLocaleString()}</span>
        {sub ? <span className="brk-stat__sub">{sub}</span> : null}
      </span>
      {href ? <ArrowUpRight size={15} className="brk-stat__arrow" /> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`brk-stat brk-stat--${tone}`}>
        {body}
      </Link>
    );
  }

  return <div className={`brk-stat brk-stat--${tone}`}>{body}</div>;
}

function MiniStat({ icon: Icon, value, label }) {
  return (
    <div className="brk-mini">
      <span className="brk-mini__icon">
        <Icon size={15} />
      </span>
      <span className="brk-mini__meta">
        <span className="brk-mini__value">{Number(value || 0).toLocaleString()}</span>
        <span className="brk-mini__label">{label}</span>
      </span>
    </div>
  );
}

export default function BrokerDashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="brk-stat-grid" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="brk-stat brk-stat--skeleton" />
        ))}
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
      <div className="brk-stat-grid">
        <StatCard
          label="Total Listings"
          value={totalListings}
          sub={addedThisMonth > 0 ? `+${addedThisMonth} added this month` : "All your properties"}
          icon={Building2}
          tone="emerald"
          href="/portal/dashboard/listings"
        />
        <StatCard
          label="Live Listings"
          value={liveListings}
          sub="Published on /properties"
          icon={CheckCircle2}
          tone="green"
          href="/portal/dashboard/listings"
        />
        <StatCard
          label="Pending Review"
          value={pendingListings}
          sub="Awaiting approval"
          icon={Clock}
          tone="amber"
          href="/portal/dashboard/listings"
        />
        <StatCard
          label="Enquiries"
          value={enquiryCount}
          sub="Buyer leads received"
          icon={MessageSquare}
          tone="blue"
          href="/portal/dashboard/leads"
        />
      </div>

      <section className="brk-panel brk-panel--flush">
        <div className="brk-panel__head">
          <div>
            <h2 className="brk-panel__title">Portfolio Coverage</h2>
            <p className="brk-panel__sub">Spread of your listed inventory</p>
          </div>
        </div>
        <div className="brk-mini-row">
          <MiniStat icon={MapPin} value={cityCount} label="Cities" />
          <MiniStat icon={HardHat} value={builderCount} label="Builders" />
          <MiniStat icon={Layers} value={amenityCount} label="Amenities" />
          <MiniStat icon={LayoutGrid} value={propertyTypeCount} label="Property Types" />
        </div>
      </section>
    </>
  );
}

export function BrokerQuickActions() {
  const links = [
    { href: "/portal/dashboard/listings?action=add", label: "Add Property", icon: Plus },
    { href: "/portal/dashboard/listings", label: "My Listings", icon: Building2 },
    { href: "/portal/dashboard/leads", label: "Buyer Leads", icon: MessageSquare },
    { href: "/portal/dashboard/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <section className="brk-panel">
      <div className="brk-panel__head">
        <div>
          <h2 className="brk-panel__title">Quick Actions</h2>
          <p className="brk-panel__sub">Jump straight to what you need</p>
        </div>
      </div>
      <div className="brk-panel__body">
        <div className="brk-quick">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="brk-quick__link">
              <span className="brk-quick__icon">
                <Icon size={15} />
              </span>
              {label}
              <ArrowUpRight size={14} className="brk-quick__arrow" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
