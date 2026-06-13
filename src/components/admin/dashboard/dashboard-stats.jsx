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
} from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  accentColor = "primary",
}) {
  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper {...wrapperProps} className={`mpf-stat mpf-stat--${accentColor}`}>
      <div className="mpf-stat__top">
        <p className="mpf-stat__label">{title}</p>
        <span className="mpf-stat__icon">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mpf-stat__value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <div className="mpf-stat__foot">
        {description ? (
          <span className="mpf-stat__desc">{description}</span>
        ) : href ? (
          <span className="mpf-stat__link">
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
    </Wrapper>
  );
}

function MiniStatCard({ icon: Icon, value, label, iconSrc }) {
  return (
    <div className="mpf-mini">
      <span className="mpf-mini__icon">
        {iconSrc ? (
          <img src={iconSrc} alt="" className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
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
  noOfProjectTypes,
  isSuperAdmin,
  canManageBlogs,
  canEnquiries,
  canManageOptions,
  canManageAmenities,
  canManageWebStories,
}) {
  return (
    <div className="space-y-6">
      {/* Primary Stats Row */}
      <div className="mpf-stats-grid">
        <StatCard
          title="Total Projects"
          value={noOfProjects}
          icon={Building2}
          href="/admin/dashboard/manage-projects"
          accentColor="primary"
        />

        {isSuperAdmin && (
          <StatCard
            title="Active Users"
            value={noOfUsers}
            icon={Users}
            href="/admin/dashboard/manage-users"
            accentColor="success"
          />
        )}

        {canManageBlogs && (
          <StatCard
            title="Total Blogs"
            value={noOfBlogs}
            description={`${noOfBlogCategories} categories`}
            icon={FileText}
            href="/admin/dashboard/manage-blogs"
            accentColor="info"
          />
        )}

        {canEnquiries && (
          <StatCard
            title="Enquiries"
            value={noOfEnquiries}
            icon={MessageSquare}
            href="/admin/dashboard/enquiries"
            accentColor="warning"
          />
        )}
      </div>

      {/* Secondary Stats Row */}
      <div className="mpf-mini-grid">
        {canManageOptions && (
          <>
            <MiniStatCard icon={MapPin} value={noOfCities} label="Cities" />
            <MiniStatCard icon={HardHat} value={noOfBuilders} label="Builders" />
          </>
        )}

        {canManageAmenities && (
          <MiniStatCard icon={Layers} value={noOfAmenities} label="Amenities" />
        )}

        {canManageWebStories && (
          <>
            <MiniStatCard icon={BookOpen} value={noOfWebStories} label="Web Stories" />
            <MiniStatCard icon={BookOpen} value={noOfWebStoryCategories} label="Story Categories" />
          </>
        )}
      </div>
    </div>
  );
}

export function QuickActionsCard({ quickLinks }) {
  if (!quickLinks?.length) return null;

  return (
    <section className="mpf-panel">
      <div className="mpf-panel__head">
        <div>
          <h2 className="mpf-panel__title">Quick Actions</h2>
          <p className="mpf-panel__sub">Jump straight to the things you manage most</p>
        </div>
      </div>
      <div className="mpf-panel__body">
        <div className="mpf-actions-grid">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="mpf-action">
              <span className="mpf-action__icon">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <span className="mpf-action__label">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecentActivityCard({ activities, loading, displayName }) {
  return (
    <section className="mpf-panel h-full">
      <div className="mpf-panel__head">
        <div>
          <h2 className="mpf-panel__title">Recent Activity</h2>
          {displayName && (
            <p className="mpf-panel__sub">Latest actions by {displayName}</p>
          )}
        </div>
        <span className="mpf-live-badge">
          <span className="mpf-live-dot" />
          Live
        </span>
      </div>
      <div className="mpf-panel__body">
        {loading ? (
          <div className="mpf-activity">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mpf-activity__item">
                <span className="mpf-skel-line" style={{ width: "2.1rem", height: "2.1rem", borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <div className="mpf-skel-line" style={{ height: "0.85rem", width: "70%", marginBottom: "0.4rem" }} />
                  <div className="mpf-skel-line" style={{ height: "0.7rem", width: "45%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : activities?.length > 0 ? (
          <div className="mpf-activity">
            {activities.map((activity, index) => (
              <div key={`${activity.taskType}-${index}`} className="mpf-activity__item">
                <span className={`mpf-activity__icon mpf-activity__icon--${index % 3}`}>
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mpf-activity__title">{activity.title || "Action"}</p>
                  <p className="mpf-activity__meta">
                    {activity.taskType?.replace(/_/g, " ")} · {formatRelativeTime(activity.occurredAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mpf-activity__empty">
            <span className="mpf-activity__empty-icon">
              <Activity className="h-6 w-6" />
            </span>
            <p className="mpf-panel__sub" style={{ maxWidth: "20rem", margin: "0 auto" }}>
              No recent activity yet. Saving blogs, web stories, or approving listings will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function formatRelativeTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const h = Math.floor(diffMs / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 14) return `${days}d ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

export default DashboardStatsGrid;
