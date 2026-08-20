"use client";
import { adminApiWithAuth, adminFetchHeaders } from "../_lib/adminApiAuth";

import { useEffect, useMemo, useState } from "react";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../_contexts/AdminRoleContext";
import { ADMIN_PERMISSIONS } from "../adminPermissions";
import SiteTrafficTrendChart from "./SiteTrafficTrendChart";
import AdminDashboardLast60Traffic from "./AdminDashboardLast60Traffic";
import BackupNotificationBanner from "./BackupNotificationBanner";
import { WelcomeHeader } from "@/components/admin/dashboard/welcome-header";
import {
  DashboardStatsGrid,
  QuickActionsCard,
  RecentActivityCard,
  LeadsOverviewCard,
} from "@/components/admin/dashboard/dashboard-stats";
import { Activity } from "lucide-react";

const SITE_TRAFFIC_POLL_MS = 5_000;



export default function Dashboard({
  noOfProjects,
  noOfUsers,
  noOfBlogs,
  noOfBlogCategories,
  noOfEnquiries,
  noOfCities,
  noOfBuilders,
  noOfAmenities,
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
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_PROPERTY_APPROVALS);
  const canEnquiries =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES);
  const canManageOptions =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_OPTIONS);
  const canManageBlogs =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_BLOGS);
  const canManageAmenities =
    isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_AMENITIES);

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
          setRecentTasks(result.activities.slice(0, 6));
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

  const quickLinks = useMemo(() => {
    const links = [];
    if (canApprovals)
      links.push({ href: "/admin/dashboard/property-approvals", label: "Approvals" });
    if (isSuperAdmin)
      links.push({ href: "/admin/dashboard/manage-users", label: "Users" });
    if (canEnquiries)
      links.push({ href: "/admin/dashboard/enquiries", label: "Enquiries" });
    if (hasPermission(ADMIN_PERMISSIONS.MANAGE_BLOGS))
      links.push({ href: "/admin/dashboard/manage-blogs", label: "Blogs" });
    if (hasPermission(ADMIN_PERMISSIONS.MANAGE_OPTIONS))
      links.push({ href: "/admin/dashboard/manage-cities", label: "Cities" });
    if (hasPermission(ADMIN_PERMISSIONS.MANAGE_PROJECTS)) {
      links.push({ href: "/admin/dashboard/manage-projects", label: "Projects" });
      links.push({ href: "/admin/dashboard/manage-banners", label: "Banners" });
    }
    if (hasPermission(ADMIN_PERMISSIONS.MANAGE_AMENITIES))
      links.push({ href: "/admin/dashboard/aminities", label: "Amenities" });
    return links;
  }, [isSuperAdmin, canApprovals, canEnquiries, hasPermission]);

  return (
    <div className="mpf-dash">
      <WelcomeHeader
        displayName={displayName}
        roleLabel={roleLabel}
        isSuperAdmin={isSuperAdmin}
        loading={roleLoading}
      />

      {isSuperAdmin ? <BackupNotificationBanner /> : null}

      <DashboardStatsGrid
        noOfProjects={noOfProjects}
        noOfUsers={noOfUsers}
        noOfBlogs={noOfBlogs}
        noOfBlogCategories={noOfBlogCategories}
        noOfEnquiries={noOfEnquiries}
        noOfCities={noOfCities}
        noOfBuilders={noOfBuilders}
        noOfAmenities={noOfAmenities}
        noOfProjectTypes={noOfProjectTypes}
        isSuperAdmin={isSuperAdmin}
        canManageBlogs={canManageBlogs}
        canEnquiries={canEnquiries}
        canManageOptions={canManageOptions}
        canManageAmenities={canManageAmenities}
      />

      <div className="mpf-split mpf-split--2-1">
        <section className="mpf-panel mpf-panel--growth">
          <div className="mpf-panel__head">
            <div>
              <h2 className="mpf-panel__title">
                {showLiveTrafficAnalytics ? "Growth Overview" : "Daily User Tracking"}
              </h2>
              <p className="mpf-panel__sub">
                {showLiveTrafficAnalytics
                  ? `Website traffic today · refreshes every ${SITE_TRAFFIC_POLL_MS / 1000}s`
                  : "Live traffic analytics are available to super admins"}
              </p>
            </div>
            {showLiveTrafficAnalytics && (
              <span className="mpf-live-badge">
                <span className="mpf-live-dot" />
                Live
              </span>
            )}
          </div>
          <div className="mpf-panel__body">
            {!roleLoading && showLiveTrafficAnalytics ? (
              <SiteTrafficTrendChart
                todayPayload={trafficToday}
                todayLoading={trafficTodayLoading}
                showSuperDetailsLink
              />
            ) : showDailyUserTrackingChart ? (
              <div className="mpf-activity__empty" style={{ minHeight: 260 }}>
                <span className="mpf-activity__empty-icon">
                  <Activity className="h-6 w-6" />
                </span>
                <p className="mpf-panel__title" style={{ fontSize: "0.95rem" }}>
                  Coming Soon
                </p>
                <p
                  className="mpf-panel__sub"
                  style={{ maxWidth: "20rem", margin: "0.35rem auto 0" }}
                >
                  Daily analytics and live traffic will appear here when enabled for your account.
                </p>
              </div>
            ) : (
              <div className="mpf-activity__empty" style={{ minHeight: 220 }}>
                <span className="mpf-activity__empty-icon">
                  <Activity className="h-6 w-6" />
                </span>
                <p className="mpf-panel__sub">Growth charts unlock with admin analytics access.</p>
              </div>
            )}
          </div>
        </section>

        <LeadsOverviewCard
          noOfEnquiries={noOfEnquiries}
          noOfProjects={noOfProjects}
          noOfBlogs={noOfBlogs}
          noOfCities={noOfCities}
        />
      </div>

      <div className="mpf-split mpf-split--1-1">
        {quickLinks.length > 0 ? (
          <QuickActionsCard quickLinks={quickLinks} />
        ) : (
          <div />
        )}

        {showLiveTrafficAnalytics ? (
          <section className="mpf-panel h-full">
            <div className="mpf-panel__head">
              <div>
                <h2 className="mpf-panel__title">Last 60 Minutes</h2>
                <p className="mpf-panel__sub">Live public site traffic</p>
              </div>
              <span className="mpf-live-badge">
                <span className="mpf-live-dot" />
                Live
              </span>
            </div>
            <div className="mpf-panel__body">
              <AdminDashboardLast60Traffic
                livePayload={trafficLive}
                liveLoading={trafficLiveLoading}
                liveError={trafficLiveErr}
                liveUpdatedAt={trafficLiveUpdatedAt}
              />
            </div>
          </section>
        ) : (
          <RecentActivityCard
            activities={recentTasks}
            loading={recentLoading}
            displayName={displayName}
          />
        )}
      </div>

      {showLiveTrafficAnalytics && (
        <RecentActivityCard
          activities={recentTasks}
          loading={recentLoading}
          displayName={displayName}
        />
      )}
    </div>
  );
}
