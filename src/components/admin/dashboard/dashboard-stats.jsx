"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Users,
  FileText,
  MessageSquare,
  MapPin,
  HardHat,
  Layers,
  BookOpen,
  Activity,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  accentColor = "blue",
}) {
  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper {...wrapperProps} className={`mpf-stat mpf-stat--${accentColor}`}>
      <div className="mpf-stat__top">
        <p className="mpf-stat__label">{title}</p>
        <span className="mpf-stat__icon" aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mpf-stat__value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {description ? <p className="mpf-stat__desc">{description}</p> : null}
    </Wrapper>
  );
}

function MiniStatCard({ icon: Icon, value, label, tone = "green" }) {
  return (
    <div className={`mpf-mini mpf-mini--${tone}`}>
      <span className="mpf-mini__icon" aria-hidden>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="mpf-mini__value">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mpf-mini__label">{label}</p>
      </div>
    </div>
  );
}

export function DashboardStatsGrid({
  noOfProjects,
  noOfUsers,
  noOfBlogs,
  noOfBlogCategories,
  noOfEnquiries,
  noOfCities,
  noOfBuilders,
  noOfAmenities,
  noOfWebStories,
  noOfWebStoryCategories,
  isSuperAdmin,
  canManageBlogs,
  canEnquiries,
  canManageOptions,
  canManageAmenities,
  canManageWebStories,
}) {
  return (
    <div className="mpf-stats-block">
      <div className="mpf-stats-grid">
        <StatCard
          title="Projects"
          value={noOfProjects}
          icon={Building2}
          href="/admin/dashboard/manage-projects"
          accentColor="blue"
        />

        {isSuperAdmin && (
          <StatCard
            title="Users"
            value={noOfUsers}
            icon={Users}
            href="/admin/dashboard/manage-users"
            accentColor="green"
          />
        )}

        {canManageBlogs && (
          <StatCard
            title="Blogs"
            value={noOfBlogs}
            description={`${noOfBlogCategories || 0} categories`}
            icon={FileText}
            href="/admin/dashboard/manage-blogs"
            accentColor="purple"
          />
        )}

        {canEnquiries && (
          <StatCard
            title="Enquiries"
            value={noOfEnquiries}
            icon={MessageSquare}
            href="/admin/dashboard/enquiries"
            accentColor="orange"
          />
        )}
      </div>

      <div className="mpf-mini-grid">
        {canManageOptions && (
          <>
            <MiniStatCard icon={MapPin} value={noOfCities} label="Cities" tone="green" />
            <MiniStatCard icon={HardHat} value={noOfBuilders} label="Builders" tone="purple" />
          </>
        )}

        {canManageAmenities && (
          <MiniStatCard icon={Layers} value={noOfAmenities} label="Amenities" tone="blue" />
        )}

        {canManageWebStories && (
          <>
            <MiniStatCard icon={BookOpen} value={noOfWebStories} label="Web Stories" tone="pink" />
            <MiniStatCard
              icon={FolderOpen}
              value={noOfWebStoryCategories}
              label="Story Categories"
              tone="orange"
            />
          </>
        )}
      </div>
    </div>
  );
}

const ACTION_META = {
  Approvals: { icon: CheckCircle2, tone: "blue" },
  Users: { icon: Users, tone: "green" },
  Enquiries: { icon: MessageSquare, tone: "orange" },
  Blogs: { icon: FileText, tone: "purple" },
  Cities: { icon: MapPin, tone: "teal" },
  Projects: { icon: Building2, tone: "indigo" },
  Banners: { icon: ImageIcon, tone: "pink" },
  Amenities: { icon: Layers, tone: "cyan" },
  "Web Stories": { icon: BookOpen, tone: "violet" },
};

export function QuickActionsCard({ quickLinks }) {
  if (!quickLinks?.length) return null;

  return (
    <section className="mpf-panel mpf-panel--actions h-full">
      <div className="mpf-panel__head">
        <div>
          <h2 className="mpf-panel__title">Quick Actions</h2>
          <p className="mpf-panel__sub">Jump straight to the things you manage most</p>
        </div>
      </div>
      <div className="mpf-panel__body">
        <div className="mpf-actions-grid">
          {quickLinks.map((link) => {
            const meta = ACTION_META[link.label] || { icon: ArrowUpRight, tone: "blue" };
            const Icon = meta.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`mpf-action mpf-action--${meta.tone}`}
              >
                <span className="mpf-action__icon">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mpf-action__label">{link.label}</span>
                <ArrowUpRight className="mpf-action__arrow h-3.5 w-3.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const ACTIVITY_ICONS = [MessageSquare, Users, CheckCircle2, FileText, Building2, Activity];

export function RecentActivityCard({ activities, loading, displayName }) {
  return (
    <section className="mpf-panel mpf-panel--activity h-full">
      <div className="mpf-panel__head">
        <div>
          <h2 className="mpf-panel__title">Recent Activity</h2>
          {displayName ? (
            <p className="mpf-panel__sub">Latest actions by {displayName}</p>
          ) : (
            <p className="mpf-panel__sub">What happened across the platform</p>
          )}
        </div>
        <div className="mpf-panel__head-right">
          <span className="mpf-live-badge">
            <span className="mpf-live-dot" />
            Live
          </span>
          <Link href="/admin/dashboard/activity-log" className="mpf-panel__link">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className="mpf-panel__body">
        {loading ? (
          <div className="mpf-activity">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="mpf-activity__item">
                <span
                  className="mpf-skel-line"
                  style={{ width: "2.25rem", height: "2.25rem", borderRadius: 999 }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="mpf-skel-line"
                    style={{ height: "0.85rem", width: "70%", marginBottom: "0.4rem" }}
                  />
                  <div className="mpf-skel-line" style={{ height: "0.7rem", width: "45%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : activities?.length > 0 ? (
          <div className="mpf-activity">
            {activities.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[index % ACTIVITY_ICONS.length];
              return (
                <div key={`${activity.taskType}-${index}`} className="mpf-activity__item">
                  <span className={`mpf-activity__icon mpf-activity__icon--${index % 5}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="mpf-activity__title">{activity.title || "Action"}</p>
                    <p className="mpf-activity__meta">
                      {activity.taskType?.replace(/_/g, " ")} ·{" "}
                      {formatRelativeTime(activity.occurredAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mpf-activity__empty">
            <span className="mpf-activity__empty-icon">
              <Activity className="h-6 w-6" />
            </span>
            <p className="mpf-panel__sub" style={{ maxWidth: "20rem", margin: "0 auto" }}>
              No recent activity yet. Saving blogs, web stories, or approving listings will appear
              here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/** CSS donut built from real dashboard counts */
export function LeadsOverviewCard({
  noOfEnquiries = 0,
  noOfProjects = 0,
  noOfBlogs = 0,
  noOfWebStories = 0,
  noOfCities = 0,
}) {
  const segments = React.useMemo(() => {
    const raw = [
      { label: "Enquiries", value: Number(noOfEnquiries) || 0, color: "#3b82f6" },
      { label: "Listings", value: Number(noOfProjects) || 0, color: "#22c55e" },
      { label: "Blog Leads", value: Number(noOfBlogs) || 0, color: "#a855f7" },
      { label: "Web Stories", value: Number(noOfWebStories) || 0, color: "#f97316" },
      { label: "Cities", value: Number(noOfCities) || 0, color: "#06b6d4" },
    ].filter((s) => s.value > 0);

    const total = raw.reduce((sum, s) => sum + s.value, 0) || 1;
    return {
      total: raw.reduce((sum, s) => sum + s.value, 0),
      items: raw.map((s) => ({
        ...s,
        pct: Math.round((s.value / total) * 1000) / 10,
      })),
    };
  }, [noOfEnquiries, noOfProjects, noOfBlogs, noOfWebStories, noOfCities]);

  const gradient = React.useMemo(() => {
    if (!segments.items.length) return "conic-gradient(#e5e7eb 0deg 360deg)";
    let cursor = 0;
    const parts = segments.items.map((s) => {
      const start = cursor;
      const end = cursor + (s.pct / 100) * 360;
      cursor = end;
      return `${s.color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${parts.join(", ")})`;
  }, [segments]);

  return (
    <section className="mpf-panel mpf-panel--leads h-full">
      <div className="mpf-panel__head">
        <div>
          <h2 className="mpf-panel__title">Leads Overview</h2>
          <p className="mpf-panel__sub">Breakdown across your key modules</p>
        </div>
      </div>
      <div className="mpf-panel__body">
        <div className="mpf-leads">
          <div className="mpf-leads__chart-wrap">
            <div className="mpf-leads__chart" style={{ background: gradient }}>
              <div className="mpf-leads__hole">
                <strong>{segments.total.toLocaleString()}</strong>
                <span>Total</span>
              </div>
            </div>
          </div>
          <ul className="mpf-leads__legend">
            {segments.items.map((item) => (
              <li key={item.label}>
                <span className="mpf-leads__swatch" style={{ background: item.color }} />
                <span className="mpf-leads__name">{item.label}</span>
                <span className="mpf-leads__pct">{item.pct}%</span>
              </li>
            ))}
            {!segments.items.length && (
              <li className="mpf-leads__empty">No module data available yet.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function formatRelativeTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
    const days = Math.floor(h / 24);
    if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

export default DashboardStatsGrid;
