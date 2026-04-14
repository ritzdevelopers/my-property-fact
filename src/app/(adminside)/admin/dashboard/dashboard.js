"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
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
import { useRouter } from "next/navigation";
import SiteTrafficTrendChart from "./SiteTrafficTrendChart";
import AdminDashboardLast60Traffic from "./AdminDashboardLast60Traffic";

/** How often super-admin traffic charts refetch (no full page reload). */
const SITE_TRAFFIC_POLL_MS = 5_000;

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
  iconSrc,
  style,
  className,
  valueStyle,
  subStyle,
  labelStyle,
  iconWrapStyle,
  href,
}) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <article
      className={`admin-dash-metric admin-dash-metric--${tone}${className ? ` ${className}` : ""}`}
      style={{ ...style, cursor: href ? "pointer" : "default" }}
      onClick={handleClick}
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
          {iconSrc ? (
            <img src={iconSrc} alt="" width={24} height={24} style={{ opacity: 0.8 }} />
          ) : (
            <FontAwesomeIcon icon={icon} />
          )}
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

function MiniStat({ icon, iconSrc, value, label, meta, cardKey }) {
  return (
    <div className={`admin-dash-mini admin-dash-mini--${cardKey || "default"}`}>
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

  /** Chart card shell: visible to Super Admin (live data) and Admin (coming soon placeholder). */
  const showDailyUserTrackingChart = isSuperAdmin || isAdmin;
  const showLiveTrafficAnalytics = isSuperAdmin;

  const [recentTasks, setRecentTasks] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const [trafficLive, setTrafficLive] = useState(null);
  const [trafficLiveErr, setTrafficLiveErr] = useState("");
  const [trafficLiveLoading, setTrafficLiveLoading] = useState(false);
  const [trafficLiveUpdatedAt, setTrafficLiveUpdatedAt] = useState(null);
  const [trafficToday, setTrafficToday] = useState(null);
  const [trafficTodayErr, setTrafficTodayErr] = useState("");
  const [trafficTodayLoading, setTrafficTodayLoading] = useState(false);

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

  useEffect(() => {
    if (roleLoading) return;
    if (!showLiveTrafficAnalytics) {
      setTrafficLive(null);
      setTrafficLiveErr("");
      setTrafficLiveLoading(false);
      setTrafficLiveUpdatedAt(null);
      setTrafficToday(null);
      setTrafficTodayErr("");
      setTrafficTodayLoading(false);
      return;
    }
    let cancelled = false;
    let pollId = null;

    const loadBoth = async (isInitial) => {
      const apiBase = getPublicApiBase();
      if (!apiBase) {
        if (!cancelled) {
          setTrafficLive(null);
          setTrafficToday(null);
          setTrafficLiveErr("API URL not configured");
          setTrafficTodayErr("API URL not configured");
          setTrafficLiveLoading(false);
          setTrafficTodayLoading(false);
        }
        return;
      }
      if (isInitial) {
        setTrafficLiveLoading(true);
        setTrafficTodayLoading(true);
        setTrafficLiveErr("");
        setTrafficTodayErr("");
      }
      try {
        const [lRes, dayRes] = await Promise.all([
          fetch(`${apiBase}admin/dashboard/site-traffic-live?minutes=60`, {
            credentials: "include",
            headers: { ...adminFetchHeaders(), Accept: "application/json" },
          }),
          fetch(`${apiBase}admin/dashboard/site-traffic-today`, {
            credentials: "include",
            headers: { ...adminFetchHeaders(), Accept: "application/json" },
          }),
        ]);
        if (cancelled) return;

        if (lRes.ok) {
          setTrafficLive(await lRes.json());
          setTrafficLiveErr("");
        } else {
          const t = await lRes.text();
          setTrafficLive(null);
          setTrafficLiveErr(
            t && t.length < 200 ? t : `Live traffic failed (${lRes.status})`,
          );
        }

        if (dayRes.ok) {
          setTrafficToday(await dayRes.json());
          setTrafficTodayErr("");
        } else {
          const t = await dayRes.text();
          setTrafficToday(null);
          setTrafficTodayErr(
            t && t.length < 200 ? t : `Today traffic failed (${dayRes.status})`,
          );
        }

        if (!cancelled && (lRes.ok || dayRes.ok)) {
          setTrafficLiveUpdatedAt(new Date());
        }
      } catch (e) {
        if (!cancelled) {
          setTrafficLiveErr(e.message || "Network error");
          setTrafficTodayErr(e.message || "Network error");
        }
      } finally {
        if (!cancelled && isInitial) {
          setTrafficLiveLoading(false);
          setTrafficTodayLoading(false);
        }
      }
    };

    void (async () => {
      await loadBoth(true);
      if (cancelled) return;
      pollId = window.setInterval(() => {
        void loadBoth(false);
      }, SITE_TRAFFIC_POLL_MS);
    })();

    return () => {
      cancelled = true;
      if (pollId != null) window.clearInterval(pollId);
    };
  }, [roleLoading, showLiveTrafficAnalytics]);

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
        iconSrc: "/images/admin/user_icon.svg",
        href: "/admin/dashboard/manage-users",
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
        iconSrc: "/images/admin/blog_icon.svg",
        className: "admin-dash-metric--hover-sub",
        iconWrapStyle: {
          color: "rgba(0,0,0,0.25)",
        },
        href: "/admin/dashboard/manage-blogs",
      });
    }
    if (canEnquiries) {
      list.push({
        key: "enquiries",
        tone: "slate",
        label: "ENQUIRIES",
        value: noOfEnquiries,
        sub: null,
        iconSrc: "/images/admin/enquiries.svg",
        href: "/admin/dashboard/enquiries",
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
        iconSrc: DASH_MINI_ICONS.webStories,
      });
      row.push({
        key: "mini-story-categories",
        label: "STORY CATEGORIES",
        value: noOfWebStoryCategories,
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

  const greetingTarget = useMemo(() => {
    if (roleLoading) return null;
    return isSuperAdmin ? `Welcome Back, Super Admin` : `Welcome Back, Admin`;
  }, [roleLoading, isSuperAdmin, welcomeName]);

  const [typedGreeting, setTypedGreeting] = useState("");
  const [greetingTypingDone, setGreetingTypingDone] = useState(false);
  const greetingIntervalRef = useRef(null);

  useEffect(() => {
    if (greetingIntervalRef.current) {
      clearInterval(greetingIntervalRef.current);
      greetingIntervalRef.current = null;
    }
    if (!greetingTarget) {
      setTypedGreeting("");
      setGreetingTypingDone(false);
      return;
    }
    setTypedGreeting("");
    setGreetingTypingDone(false);
    let i = 0;
    greetingIntervalRef.current = setInterval(() => {
      i += 1;
      setTypedGreeting(greetingTarget.slice(0, i));
      if (i >= greetingTarget.length) {
        if (greetingIntervalRef.current) {
          clearInterval(greetingIntervalRef.current);
          greetingIntervalRef.current = null;
        }
        setGreetingTypingDone(true);
      }
    }, 42);
    return () => {
      if (greetingIntervalRef.current) {
        clearInterval(greetingIntervalRef.current);
        greetingIntervalRef.current = null;
      }
    };
  }, [greetingTarget]);

  const activityLinkGates = {
    canApprovals,
    canManageBlogs,
    canManageWebStories,
  };

  const renderSplitChartSection = () => {
    if (!showDailyUserTrackingChart) return null;
    return (
      <section
        className={`admin-dash-chart${showLiveTrafficAnalytics ? " admin-dash-chart--website-traffic" : ""}`}
        aria-label={
          showLiveTrafficAnalytics ? "Today public website traffic by hour" : "Daily user tracking"
        }
      >
        <div className="admin-dash-chart__head">
          <div className="admin-dash-chart__title-block">
            <h2 className="admin-dash-chart__title">
              {showLiveTrafficAnalytics ? "Today on your website (by hour)" : "Daily user tracking"}
            </h2>
            {showLiveTrafficAnalytics ? (
              <p className="admin-dash-chart__subtitle">
                Real visits to your public website (not admin). Left: last hour, minute by minute.
                Right: today by hour. Refreshes about every {SITE_TRAFFIC_POLL_MS / 1000}s while this
                tab stays open.
              </p>
            ) : (
              <p className="admin-dash-chart__subtitle">
                Live traffic analytics are available to super admins only.
              </p>
            )}
          </div>
          {showLiveTrafficAnalytics ? (
            <span className="admin-dash-chart__live">
              <span className="admin-dash-chart__live-dot" />
              LIVE DATA
            </span>
          ) : null}
        </div>
        <div
          className={
            showLiveTrafficAnalytics
              ? "admin-dash-chart__plot-wrap admin-dash-chart__plot-wrap--traffic"
              : "admin-dash-chart__plot-wrap"
          }
        >
          {!roleLoading && showDailyUserTrackingChart ? (
            showLiveTrafficAnalytics ? (
              <SiteTrafficTrendChart
                todayPayload={trafficToday}
                todayLoading={trafficTodayLoading}
                showSuperDetailsLink
              />
            ) : (
              <>
                <svg
                  className="admin-dash-chart__svg"
                  viewBox="0 0 400 200"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient
                      id="adminDashChartFillAdmin"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#005032" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#005032" stopOpacity="0" />
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
                  <path
                    d="M40,165 C90,150 130,130 170,115 S260,75 320,55 S370,40 392,32 L392,175 L40,175 Z"
                    fill="url(#adminDashChartFillAdmin)"
                  />
                  <path
                    d="M40,165 C90,150 130,130 170,115 S260,75 320,55 S370,40 392,32"
                    fill="none"
                    stroke="#005032"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="admin-dash-chart__overlay">
                  <p className="admin-dash-chart__overlay-title">Coming Soon</p>
                  <p className="admin-dash-chart__overlay-sub">
                    Daily analytics and live traffic will appear here for your account when enabled.
                  </p>
                </div>
              </>
            )
          ) : null}
        </div>
      </section>
    );
  };

  const renderSplitAside = () => (
    <aside
      className={`admin-dash-pending${showLiveTrafficAnalytics ? " admin-dash-pending--last60" : ""}`}
      aria-label={
        showLiveTrafficAnalytics ? "Live public site traffic last hour" : "Your recent tasks"
      }
    >
      {showLiveTrafficAnalytics ? (
        <AdminDashboardLast60Traffic
          livePayload={trafficLive}
          liveLoading={trafficLiveLoading}
          liveError={trafficLiveErr}
          liveUpdatedAt={trafficLiveUpdatedAt}
        />
      ) : (
        <>
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
                No tasks logged yet. Saving blogs, web stories, their categories, or approving
                listings will show up here for your account.
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
        </>
      )}
    </aside>
  );

  return (
    <div className="admin-dash-home">
      <header>
        {/* <p className="admin-dash-home__kicker">Executive overview</p> */}
        <div className="admin-dash-home__hero-row">
          <h1
            className="admin-dash-home__title admin-dash-home__title--greeting"
            aria-label={greetingTarget || "Admin dashboard"}
          >
            {typedGreeting}
            {greetingTarget && !greetingTypingDone ? (
              <span
                className="admin-dash-home__typing-cursor"
                aria-hidden
              />
            ) : null}
          </h1>
          {/* <div className="admin-dash-home__trend">
            <FontAwesomeIcon icon={faArrowTrendUp} />
            <span>12.5% vs last quarter</span>
          </div> */}
        </div>
        {!roleLoading && (welcomeName || roleLabel) ? (
          <p className="admin-dash-home__signed-in-meta">
            {welcomeName ? <>Signed in as {welcomeName}</> : null}
            {welcomeName && roleLabel ? " · " : null}
            {roleLabel ? <span>{roleLabel}</span> : null}
          </p>
        ) : null}
      </header>

      <section aria-label="Key metrics">
        <div className="admin-dash-home__top-metrics-row">
          <div className="admin-dash-home__projects-card">
            <div className="admin-dash-home__projects-card-icon">
              <img src="/images/admin/projects.svg" alt="" width={22} height={22} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <p className="admin-dash-home__projects-card-label">
                TOTAL PROJECTS
              </p>
              <p className="admin-dash-home__projects-card-value">
                {typeof noOfProjects === "number" ? noOfProjects.toLocaleString() : noOfProjects}
              </p>
            </div>
          </div>
          <div className="admin-dash-home__top-metrics-right">
            {topMetrics.length > 0 ? (
              <div className="admin-horizontal-scroll admin-dash-home__metrics-scroll-row">
                {topMetrics.map((m) => (
                  <MetricCard
                    key={m.key}
                    tone={m.tone}
                    label={m.label}
                    value={m.value}
                    sub={m.sub}
                    subMuted={m.subMuted}
                    icon={m.icon}
                    iconSrc={m.iconSrc}
                    iconWrapStyle={m.iconWrapStyle}
                    className={m.className}
                    href={m.href}
                  />
                ))}
              </div>
            ) : null}
            {miniStats.length > 0 ? (
              <div className="admin-dash-home__mini admin-horizontal-scroll">
                {miniStats.map((m) => (
                  <MiniStat
                    key={m.key}
                    cardKey={m.key}
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

      <div
        className={`admin-dash-home__split${!showDailyUserTrackingChart ? " admin-dash-home__split--no-chart" : ""}${showLiveTrafficAnalytics && showDailyUserTrackingChart ? " admin-dash-home__split--traffic-live" : ""}`}
      >
        {showLiveTrafficAnalytics && showDailyUserTrackingChart ? (
          <>
            {renderSplitAside()}
            {renderSplitChartSection()}
          </>
        ) : (
          <>
            {renderSplitChartSection()}
            {renderSplitAside()}
          </>
        )}
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
      <section className="admin-dash-home__catalog" aria-label="Extended counts">
        <p className="admin-dash-home__catalog-kicker">
          Data catalog
        </p>
        <p className="admin-dash-home__catalog-body">
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
