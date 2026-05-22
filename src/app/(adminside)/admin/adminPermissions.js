/** Must match backend {@code AdminPermissionKeys}. */

export const ADMIN_PERMISSIONS = {
  MANAGE_WEBSITE: "MANAGE_WEBSITE",
  MANAGE_OPTIONS: "MANAGE_OPTIONS",
  MANAGE_PROJECTS: "MANAGE_PROJECTS",
  MANAGE_INSIGHTS: "MANAGE_INSIGHTS",
  MANAGE_BLOGS: "MANAGE_BLOGS",
  MANAGE_WEB_STORIES: "MANAGE_WEB_STORIES",
  MANAGE_AMENITIES: "MANAGE_AMENITIES",
  MANAGE_FEATURES: "MANAGE_FEATURES",
  MANAGE_NEARBY_BENEFITS: "MANAGE_NEARBY_BENEFITS",
  MANAGE_PROPERTY_APPROVALS: "MANAGE_PROPERTY_APPROVALS",
  MANAGE_ENQUIRIES: "MANAGE_ENQUIRIES",
};

export function canAccessAdminPath(roles, permissions, pathname) {
  const normalizedRoles = (roles || []).map((r) =>
    String(r || "")
      .replace(/^ROLE_/i, "")
      .toUpperCase(),
  );
  const isSuper = normalizedRoles.includes("SUPERADMIN");
  const isAdmin = normalizedRoles.includes("ADMIN");
  if (isSuper) return { ok: true };
  if (!isAdmin) return { ok: false, redirect: "/admin/dashboard" };

  const perms = new Set(
    (permissions || []).map((p) => String(p || "").toUpperCase()),
  );
  const has = (key) => perms.has(String(key).toUpperCase());

  if (
    pathname.startsWith("/admin/dashboard/manage-users") ||
    pathname.startsWith("/admin/dashboard/pending-permissions") ||
    pathname.startsWith("/admin/dashboard/pending-admin-approvals")
  ) {
    return { ok: false, redirect: "/admin/dashboard" };
  }

  if (
    pathname === "/admin/dashboard/super-tracking" ||
    pathname.startsWith("/admin/dashboard/super-tracking/")
  ) {
    return { ok: false, redirect: "/admin/dashboard" };
  }

  if (
    pathname === "/admin/dashboard/activity-log" ||
    pathname.startsWith("/admin/dashboard/activity-log/")
  ) {
    return { ok: false, redirect: "/admin/dashboard" };
  }

  if (
    pathname === "/admin/dashboard/data-backup" ||
    pathname.startsWith("/admin/dashboard/data-backup/")
  ) {
    return { ok: false, redirect: "/admin/dashboard" };
  }

  if (
    pathname === "/admin/dashboard/enquiries" ||
    pathname.startsWith("/admin/dashboard/enquiries/")
  ) {
    return has(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES)
      ? { ok: true }
      : { ok: false, redirect: "/admin/dashboard" };
  }

  const rules = [
    ["/admin/dashboard/manage-home-banners", ADMIN_PERMISSIONS.MANAGE_WEBSITE],
    ["/admin/dashboard/manage-testimonials", ADMIN_PERMISSIONS.MANAGE_WEBSITE],
    [
      "/admin/dashboard/manage-countries",
      ADMIN_PERMISSIONS.MANAGE_OPTIONS,
    ],
    ["/admin/dashboard/manage-states", ADMIN_PERMISSIONS.MANAGE_OPTIONS],
    ["/admin/dashboard/manage-cities", ADMIN_PERMISSIONS.MANAGE_OPTIONS],
    ["/admin/dashboard/manage-localities", ADMIN_PERMISSIONS.MANAGE_OPTIONS],
    [
      "/admin/dashboard/manage-score-evalution",
      ADMIN_PERMISSIONS.MANAGE_INSIGHTS,
    ],
    ["/admin/dashboard/project-types", ADMIN_PERMISSIONS.MANAGE_OPTIONS],
    [
      "/admin/dashboard/manage-project-status",
      ADMIN_PERMISSIONS.MANAGE_OPTIONS,
    ],
    ["/admin/dashboard/builder", ADMIN_PERMISSIONS.MANAGE_OPTIONS],
    ["/admin/dashboard/budget-options", ADMIN_PERMISSIONS.MANAGE_OPTIONS],
    [
      "/admin/dashboard/manage-career-applications",
      ADMIN_PERMISSIONS.MANAGE_OPTIONS,
    ],
    ["/admin/dashboard/project-amenity", ADMIN_PERMISSIONS.MANAGE_PROJECTS],
    ["/admin/dashboard/manage-banners", ADMIN_PERMISSIONS.MANAGE_PROJECTS],
    ["/admin/dashboard/manage-floor-plans", ADMIN_PERMISSIONS.MANAGE_PROJECTS],
    ["/admin/dashboard/manage-gallery", ADMIN_PERMISSIONS.MANAGE_PROJECTS],
    ["/admin/dashboard/manage-faqs", ADMIN_PERMISSIONS.MANAGE_PROJECTS],
    [
      "/admin/dashboard/manage-project-about",
      ADMIN_PERMISSIONS.MANAGE_PROJECTS,
    ],
    [
      "/admin/dashboard/manage-project-walkthrough",
      ADMIN_PERMISSIONS.MANAGE_PROJECTS,
    ],
    [
      "/admin/dashboard/location-benifits",
      ADMIN_PERMISSIONS.MANAGE_PROJECTS,
    ],
    ["/admin/dashboard/manage-projects", ADMIN_PERMISSIONS.MANAGE_PROJECTS],
    ["/admin/dashboard/city-price-data", ADMIN_PERMISSIONS.MANAGE_INSIGHTS],
    [
      "/admin/dashboard/manage-insight-headers",
      ADMIN_PERMISSIONS.MANAGE_INSIGHTS,
    ],
    ["/admin/dashboard/insight-category", ADMIN_PERMISSIONS.MANAGE_INSIGHTS],
    ["/admin/dashboard/top-developers", ADMIN_PERMISSIONS.MANAGE_INSIGHTS],
    ["/admin/dashboard/aminities", ADMIN_PERMISSIONS.MANAGE_AMENITIES],
    ["/admin/dashboard/manage-features", ADMIN_PERMISSIONS.MANAGE_FEATURES],
    [
      "/admin/dashboard/manage-location-benefits",
      ADMIN_PERMISSIONS.MANAGE_NEARBY_BENEFITS,
    ],
    ["/admin/dashboard/manage-blogs", ADMIN_PERMISSIONS.MANAGE_BLOGS],
    ["/admin/dashboard/manage-categories", ADMIN_PERMISSIONS.MANAGE_BLOGS],
    [
      "/admin/dashboard/property-approvals",
      ADMIN_PERMISSIONS.MANAGE_PROPERTY_APPROVALS,
    ],
    ["/admin/dashboard/web-story-category", ADMIN_PERMISSIONS.MANAGE_WEB_STORIES],
    ["/admin/dashboard/web-story", ADMIN_PERMISSIONS.MANAGE_WEB_STORIES],
  ];

  const sorted = [...rules].sort((a, b) => b[0].length - a[0].length);
  for (const [prefix, key] of sorted) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return has(key)
        ? { ok: true }
        : { ok: false, redirect: "/admin/dashboard" };
    }
  }

  return { ok: true };
}
