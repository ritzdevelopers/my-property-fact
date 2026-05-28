import { NextResponse } from "next/server";
import { canAccessAdminPath } from "./app/(adminside)/admin/adminPermissions";
import { getPublicApiBase } from "./lib/publicApiBase";
import { ELDECO_LANDING_BASE_PATH } from "./components/eldecoPaths";

const protectedRoutes = [
  "/admin",
  "/admin/dashboard",
  "/admin/settings",
  "/portal",
  "/portal/dashboard",
];

function buildCookieHeader(req) {
  try {
    const all = req.cookies.getAll();
    if (!all?.length) return req.headers.get("cookie") || "";
    return all.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch {
    return req.headers.get("cookie") || "";
  }
}

// checking session validity and extracting roles
async function checkSession(req) {
  try {
    const apiBase = getPublicApiBase();
    if (!apiBase) {
      return { valid: false };
    }
    const cookieHeader = buildCookieHeader(req);
    const res = await fetch(`${apiBase}admin-portal/auth/session`, {
      headers: {
        Cookie: cookieHeader || "",
      },
    });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return { valid: false };
    }
    if (!res.ok) return { valid: false };
    // Session expiry: backend sends expiresAt in response body (ISO string)
    if (data.expiresAt) {
      const expiresAt = new Date(data.expiresAt);
      if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
        return { valid: false };
      }
    }
    return {
      valid: true,
      roles: data.roles || [],
      permissions: data.permissions || [],
      email: data.email,
    };
  } catch (err) {
    console.error("checkSession error:", err);
    return { valid: false };
  }
}

// Helper function to check if user has required role
function hasRole(roles, requiredRole) {
  if (!roles || !Array.isArray(roles)) return false;

  const normalizedRequired = requiredRole.toUpperCase();

  return roles.some((role) => {
    if (!role) return false;
    const normalizedRole = role.toUpperCase();
    return (
      normalizedRole === normalizedRequired ||
      normalizedRole === `ROLE_${normalizedRequired}`
    );
  });
}

/** Super Admin or Admin may use /admin dashboard (not portal User). */
function hasAdminDashboardAccess(roles) {
  return hasRole(roles, "SUPERADMIN") || hasRole(roles, "ADMIN");
}

function isEldecoTerraSolPath(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // keep raw pathname
  }
  return (
    decoded === ELDECO_LANDING_BASE_PATH ||
    decoded.startsWith(`${ELDECO_LANDING_BASE_PATH}/`)
  );
}

function legacyWebStoryRedirect(req) {
  const path = req.nextUrl.pathname;
  if (!path.startsWith("/web-story/")) {
    return null;
  }
  const slug = path.slice("/web-story/".length).replace(/\/+$/, "");
  if (!slug) {
    return null;
  }
  const url = req.nextUrl.clone();
  url.pathname = `/api/v1/web-story/${slug}`;
  return NextResponse.redirect(url, 308);
}

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  const webStoryRedirect = legacyWebStoryRedirect(req);
  if (webStoryRedirect) {
    return webStoryRedirect;
  }

  if (isEldecoTerraSolPath(path)) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-mpf-hide-popular-promo", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Public registration removed — only Super Admin creates users from the dashboard
  if (path === "/admin/register" || path === "/admin/register/") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (
    path === "/admin/forgot-password" ||
    path === "/admin/forgot-password/"
  ) {
    return NextResponse.next();
  }

  // Special case: login page
  if (path === "/admin") {
    // Check if accessDenied query parameter is already present
    const accessDenied = req.nextUrl.searchParams.get("accessDenied");

    const session = await checkSession(req);
    if (session.valid) {
      if (hasAdminDashboardAccess(session.roles)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      // Logged in but wrong role
      if (accessDenied === "true") {
        return NextResponse.next(); // allow page to show toast
      }
      return NextResponse.redirect(
        new URL("/admin?accessDenied=true", req.url),
      );
    }
    return NextResponse.next();
  }

  // Special case: portal root (signin page)
  if (path === "/portal" || path === "/portal/") {
    const session = await checkSession(req);

    if (session.valid) {
      if (
        hasRole(session.roles, "USER") &&
        !hasRole(session.roles, "SUPERADMIN")
      ) {
        return NextResponse.redirect(new URL("/portal/dashboard", req.url));
      }

      // SUPERADMIN trying to access portal
      // if (hasRole(session.roles, "SUPERADMIN")) {
      //   return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      // }
    }
    return NextResponse.next();
  }
  // Protect admin and portal routes (except /portal which is the signin page)
  if (
    protectedRoutes.some((route) => path.startsWith(route)) &&
    path !== "/portal" &&
    path !== "/portal/"
  ) {
    const session = await checkSession(req);

    if (!session.valid) {
      const redirectTo = path.startsWith("/portal") ? "/portal" : "/admin";

      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    const isAdminRoute = path.startsWith("/admin");
    const isPortalRoute = path.startsWith("/portal");

    // ---- ROLE BASED ACCESS ----
    if (isAdminRoute) {
      if (!hasAdminDashboardAccess(session.roles)) {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
      if (
        path.startsWith("/admin/dashboard") &&
        path !== "/admin/dashboard" &&
        path !== "/admin/dashboard/"
      ) {
        const gate = canAccessAdminPath(
          session.roles,
          session.permissions,
          path,
        );
        if (!gate.ok && gate.redirect) {
          return NextResponse.redirect(new URL(gate.redirect, req.url));
        }
      }
    }

    if (isPortalRoute) {
      // if (hasRole(session.roles, "SUPERADMIN")) {
      //   return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      // }

      if (!hasRole(session.roles, "USER")) {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
    }
    // All good → allow request
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/web-story/:path*",
    "/admin/:path*",
    "/portal/:path*",
    "/Eldeco-terra&sol",
    "/Eldeco-terra&sol/:path*",
  ],
};
