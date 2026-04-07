"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faBookOpen,
  faBuilding,
  faEnvelope,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminRole } from "../_contexts/AdminRoleContext";
import { ADMIN_PERMISSIONS } from "../adminPermissions";
import "./dashboard-home.css";

const DASH_MINI_ICONS = {
  cities: "/images/admin/Vector (4).svg",
  builders: "/images/admin/Icon (1).svg",
  amenities: "/images/admin/Icon.svg",
  webStories: "/images/admin/Icon (2).svg",
};

function adminFetchHeaders() {
  const token =
    typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const TASK_TYPE_LABELS = {
  BLOG: "Blog",
  BLOG_CATEGORY: "Blog category",
  WEB_STORY: "Web story",
  WEB_STORY_CATEGORY: "Web story category",
  PROPERTY_APPROVED: "Property approved",
  PROPERTY_REJECTED: "Property rejected",
};

function formatRelativeFromIso(iso) {
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

function formatActivityMeta(activity) {
  const typeKey = String(activity.taskType || "").toUpperCase();
  const typeLabel = TASK_TYPE_LABELS[typeKey] || typeKey.replace(/_/g, " ") || "Task";
  const when = formatRelativeFromIso(activity.occurredAt);
  return when ? `${typeLabel} · ${when}` : typeLabel;
}

function activityThumbVariant(taskType, rowIndex) {
  const t = String(taskType || "").toUpperCase();
  if (t.startsWith("PROPERTY")) return 0;
  if (t.includes("BLOG")) return 1;
  if (t.includes("WEB_STORY")) return 2;
  return rowIndex % 3;
}

function canOpenActivityHref(href, gates) {
  if (!href || typeof href !== "string") return false;
  if (href.includes("/property-approvals")) return gates.canApprovals;
  if (href.includes("/manage-blogs") || href.includes("/manage-categories")) {
    return gates.canManageBlogs;
  }
  if (href.includes("/web-story")) return gates.canManageWebStories;
  return true;
}

const THUMB_FALLBACK = ["a", "b", "c"];

function ActivityThumb({ variantIndex }) {
  const fallbackClass = `admin-dash-pending-item__thumb--${THUMB_FALLBACK[variantIndex % THUMB_FALLBACK.length]}`;
  return (
    <div
      className={`admin-dash-pending-item__thumb ${fallbackClass}`}
      aria-hidden
    />
  );
}

function MetricCard({
  tone,
  label,
  value,
  sub,
  subMuted,
  icon,
  style,
  className,
  valueStyle,
  subStyle,
  labelStyle,
  iconWrapStyle,
}) {
  return (
    <article
      className={`admin-dash-metric admin-dash-metric--${tone}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <div className="admin-dash-metric__top">
        <div>
          <p className="admin-dash-metric__label" style={labelStyle}>
            {label}
          </p>
          <p className="admin-dash-metric__value" style={valueStyle}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className="admin-dash-metric__icon"
          style={iconWrapStyle}
          aria-hidden
        >
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
      {sub ? (
        <p
          className={`admin-dash-metric__sub${subMuted ? " admin-dash-metric__sub--muted" : ""}`}
          style={subStyle}
        >
          {sub}
        </p>
      ) : null}
    </article>
  );
}

function MiniStat({ icon, iconSrc, value, label, meta }) {
  return (
    <div className="admin-dash-mini">
      <div
        className={`admin-dash-mini__icon${iconSrc ? " admin-dash-mini__icon--img" : ""}`}
        aria-hidden
      >
        {iconSrc ? (
          <img src={iconSrc} alt="" width={22} height={22} />
        ) : (
          <FontAwesomeIcon icon={icon} />
        )}
      </div>
      <div className="admin-dash-mini__meta">
        <p className="admin-dash-mini__value">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {meta ? (
          <p
            style={{
              margin: "0.2rem 0 0",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#6b7280",
              textTransform: "uppercase",
            }}
          >
            {meta}
          </p>
        ) : null}
        <p className="admin-dash-mini__label">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard({
  noOfProjects,
  noOfUsers,
  noOfBlogs,
  noOfBlogCategories,
  noOfEnquiries,
  noOfCities,
  noOfBuilders,
  noOfAmenities,
  noOfWebStoryCategories,
  noOfWebStories,
  noOfProjectTypes,
}) {
  const {
    isSuperAdmin,
    isAdmin,
    hasPermission,
    displayName,
    roleLabel,
    loading: roleLoading,
  } = useAdminRole();

  const canApprovals =
    isSuperAdmin ||
    hasPermission(ADMIN_PERMISSIONS.MANAGE_PROPERTY_APPROVALS);
  const canEnquiries =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES);
  const canManageOptions =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_OPTIONS);
  const canManageBlogs =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_BLOGS);
  const canManageAmenities =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_AMENITIES);
  const canManageWebStories =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_WEB_STORIES);

  const [recentTasks, setRecentTasks] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    if (roleLoading) return;
    if (!isSuperAdmin && !isAdmin) {
      setRecentTasks([]);
      setRecentLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setRecentLoading(true);
      try {
        const apiBase = getPublicApiBase();
        if (!apiBase) {
          if (!cancelled) setRecentTasks([]);
          return;
        }
        const res = await fetch(`${apiBase}admin/dashboard/my-activity`, {
          credentials: "include",
          headers: adminFetchHeaders(),
        });
        if (cancelled) return;
        if (!res.ok) {
          if (!cancelled) setRecentTasks([]);
          return;
        }
        const result = await res.json();
        if (cancelled) return;
        if (result.success && Array.isArray(result.activities)) {
          setRecentTasks(result.activities.slice(0, 5));
        } else {
          setRecentTasks([]);
        }
      } catch {
        if (!cancelled) setRecentTasks([]);
      } finally {
        if (!cancelled) setRecentLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roleLoading, isSuperAdmin, isAdmin]);

  /** Top colored row: only metrics the role is allowed to see (matches design: users / blogs / enquiries). */
  const topMetrics = useMemo(() => {
    const list = [];
    if (isSuperAdmin) {
      list.push({
        key: "active-users",
        tone: "mint",
        label: "ACTIVE USERS",
        value: noOfUsers,
        sub: null,
        icon: faUsers,
      });
    }
    if (canManageBlogs) {
      list.push({
        key: "total-blogs",
        tone: "cyan",
        label: "TOTAL BLOGS",
        value: noOfBlogs,
        sub: `${noOfBlogCategories.toLocaleString()} blog categories`,
        subMuted: true,
        icon: faBookOpen,
        iconWrapStyle: {
          background: "#01613E",
          color: "#fff",
        },
      });
    }
    if (canEnquiries) {
      list.push({
        key: "enquiries",
        tone: "slate",
        label: "ENQUIRIES",
        value: noOfEnquiries,
        sub: null,
        icon: faEnvelope,
      });
    }
    return list;
  }, [
    isSuperAdmin,
    noOfUsers,
    noOfBlogs,
    noOfBlogCategories,
    noOfEnquiries,
    canManageBlogs,
    canEnquiries,
  ]);

  /** Bottom grey row: cities, builders, amenities, stories — each only if that area is assigned. */
  const miniStats = useMemo(() => {
    const row = [];
    if (canManageOptions) {
      row.push({
        key: "mini-cities",
        label: "CITIES",
        value: noOfCities,
        iconSrc: DASH_MINI_ICONS.cities,
      });
      row.push({
        key: "mini-builders",
        label: "BUILDERS",
        value: noOfBuilders,
        iconSrc: DASH_MINI_ICONS.builders,
      });
    }
    if (canManageAmenities) {
      row.push({
        key: "mini-amenities",
        label: "AMENITIES",
        value: noOfAmenities,
        iconSrc: DASH_MINI_ICONS.amenities,
      });
    }
    if (canManageWebStories) {
      row.push({
        key: "mini-stories",
        label: "STORIES",
        value: noOfWebStories,
        meta: `${noOfWebStoryCategories.toLocaleString()} web story categories`,
        iconSrc: DASH_MINI_ICONS.webStories,
      });
    }
    return row;
  }, [
    canManageOptions,
    canManageAmenities,
    canManageWebStories,
    noOfCities,
    noOfBuilders,
    noOfAmenities,
    noOfWebStories,
    noOfWebStoryCategories,
  ]);

  const topGridColumns =
    topMetrics.length === 0
      ? undefined
      : `repeat(${Math.min(topMetrics.length, 3)}, minmax(0, 1fr))`;
  const miniGridColumns =
    miniStats.length === 0
      ? undefined
      : `repeat(${Math.min(miniStats.length, 4)}, minmax(0, 1fr))`;

  const quickLinks = [];
  if (canApprovals) {
    quickLinks.push({
      href: "/admin/dashboard/property-approvals",
      label: "Property approvals",
    });
  }
  if (isSuperAdmin) {
    quickLinks.push({
      href: "/admin/dashboard/manage-users",
      label: "Manage users",
    });
  }
  if (canEnquiries) {
    quickLinks.push({
      href: "/admin/dashboard/enquiries",
      label: "Enquiries",
    });
  }
  if (hasPermission(ADMIN_PERMISSIONS.MANAGE_BLOGS)) {
    quickLinks.push({
      href: "/admin/dashboard/manage-blogs",
      label: "Blogs",
    });
  }
  if (hasPermission(ADMIN_PERMISSIONS.MANAGE_OPTIONS)) {
    quickLinks.push({
      href: "/admin/dashboard/manage-cities",
      label: "Cities",
    });
  }
  if (hasPermission(ADMIN_PERMISSIONS.MANAGE_PROJECTS)) {
    quickLinks.push({
      href: "/admin/dashboard/manage-projects",
      label: "Projects",
    });
    quickLinks.push({
      href: "/admin/dashboard/manage-banners",
      label: "Banners",
    });
  }
  if (hasPermission(ADMIN_PERMISSIONS.MANAGE_AMENITIES)) {
    quickLinks.push({
      href: "/admin/dashboard/aminities",
      label: "Amenities",
    });
  }
  if (hasPermission(ADMIN_PERMISSIONS.MANAGE_WEB_STORIES)) {
    quickLinks.push({
      href: "/admin/dashboard/web-story",
      label: "Web stories",
    });
  }

  const welcomeName =
    !roleLoading && displayName ? displayName.split(" ")[0] : null;

  const activityLinkGates = {
    canApprovals,
    canManageBlogs,
    canManageWebStories,
  };

  return (
    <div className="admin-dash-home">
      <header>
        {/* <p className="admin-dash-home__kicker">Executive overview</p> */}
        <div className="admin-dash-home__hero-row">
          <h1 className="admin-dash-home__title">My Property Fact Dashboard</h1>
          {/* <div className="admin-dash-home__trend">
            <FontAwesomeIcon icon={faArrowTrendUp} />
            <span>12.5% vs last quarter</span>
          </div> */}
        </div>
        {!roleLoading && (welcomeName || roleLabel) ? (
          <p
            style={{
              margin: "-0.5rem 0 1.25rem",
              fontSize: "0.9rem",
              color: "#6b7280",
              fontWeight: 600,
            }}
          >
            {welcomeName ? <>Signed in as {welcomeName}</> : null}
            {welcomeName && roleLabel ? " · " : null}
            {roleLabel ? <span>{roleLabel}</span> : null}
          </p>
        ) : null}
      </header>

      <section aria-label="Key metrics">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              flex: "1 1 280px",
              minWidth: "260px",
              maxWidth: "100%",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <MetricCard
              tone="white"
              label="TOTAL PROJECTS"
              value={noOfProjects}
              sub="Total across the platform"
              subMuted
              icon={faBuilding}
              style={{ width: "100%", minHeight: "100%" }}
              labelStyle={{
                color: "#a16207",
                fontWeight: 700,
                letterSpacing: "0.06em",
                fontSize: "0.72rem",
              }}
              valueStyle={{
                color: "#007d51",
                fontSize: "clamp(2rem, 4vw, 2.65rem)",
              }}
              subStyle={{ color: "#a16207", fontWeight: 600 }}
            />
          </div>
          <div
            style={{
              flex: "3 1 400px",
              minWidth: "min(100%, 280px)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {topMetrics.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: topGridColumns,
                  gap: "1rem",
                }}
              >
                {topMetrics.map((m) => (
                  <MetricCard
                    key={m.key}
                    tone={m.tone}
                    label={m.label}
                    value={m.value}
                    sub={m.sub}
                    subMuted={m.subMuted}
                    icon={m.icon}
                    iconWrapStyle={m.iconWrapStyle}
                  />
                ))}
              </div>
            ) : null}
            {miniStats.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: miniGridColumns,
                  gap: "0.85rem",
                }}
              >
                {miniStats.map((m) => (
                  <MiniStat
                    key={m.key}
                    label={m.label}
                    value={m.value}
                    meta={m.meta}
                    icon={m.icon}
                    iconSrc={m.iconSrc}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="admin-dash-home__split">
        <section className="admin-dash-chart" aria-label="Daily user tracking">
          <div className="admin-dash-chart__head">
            <h2 className="admin-dash-chart__title">Daily user tracking</h2>
            <span className="admin-dash-chart__live">
              <span className="admin-dash-chart__live-dot" />
              LIVE DATA
            </span>
            {/* <div className="admin-dash-chart__filters">
              {["1W", "1M", "1Y"].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`admin-dash-chart__filter${chartRange === k ? " is-active" : ""}`}
                  onClick={() => setChartRange(k)}
                >
                  {k}
                </button>
              ))}
            </div> */}
          </div>
          <div className="admin-dash-chart__plot-wrap">
            <svg
              className="admin-dash-chart__svg"
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient
                  id="adminDashChartFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#007d51" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#007d51" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1="36"
                y1="10"
                x2="36"
                y2="175"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="36"
                y1="175"
                x2="390"
                y2="175"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              {/* <text x="0" y="24" fontSize="9" fill="#9ca3af">
                $5.2M
              </text>
              <text x="0" y="95" fontSize="9" fill="#9ca3af">
                $4.0M
              </text>
              <text x="0" y="168" fontSize="9" fill="#9ca3af">
                $1.2M
              </text> */}
              <path
                d="M40,165 C90,150 130,130 170,115 S260,75 320,55 S370,40 392,32 L392,175 L40,175 Z"
                fill="url(#adminDashChartFill)"
              />
              <path
                d="M40,165 C90,150 130,130 170,115 S260,75 320,55 S370,40 392,32"
                fill="none"
                stroke="#007d51"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="admin-dash-chart__overlay">
              <p className="admin-dash-chart__overlay-title">Coming Soon</p>
              <p className="admin-dash-chart__overlay-sub">
                Daily analytics and live traffic will appear here once constructed.
              </p>
            </div>
          </div>
          {/* <div className="admin-dash-chart__foot">
            <div>
              <p className="admin-dash-chart-stat__label">Avg. valuation</p>
              <p className="admin-dash-chart-stat__value">$3.1M</p>
            </div>
            <div>
              <p className="admin-dash-chart-stat__label">Listing velocity</p>
              <p className="admin-dash-chart-stat__value">12 days</p>
            </div>
            <div>
              <p className="admin-dash-chart-stat__label">Conversion</p>
              <p className="admin-dash-chart-stat__value">8.4%</p>
            </div>
          </div> */}
        </section>

        <aside className="admin-dash-pending" aria-label="Your recent tasks">
          <h2 className="admin-dash-pending__title">Your recent tasks</h2>
          {!roleLoading && displayName ? (
            <p
              style={{
                margin: "-0.35rem 0 0.85rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#6b7280",
              }}
            >
              Recent actions — {displayName}
            </p>
          ) : null}
          <div className="admin-dash-pending__list">
            {recentLoading ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  color: "#6b7280",
                  fontWeight: 600,
                }}
              >
                Loading your activity…
              </p>
            ) : null}
            {!recentLoading && recentTasks.length > 0
              ? recentTasks.map((activity, index) => {
                  const variant = activityThumbVariant(
                    activity.taskType,
                    index,
                  );
                  const href =
                    typeof activity.href === "string" &&
                    activity.href.startsWith("/")
                      ? activity.href
                      : null;
                  const inner = (
                    <div className="admin-dash-pending-item">
                      <ActivityThumb variantIndex={variant} />
                      <div className="admin-dash-pending-item__body">
                        <p className="admin-dash-pending-item__name">
                          {activity.title || "Action"}
                        </p>
                        <p className="admin-dash-pending-item__meta">
                          {formatActivityMeta(activity)}
                        </p>
                      </div>
                    </div>
                  );
                  const key = `${activity.taskType || "x"}-${activity.occurredAt || index}-${index}`;
                  if (href && canOpenActivityHref(href, activityLinkGates)) {
                    return (
                      <Link
                        key={key}
                        href={href}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          display: "block",
                        }}
                      >
                        {inner}
                      </Link>
                    );
                  }
                  return <div key={key}>{inner}</div>;
                })
              : null}
            {!recentLoading && recentTasks.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  color: "#6b7280",
                  fontWeight: 600,
                }}
              >
                No tasks logged yet. Saving blogs, web stories, their categories,
                or approving listings will show up here for your account.
              </p>
            ) : null}
          </div>
          <div className="admin-dash-pending__footer">
            {canApprovals ? (
              <Link
                href="/admin/dashboard/property-approvals"
                className="admin-dash-pending__link"
              >
                Open property approvals →
              </Link>
            ) : (
              <span className="admin-dash-pending__link" style={{ opacity: 0.55 }}>
                Property queue requires approvals access
              </span>
            )}
          </div>
        </aside>
      </div>

      {quickLinks.length > 0 ? (
        <section className="admin-dash-home__quick" aria-label="Quick links">
          <h2 className="admin-dash-home__quick-title">Workspace shortcuts</h2>
          <div className="admin-dash-home__quick-grid">
            {quickLinks.map((q) => (
              <Link
                key={q.href + q.label}
                href={q.href}
                className="admin-dash-quick-link"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Secondary stats (compact) — real counts for power users */}
      <section
        style={{
          marginTop: "1.25rem",
          padding: "1rem 1.1rem",
          background: "#f9fafb",
          borderRadius: "14px",
          border: "1px solid #eef0f4",
        }}
        aria-label="Extended counts"
      >
        <p
          style={{
            margin: "0 0 0.65rem",
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#9ca3af",
            textTransform: "uppercase",
          }}
        >
          Data catalog
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            color: "#6b7280",
            lineHeight: 1.65,
            fontWeight: 600,
          }}
        >
          Story categories: {noOfWebStoryCategories.toLocaleString()} · Project
          types: {noOfProjectTypes.toLocaleString()}
          {isSuperAdmin ? (
            <>
              {" "}
              · Users: {noOfUsers.toLocaleString()}
            </>
          ) : null}
        </p>
      </section>
    </div>
  );
}
